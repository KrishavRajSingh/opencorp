import { mastra } from "@/mastra";
import { researchEvents } from "@/mastra/research-events";

const RESEARCH_TIMEOUT = 120_000;

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

  try {
    new URL(url);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid URL format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const workflow = mastra.getWorkflow("productResearchWorkflow");
  if (!workflow) {
    return new Response(
      JSON.stringify({ error: "Research workflow not found" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const encoder = new TextEncoder();

  const run = await workflow.createRun();
  const runId = run.runId;

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const enqueue = (eventType: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(
              `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`,
            ),
          );
        } catch {
          closed = true;
        }
      };

      enqueue("connected", {});

      const unsubscribe = researchEvents.subscribe(runId, (event) => {
        if (closed) return;
        enqueue(event.type, event.data);
      });

      const timeout = setTimeout(() => {
        enqueue("error", { error: "Research timed out" });
        closed = true;
        unsubscribe();
        try { controller.close(); } catch { /* ok */ }
      }, RESEARCH_TIMEOUT);

      const heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode("event: tick\ndata: {}\n\n"),
          );
        } catch {
          closed = true;
          clearInterval(heartbeat);
        }
      }, 4000);

      (async () => {
        try {
          const output = run.stream({ inputData: { url } });

          const reader = output.fullStream.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done || closed) break;
            enqueue(value.type, value);
          }

          const result = await output.result;
          clearTimeout(timeout);
          clearInterval(heartbeat);
          unsubscribe();
          if (closed) return;

          if (result.status === "failed") {
            const message =
              result.error instanceof Error
                ? result.error.message
                : String(result.error);
            enqueue("error", { error: message });
          } else if (result.status === "success") {
            enqueue("result", result.result);
          }
        } catch (error) {
          clearTimeout(timeout);
          clearInterval(heartbeat);
          unsubscribe();
          if (!closed) {
            const message =
              error instanceof Error
                ? error.message
                : "Unknown workflow error";
            enqueue("error", { error: message });
          }
        } finally {
          if (!closed) {
            try { controller.close(); } catch { /* ok */ }
            closed = true;
          }
        }
      })();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
