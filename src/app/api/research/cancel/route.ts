import { runs } from "@trigger.dev/sdk/v3";
import { getDbClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let runId: string;
  let sessionId: string | undefined;
  try {
    const body = await request.json();
    runId = body.runId;
    sessionId = body.sessionId;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!runId || typeof runId !== "string") {
    return new Response(JSON.stringify({ error: "runId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (sessionId !== undefined && (typeof sessionId !== "string" || !sessionId)) {
    return new Response(
      JSON.stringify({ error: "sessionId must be a non-empty string when provided" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (sessionId) {
    const supabase = await getDbClient();
    const { data } = await supabase
      .from("research_sessions")
      .select("id")
      .eq("id", sessionId)
      .maybeSingle();
    if (!data) {
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  try {
    await runs.cancel(runId);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to cancel run";
    // Already finished / missing run — treat as success for the client
    if (/not found|already|canceled|cancelled|completed|finished/i.test(message)) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
