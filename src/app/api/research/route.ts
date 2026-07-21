import type { productResearchTask } from "@/trigger/research";
import { tasks } from "@trigger.dev/sdk/v3";
import { getAuthedUser } from "@/lib/supabase/auth";
import { getDbClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { user } = await getAuthedUser();

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

  // Create the session row upfront: its id is the ownership handle the
  // cancel route authorizes against while the run is still in flight.
  const supabase = await getDbClient();
  const { data: session, error: sessionError } = await supabase
    .from("research_sessions")
    .insert({
      user_id: user.id,
      input: { url } as never,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (sessionError) {
    return new Response(JSON.stringify({ error: sessionError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const handle = await tasks.trigger<typeof productResearchTask>("product-research", {
      url,
      sessionId: session.id,
    });
    return new Response(
      JSON.stringify({
        runId: handle.id,
        publicAccessToken: handle.publicAccessToken,
        sessionId: session.id,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    // Trigger failed — the stub row is unreachable, remove it.
    await supabase.from("research_sessions").delete().eq("id", session.id);
    const message = err instanceof Error ? err.message : "Failed to trigger task";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
