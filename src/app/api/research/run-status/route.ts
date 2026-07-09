import { runs } from "@trigger.dev/sdk/v3";
import { getAuthedUser } from "@/lib/supabase/auth";

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
  const auth = await getAuthedUser();
  if ("response" in auth) return auth.response;

  const runId = new URL(request.url).searchParams.get("runId");
  if (!runId) {
    return new Response(JSON.stringify({ error: "runId required" }), {
      status: 400,
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
