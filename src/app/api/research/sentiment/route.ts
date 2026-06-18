import { mastra } from "@/mastra";
import { z } from "zod";
import { createSSEResponse } from "../sse";

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

    const prompt = `Research user sentiment and pain points for this product space.

PRODUCT URL: ${input.url}

PRODUCT RESEARCH:
${input.researchSummary}

Find what users hate, what they wish existed, and who these users are. Search the web for reviews and complaints. Search HN for "Ask HN" threads, complaint threads, and user discussions. Read review pages and threads deeply for exact quotes and ICP signals.`;

    const streamResult = await agent.stream(prompt, {
      structuredOutput: { schema: sentimentSchema, model: 'openrouter/owl-alpha' },
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
      ctrl.enqueue("error", { error: "Failed to find user sentiment" });
      return;
    }

    ctrl.enqueue("result", {
      findings: object.findings,
      searchQueriesUsed: object.searchQueriesUsed ?? [],
    });
  });
}
