import { task } from "@trigger.dev/sdk";
import { mastra } from "@/mastra";
import { z } from "zod/v4";
import type { Agent } from "@mastra/core/agent";
import { researchStream } from "./streams";

type StreamOptions = {
  structuredOutput: { schema: z.ZodObject<z.ZodRawShape>; model: string };
  maxSteps: number;
};

async function runWithRetry(
  agent: Agent,
  prompt: string,
  opts: StreamOptions,
  onToolCall: (step: { toolCalls?: Array<{ payload: { toolCallId: string; toolName: string; args?: unknown } }> }) => void,
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
  techStack: z.string(),
  marketPosition: z.string(),
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
          for (const tc of toolCalls) {
            researchStream.append(JSON.stringify({
              type: "tool-call",
              toolCallId: tc.payload.toolCallId ?? crypto.randomUUID(),
              toolName: tc.payload.toolName ?? "unknown",
              args: tc.payload.args as { url?: string } | undefined,
            }));
          }
        },
      );

      const researchSummary = [
        `Product: ${(object as Record<string, string>).productName}`,
        (object as Record<string, string>).description && `Description: ${(object as Record<string, string>).description}`,
        ((object as Record<string, string[]>).keyFeatures?.length ?? 0) > 0 && `Key Features: ${(object as Record<string, string[]>).keyFeatures.join(", ")}`,
        (object as Record<string, string>).targetAudience && `Target Audience: ${(object as Record<string, string>).targetAudience}`,
        (object as Record<string, string>).pricingModel && `Pricing: ${(object as Record<string, string>).pricingModel}`,
        (object as Record<string, string>).techStack && `Tech Stack: ${(object as Record<string, string>).techStack}`,
        (object as Record<string, string>).marketPosition && `Market Position: ${(object as Record<string, string>).marketPosition}`,
      ]
        .filter(Boolean)
        .join("\n\n");

      const result = {
        url: validatedUrl,
        ...object,
        researchSummary,
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
      featureSet: z.string(),
      pricingModel: z.string(),
      targetAudience: z.string(),
      strengths: z.string(),
      weaknesses: z.string(),
      mentionSources: z.array(z.string()),
    }),
  ),
  searchQueriesUsed: z.array(z.string()),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const productContextSchema = z.object({
  url: z.string(),
  productName: z.string(),
  description: z.string(),
  researchSummary: z.string(),
  keyFeatures: z.array(z.string()),
  targetAudience: z.string(),
  pricingModel: z.string(),
  techStack: z.string(),
  marketPosition: z.string(),
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

    const prompt = `Research competitors for this product.

PRODUCT URL: ${payload.url}

PRODUCT RESEARCH:
${payload.researchSummary}

Find every competitor, alternative, and substitute product. Search the web for company pages and comparison articles. Search HN for discussions about alternatives and switching. Read competitor landing pages to understand their positioning and features.`;

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
          for (const tc of toolCalls) {
            researchStream.append(JSON.stringify({
              type: "tool-call",
              toolCallId: tc.payload.toolCallId ?? crypto.randomUUID(),
              toolName: tc.payload.toolName ?? "unknown",
              args: tc.payload.args as { url?: string } | undefined,
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

const sentimentSchema = z.object({
  findings: z.array(
    z.object({
      painPoint: z.string(),
      severity: z.string(),
      frequency: z.string(),
      verbatimQuote: z.string(),
      quoteSource: z.string(),
      userRole: z.string(),
      companyType: z.string(),
      toolStack: z.string(),
      wishlist: z.string(),
    }),
  ),
  searchQueriesUsed: z.array(z.string()),
});

export const sentimentResearchTask = task({
  id: "sentiment-research",
  maxDuration: 3600,
  run: async (payload: z.infer<typeof productContextSchema>) => {
    const agent = mastra.getAgent("discoveryAgent");
    if (!agent) {
      await researchStream.append(JSON.stringify({ type: "error", error: "Discovery agent not found" }));
      throw new Error("Discovery agent not found");
    }

    const prompt = `Research user sentiment and pain points for this product space.

PRODUCT URL: ${payload.url}

PRODUCT RESEARCH:
${payload.researchSummary}

Find what users hate, what they wish existed, and who these users are. Search the web for reviews and complaints. Search HN for "Ask HN" threads, complaint threads, and user discussions. Read review pages and threads deeply for exact quotes and ICP signals.`;

    try {
      const object = await runWithRetry(
        agent,
        prompt,
        {
          structuredOutput: { schema: sentimentSchema, model: "openrouter/owl-alpha" },
          maxSteps: 8,
        },
        (step) => {
          const toolCalls = step.toolCalls ?? [];
          for (const tc of toolCalls) {
            researchStream.append(JSON.stringify({
              type: "tool-call",
              toolCallId: tc.payload.toolCallId ?? crypto.randomUUID(),
              toolName: tc.payload.toolName ?? "unknown",
              args: tc.payload.args as { url?: string } | undefined,
            }));
          }
        },
      );

      const obj = object as { findings: Array<Record<string, unknown>>; searchQueriesUsed: string[] };
      const result = {
        findings: obj.findings,
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
