import { runs } from "@trigger.dev/sdk/v3";
import { getAuthedUser } from "@/lib/supabase/auth";
import { getDbClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { user } = await getAuthedUser();

  let runId: string;
  let sessionId: string;
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

  // sessionId is the ownership handle — without it there is nothing to
  // authorize against, so reject before any run lookup or cancel.
  if (!sessionId || typeof sessionId !== "string") {
    return new Response(JSON.stringify({ error: "sessionId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = await getDbClient();
  const { data } = await supabase
    .from("research_sessions")
    .select("id, user_id")
    .eq("id", sessionId)
    .maybeSingle();
  if (!data || data.user_id !== user.id) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Reject runs bound to a different session. Only competitor-research
  // payloads carry sessionId; other tasks leave the run unbound, so
  // there is nothing to compare for them.
  try {
    const run = await runs.retrieve(runId);
    const runSessionId = (run.payload as { sessionId?: unknown } | undefined)
      ?.sessionId;
    if (typeof runSessionId === "string" && runSessionId !== sessionId) {
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    // Confirmed missing run (404) → let runs.cancel below no-op it.
    // Anything else (network, auth, upstream 5xx) fails closed — the
    // binding check did not complete, so do not cancel.
    if ((err as { status?: number })?.status !== 404) {
      const message = err instanceof Error ? err.message : "Run lookup failed";
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  let skipped = false;
  try {
    await runs.cancel(runId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to cancel run";
    // Already finished / missing run — treat as success for the client
    if (!/not found|already|canceled|cancelled|completed|finished/i.test(message)) {
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    skipped = true;
  }

  // A session canceled before its product result holds nothing worth
  // keeping — drop the stub row. Sessions with results are untouched.
  // Best-effort: the run is already canceled, so ignore delete errors.
  await supabase
    .from("research_sessions")
    .delete()
    .eq("id", sessionId)
    .is("product_analyst_result", null);

  return new Response(JSON.stringify({ ok: true, ...(skipped ? { skipped: true } : {}) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
