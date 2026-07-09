import { runs } from "@trigger.dev/sdk";
import { getAuthedUser } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const auth = await getAuthedUser();
  if ("response" in auth) return auth.response;

  let runId: string;
  try {
    const body = await request.json();
    runId = body.runId;
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
