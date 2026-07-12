import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { readTriggerSse } from "@/lib/sse";
import type { ToolCallChunk } from "@/lib/types/session";

type ChannelEvent<T> =
  | { kind: "tool-call"; status: string }
  | { kind: "result"; payload: T }
  | { kind: "error"; message: string };

type ChannelName = "hn" | "reddit";

/**
 * Generic SSE channel for HN + Reddit.
 * Owns runId/token, SSE reader, loading/streamStatus/error state.
 * Caller owns result state via onResult callback.
 */
export function useSseChannel<T>(opts: {
  channel: ChannelName;
  apiPath: string;
  buildBody: () => Record<string, unknown>;
  mapEvent: (event: Record<string, unknown>) => ChannelEvent<T> | null;
  sessionId: string;
  onResult: (payload: T) => void | Promise<void>;
  onError?: (message: string) => void;
  transportErrorPrefix?: string;
}) {
  const router = useRouter();
  const { channel, apiPath, buildBody, mapEvent, sessionId, onResult, onError, transportErrorPrefix } = opts;
  const transportPrefix = transportErrorPrefix ?? channel.toUpperCase();

  const [runId, setRunId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const runGenRef = useRef(0);

  // SSE reader
  useEffect(() => {
    if (!runId || !token) return;
    const controller = new AbortController();
    const done = { current: false };

    readTriggerSse({
      runId,
      streamKey: "research",
      accessToken: token,
      onData: (data) => {
        try {
          const event = JSON.parse(data) as Record<string, unknown>;
          const result = mapEvent(event);
          if (!result) return;
          switch (result.kind) {
            case "tool-call": {
              setStreamStatus(result.status);
              break;
            }
            case "result": {
              controller.abort();
              if (done.current) break;
              done.current = true;
              void Promise.resolve(onResult(result.payload))
                .then(() => setStreamStatus("Saved"))
                .catch((err) => {
                  setError(
                    err instanceof Error ? err.message : "Failed to save result",
                  );
                })
                .finally(() => setLoading(false));
              break;
            }
            case "error": {
              controller.abort();
              setError(result.message);
              setLoading(false);
              break;
            }
          }
        } catch { /* skip */ }
      },
      onError: (err) => {
        const message = `${transportPrefix}: ${err}`;
        setError(message);
        setLoading(false);
        onError?.(message);
      },
      signal: controller.signal,
      onEnd: () => {
        if (done.current) return;
        const message = `${transportPrefix}: stream ended before a result`;
        setError(message);
        setLoading(false);
        onError?.(message);
      },
    });

    return () => controller.abort();
  }, [runId, token, mapEvent, onResult, onError, transportPrefix]);

  const run = useCallback(async () => {
    const gen = ++runGenRef.current;
    setLoading(true);
    setError(null);
    setRunId(null);
    setToken(null);
    setStreamStatus(null);

    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody()),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      if (gen !== runGenRef.current) return;
      setRunId(body.runId);
      setToken(body.publicAccessToken);
    } catch (err) {
      if (gen !== runGenRef.current) return;
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }, [apiPath, buildBody]);

  const cancel = useCallback(() => {
    runGenRef.current++;
    const id = runId;
    setRunId(null);
    setToken(null);
    setLoading(false);
    if (id) {
      void fetch("/api/research/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: id, sessionId }),
      });
    }
  }, [runId, sessionId]);

  const resetError = useCallback(() => setError(null), []);

  return {
    loading,
    streamStatus,
    error,
    run,
    cancel,
    resetError,
  };
}
