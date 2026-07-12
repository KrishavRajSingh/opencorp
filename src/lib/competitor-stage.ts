/**
 * Pure competitor-stage state machine.
 * Keeps loader/cancel/stream lifecycle out of React so it can be script-tested.
 */
export { readSseStream as readSSEStream } from "@/lib/sse";

export type CompetitorResult = {
  competitors: Array<{
    name: string;
    url: string;
    description?: string;
    mentionSources?: string[];
  }>;
  searchQueriesUsed?: string[];
};

export type CompetitorStageSnapshot = {
  loading: boolean;
  competitors: CompetitorResult | null;
  error: string | null;
  streamStatus: string | null;
  streamError: string | null;
  /** Bumped on cancel/restart — ignore events from older generations. */
  gen: number;
};

export type StreamEvent = { type: string } & Record<string, unknown>;

export function createCompetitorStage(opts: {
  initial: CompetitorResult | null;
  readOnly?: boolean;
  /**
   * When set, overrides the default "loading if no result" behavior.
   * Use false on refresh after cancel / idle so the dino does not spin forever.
   */
  startLoading?: boolean;
}) {
  const readOnly = opts.readOnly ?? false;
  const startLoading =
    opts.startLoading ?? (!readOnly && opts.initial == null);
  let state: CompetitorStageSnapshot = {
    loading: startLoading,
    competitors: opts.initial,
    error: null,
    streamStatus: null,
    streamError: null,
    gen: 0,
  };

  const get = () => state;

  /** ProductHeader dino — only while loading and no result yet. */
  const showDino = () =>
    !readOnly && state.competitors === null && state.loading;

  function cancel(): { gen: number } {
    state = {
      ...state,
      gen: state.gen + 1,
      loading: false,
      streamStatus: null,
      streamError: null,
      error: "Alternatives stage cancelled. Try again.",
    };
    return { gen: state.gen };
  }

  /** Idle after refresh with no result — no error banner unless provided. */
  function markIdle(message?: string | null): void {
    state = {
      ...state,
      gen: state.gen + 1,
      loading: false,
      streamStatus: null,
      streamError: null,
      error: message ?? null,
    };
  }

  /**
   * Stop waiting because the backend run is gone (canceled/failed/expired)
   * without a result payload. Always clears loading.
   */
  function stopBecauseRunEnded(
    reason: "canceled" | "failed" | "stopped",
    message?: string,
  ): void {
    state = {
      ...state,
      gen: state.gen + 1,
      loading: false,
      streamStatus: null,
      streamError: null,
      error:
        message ??
        (reason === "canceled"
          ? "Alternatives stage cancelled. Try again."
          : reason === "failed"
            ? "Alternatives stage failed. Try again."
            : "Alternatives stage stopped. Try again."),
    };
  }

  /** Begin a new run (re-run / restart). Returns gen for the new stream. */
  function beginRun(): number {
    state = {
      ...state,
      gen: state.gen + 1,
      loading: true,
      error: null,
      streamStatus: null,
      streamError: null,
    };
    return state.gen;
  }

  function setStreamStatus(label: string, gen: number) {
    if (gen !== state.gen) return;
    state = { ...state, streamStatus: label };
  }

  function applyResult(result: CompetitorResult, gen: number): boolean {
    if (gen !== state.gen) return false;
    state = {
      ...state,
      competitors: result,
      loading: false,
      streamStatus: "Saved",
      error: null,
      streamError: null,
    };
    return true;
  }

  function applyError(message: string, gen: number): boolean {
    if (gen !== state.gen) return false;
    state = {
      ...state,
      loading: false,
      error: message,
    };
    return true;
  }

  function applyStreamTransportError(message: string, gen: number): boolean {
    if (gen !== state.gen) return false;
    state = {
      ...state,
      loading: false,
      streamError: `Competitors: ${message}`,
    };
    return true;
  }

  /** Stream closed without result/error event (task cancelled externally, drop). */
  function applyStreamEnd(gen: number): boolean {
    if (gen !== state.gen) return false;
    if (!state.loading) return false;
    state = {
      ...state,
      loading: false,
      streamStatus: null,
      error: state.error ?? "Alternatives stage stopped. Try again.",
    };
    return true;
  }

  /**
   * Handle one parsed research stream event.
   * @returns whether the stream is finished (caller should abort).
   */
  function handleEvent(event: StreamEvent, gen: number): boolean {
    if (gen !== state.gen) return true;
    switch (event.type) {
      case "tool-call": {
        const title = typeof event.title === "string" ? event.title : undefined;
        const query = typeof event.query === "string" ? event.query : undefined;
        const url = typeof event.url === "string" ? event.url : undefined;
        const toolName =
          typeof event.toolName === "string" ? event.toolName : "tool";
        const label = title
          ? `Read: ${title}`
          : query
            ? `Searching "${query}"`
            : url
              ? `Reading ${url}...`
              : toolName;
        setStreamStatus(label, gen);
        return false;
      }
      case "result": {
        const { type: _t, ...rest } = event;
        applyResult(rest as unknown as CompetitorResult, gen);
        return true;
      }
      case "error": {
        const message =
          typeof event.error === "string" ? event.error : "Unknown error";
        applyError(message, gen);
        return true;
      }
      default:
        return false;
    }
  }

  return {
    getSnapshot: get,
    showDino,
    cancel,
    markIdle,
    stopBecauseRunEnded,
    beginRun,
    setStreamStatus,
    applyResult,
    applyError,
    applyStreamTransportError,
    applyStreamEnd,
    handleEvent,
  };
}

/** sessionStorage key for durable UI stage across refresh */
export function competitorStageStorageKey(sessionId: string) {
  return `competitor-stage:${sessionId}`;
}

export type CompetitorStageMarker = {
  status: "running" | "canceled" | "idle" | "done";
  runId?: string;
};

export function readCompetitorStageMarker(
  sessionId: string,
): CompetitorStageMarker | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(competitorStageStorageKey(sessionId));
    if (!raw) return null;
    return JSON.parse(raw) as CompetitorStageMarker;
  } catch {
    return null;
  }
}

export function writeCompetitorStageMarker(
  sessionId: string,
  marker: CompetitorStageMarker | null,
) {
  if (typeof window === "undefined") return;
  try {
    const key = competitorStageStorageKey(sessionId);
    if (!marker) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(marker));
  } catch {
    /* private mode */
  }
}

/**
 * Should the session view start in "waiting for alternatives" on mount?
 * Only when we have evidence a run is in flight (handoff token or running marker).
 * Cancelled / idle / bare refresh with no result → false (no infinite dino).
 */
export function shouldStartCompetitorLoading(opts: {
  sessionId: string;
  hasResult: boolean;
  readOnly?: boolean;
}): boolean {
  if (opts.readOnly || opts.hasResult) return false;
  if (typeof window === "undefined") return false;
  try {
    const marker = readCompetitorStageMarker(opts.sessionId);
    if (marker?.status === "canceled" || marker?.status === "idle") return false;
    if (marker?.status === "done") return false;
    if (marker?.status === "running") return true;
    if (sessionStorage.getItem(`competitor-stream:${opts.sessionId}`)) return true;
  } catch {
    /* ignore */
  }
  return false;
}

export type CompetitorStage = ReturnType<typeof createCompetitorStage>;
