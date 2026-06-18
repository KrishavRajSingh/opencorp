export interface SSEController {
  enqueue(eventType: string, data: unknown): void;
}

export function createSSEResponse(
  handler: (ctrl: SSEController) => Promise<void>,
): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      const ctrl: SSEController = {
        enqueue(eventType: string, data: unknown) {
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
        },
      };

      const heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode("event: tick\ndata: {}\n\n"));
        } catch {
          closed = true;
          clearInterval(heartbeat);
        }
      }, 4000);

      handler(ctrl)
        .catch((error) => {
          if (!closed) {
            const message =
              error instanceof Error ? error.message : "Unknown error";
            ctrl.enqueue("error", { error: message });
          }
        })
        .finally(() => {
          clearInterval(heartbeat);
          if (!closed) {
            try {
              controller.close();
            } catch {
              /* ok */
            }
            closed = true;
          }
        });
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
