import type { productResearchTask } from "@/trigger/research";
import { tasks } from "@trigger.dev/sdk/v3";
import { getAuthedUser } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const auth = await getAuthedUser();
  if ("response" in auth) return auth.response;

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

  try {
    const handle = await tasks.trigger<typeof productResearchTask>("product-research", { url });
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
      headers: { "Content-Type": "application/json" },
    });
  }
}
