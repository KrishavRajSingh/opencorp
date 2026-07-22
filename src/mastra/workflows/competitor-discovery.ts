import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { searchExa, type SearchExaResult } from '../tools/search-web';

const angleEnum = z.enum(['direct', 'pain', 'audience', 'alternative', 'oss']);

const productContextSchema = z.object({
  url: z.string(),
  productName: z.string(),
  description: z.string(),
  keyFeatures: z.array(z.string()),
});

const plannedQuerySchema = z.object({
  angle: angleEnum,
  query: z.string().min(5).max(200),
});

const dedupedResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  domain: z.string(),
  highlights: z.array(z.string()).nullable(),
  text: z.string(),
  sourceAngle: angleEnum,
  sourceQuery: z.string(),
});

const competitorSchema = z.object({
  name: z.string(),
  url: z.string(),
  description: z.string(),
  mentionSources: z.array(z.string()),
});

const workflowInputSchema = productContextSchema;

const workflowOutputSchema = z.object({
  competitors: z.array(competitorSchema),
  searchQueriesUsed: z.array(z.string()),
});

type PlannedQuery = z.infer<typeof plannedQuerySchema>;
type DedupedResult = z.infer<typeof dedupedResultSchema>;

const ANGLE_CATEGORY: Record<z.infer<typeof angleEnum>, 'company' | undefined> = {
  direct: 'company',
  pain: undefined,
  audience: undefined,
  alternative: 'company',
  oss: undefined,
};

const SEARCH_RESULTS_CAP = 40;
const RESULTS_PER_QUERY = 10;

function extractJsonObject(text: string): string | null {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return null;
  return text.slice(first, last + 1);
}

function normalizeQueries(parsed: unknown): PlannedQuery[] | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const queries = (parsed as { queries?: unknown }).queries;
  if (!Array.isArray(queries)) return null;
  const out: PlannedQuery[] = [];
  for (const q of queries) {
    if (!q || typeof q !== 'object') return null;
    const angle = (q as { angle?: unknown }).angle;
    const query = (q as { query?: unknown }).query;
    if (typeof angle !== 'string' || typeof query !== 'string') return null;
    const angleCheck = angleEnum.safeParse(angle);
    if (!angleCheck.success) return null;
    const trimmed = query.trim();
    if (trimmed.length < 5) return null;
    out.push({ angle: angleCheck.data, query: trimmed });
  }
  if (out.length !== 5) return null;
  return out;
}

function getHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

const planQueries = createStep({
  id: 'plan-queries',
  description: 'Generate 5 angle-slot Exa queries from product context',
  inputSchema: workflowInputSchema,
  outputSchema: workflowInputSchema.extend({
    queries: z.array(plannedQuerySchema).length(5),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) throw new Error('inputData required');
    const agent = mastra?.getAgent('competitorAnalystAgent');
    if (!agent) throw new Error('competitorAnalystAgent not registered');

    const userQ = `PRODUCT: ${inputData.productName}
URL: ${inputData.url}
DESCRIPTION: ${inputData.description}
FEATURES: ${inputData.keyFeatures.join(', ') || '(none)'}

PLAN QUERIES. Output strict JSON with EXACTLY 5 entries \u2014 one per angle slot: direct, pain, audience, alternative, oss. Each query: 5-12 word natural-language Exa query, paraphrasing the product in that angle. No prose.`;

    const response = await agent.stream([{ role: 'user', content: userQ }]);
    let text = '';
    for await (const chunk of response.textStream) text += chunk;

    const json = extractJsonObject(text);
    if (!json) throw new Error('Query planner returned no JSON');
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch (err) {
      throw new Error(`Query planner JSON parse failed: ${(err as Error).message}`);
    }
    const queries = normalizeQueries(parsed);
    if (!queries) throw new Error('Query planner output failed validation');

    return { ...inputData, queries };
  },
});

const executeSearches = createStep({
  id: 'execute-searches',
  description: 'Run 5 Exa queries in parallel, dedupe by domain, cap results',
  inputSchema: workflowInputSchema.extend({
    queries: z.array(plannedQuerySchema).length(5),
  }),
  outputSchema: z.object({
    productContext: workflowInputSchema,
    results: z.array(dedupedResultSchema),
    searchQueriesUsed: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) throw new Error('queries required');
    const { queries } = inputData;

    const searches = await Promise.all(
      queries.map(async (q) => {
        try {
          const res = await searchExa({
            query: q.query,
            numResults: RESULTS_PER_QUERY,
            category: ANGLE_CATEGORY[q.angle],
            maxTextCharacters: 2000,
          });
          return { angle: q.angle, query: q.query, res };
        } catch {
          return {
            angle: q.angle,
            query: q.query,
            res: { query: q.query, results: [], resultCount: 0, costDollars: null },
          };
        }
      }),
    );

    const seenDomains = new Set<string>();
    const deduped: DedupedResult[] = [];

    for (const { angle, query, res } of searches) {
      for (const r of res.results as SearchExaResult[]) {
        if (!r.url) continue;
        const host = getHostname(r.url);
        if (!host) continue;
        if (seenDomains.has(host)) continue;
        seenDomains.add(host);
        deduped.push({
          title: r.title,
          url: r.url,
          domain: host,
          highlights: r.highlights,
          text: r.text,
          sourceAngle: angle,
          sourceQuery: query,
        });
        if (deduped.length >= SEARCH_RESULTS_CAP) break;
      }
      if (deduped.length >= SEARCH_RESULTS_CAP) break;
    }

    return {
      productContext: {
        url: inputData.url,
        productName: inputData.productName,
        description: inputData.description,
        keyFeatures: inputData.keyFeatures,
      },
      results: deduped,
      searchQueriesUsed: queries.map((q) => q.query),
    };
  },
});

const synthesize = createStep({
  id: 'synthesize',
  description: 'Synthesize deduped results into structured competitors[]',
  inputSchema: z.object({
    productContext: workflowInputSchema,
    results: z.array(dedupedResultSchema),
    searchQueriesUsed: z.array(z.string()),
  }),
  outputSchema: workflowOutputSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) throw new Error('search results required');
    const { productContext, results, searchQueriesUsed } = inputData;

    const compact = results.map((r) => ({
      angle: r.sourceAngle,
      query: r.sourceQuery,
      title: r.title,
      url: r.url,
      domain: r.domain,
      highlights: r.highlights ?? [],
      text: r.text.slice(0, 1500),
    }));

    const userQ = `SYNTHESIZE COMPETITORS for this product.

TARGET PRODUCT:
- Name: ${productContext.productName}
- URL: ${productContext.url}
- Description: ${productContext.description}
- Features: ${productContext.keyFeatures.join(', ') || '(none)'}

SEARCH RESULTS (${compact.length} unique domains, deduped):
${JSON.stringify(compact, null, 0)}

SEARCH QUERIES USED: ${JSON.stringify(searchQueriesUsed)}

Output strict JSON: { "competitors": [...], "searchQueriesUsed": [...] }. Only include products you can identify from the results above. No invention. Prioritize products that overlap the target's category and audience, not adjacent tangents.`;

    const agent = mastra?.getAgent('competitorAnalystAgent');
    if (!agent) throw new Error('competitorAnalystAgent not registered');

    const response = await agent.stream([{ role: 'user', content: userQ }]);
    let text = '';
    for await (const chunk of response.textStream) text += chunk;

    const json = extractJsonObject(text);
    if (!json) throw new Error('Synthesizer returned no JSON');
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch (err) {
      throw new Error(`Synthesizer JSON parse failed: ${(err as Error).message}`);
    }
    const obj = parsed as { competitors?: unknown; searchQueriesUsed?: unknown };
    if (!obj || !Array.isArray(obj.competitors)) {
      throw new Error('Synthesizer output failed validation');
    }
    const competitors: z.infer<typeof competitorSchema>[] = [];
    for (const c of obj.competitors) {
      if (!c || typeof c !== 'object') continue;
      const name = (c as { name?: unknown }).name;
      const url = (c as { url?: unknown }).url;
      const description = (c as { description?: unknown }).description;
      const mentionSources = (c as { mentionSources?: unknown }).mentionSources;
      if (typeof name !== 'string' || typeof url !== 'string' || typeof description !== 'string') continue;
      const sources = Array.isArray(mentionSources)
        ? mentionSources.filter((s): s is string => typeof s === 'string')
        : [];
      competitors.push({ name, url, description, mentionSources: sources });
    }
    const used = Array.isArray(obj.searchQueriesUsed)
      ? obj.searchQueriesUsed.filter((s): s is string => typeof s === 'string')
      : searchQueriesUsed;

    return { competitors, searchQueriesUsed: used };
  },
});

const competitorDiscoveryWorkflow = createWorkflow({
  id: 'competitor-discovery',
  inputSchema: workflowInputSchema,
  outputSchema: workflowOutputSchema,
})
  .then(planQueries)
  .then(executeSearches)
  .then(synthesize);

competitorDiscoveryWorkflow.commit();

export { competitorDiscoveryWorkflow };
