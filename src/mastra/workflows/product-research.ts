import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { researchEvents } from "../research-events";

const competitorAgentOutputSchema = z.object({
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

const sentimentAgentOutputSchema = z.object({
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

const competitorStepOutputSchema = competitorAgentOutputSchema.extend({
  url: z.string(),
  researchSummary: z.string(),
});

const sentimentStepOutputSchema = sentimentAgentOutputSchema.extend({
  url: z.string(),
  researchSummary: z.string(),
});

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

const discoverCompetitors = createStep({
  id: "discover-competitors",
  description: "Discovery agent hunts every competitor, alternative, and substitute in the market",
  inputSchema: z.object({
    url: z.string(),
    researchSummary: z.string(),
  }),
  outputSchema: competitorStepOutputSchema,
  execute: async ({ inputData, mastra, runId }) => {
    const { url, researchSummary } = inputData;

    const agent = mastra?.getAgent("discoveryAgent");
    if (!agent) throw new Error("Discovery agent not found");

    const prompt = `Research competitors for this product.

PRODUCT URL: ${url}

PRODUCT RESEARCH:
${researchSummary}

Find every competitor, alternative, and substitute product. Search the web for company pages and comparison articles. Search HN for discussions about alternatives and switching. Read competitor landing pages to understand their positioning and features.`;

    const streamResult = await agent.stream(prompt, {
      structuredOutput: { schema: competitorAgentOutputSchema },
      maxSteps: 15,
      onChunk: (chunk: { type: string }) => {
        researchEvents.emit(runId, chunk.type, chunk);
      },
    });

    const object = await streamResult.object;

    if (!object) {
      console.warn("Competitor step failed, returning empty result");
      return { url, researchSummary, competitors: [], searchQueriesUsed: [] };
    }

    return { url, researchSummary, ...object };
  },
});

const discoverSentiment = createStep({
  id: "discover-sentiment",
  description: "Discovery agent extracts user pain points, verbatim complaints, and ICP signals",
  inputSchema: z.object({
    url: z.string(),
    researchSummary: z.string(),
  }),
  outputSchema: sentimentStepOutputSchema,
  execute: async ({ inputData, mastra, runId }) => {
    const { url, researchSummary } = inputData;

    const agent = mastra?.getAgent("discoveryAgent");
    if (!agent) throw new Error("Discovery agent not found");

    const prompt = `Research user sentiment and pain points for this product space.

PRODUCT URL: ${url}

PRODUCT RESEARCH:
${researchSummary}

Find what users hate, what they wish existed, and who these users are. Search the web for reviews and complaints. Search HN for "Ask HN" threads, complaint threads, and user discussions. Read review pages and threads deeply for exact quotes and ICP signals.`;

    const streamResult = await agent.stream(prompt, {
      structuredOutput: { schema: sentimentAgentOutputSchema },
      maxSteps: 15,
      onChunk: (chunk: { type: string }) => {
        researchEvents.emit(runId, chunk.type, chunk);
      },
    });

    const object = await streamResult.object;

    if (!object) {
      console.warn("Sentiment step failed, returning empty result");
      return { url, researchSummary, findings: [], searchQueriesUsed: [] };
    }

    return { url, researchSummary, ...object };
  },
});

const synthesizeResults = createStep({
  id: "synthesize-results",
  description: "Combines competitor and sentiment findings into the final discovery dossier",
  inputSchema: z.object({
    "discover-competitors": competitorStepOutputSchema,
    "discover-sentiment": sentimentStepOutputSchema,
  }),
  outputSchema: z.object({
    url: z.string(),
    researchSummary: z.string(),
    discovery: discoveryResultSchema.nullable(),
  }),
  execute: async ({ inputData, mastra, runId }) => {
    const competitorResults = inputData["discover-competitors"];
    const sentimentResults = inputData["discover-sentiment"];
    const { url, researchSummary } = competitorResults;

    const agent = mastra?.getAgent("discoveryAgent");
    if (!agent) throw new Error("Discovery agent not found");

    const allQueries = [
      ...(competitorResults.searchQueriesUsed ?? []),
      ...(sentimentResults.searchQueriesUsed ?? []),
    ];

    const prompt = `SYNTHESIZE ONLY — DO NOT SEARCH, DO NOT FETCH. You are merging already-completed research.

PRODUCT: ${url}

## Competitor Findings
${JSON.stringify(competitorResults.competitors, null, 2)}

## Sentiment Findings
${JSON.stringify(sentimentResults.findings, null, 2)}

## Research Queries Used
${allQueries.join("\n")}

Merge into the output schema. Map competitor weaknesses to pain points. Map sentiment wishlists and gaps to opportunities. Extract top 3-5 themes. Use only the data provided — do not reach for tools.`;

    const streamResult = await agent.stream(prompt, {
      structuredOutput: { schema: discoveryResultSchema },
      maxSteps: 3,
      onChunk: (chunk: { type: string }) => {
        researchEvents.emit(runId, chunk.type, chunk);
      },
    });

    const object = await streamResult.object;

    return {
      url,
      researchSummary,
      discovery: object ?? null,
    };
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
  .parallel([discoverCompetitors, discoverSentiment])
  .then(synthesizeResults);

productResearchWorkflow.commit();

export { productResearchWorkflow };
