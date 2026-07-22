import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { fetchGoogleRedditThreads } from '../tools/google-reddit';

const intentSchema = z.object({
  product_name: z.string(),
  product_context: z.string(),
  lens: z.string(),
  personas: z.array(z.string()),
  pain_signals: z.array(z.string()),
  query_angles: z.array(z.string()),
  exclude_patterns: z.array(z.string()),
  competitor_deflection_queries: z.array(z.string()).default([]),
});

// Validate pain_signals before using as /search queries.
// Drop phrases that contain generic framing words, are too long, or have no content word.
const GENERIC_QUERY_STOPS = [
  'tired of', 'looking for', 'looking to', 'best', 'smart', 'is there',
  'how do', 'i keep', 'fed up', 'anyone', 'need help', 'help with',
  'need a', 'needs a', 'help me', 'please help', 'is anyone',
  'fatigue', 'frustrat', 'redundan', 'tedium', 'annoyance',
  'issue', 'problem',
];

function isValidQueryPhrase(p: string): boolean {
  const s = p.trim().toLowerCase();
  if (s.length < 4) return false;
  const words = s.split(/\s+/);
  if (words.length < 2 || words.length > 4) return false;
  if (GENERIC_QUERY_STOPS.some((stop) => s.includes(stop))) return false;
  // require at least one word with length >= 5
  if (!words.some((w) => w.replace(/[^a-z0-9]/g, '').length >= 5)) return false;
  return true;
}

const threadSchema = z.object({
  id: z.string(),
  sub: z.string(),
  title: z.string(),
  link: z.string(),
  author: z.string().optional(),
  updated: z.string().optional(),
  content: z.string().optional(),
  score: z.number().optional(),
  num_comments: z.number().optional(),
  upvote_ratio: z.number().optional(),
  fullname: z.string().optional(),
});

const statsSchema = z.object({
  threads_scanned: z.number(),
  top_threads: z.number(),
  runtime_s: z.number(),
  queries: z.number(),
});

const classifyIntentSchema = z.object({
  userQuery: z.string(),
  productName: z.string(),
  description: z.string(),
  keyFeatures: z.array(z.string()),
  targetAudience: z.string(),
  pricingModel: z.string(),
  competitors: z.array(z.object({ name: z.string(), url: z.string().optional().default('') })).optional().default([]).describe('Discovered competitors for deflection queries'),
});

const PRE_RANK_CAP = 60;

// Regex patterns for obvious non-buyer threads that engagement may miss
const DEMOTE_PATTERNS: RegExp[] = [
  /^(I|we)\s+(built|launched|created|made|shipped|released)\b/i,
  /show\s*h(n|r)\b/i,
  /\b(my|our)\s+(startup|saas|tool|app|product|side\s*project)\s+(just\s+)?(launched|released|is\s+live)\b/i,
  /\b(hiring|looking|searching)\s+(a\s+|an\s+|for\s+(a\s+|an\s+)?)?(co-?founder|partner)\b/i,
  /\b(freelance|for\s*hire|available\s*for)\b/i,
  /\b(we|our\s+team)\s+(are|is)\s+(hiring|recruiting)\b/i,
];

function isBuyerThread(t: z.infer<typeof threadSchema>): boolean {
  const text = `${t.title} ${t.content ?? ''}`;
  return !DEMOTE_PATTERNS.some((re) => re.test(text));
}

const classifyIntent = createStep({
  id: 'classify-intent',
  description: 'Generate pain signals + deflection queries from product context',
  inputSchema: classifyIntentSchema,
  outputSchema: intentSchema.extend({
    usedQueries: z.array(z.string()),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) throw new Error('inputData required');
    const agent = mastra?.getAgent('gtmIntentClassifier');
    if (!agent) throw new Error('gtmIntentClassifier not registered');

    const userQ = `PRODUCT: ${inputData.productName}
DESCRIPTION: ${inputData.description}
FEATURES: ${inputData.keyFeatures.join(', ') || '(none)'}
TARGET AUDIENCE: ${inputData.targetAudience}

USER REQUEST: "${inputData.userQuery}"

${
  inputData.competitors && inputData.competitors.length > 0
    ? `\nCOMPETITORS (top ${inputData.competitors.length} from discovery):\n${inputData.competitors.map((c) => `- ${c.name}${c.url ? ` (${c.url})` : ''}`).join('\n')}\n\nFor these, output 1-2 competitor_deflection_queries per top 2-3 competitors using DISTINCT templates from {name} alternative | {name} too expensive | leaving {name} | better than {name} | {name} complaints | {name} not worth it. Do not output both {name} alternative AND alternative to {name} — same intent.`
    : `\nNo competitors provided. Return competitor_deflection_queries: [].`
}

Output strict JSON with EXACTLY 3 fields: pain_signals, exclude_patterns, competitor_deflection_queries.`;

    const response = await agent.stream([{ role: 'user', content: userQ }]);
    let text = '';
    for await (const chunk of response.textStream) text += chunk;

    let parsed: {
      pain_signals: string[];
      exclude_patterns: string[];
      competitor_deflection_queries: string[];
    };
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Intent classifier returned no JSON');
      parsed = JSON.parse(match[0]);
    }

    const painSignals = parsed.pain_signals ?? [];
    const deflectionQueries = (parsed.competitor_deflection_queries ?? []).filter((q) => typeof q === 'string' && q.trim().length > 0);

    return {
      product_name: inputData.productName,
      product_context: inputData.description,
      lens: 'user_acquisition',
      personas: inputData.targetAudience ? [inputData.targetAudience] : [],
      pain_signals: painSignals,
      query_angles: painSignals,
      exclude_patterns: parsed.exclude_patterns ?? [],
      competitor_deflection_queries: deflectionQueries,
      usedQueries: painSignals,
    };
  },
});

const workflowOutputSchema = z.object({
  run_id: z.string(),
  generated_at: z.string(),
  pipeline_cost_usd: z.number(),
  intent: intentSchema,
  top_threads: z.array(threadSchema),
  stats: statsSchema,
});

const fetchThreads = createStep({
  id: 'fetch-threads',
  description: 'Run pain_signals + competitor_deflection_queries in parallel against Google site:reddit.com, dedupe, apply regex demote, sort by engagement',
  inputSchema: intentSchema.extend({
    usedQueries: z.array(z.string()),
  }),
  outputSchema: workflowOutputSchema,
  execute: async ({ inputData }) => {
    if (!inputData) throw new Error('intent required');
    const t0 = Date.now();

    const validPainSignals = inputData.pain_signals.filter(isValidQueryPhrase);
    const validDeflections = (inputData.competitor_deflection_queries ?? []).filter(isValidQueryPhrase);

    const seen = new Set<string>();
    const allQueries: string[] = [];
    for (const q of [...validPainSignals, ...validDeflections]) {
      const key = q.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      allQueries.push(q);
    }
    const validQueries = allQueries.slice(0, 12);

    const rawThreads = await fetchGoogleRedditThreads({
      queries: validQueries,
      limit: 5,
      time: 'm',
    });

    const deduped = dedupe(rawThreads);
    const buyers = deduped.filter(isBuyerThread);

    // Order preserved from dedupe: per-query Google's site:reddit.com ranking,
    // grouped by query, deduped by reddit_id. Cap at PRE_RANK_CAP.
    const ranked = buyers.slice(0, PRE_RANK_CAP);

    const elapsed = (Date.now() - t0) / 1000;

    return {
      run_id: `run_${Date.now().toString(36)}`,
      generated_at: new Date().toISOString(),
      pipeline_cost_usd: 0,
      intent: {
        product_name: inputData.product_name,
        product_context: inputData.product_context,
        lens: inputData.lens,
        personas: inputData.personas,
        pain_signals: inputData.pain_signals,
        query_angles: inputData.query_angles,
        exclude_patterns: inputData.exclude_patterns,
        competitor_deflection_queries: inputData.competitor_deflection_queries ?? [],
      },
      top_threads: ranked,
      stats: {
        threads_scanned: deduped.length,
        top_threads: ranked.length,
        runtime_s: elapsed,
        queries: validQueries.length,
      },
    };
  },
});

function dedupe(threads: z.infer<typeof threadSchema>[]): z.infer<typeof threadSchema>[] {
  const seen = new Set<string>();
  const out: z.infer<typeof threadSchema>[] = [];
  for (const t of threads) {
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    out.push(t);
  }
  return out;
}

const gtmRedditScanWorkflow = createWorkflow({
  id: 'gtm-redditscan',
  inputSchema: classifyIntentSchema,
  outputSchema: workflowOutputSchema,
})
  .then(classifyIntent)
  .then(fetchThreads);

gtmRedditScanWorkflow.commit();

export { gtmRedditScanWorkflow };
