import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { researchEvents } from "../research-events";

const productAnalystOutputSchema = z.object({
  productName: z.string(),
  description: z.string(),
  keyFeatures: z.array(z.string()),
  targetAudience: z.string(),
  pricingModel: z.string(),
  techStack: z.string(),
  marketPosition: z.string(),
});

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

const competitorStepOutputSchema = competitorAgentOutputSchema
  .merge(productAnalystOutputSchema)
  .extend({
    url: z.string(),
    researchSummary: z.string(),
  });

const sentimentStepOutputSchema = sentimentAgentOutputSchema
  .merge(productAnalystOutputSchema)
  .extend({
    url: z.string(),
    researchSummary: z.string(),
  });

const collectResultSchema = productAnalystOutputSchema.extend({
  url: z.string(),
  researchSummary: z.string(),
  competitors: competitorAgentOutputSchema.shape.competitors,
  findings: sentimentAgentOutputSchema.shape.findings,
  competitorQueries: z.array(z.string()),
  sentimentQueries: z.array(z.string()),
});

const researchProduct = createStep({
  id: "research-product",
  description:
    "Product Analyst agent researches the product website and returns structured product data",
  inputSchema: z.object({
    url: z.string().url(),
  }),
  outputSchema: productAnalystOutputSchema.extend({
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
        structuredOutput: { schema: productAnalystOutputSchema, model: 'openrouter/owl-alpha' },
        maxSteps: 10,
        onChunk: (chunk: { type: string }) => {
          researchEvents.emit(runId, chunk.type, chunk);
        },
      },
    );

    const object = await streamResult.object;

    if (!object) {
      console.warn("Product analyst step failed, returning empty result");
      return {
        url,
        productName: url,
        description: "",
        keyFeatures: [],
        targetAudience: "",
        pricingModel: "",
        techStack: "",
        marketPosition: "",
        researchSummary: `Product at ${url}`,
      };
    }

    const researchSummary = [
      `Product: ${object.productName}`,
      object.description && `Description: ${object.description}`,
      object.keyFeatures.length > 0 && `Key Features: ${object.keyFeatures.join(", ")}`,
      object.targetAudience && `Target Audience: ${object.targetAudience}`,
      object.pricingModel && `Pricing: ${object.pricingModel}`,
      object.techStack && `Tech Stack: ${object.techStack}`,
      object.marketPosition && `Market Position: ${object.marketPosition}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    return { url, ...object, researchSummary };
  },
});

const discoverCompetitors = createStep({
  id: "discover-competitors",
  description: "Discovery agent hunts every competitor, alternative, and substitute in the market",
  inputSchema: productAnalystOutputSchema.extend({
    url: z.string(),
    researchSummary: z.string(),
  }),
  outputSchema: competitorStepOutputSchema,
  execute: async ({ inputData, mastra, runId }) => {
    const { url, researchSummary, productName, description, keyFeatures, targetAudience, pricingModel, techStack, marketPosition } = inputData;

    const agent = mastra?.getAgent("discoveryAgent");
    if (!agent) throw new Error("Discovery agent not found");

    const prompt = `Research competitors for this product.

PRODUCT URL: ${url}

PRODUCT RESEARCH:
${researchSummary}

Find every competitor, alternative, and substitute product. Search the web for company pages and comparison articles. Search HN for discussions about alternatives and switching. Read competitor landing pages to understand their positioning and features.`;

    const streamResult = await agent.stream(prompt, {
      structuredOutput: { schema: competitorAgentOutputSchema, model: 'openrouter/owl-alpha' },
      maxSteps: 15,
      onChunk: (chunk: { type: string }) => {
        researchEvents.emit(runId, chunk.type, chunk);
      },
    });

    const object = await streamResult.object;

    if (!object) {
      console.warn("Competitor step failed, returning empty result");
      return { url, researchSummary, competitors: [], searchQueriesUsed: [], productName: productName ?? "", description: description ?? "", keyFeatures: keyFeatures ?? [], targetAudience: targetAudience ?? "", pricingModel: pricingModel ?? "", techStack: techStack ?? "", marketPosition: marketPosition ?? "" };
    }

    return { url, researchSummary, ...object, productName, description, keyFeatures, targetAudience, pricingModel, techStack, marketPosition };
  },
});

const discoverSentiment = createStep({
  id: "discover-sentiment",
  description: "Discovery agent extracts user pain points, verbatim complaints, and ICP signals",
  inputSchema: productAnalystOutputSchema.extend({
    url: z.string(),
    researchSummary: z.string(),
  }),
  outputSchema: sentimentStepOutputSchema,
  execute: async ({ inputData, mastra, runId }) => {
    const { url, researchSummary, productName, description, keyFeatures, targetAudience, pricingModel, techStack, marketPosition } = inputData;

    const agent = mastra?.getAgent("discoveryAgent");
    if (!agent) throw new Error("Discovery agent not found");

    const prompt = `Research user sentiment and pain points for this product space.

PRODUCT URL: ${url}

PRODUCT RESEARCH:
${researchSummary}

Find what users hate, what they wish existed, and who these users are. Search the web for reviews and complaints. Search HN for "Ask HN" threads, complaint threads, and user discussions. Read review pages and threads deeply for exact quotes and ICP signals.`;

    const streamResult = await agent.stream(prompt, {
      structuredOutput: { schema: sentimentAgentOutputSchema, model: 'openrouter/owl-alpha' },
      maxSteps: 15,
      onChunk: (chunk: { type: string }) => {
        researchEvents.emit(runId, chunk.type, chunk);
      },
    });

    const object = await streamResult.object;

    if (!object) {
      console.warn("Sentiment step failed, returning empty result");
      return { url, researchSummary, findings: [], searchQueriesUsed: [], productName: productName ?? "", description: description ?? "", keyFeatures: keyFeatures ?? [], targetAudience: targetAudience ?? "", pricingModel: pricingModel ?? "", techStack: techStack ?? "", marketPosition: marketPosition ?? "" };
    }

    return { url, researchSummary, ...object, productName, description, keyFeatures, targetAudience, pricingModel, techStack, marketPosition };
  },
});

const collectResults = createStep({
  id: "collect-results",
  description: "Collects parallel competitor and sentiment results",
  inputSchema: z.object({
    "discover-competitors": competitorStepOutputSchema,
    "discover-sentiment": sentimentStepOutputSchema,
  }),
  outputSchema: collectResultSchema,
  execute: async ({ inputData }) => {
    const competitorResults = inputData["discover-competitors"];
    const sentimentResults = inputData["discover-sentiment"];

    return {
      url: competitorResults.url,
      researchSummary: competitorResults.researchSummary,
      competitors: competitorResults.competitors,
      findings: sentimentResults.findings,
      competitorQueries: competitorResults.searchQueriesUsed ?? [],
      sentimentQueries: sentimentResults.searchQueriesUsed ?? [],
      productName: competitorResults.productName,
      description: competitorResults.description,
      keyFeatures: competitorResults.keyFeatures,
      targetAudience: competitorResults.targetAudience,
      pricingModel: competitorResults.pricingModel,
      techStack: competitorResults.techStack,
      marketPosition: competitorResults.marketPosition,
    };
  },
});

const productResearchWorkflow = createWorkflow({
  id: "product-research",
  inputSchema: z.object({
    url: z.string().url().describe("The URL of the product to research"),
  }),
  outputSchema: collectResultSchema,
})
  .then(researchProduct)
  .parallel([discoverCompetitors, discoverSentiment])
  .then(collectResults);

productResearchWorkflow.commit();

export { productResearchWorkflow };
