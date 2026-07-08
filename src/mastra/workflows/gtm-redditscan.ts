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
  target_subs: z.array(z.string()),
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

const classifyIntentSchema = z.object({
  userQuery: z.string(),
  productName: z.string(),
  description: z.string(),
  keyFeatures: z.array(z.string()),
  targetAudience: z.string(),
  pricingModel: z.string(),
  subsSearch: z.array(z.string()).optional().describe('Optional per-product sub slug override. If provided, replaces target_subs from the LLM entirely.'),
  competitors: z.array(z.object({ name: z.string(), url: z.string().optional().default('') })).optional().default([]).describe('Discovered competitors for deflection queries'),
});

const classifyIntent = createStep({
  id: 'classify-intent',
  description: 'Generate 3-5 sharp query angles + pain signals + subs from product context',
  inputSchema: classifyIntentSchema,
  outputSchema: intentSchema.extend({
    subsSource: z.enum(['override', 'classifier']),
    usedQueries: z.array(z.string()),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) throw new Error('inputData required');
    const agent = mastra?.getAgent('gtmIntentClassifier');
    if (!agent) throw new Error('gtmIntentClassifier not registered');

    const override =
      inputData.subsSearch && inputData.subsSearch.length > 0
        ? inputData.subsSearch.map((s) => s.replace(/^r\//, '').trim()).filter(Boolean)
        : null;

    const userQ = `PRODUCT: ${inputData.productName}
DESCRIPTION: ${inputData.description}
FEATURES: ${inputData.keyFeatures.join(', ') || '(none)'}
TARGET AUDIENCE: ${inputData.targetAudience}

USER REQUEST: "${inputData.userQuery}"

${
  override
    ? `HARD CONSTRAINT — use these subreddits EXACTLY in target_subs: ${override.map((s) => `r/${s}`).join(', ')}. Skip your own sub selection.`
    : `Pick target_subs yourself — focused communities preferred over broad ones (r/SaaS, r/sideproject, r/indiehackers over r/Entrepreneur, r/startups).`
}

${
  inputData.competitors && inputData.competitors.length > 0
    ? `\nCOMPETITORS (top ${inputData.competitors.length} from discovery):\n${inputData.competitors.map((c) => `- ${c.name}${c.url ? ` (${c.url})` : ''}`).join('\n')}\n\nFor these, output 1-2 competitor_deflection_queries per top 2-3 competitors using DISTINCT templates from {name} alternative | {name} too expensive | leaving {name} | better than {name} | {name} complaints | {name} not worth it. Do not output both {name} alternative AND alternative to {name} — same intent.`
    : `\nNo competitors provided. Return competitor_deflection_queries: [].`
}

Output strict JSON with EXACTLY 4 fields: pain_signals, target_subs, exclude_patterns, competitor_deflection_queries.`;

    const response = await agent.stream([{ role: 'user', content: userQ }]);
    let text = '';
    for await (const chunk of response.textStream) text += chunk;

    let parsed: {
      pain_signals: string[];
      target_subs: string[];
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
      target_subs: override ?? parsed.target_subs ?? [],
      exclude_patterns: parsed.exclude_patterns ?? [],
      competitor_deflection_queries: deflectionQueries,
      subsSource: (override ? 'override' : 'classifier') as 'override' | 'classifier',
      usedQueries: painSignals,
    };
  },
});

const fetchThreads = createStep({
  id: 'fetch-threads',
  description: 'Run pain_signals + competitor_deflection_queries in parallel against Google site:reddit.com, scoped to target_subs',
  inputSchema: intentSchema.extend({
    subsSource: z.enum(['override', 'classifier']),
    usedQueries: z.array(z.string()),
  }),
  outputSchema: z.object({
    intent: intentSchema,
    threads: z.array(threadSchema),
    fetchedSubs: z.array(z.string()),
    failedQueries: z.array(z.object({ query: z.string(), status: z.number() })),
    validQueries: z.array(z.string()),
    fetchDurationMs: z.number(),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) throw new Error('intent required');
    const t0 = Date.now();
    const acc: z.infer<typeof threadSchema>[] = [];
    const failedQueries: Array<{ query: string; status: number }> = [];

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

    const threads = await fetchGoogleRedditThreads({
      queries: validQueries,
      subs: inputData.target_subs,
      limit: 5,
      time: 'm',
    }).catch((err) => {
      console.error('[google-reddit] fetch failed:', err);
      return [];
    });

    if (threads.length === 0 && validQueries.length > 0) {
      failedQueries.push({ query: validQueries[0]!, status: 500 });
    }

    for (const t of threads) acc.push(t as z.infer<typeof threadSchema>);

    return {
      intent: {
        product_name: inputData.product_name,
        product_context: inputData.product_context,
        lens: inputData.lens,
        personas: inputData.personas,
        pain_signals: inputData.pain_signals,
        query_angles: inputData.query_angles,
        target_subs: inputData.target_subs,
        exclude_patterns: inputData.exclude_patterns,
        competitor_deflection_queries: inputData.competitor_deflection_queries ?? [],
      },
      threads: dedupe(acc),
      fetchedSubs: inputData.target_subs,
      failedQueries,
      validQueries,
      fetchDurationMs: Date.now() - t0,
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

const curateThreads = createStep({
  id: 'curate-threads',
  description: 'Single LLM call: decide is_buyer per thread, drop non-buyers, pin 2-3 quotes per kept, write headline',
  inputSchema: z.object({
    intent: intentSchema,
    threads: z.array(threadSchema),
    fetchedSubs: z.array(z.string()),
    failedQueries: z.array(z.object({ query: z.string(), status: z.number() })),
    validQueries: z.array(z.string()),
    fetchDurationMs: z.number(),
  }),
  outputSchema: z.object({
    run_id: z.string(),
    generated_at: z.string(),
    pipeline_cost_usd: z.number(),
    intent: intentSchema,
    top_threads: z.array(
      z.object({
        rank: z.number(),
        thread: threadSchema,
        buyer_reason: z.string(),
        top_quotes: z.array(z.string()),
      }),
    ),
    dropped: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        drop_reason: z.string(),
      }),
    ),
    stats: z.object({
      threads_scanned: z.number(),
      top_threads: z.number(),
      dropped: z.number(),
      runtime_s: z.number(),
      queries: z.number(),
      subs_source: z.string(),
    }),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) throw new Error('input required');
    const { intent, threads, validQueries } = inputData;
    const agent = mastra?.getAgent('gtmSynth');
    if (!agent) throw new Error('gtmSynth not registered');

    if (threads.length === 0) {
      return {
        run_id: `run_${Date.now().toString(36)}`,
        generated_at: new Date().toISOString(),
        pipeline_cost_usd: 0,
        intent,
        top_threads: [],
        dropped: [],
        stats: {
          threads_scanned: 0,
          top_threads: 0,
          dropped: 0,
          runtime_s: 0,
          queries: validQueries.length,
          subs_source: intent.target_subs.join(', '),
        },
      };
    }

    const PRE_RANK_CAP = 60;
    const rankedThreads = [...threads]
      .map((t) => ({
        t,
        engagement: (t.score ?? 0) + 0.5 * (t.num_comments ?? 0),
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, PRE_RANK_CAP)
      .map((x) => x.t);

    const threadTable = rankedThreads
      .map(
        (t, i) =>
          `[T${i}] [id=${t.id}] [r/${t.sub}] [score=${t.score ?? '?'} comments=${t.num_comments ?? '?'}] [u/${t.author ?? '?'}]\nTitle: ${t.title}\nBody: ${(t.content ?? '').slice(0, 500)}`,
      )
      .join('\n\n');

    const prompt = `PRODUCT: ${intent.product_name}
AUDIENCE: ${intent.personas.join(', ') || intent.product_context}
PAIN SIGNALS: ${intent.pain_signals.join(', ')}
SUBS: ${intent.target_subs.join(', ')}

THREADS (${threads.length} fetched across ${validQueries.length} queries):
${threadTable}

For each thread, decide is_buyer (true if OP is shopping/comparing or expressing pain the product solves; false if pitching service, freelance for hire, own product launch, venting without need, recruiting, off-topic).

Keep best 5-10 buyers. Drop the rest with a one-line reason.

Output strict JSON: { top_threads: [{ rank, thread_id, buyer_reason, top_quotes: [verbatim1, verbatim2] }], dropped: [{ thread_id, drop_reason }] }`;

    const t0 = Date.now();
    const response = await agent.stream([{ role: 'user', content: prompt }]);
    let text = '';
    for await (const chunk of response.textStream) text += chunk;
    const elapsed = (Date.now() - t0) / 1000;

    let parsed: {
      top_threads: Array<{
        rank: number;
        thread_id: string;
        buyer_reason: string;
        top_quotes: string[];
      }>;
      dropped: Array<{ thread_id: string; drop_reason: string }>;
    };
    try {
      parsed = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('Curator returned no JSON');
      parsed = JSON.parse(m[0]);
    }

    const findThread = (id: string) =>
      threads.find((ot) => ot.id === id) ??
      threads.find((ot) => ot.link.includes(id)) ??
      threads[0];

    const curatedThreads = (parsed.top_threads ?? []).map((t) => {
      const orig = findThread(t.thread_id);
      return {
        rank: t.rank,
        thread: orig ?? { id: t.thread_id, sub: 'unknown', title: 'Unknown', link: '' },
        buyer_reason: t.buyer_reason ?? '',
        top_quotes: (t.top_quotes ?? []).filter((q) => q && q !== 'N/A'),
      };
    });

    const dropped = (parsed.dropped ?? [])
      .map((d) => {
        const orig = findThread(d.thread_id);
        return {
          id: d.thread_id,
          title: orig?.title ?? '(unknown)',
          drop_reason: d.drop_reason ?? '',
        };
      })
      .filter((d) => !curatedThreads.some((c) => c.thread.id === d.id));

    return {
      run_id: `run_${Date.now().toString(36)}`,
      generated_at: new Date().toISOString(),
      pipeline_cost_usd: 0,
      intent,
      top_threads: curatedThreads,
      dropped,
      stats: {
        threads_scanned: threads.length,
        top_threads: curatedThreads.length,
        dropped: dropped.length,
        runtime_s: elapsed,
        queries: validQueries.length,
        subs_source: intent.target_subs.join(', '),
      },
    };
  },
});

const gtmRedditScanWorkflow = createWorkflow({
  id: 'gtm-redditscan',
  inputSchema: classifyIntentSchema,
  outputSchema: z.object({
    run_id: z.string(),
    generated_at: z.string(),
    pipeline_cost_usd: z.number(),
    intent: intentSchema,
    top_threads: z.array(z.any()),
    dropped: z.array(z.any()),
    stats: z.any(),
  }),
})
  .then(classifyIntent)
  .then(fetchThreads)
  .then(curateThreads);

gtmRedditScanWorkflow.commit();

export { gtmRedditScanWorkflow };
