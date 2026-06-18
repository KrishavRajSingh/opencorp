import { mastra } from "@/mastra";
import { z } from "zod";
import { createSSEResponse } from "../sse";

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

const inputSchema = z.object({
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

export async function POST(request: Request) {
  let input: z.infer<typeof inputSchema>;
  try {
    const body = await request.json();
    input = inputSchema.parse(body);
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid body — product context required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  return createSSEResponse(async (ctrl) => {
    const agent = mastra.getAgent("discoveryAgent");
    if (!agent) {
      ctrl.enqueue("error", { error: "Discovery agent not found" });
      return;
    }

    ctrl.enqueue("connected", {});

    const prompt = `Research competitors for this product.

PRODUCT URL: ${input.url}

PRODUCT RESEARCH:
${input.researchSummary}

Find every competitor, alternative, and substitute product. Search the web for company pages and comparison articles. Search HN for discussions about alternatives and switching. Read competitor landing pages to understand their positioning and features.`;

    const streamResult = await agent.stream(prompt, {
      structuredOutput: { schema: competitorSchema, model: 'openrouter/owl-alpha' },
      maxSteps: 15,
      onStepFinish: (step) => {
          const toolCalls = step.toolCalls ?? [];
          for (const tc of toolCalls) {
          ctrl.enqueue("tool-call", {
            toolCallId: tc.payload.toolCallId ?? crypto.randomUUID(),
            toolName: tc.payload.toolName ?? "unknown",
            args: tc.payload.args ?? {},
          });
        }
      },
    });

    const object = await streamResult.object;

    if (!object) {
      ctrl.enqueue("error", { error: "Failed to find competitors" });
      return;
    }

    ctrl.enqueue("result", {
      competitors: object.competitors,
      searchQueriesUsed: object.searchQueriesUsed ?? [],
    });
  });
}
