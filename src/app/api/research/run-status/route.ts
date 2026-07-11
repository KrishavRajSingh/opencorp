import { runs } from "@trigger.dev/sdk/v3";
import { getAuthedUser } from "@/lib/supabase/auth";
import { ANON_BUCKET_USER_ID, createClient } from "@/lib/supabase/server";

/** Terminal Trigger.dev run statuses that mean "stop waiting". */
const STOP_STATUSES = new Set([
  "CANCELED",
  "CANCELLED",
  "FAILED",
  "CRASHED",
  "SYSTEM_FAILURE",
  "EXPIRED",
  "TIMED_OUT",
]);

export async function GET(request: Request) {
  const { user } = await getAuthedUser();

  const params = new URL(request.url).searchParams;
  const runId = params.get("runId");
  if (!runId) {
    return new Response(JSON.stringify({ error: "runId required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sessionId = params.get("sessionId") ?? undefined;
  if (sessionId !== undefined && (typeof sessionId !== "string" || !sessionId)) {
    return new Response(
      JSON.stringify({ error: "sessionId must be a non-empty string when provided" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (sessionId) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("research_sessions")
      .select("id")
      .eq("id", sessionId)
      .single();
    if (error || !data) {
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  } else if (user.id !== ANON_BUCKET_USER_ID) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const run = await runs.retrieve(runId);
    const status = String(run.status ?? "UNKNOWN");
    const terminal = STOP_STATUSES.has(status) || status === "COMPLETED";
    const canceled =
      status === "CANCELED" ||
      status === "CANCELLED" ||
      // some SDK versions
      status.toLowerCase().includes("cancel");

    return new Response(
      JSON.stringify({
        runId,
        status,
        terminal,
        canceled,
        failed: status === "FAILED" || status === "CRASHED" || status === "SYSTEM_FAILURE",
        completed: status === "COMPLETED",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "retrieve failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
