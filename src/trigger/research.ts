import { task } from "@trigger.dev/sdk";
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
): Promise<Record<string, unknown>> {
  // First attempt — stream tool calls
  let result = await agent.stream(prompt, { ...opts, onStepFinish: onToolCall });
  let object = await result.object;

  // Retry once without streaming tool calls (avoids duplicates)
  if (!object) {
    await researchStream.append(JSON.stringify({
      type: "tool-call",
      toolName: "structured-output-retry",
      args: { url: "Retrying structured extraction..." },
    }));
    result = await agent.stream(prompt, opts);
    object = await result.object;
  }

  if (!object) {
    throw new Error("Structured output extraction failed after retry");
  }

  return object as Record<string, unknown>;
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
  run: async (payload: { url: string }) => {
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
          structuredOutput: { schema: productSchema, model: "openrouter/owl-alpha" },
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

export const competitorResearchTask = task({
  id: "competitor-research",
  maxDuration: 3600,
  run: async (payload: z.infer<typeof productContextSchema>) => {
    const agent = mastra.getAgent("discoveryAgent");
    if (!agent) {
      await researchStream.append(JSON.stringify({ type: "error", error: "Discovery agent not found" }));
      throw new Error("Discovery agent not found");
    }

    const prompt = `Find competitors for: ${payload.url}

Product name: ${payload.productName}
Description: ${payload.description}
Features: ${payload.keyFeatures.join(", ")}`;

    try {
      const object = await runWithRetry(
        agent,
        prompt,
        {
          structuredOutput: { schema: competitorSchema, model: "openrouter/owl-alpha" },
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
      );

      const obj = object as { competitors: Array<Record<string, unknown>>; searchQueriesUsed: string[] };
      const result = {
        competitors: obj.competitors,
        searchQueriesUsed: obj.searchQueriesUsed ?? [],
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
  run: async (payload: z.infer<typeof hnContextSchema>) => {
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
          structuredOutput: { schema: hnThreadsSchema, model: "openrouter/owl-alpha" },
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
