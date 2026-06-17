import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { researchEvents } from "../research-events";

const discoveryResultSchema = z.object({
  competitors: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      mentions: z.number(),
      notes: z.string(),
    }),
  ),
  painPoints: z.array(
    z.object({
      description: z.string(),
      source: z.string(),
      frequency: z.string(),
      severity: z.string(),
    }),
  ),
  opportunities: z.array(
    z.object({
      description: z.string(),
      channel: z.string(),
      url: z.string(),
      action: z.string(),
    }),
  ),
  discussionThemes: z.array(z.string()),
  searchQueriesUsed: z.array(z.string()),
});

const researchProduct = createStep({
  id: "research-product",
  description:
    "Product Analyst agent researches the product website and produces a thorough markdown summary",
  inputSchema: z.object({
    url: z.string().url(),
  }),
  outputSchema: z.object({
    url: z.string(),
    researchSummary: z.string(),
  }),
  execute: async ({ inputData, mastra, runId }) => {
    const { url } = inputData;

    const agent = mastra?.getAgent("productAnalystAgent");
    if (!agent) throw new Error("Product Analyst agent not found");

    const streamResult = await agent.stream(
      `Research this product thoroughly: ${url}`,
      {
        maxSteps: 10,
        onChunk: (chunk: { type: string }) => {
          researchEvents.emit(runId, chunk.type, chunk);
        },
      },
    );

    const text = await streamResult.text;

    return { url, researchSummary: text };
  },
});

const discoverOpportunities = createStep({
  id: "discover-opportunities",
  description:
    "Discovery agent takes the research summary and searches HN for competitors, pain points, and opportunities",
  inputSchema: z.object({
    url: z.string(),
    researchSummary: z.string(),
  }),
  outputSchema: z.object({
    url: z.string(),
    researchSummary: z.string(),
    discovery: discoveryResultSchema.nullable(),
  }),
  execute: async ({ inputData, mastra, runId }) => {
    const { url, researchSummary } = inputData;

    const agent = mastra?.getAgent("discoveryAgent");
    if (!agent) throw new Error("Discovery agent not found");

    const streamResult = await agent.stream(
      `Here is a product research summary for ${url}:\n\n${researchSummary}\n\nSearch Hacker News for competitors, user pain points, and distribution opportunities. Run at least 5 queries covering different angles.`,
      {
        structuredOutput: { schema: discoveryResultSchema },
        maxSteps: 10,
        onChunk: (chunk: { type: string }) => {
          researchEvents.emit(runId, chunk.type, chunk);
        },
      },
    );

    const object = await streamResult.object;

    return { url, researchSummary, discovery: object ?? null };
  },
});

const productResearchWorkflow = createWorkflow({
  id: "product-research",
  inputSchema: z.object({
    url: z.string().url().describe("The URL of the product to research"),
  }),
  outputSchema: z.object({
    url: z.string(),
    researchSummary: z.string(),
    discovery: discoveryResultSchema.nullable(),
  }),
})
  .then(researchProduct)
  .then(discoverOpportunities);

productResearchWorkflow.commit();

export { productResearchWorkflow };
