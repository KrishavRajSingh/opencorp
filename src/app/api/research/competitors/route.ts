import type { competitorResearchTask } from "@/trigger/research";
import { tasks } from "@trigger.dev/sdk";
import { z } from "zod/v4";
import { getAuthedUser } from "@/lib/supabase/auth";

const inputSchema = z.object({
  url: z.string(),
  productName: z.string(),
  description: z.string(),
  researchSummary: z.string(),
  keyFeatures: z.array(z.string()),
  targetAudience: z.string(),
  pricingModel: z.string(),
});

export async function POST(request: Request) {
  const auth = await getAuthedUser();
  if ("response" in auth) return auth.response;

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

  try {
    const handle = await tasks.trigger<typeof competitorResearchTask>(
      "competitor-research",
      input,
    );
    return new Response(
      JSON.stringify({
        runId: handle.id,
        publicAccessToken: handle.publicAccessToken,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to trigger task";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" } },
    );
  }
}
