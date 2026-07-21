import type { gtmRedditScanTask } from "@/trigger/research";
import { tasks } from "@trigger.dev/sdk/v3";
import { z } from "zod/v4";
import { getAuthedUser } from "@/lib/supabase/auth";
import { ANON_BUCKET_USER_ID, getDbClient } from "@/lib/supabase/server";

const inputSchema = z.object({
  sessionId: z.string().uuid(),
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

export async function POST(request: Request) {
  const { user } = await getAuthedUser();
  // The shared anon bucket passes ownership for every anonymous client —
  // require a real user so a session can only be used by its creator.
  if (user.id === ANON_BUCKET_USER_ID) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

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

  // Authorize against the session before queuing work: the run is bound to
  // this sessionId, so its owner must be the caller.
  const supabase = await getDbClient();
  const { data: session, error: sessionError } = await supabase
    .from("research_sessions")
    .select("id, user_id")
    .eq("id", input.sessionId)
    .maybeSingle();
  if (sessionError) {
    console.error("[api/research/reddit] session lookup failed:", sessionError);
    return new Response(
      JSON.stringify({ error: "Failed to authorize session" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
  if (!session || session.user_id !== user.id) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const handle = await tasks.trigger<typeof gtmRedditScanTask>(
      "gtm-reddit-scan",
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
    console.error("[api/research/reddit] trigger failed:", err);
    return new Response(JSON.stringify({ error: "Failed to trigger task" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
