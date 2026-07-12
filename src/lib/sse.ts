/**
 * Trigger.dev realtime SSE reader.
 * Low-level: takes a URL. High-level: builds URL from runId/streamKey.
 */

const TRIGGER_API = "https://api.trigger.dev/realtime/v1/streams";

export function readSseStream(
  url: string,
  accessToken: string,
  onData: (data: string) => void,
  onError: (err: string) => void,
  signal: AbortSignal,
  onEnd?: () => void,
): void {
  fetch(url, {
    headers: {
      Accept: "text/event-stream",
      Authorization: `Bearer ${accessToken}`,
      "Timeout-Seconds": "600",
    },
    signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (value) {
          buf += decoder.decode(value, { stream: !done });
        }
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const part of parts) {
          if (!part.trim()) continue;
          let eventType = "";
          let data = "";
          for (const line of part.split("\n")) {
            if (line.startsWith("event: ")) eventType = line.slice(7);
            else if (line.startsWith("data: ")) data = line.slice(6);
          }
          if (!data) continue;
          try {
            const obj = JSON.parse(data) as {
              records?: Array<{ body: string }>;
            };
            if (eventType === "batch" && obj.records) {
              for (const r of obj.records) {
                const body = JSON.parse(r.body) as { data: string };
                onData(body.data);
              }
            }
          } catch {
            /* skip */
          }
        }
        if (done) break;
      }
      if (!signal.aborted) onEnd?.();
    })
    .catch((err: unknown) => {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (signal.aborted) return;
      onError(err instanceof Error ? err.message : String(err));
    });
}

export function readTriggerSse(opts: {
  runId: string;
  streamKey: string;
  accessToken: string;
  onData: (data: string) => void;
  onError: (err: string) => void;
  signal: AbortSignal;
  onEnd?: () => void;
}): void {
  const url = `${TRIGGER_API}/${opts.runId}/${opts.streamKey}`;
  readSseStream(
    url,
    opts.accessToken,
    opts.onData,
    opts.onError,
    opts.signal,
    opts.onEnd,
  );
}
