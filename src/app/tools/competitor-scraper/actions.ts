"use server";

import { z } from "zod";
import { mastra } from "@/mastra";
import { searchExa } from "@/mastra/tools/search-web";

const angleEnum = z.enum(["direct", "pain", "audience", "alternative", "oss"]);

const competitorSchema = z.object({
  name: z.string(),
  url: z.string(),
  description: z.string(),
  mentionSources: z.array(z.string()),
});

const productSchema = z.object({
  productName: z.string(),
  description: z.string(),
  keyFeatures: z.array(z.string()),
  targetAudience: z.string(),
  pricingModel: z.string().optional(),
});

export type Competitor = z.infer<typeof competitorSchema>;

export type CompetitorResult =
  | {
      ok: true;
      product: z.infer<typeof productSchema>;
      competitors: Competitor[];
      searchQueriesUsed: string[];
    }
  | { ok: false; error: string };

const ANGLE_CATEGORY: Record<z.infer<typeof angleEnum>, "company" | undefined> = {
  direct: "company",
  pain: undefined,
  audience: undefined,
  alternative: "company",
  oss: undefined,
};

const SEARCH_RESULTS_CAP = 30;
const RESULTS_PER_QUERY = 5;

function extractJsonObject(text: string): string | null {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1]!.trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;
  return text.slice(first, last + 1);
}

export async function runCompetitorScraper(rawUrl: string): Promise<CompetitorResult> {
  let url = rawUrl.trim();
  if (!url) return { ok: false, error: "Enter a product URL." };
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  const productAgent = mastra.getAgent("productAnalystAgent");
  if (!productAgent) return { ok: false, error: "productAnalystAgent not registered" };
  const competitorAgent = mastra.getAgent("competitorAnalystAgent");
  if (!competitorAgent) return { ok: false, error: "competitorAnalystAgent not registered" };

  let product: z.infer<typeof productSchema>;
  try {
    const object = await productAgent.generate(`Research this product thoroughly: ${url}`, {
      structuredOutput: {
        schema: productSchema,
        model: "openrouter/deepseek/deepseek-v4-flash",
      },
      maxSteps: 6,
    });
    if (!object || !object.object) {
      return { ok: false, error: "product analysis produced no result" };
    }
    product = object.object;
  } catch (err) {
    return {
      ok: false,
      error: `Product analysis failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // 2. Plan 5 search queries via competitorAnalystAgent
  const queries: Array<{ angle: z.infer<typeof angleEnum>; query: string }> = [];
  try {
    const planned = await competitorAgent.generate(
      "PLAN QUERIES for this product:\n" +
        `Name: ${product.productName}\n` +
        `Description: ${product.description}\n` +
        `Key features: ${product.keyFeatures.join("; ")}\n` +
        `Audience: ${product.targetAudience}`,
    );
    const json = extractJsonObject(planned.text);
    if (!json) throw new Error("planner returned no JSON");
    const parsed = JSON.parse(json) as { queries?: unknown };
    if (Array.isArray(parsed.queries)) {
      for (const q of parsed.queries) {
        if (!q || typeof q !== "object") continue;
        const a = (q as { angle?: unknown }).angle;
        const t = (q as { query?: unknown }).query;
        if (typeof a !== "string" || typeof t !== "string") continue;
        const check = angleEnum.safeParse(a);
        if (!check.success) continue;
        const trimmed = t.trim();
        if (trimmed.length < 5) continue;
        queries.push({ angle: check.data, query: trimmed });
      }
    }
  } catch (err) {
    return {
      ok: false,
      error: `Query planning failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  if (queries.length === 0) {
    return { ok: false, error: "planner produced no usable queries" };
  }

  // 3. Execute searches in parallel
  type DedupedResult = {
    title: string;
    url: string;
    domain: string;
    highlights: string[] | null;
    text: string;
    sourceAngle: z.infer<typeof angleEnum>;
    sourceQuery: string;
  };

  const dedup = new Map<string, DedupedResult>();
  const searchQueriesUsed: string[] = [];

  await Promise.all(
    queries.map(async (q) => {
      try {
        const result = await searchExa({
          query: q.query,
          numResults: RESULTS_PER_QUERY,
          category: ANGLE_CATEGORY[q.angle],
          maxTextCharacters: 1200,
        });
        for (const r of result.results) {
          try {
            const domain = new URL(r.url).hostname.replace(/^www\./, "");
            if (dedup.has(domain)) continue;
            dedup.set(domain, {
              title: r.title,
              url: r.url,
              domain,
              highlights: r.highlights,
              text: r.text,
              sourceAngle: q.angle,
              sourceQuery: q.query,
            });
            if (dedup.size >= SEARCH_RESULTS_CAP) break;
          } catch {
            /* skip unparseable url */
          }
        }
        searchQueriesUsed.push(q.query);
      } catch (err) {
        // ponytail: best-effort — log and continue
        console.warn(`[competitor-scraper] search failed for "${q.query}":`, err);
      }
    }),
  );

  if (dedup.size === 0) {
    return { ok: false, error: "No search results came back." };
  }

  // 4. Synthesize via competitorAnalystAgent
  const resultsList = Array.from(dedup.values())
    .map(
      (r, i) =>
        `[${i + 1}] angle=${r.sourceAngle} domain=${r.domain}\ntitle: ${r.title}\nurl: ${r.url}\nhighlights: ${(r.highlights ?? []).join(" | ")}\ntext: ${r.text.slice(0, 600)}`,
    )
    .join("\n\n");

  try {
    const synth = await competitorAgent.generate(
      "SYNTHESIZE COMPETITORS.\n\n" +
        `Product:\nName: ${product.productName}\nDescription: ${product.description}\nFeatures: ${product.keyFeatures.join("; ")}\nAudience: ${product.targetAudience}\n\n` +
        `Search results (deduped, ${dedup.size} entries):\n${resultsList}\n\n` +
        "Output strict JSON: { competitors: [{name, url, description, mentionSources}], searchQueriesUsed: [..echo..] }",
    );
    const json = extractJsonObject(synth.text);
    if (!json) throw new Error("synthesizer returned no JSON");
    const parsed = JSON.parse(json) as {
      competitors?: unknown;
      searchQueriesUsed?: unknown;
    };
    const competitors: Competitor[] = [];
    if (Array.isArray(parsed.competitors)) {
      for (const c of parsed.competitors) {
        if (!c || typeof c !== "object") continue;
        const name = (c as { name?: unknown }).name;
        const u = (c as { url?: unknown }).url;
        const description = (c as { description?: unknown }).description;
        const mentionSources = (c as { mentionSources?: unknown }).mentionSources;
        if (typeof name !== "string" || typeof u !== "string" || typeof description !== "string") continue;
        const sources = Array.isArray(mentionSources)
          ? mentionSources.filter((s): s is string => typeof s === "string")
          : [];
        const check = competitorSchema.safeParse({
          name,
          url: u,
          description,
          mentionSources: sources,
        });
        if (check.success) competitors.push(check.data);
      }
    }
    const used = Array.isArray(parsed.searchQueriesUsed)
      ? parsed.searchQueriesUsed.filter((s): s is string => typeof s === "string")
      : searchQueriesUsed;
    return { ok: true, product, competitors, searchQueriesUsed: used };
  } catch (err) {
    return {
      ok: false,
      error: `Synthesis failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
