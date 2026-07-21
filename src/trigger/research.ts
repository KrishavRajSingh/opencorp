import { task } from "@trigger.dev/sdk/v3";
import { mastra } from "@/mastra";
import { z } from "zod/v4";
import type { Agent } from "@mastra/core/agent";
import { researchStream } from "./streams";

type StreamOptions = {
  structuredOutput: { schema: z.ZodObject<z.ZodRawShape>; model: string };
  maxSteps: number;
};

type ToolSummary = {
  url?: string;
  query?: string;
  title?: string;
  snippet?: string;
};

function summarizeToolResult(
  toolName: string,
  args: unknown,
  result: unknown,
): ToolSummary {
  const a = (args ?? {}) as Record<string, unknown>;
  const r = (result ?? {}) as Record<string, unknown>;

  if (toolName === "fetchPageTool" || toolName === "fetch-page") {
    const content = typeof r.content === "string" ? r.content : "";
    return {
      url: typeof a.url === "string" ? a.url : undefined,
      title: typeof r.title === "string" ? r.title : undefined,
      snippet: content ? collapseWhitespace(content).slice(0, 240) : undefined,
    };
  }

  if (toolName === "searchWebTool" || toolName === "search-web") {
    const results = Array.isArray(r.results) ? (r.results as Array<Record<string, unknown>>) : [];
    const first = results[0];
    const highlights = Array.isArray(first?.highlights)
      ? (first.highlights as string[])
      : [];
    const text = typeof first?.text === "string" ? first.text : "";
    return {
      query: typeof a.query === "string" ? a.query : undefined,
      title: typeof first?.title === "string" ? first.title : undefined,
      snippet:
        highlights[0] ??
        (text ? collapseWhitespace(text).slice(0, 240) : undefined),
    };
  }

  if (toolName === "searchHNTool" || toolName === "search-hn") {
    const results = Array.isArray(r.results) ? (r.results as Array<Record<string, unknown>>) : [];
    const first = results[0];
    const topComments = Array.isArray(first?.topComments)
      ? (first.topComments as Array<Record<string, unknown>>)
      : [];
    const snippetText =
      typeof first?.snippet === "string" && first.snippet
        ? stripHtml(first.snippet)
        : typeof topComments[0]?.text === "string"
          ? (topComments[0].text as string)
          : "";
    return {
      query: typeof a.query === "string" ? a.query : undefined,
      title: typeof first?.title === "string" ? first.title : undefined,
      snippet: snippetText ? collapseWhitespace(snippetText).slice(0, 240) : undefined,
    };
  }

  return {};
}

function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ");
}

async function runWithRetry(
  agent: Agent,
  prompt: string,
  opts: StreamOptions,
  onToolCall: (step: {
    toolCalls?: Array<{
      payload: { toolCallId: string; toolName: string; args?: unknown };
    }>;
    toolResults?: Array<{ payload: unknown }>;
  }) => void,
  signal?: AbortSignal,
): Promise<Record<string, unknown>> {
  const MAX_STREAM_ATTEMPTS = 3;
  const RATE_LIMIT_BACKOFF_MS = 30_000;
  const TRANSIENT_BACKOFF_BASE_MS = 2_000;
  const TRANSIENT_BACKOFF_MAX_MS = 30_000;

  function isRateLimitError(err: unknown): boolean {
    if (!(err instanceof Error)) return false;
    const msg = err.message.toLowerCase();
    return (
      msg.includes("rate limit") ||
      msg.includes("429") ||
      msg.includes("free-models-per-min")
    );
  }

  function backoffMs(attempt: number, rateLimited: boolean): number {
    if (rateLimited) return RATE_LIMIT_BACKOFF_MS;
    const exp = Math.min(
      TRANSIENT_BACKOFF_BASE_MS * 2 ** (attempt - 1),
      TRANSIENT_BACKOFF_MAX_MS,
    );
    return Math.floor(exp / 2 + Math.random() * (exp / 2));
  }

  // setTimeout that rejects with AbortError as soon as signal aborts, so a
  // canceled run exits the backoff immediately instead of lingering for the
  // full retry interval (and then starting another attempt).
  function sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      const onAbort = () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      };
      const timer = setTimeout(() => {
        signal?.removeEventListener("abort", onAbort);
        resolve();
      }, ms);
      signal?.addEventListener("abort", onAbort, { once: true });
    });
  }

  if (signal?.aborted) {
    throw new DOMException("Aborted before start", "AbortError");
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_STREAM_ATTEMPTS; attempt++) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    try {
      const streamOpts =
        attempt === 1
          ? { ...opts, onStepFinish: onToolCall }
          : opts;

      const result = await agent.stream(prompt, { ...streamOpts, abortSignal: signal });
      const object = await result.object;

      if (object) {
        return object as Record<string, unknown>;
      }

      lastError = new Error("Structured output returned null");
      await researchStream.append(
        JSON.stringify({
          type: "tool-call",
          toolName: "structured-output-retry",
          args: { attempt, reason: "empty object" },
        }),
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }
      lastError = err instanceof Error ? err : new Error(String(err));
      const rateLimited = isRateLimitError(lastError);

      await researchStream.append(
        JSON.stringify({
          type: "tool-call",
          toolName: rateLimited ? "rate-limit-retry" : "stream-retry",
          args: {
            attempt,
            reason: rateLimited ? "rate limit" : "stream error",
            message: lastError.message.slice(0, 200),
          },
        }),
      );
    }

    if (attempt < MAX_STREAM_ATTEMPTS) {
      const rateLimited = isRateLimitError(lastError);
      const wait = backoffMs(attempt, rateLimited);
      await sleep(wait, signal);
    }
  }

  throw new Error(
    `Structured output extraction failed after ${MAX_STREAM_ATTEMPTS} attempts. ` +
      `Last error: ${lastError?.message ?? "no object returned"}`,
  );
}

const productSchema = z.object({
  productName: z.string(),
  description: z.string(),
  keyFeatures: z.array(z.string()),
  targetAudience: z.string(),
  pricingModel: z.string(),
});

export const productResearchTask = task({
  id: "product-research",
  maxDuration: 3600,
  run: async (payload: { url: string }, { signal }) => {
    const agent = mastra.getAgent("productAnalystAgent");
    if (!agent) {
      await researchStream.append(JSON.stringify({ type: "error", error: "Product analyst agent not found" }));
      throw new Error("Product analyst agent not found");
    }

    let validatedUrl = payload.url;
    if (!/^https?:\/\//i.test(validatedUrl)) {
      validatedUrl = `https://${validatedUrl}`;
    }

    try {
      const object = await runWithRetry(
        agent,
        `Research this product thoroughly: ${validatedUrl}`,
        {
          structuredOutput: { schema: productSchema, model: "openrouter/deepseek/deepseek-v4-flash" },
          maxSteps: 6,
        },
        (step) => {
          const toolCalls = step.toolCalls ?? [];
          const toolResults = step.toolResults ?? [];
          for (let i = 0; i < toolCalls.length; i++) {
            const tc = toolCalls[i];
            const tr = toolResults[i];
            const summary = summarizeToolResult(
              tc.payload.toolName ?? "unknown",
              tc.payload.args,
              tr?.payload,
            );
            researchStream.append(JSON.stringify({
              type: "tool-call",
              toolCallId: tc.payload.toolCallId ?? crypto.randomUUID(),
              toolName: tc.payload.toolName ?? "unknown",
              args: tc.payload.args as { url?: string } | undefined,
              ...summary,
            }));
          }
        },
        signal,
      );

      const result = {
        url: validatedUrl,
        ...object,
      };

      await researchStream.append(JSON.stringify({ type: "result", ...result }));
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      await researchStream.append(JSON.stringify({ type: "error", error: message }));
      throw err;
    }
  },
});

const competitorSchema = z.object({
  competitors: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      description: z.string(),
      mentionSources: z.array(z.string()),
    }),
  ),
  searchQueriesUsed: z.array(z.string()),
});

const productContextSchema = z.object({
  url: z.string(),
  productName: z.string(),
  description: z.string(),
  keyFeatures: z.array(z.string()),
});

const competitorTaskPayloadSchema = productContextSchema.extend({
  /** When set, result is written to research_sessions server-side. */
  sessionId: z.string().uuid().optional(),
});

async function persistCompetitorResult(
  sessionId: string,
  result: { competitors: unknown; searchQueriesUsed: string[] },
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase admin env for competitor persist");
  }
  // Inline admin client — avoid importing next/headers via @/lib/supabase/server.
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await supabase
    .from("research_sessions")
    .update({
      competitor_result: result,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);
  if (error) {
    throw new Error(`Failed to persist competitors: ${error.message}`);
  }
}

export const competitorResearchTask = task({
  id: "competitor-research",
  maxDuration: 3600,
  run: async (payload: z.infer<typeof competitorTaskPayloadSchema>, { signal }) => {
    const input = competitorTaskPayloadSchema.parse(payload);
    const agent = mastra.getAgent("discoveryAgent");
    if (!agent) {
      await researchStream.append(JSON.stringify({ type: "error", error: "Discovery agent not found" }));
      throw new Error("Discovery agent not found");
    }

    const prompt = `Find competitors for: ${input.url}

Product name: ${input.productName}
Description: ${input.description}
Features: ${input.keyFeatures.join(", ")}`;

    try {
      const object = await runWithRetry(
        agent,
        prompt,
        {
          structuredOutput: { schema: competitorSchema, model: "openrouter/deepseek/deepseek-v4-flash" },
          maxSteps: 8,
        },
        (step) => {
          const toolCalls = step.toolCalls ?? [];
          const toolResults = step.toolResults ?? [];
          for (let i = 0; i < toolCalls.length; i++) {
            const tc = toolCalls[i];
            const tr = toolResults[i];
            const summary = summarizeToolResult(
              tc.payload.toolName ?? "unknown",
              tc.payload.args,
              tr?.payload,
            );
            researchStream.append(JSON.stringify({
              type: "tool-call",
              toolCallId: tc.payload.toolCallId ?? crypto.randomUUID(),
              toolName: tc.payload.toolName ?? "unknown",
              args: tc.payload.args as { url?: string } | undefined,
              ...summary,
            }));
          }
        },
        signal,
      );

      const obj = object as { competitors: Array<Record<string, unknown>>; searchQueriesUsed: string[] };
      const result = {
        competitors: obj.competitors,
        searchQueriesUsed: obj.searchQueriesUsed ?? [],
      };

      if (input.sessionId) {
        try {
          await persistCompetitorResult(input.sessionId, result);
        } catch (persistErr) {
          const msg =
            persistErr instanceof Error ? persistErr.message : "persist failed";
          await researchStream.append(
            JSON.stringify({ type: "error", error: msg }),
          );
          throw persistErr;
        }
      }

      await researchStream.append(JSON.stringify({ type: "result", ...result }));
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      await researchStream.append(JSON.stringify({ type: "error", error: message }));
      throw err;
    }
  },
});

const hnThreadSchema = z.object({
  objectID: z.string(),
  title: z.string(),
  url: z.string().nullable(),
  points: z.number(),
  comments: z.number(),
  author: z.string(),
  date: z.string(),
  whyRelevant: z.string(),
  topCommentSnippet: z.string().nullable(),
});

const hnThreadsSchema = z.object({
  threads: z.array(hnThreadSchema),
});

const hnContextSchema = productContextSchema.extend({
  competitors: z.array(
    z.object({
      name: z.string(),
      url: z.string().optional().default(""),
    }).passthrough(),
  ).optional().default([]),
});

export const hnThreadsTask = task({
  id: "hn-threads",
  maxDuration: 3600,
  run: async (payload: z.infer<typeof hnContextSchema>, { signal }) => {
    const agent = mastra.getAgent("discoveryAgent");
    if (!agent) {
      await researchStream.append(JSON.stringify({ type: "error", error: "Discovery agent not found" }));
      throw new Error("Discovery agent not found");
    }

    const input = hnContextSchema.parse(payload);

    const competitorList = input.competitors
      .map((c) => `- ${c.name}${c.url ? ` (${c.url})` : ""}`)
      .join("\n");

    const prompt = `Find Hacker News posts where I can pitch my product — Show HN launches by adjacent tools, Ask HN threads about the problem space, and discussions where users complain about the current way of doing things.

For searchHNTool calls: pass 1-3 short keyword terms (e.g. "autofill extension", "job application AI", "form filling Show HN"), not full sentences. The tool uses Algolia's built-in similarQuery (OR-match with stop-word removal) so it handles both short and verbose queries. One call per distinct angle is enough. Vary the angle (problem framing, competitor name, audience) between calls — never call twice with a longer paraphrase of the same angle.

Aim for 3-6 searchHNTool calls total, each with a different angle, then stop. Read the top results and pick the most relevant threads to surface in the output.

Description: ${input.description}
Features: ${input.keyFeatures.join(", ")}

Competitors:
${competitorList || "(none provided)"}`;

    try {
      const object = await runWithRetry(
        agent,
        prompt,
        {
          structuredOutput: { schema: hnThreadsSchema, model: "openrouter/deepseek/deepseek-v4-flash" },
          maxSteps: 6,
        },
        (step) => {
          const toolCalls = step.toolCalls ?? [];
          const toolResults = step.toolResults ?? [];
          for (let i = 0; i < toolCalls.length; i++) {
            const tc = toolCalls[i];
            const tr = toolResults[i];
            const summary = summarizeToolResult(
              tc.payload.toolName ?? "unknown",
              tc.payload.args,
              tr?.payload,
            );
            researchStream.append(JSON.stringify({
              type: "tool-call",
              toolCallId: tc.payload.toolCallId ?? crypto.randomUUID(),
              toolName: tc.payload.toolName ?? "unknown",
              args: tc.payload.args as { url?: string; query?: string } | undefined,
              track: "hn",
              ...summary,
            }));
          }
        },
        signal,
      );

      const obj = object as { threads: Array<Record<string, unknown>> };
      const result = { threads: obj.threads ?? [] };

      await researchStream.append(JSON.stringify({ type: "result", ...result }));
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      await researchStream.append(JSON.stringify({ type: "error", error: message }));
      throw err;
    }
  },
});

const gtmRedditInputSchema = z.object({
  url: z.string(),
  productName: z.string(),
  description: z.string(),
  keyFeatures: z.array(z.string()).optional().default([]),
  targetAudience: z.string().optional().default(""),
  pricingModel: z.string().optional().default(""),
  subsSearch: z.array(z.string()).optional().default([]),
  competitors: z.array(
    z.object({
      name: z.string(),
      url: z.string().optional().default(""),
    }).passthrough(),
  ).optional().default([]),
});

export const gtmRedditScanTask = task({
  id: "gtm-reddit-scan",
  maxDuration: 1800,
  run: async (payload: z.infer<typeof gtmRedditInputSchema>) => {
    const wf = mastra.getWorkflow("gtmRedditScanWorkflow") as unknown as {
      createRun: (opts?: { runId?: string }) => Promise<{
        runId: string;
        start: (input: { inputData: {
          userQuery: string;
          productName: string;
          description: string;
          keyFeatures: string[];
          targetAudience: string;
          pricingModel: string;
          subsSearch?: string[];
          competitors?: Array<{ name: string; url: string }>;
        } }) => Promise<{ result: unknown }>;
      }>;
    };
    if (!wf) {
      await researchStream.append(JSON.stringify({ type: "error", error: "Reddit workflow not registered" }));
      throw new Error("Reddit workflow not registered");
    }

    const input = gtmRedditInputSchema.parse(payload);
    const userQuery = `Find me users for ${input.productName}: ${input.description}. ` +
      `Target audience: ${input.targetAudience}. Pricing: ${input.pricingModel}. ` +
      `Look for potential users who match the target persona and exhibit the product's core pain points.`;

    const subsSearch = input.subsSearch.filter((s) => s.trim().length > 0);
    // Optional enrichment only — never discover competitors here. 0 is fine:
    // workflow emits competitor_deflection_queries: [] and still ranks pain/user threads.
    const competitors = (input.competitors ?? [])
      .map((c) => ({ name: c.name, url: c.url ?? "" }))
      .filter((c) => c.name.trim().length > 0);

    try {
      await researchStream.append(JSON.stringify({
        type: "tool-call",
        toolName: "gtm-reddit-scan",
        toolCallId: crypto.randomUUID(),
        track: "reddit",
        snippet:
          competitors.length > 0
            ? `Scanning Reddit for users of ${input.productName} (${competitors.length} alts for deflection)…`
            : `Scanning Reddit for users of ${input.productName}…`,
      }));

      const run = await wf.createRun({ runId: `reddit_${Date.now().toString(36)}` });
      const result = await run.start({
        inputData: {
          userQuery,
          productName: input.productName,
          description: input.description,
          keyFeatures: input.keyFeatures,
          targetAudience: input.targetAudience,
          pricingModel: input.pricingModel,
          subsSearch,
          competitors,
        },
      });
      const brief = (result as { result?: Record<string, unknown> }).result ?? {};

      await researchStream.append(JSON.stringify({ type: "result", track: "reddit", ...brief }));
      return brief;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      await researchStream.append(JSON.stringify({ type: "error", track: "reddit", error: message }));
      throw err;
    }
  },
});
