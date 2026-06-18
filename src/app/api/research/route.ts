import { mastra } from "@/mastra";
import { z } from "zod";
import { createSSEResponse } from "./sse";

const productSchema = z.object({
  productName: z.string(),
  description: z.string(),
  keyFeatures: z.array(z.string()),
  targetAudience: z.string(),
  pricingModel: z.string(),
  techStack: z.string(),
  marketPosition: z.string(),
});

export async function POST(request: Request) {
  let url: string;
  try {
    const body = await request.json();
    url = body.url;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!url || typeof url !== "string") {
    return new Response(JSON.stringify({ error: "URL is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    new URL(url);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid URL format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return createSSEResponse(async (ctrl) => {
    const agent = mastra.getAgent("productAnalystAgent");
    if (!agent) {
      ctrl.enqueue("error", { error: "Product analyst agent not found" });
      return;
    }

    ctrl.enqueue("connected", {});

    const streamResult = await agent.stream(
      `Research this product thoroughly: ${url}`,
      {
        structuredOutput: { schema: productSchema, model: 'openrouter/owl-alpha' },
        maxSteps: 10,
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
      },
    );

    const object = await streamResult.object;

    if (!object) {
      ctrl.enqueue("error", { error: "Failed to analyze product" });
      return;
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

    ctrl.enqueue("result", {
      url,
      ...object,
      researchSummary,
    });
  });
}
