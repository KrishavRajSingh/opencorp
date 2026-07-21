"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  startTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  Share2,
  Check,
} from "lucide-react";
import { Console } from "./session-view/console";
import { ProductHeader } from "./session-view/product-header";
import { useSseChannel } from "./session-view/use-sse-channel";
import { cn } from "@/lib/utils";
import {
  createCompetitorStage,
  shouldStartCompetitorLoading,
  writeCompetitorStageMarker,
  readCompetitorStageMarker,
  type CompetitorResult as StageCompetitorResult,
  type StreamEvent,
} from "@/lib/competitor-stage";
import { readTriggerSse } from "@/lib/sse";
import type {
  ProductResult,
  CompetitorResult,
  HNResult,
  RedditScanResult,
  ShowHNDraft,
  ToolCallChunk,
} from "@/lib/types/session";

function toUiCompetitors(
  r: StageCompetitorResult | null,
): CompetitorResult | null {
  if (!r) return null;
  return {
    competitors: (r.competitors ?? []).map((c) => ({
      name: c.name,
      url: c.url,
      description: c.description ?? "",
      mentionSources: c.mentionSources ?? [],
    })),
    searchQueriesUsed: r.searchQueriesUsed,
  };
}

export function SessionViewClient({
  sessionId,
  product,
  competitors: initialCompetitors,
  hnResult: initialHNResult,
  redditScan: initialRedditScan = null,
  initialShowHNDraft = null,
  readOnly = false,
  isAuthed = !readOnly,
  signupHref = "/auth/sign-up",
}: {
  sessionId: string;
  product: ProductResult;
  competitors: CompetitorResult | null;
  hnResult: HNResult | null;
  redditScan?: RedditScanResult | null;
  initialShowHNDraft?: ShowHNDraft | null;
  readOnly?: boolean;
  isAuthed?: boolean;
  signupHref?: string;
}) {
  const router = useRouter();
  const startLoading = shouldStartCompetitorLoading({
    sessionId,
    hasResult: !!initialCompetitors,
    readOnly,
  });
  const stageRef = useRef(
    createCompetitorStage({
      initial: initialCompetitors as StageCompetitorResult | null,
      readOnly,
      startLoading,
    }),
  );
  const [competitors, setCompetitors] = useState<CompetitorResult | null>(
    initialCompetitors,
  );
  const [hnResult, setHNResult] = useState<HNResult | null>(initialHNResult);
  const [redditScan, setRedditScan] = useState<RedditScanResult | null>(
    initialRedditScan,
  );
  /** Backend product→competitors stage in flight (or handoff/poll wait). */
  const [loadingCompetitors, setLoadingCompetitors] = useState(
    () => startLoading,
  );
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  /** Timestamp when run-status first reported COMPLETED for a token-less recovery run. */
  const runCompletedAtRef = useRef<number | null>(null);

  const flushCompetitorStage = useCallback(() => {
    const s = stageRef.current.getSnapshot();
    setCompetitors(toUiCompetitors(s.competitors));
    setLoadingCompetitors(s.loading);
    setError(s.error);
    setStreamStatus(s.streamStatus);
    setStreamError(s.streamError);
  }, []);

  /** Apply stage machine mutations only — no React state. */
  const mutateCompetitorStage = useCallback(
    (opts?: {
      canceled?: boolean;
      message?: string | null;
      idle?: boolean;
    }) => {
      if (opts?.canceled) {
        stageRef.current.cancel();
        writeCompetitorStageMarker(sessionId, { status: "canceled" });
      } else if (opts?.idle) {
        stageRef.current.markIdle(opts.message ?? null);
        writeCompetitorStageMarker(sessionId, { status: "idle" });
      } else if (opts?.message) {
        stageRef.current.stopBecauseRunEnded("stopped", opts.message);
        writeCompetitorStageMarker(sessionId, { status: "idle" });
      } else {
        stageRef.current.stopBecauseRunEnded("stopped");
        writeCompetitorStageMarker(sessionId, { status: "idle" });
      }
    },
    [sessionId],
  );

  /** Hard stop: stage + React + drop stream handles. Dino must disappear. */
  const stopCompetitorsUi = useCallback(
    (opts?: {
      canceled?: boolean;
      /** omit or undefined = no banner on idle */
      message?: string | null;
      idle?: boolean;
    }) => {
      mutateCompetitorStage(opts);
      const s = stageRef.current.getSnapshot();
      // Force React state — never leave dino up because flush was skipped.
      setLoadingCompetitors(false);
      setCompetitors(toUiCompetitors(s.competitors));
      setError(
        opts?.idle
          ? (opts.message ?? null)
          : (opts?.message ??
            s.error ??
            "Alternatives stage cancelled. Try again."),
      );
      setStreamStatus(null);
      setStreamError(null);
      setRunId(null);
      setToken(null);
      streamAbortRef.current?.abort();
      streamAbortRef.current = null;
    },
    [sessionId, mutateCompetitorStage],
  );

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const redditTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [activeResult, setActiveResult] = useState<"reddit" | "hn">(
    "reddit",
  );

  const [showHNDraft, setShowHNDraft] = useState<ShowHNDraft | null>(initialShowHNDraft);
  const [loadingShowHN, setLoadingShowHN] = useState(false);
  const draftAbortRef = useRef<AbortController | null>(null);
  const [activeHNChannel, setActiveHNChannel] = useState<"find" | "draft" | null>(
    initialHNResult
      ? "find"
      : initialShowHNDraft
        ? "draft"
        : null,
  );

  const [subsSearch, setSubsSearch] = useState<string[]>([]);
  const [subsSearchOpen, setSubsSearchOpen] = useState(false);

  const [shareCopied, setShareCopied] = useState(false);
  const shareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyShareUrl = useCallback(async () => {
    const url = `${window.location.origin}/share/${sessionId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setShareCopied(true);
    if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    shareTimerRef.current = setTimeout(() => setShareCopied(false), 1800);
  }, [sessionId]);

  useEffect(() => {
    return () => {
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    };
  }, []);

  const hnMapEvent = useCallback(
    (event: Record<string, unknown>): { kind: "tool-call"; status: string } | { kind: "result"; payload: HNResult } | { kind: "error"; message: string } | null => {
      switch (event.type) {
        case "tool-call": {
          const chunk = event as unknown as ToolCallChunk;
          const label = chunk.title
            ? `Read: ${chunk.title}`
            : chunk.query
              ? `Searching "${chunk.query}"`
              : chunk.url
                ? `Reading ${chunk.url}...`
                : chunk.toolName;
          return { kind: "tool-call", status: label };
        }
        case "result":
          return { kind: "result", payload: event as unknown as HNResult };
        case "error":
          return { kind: "error", message: (event as unknown as { error: string }).error };
        default:
          return null;
      }
    },
    [],
  );

  const onHNResult = useCallback(
    (r: HNResult) => {
      setHNResult(r);
      fetch("/api/research/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sessionId, hn_threads_result: r }),
      })
        .then((res) => {
          if (res.ok) router.refresh();
        })
        .catch(() => {});
    },
    [sessionId, router],
  );

  const hnBuildBody = useCallback(
    () => ({
      url: product.url,
      productName: product.productName,
      description: product.description,
      keyFeatures: product.keyFeatures,
      competitors:
        competitors?.competitors?.map((c) => ({ name: c.name, url: c.url })) ?? [],
    }),
    [product, competitors],
  );

  const hn = useSseChannel<HNResult>({
    channel: "hn",
    apiPath: "/api/research/hn",
    buildBody: hnBuildBody,
    mapEvent: hnMapEvent,
    sessionId,
    onResult: onHNResult,
    onError: setStreamError,
  });

  const redditMapEvent = useCallback(
    (event: Record<string, unknown>): { kind: "tool-call"; status: string } | { kind: "result"; payload: RedditScanResult } | { kind: "error"; message: string } | null => {
      switch (event.type) {
        case "tool-call": {
          const chunk = event as unknown as ToolCallChunk & { track?: string };
          if (chunk.track === "reddit") {
            return { kind: "tool-call", status: chunk.snippet ?? "Scanning Reddit..." };
          }
          return null;
        }
        case "result":
          return { kind: "result", payload: event as unknown as RedditScanResult };
        case "error":
          return { kind: "error", message: (event as unknown as { error: string }).error };
        default:
          return null;
      }
    },
    [],
  );

  const onRedditResult = useCallback(
    (r: RedditScanResult) => {
      setRedditScan(r);
      fetch("/api/research/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sessionId, reddit_scan_result: r }),
      })
        .then((res) => {
          if (res.ok) router.refresh();
        })
        .catch(() => {});
    },
    [sessionId, router],
  );

  const redditBuildBody = useCallback(
    () => ({
      url: product.url,
      productName: product.productName,
      description: product.description,
      keyFeatures: product.keyFeatures,
      targetAudience: product.targetAudience,
      pricingModel: product.pricingModel,
      subsSearch: subsSearch.length > 0 ? subsSearch : undefined,
      competitors:
        competitors?.competitors?.map((c) => ({ name: c.name, url: c.url })) ?? [],
    }),
    [product, subsSearch, competitors],
  );

  const reddit = useSseChannel<RedditScanResult>({
    channel: "reddit",
    apiPath: "/api/research/reddit",
    buildBody: redditBuildBody,
    mapEvent: redditMapEvent,
    sessionId,
    onResult: onRedditResult,
    onError: setStreamError,
  });

  const draftShowHN = useCallback(async () => {
    setLoadingShowHN(true);
    setStreamError(null);
    const controller = new AbortController();
    draftAbortRef.current = controller;
    try {
      const res = await fetch("/api/show-hn-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.productName,
          description: product.description,
          keyFeatures: product.keyFeatures,
          targetAudience: product.targetAudience,
          demoUrl: product.url,
          buildMotivation: null,
          techStack: null,
          hardChallenge: null,
          tradeoffs: null,
          lessonLearned: null,
          keyMetric: null,
          openSource: null,
          openSourceUrl: null,
        }),
        signal: controller.signal,
      });
      const body = await res.json();
      if (!res.ok)
        throw new Error(body.error ?? `Request failed (${res.status})`);
      const draft = body as ShowHNDraft;
      setShowHNDraft(draft);
      fetch("/api/research/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sessionId, show_hn_draft_result: draft }),
      })
        .then((res) => {
          if (res.ok) router.refresh();
        })
        .catch(() => {});
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setStreamError(
        err instanceof Error ? err.message : "Failed to draft Show HN post",
      );
    } finally {
      if (draftAbortRef.current === controller) {
        draftAbortRef.current = null;
        setLoadingShowHN(false);
      }
    }
  }, [product, sessionId, router]);

  const cancelDraftShowHN = useCallback(() => {
    draftAbortRef.current?.abort();
  }, []);

  // Serializes persistShowHNDraft saves: a later debounced draft must never
  // reach the server before an earlier in-flight one, or the stale draft
  // would overwrite the newer edit (save API is last-writer-wins).
  const showHNSaveQueueRef = useRef<Promise<void>>(Promise.resolve());

  const persistShowHNDraft = useCallback(
    (next: ShowHNDraft) => {
      setShowHNDraft(next);
      const queued = showHNSaveQueueRef.current.then(async () => {
        try {
          await fetch("/api/research/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: sessionId,
              show_hn_draft_result: next,
            }),
          });
        } catch {
          /* swallow — silent retry on next edit */
        }
      });
      showHNSaveQueueRef.current = queued;
      return queued;
    },
    [sessionId],
  );

  const [hnElapsed, setHNElapsed] = useState(0);
  const [redditElapsed, setRedditElapsed] = useState(0);

  useEffect(() => {
    if (loadingCompetitors) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setElapsed(0);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [loadingCompetitors]);

  useEffect(() => {
    if (hn.loading) {
      hnTimerRef.current = setInterval(() => setHNElapsed((e) => e + 1), 1000);
    } else if (hnTimerRef.current) {
      clearInterval(hnTimerRef.current);
      hnTimerRef.current = null;
      setHNElapsed(0);
    }
    return () => {
      if (hnTimerRef.current) {
        clearInterval(hnTimerRef.current);
        hnTimerRef.current = null;
      }
    };
  }, [hn.loading]);

  useEffect(() => {
    if (reddit.loading) {
      redditTimerRef.current = setInterval(() => setRedditElapsed((e) => e + 1), 1000);
    } else if (redditTimerRef.current) {
      clearInterval(redditTimerRef.current);
      redditTimerRef.current = null;
      setRedditElapsed(0);
    }
    return () => {
      if (redditTimerRef.current) {
        clearInterval(redditTimerRef.current);
        redditTimerRef.current = null;
      }
    };
  }, [reddit.loading]);

  useEffect(() => {
    if (!runId || !token) return;
    const controller = new AbortController();
    streamAbortRef.current = controller;
    const stage = stageRef.current;
    const gen = stage.getSnapshot().gen;
    let finished = false;

    readTriggerSse({
      runId,
      streamKey: "research",
      accessToken: token,
      onData: (data) => {
        if (finished) return;
        try {
          const event = JSON.parse(data) as StreamEvent;
          const done = stage.handleEvent(event, gen);
          flushCompetitorStage();
          if (done) {
            finished = true;
            controller.abort();
            if (event.type === "result") {
              writeCompetitorStageMarker(sessionId, { status: "done" });
              router.refresh();
            }
          }
        } catch {
          /* skip */
        }
      },
      onError: (err) => {
        if (finished) return;
        finished = true;
        stage.applyStreamTransportError(err, gen);
        flushCompetitorStage();
        setLoadingCompetitors(false);
      },
      signal: controller.signal,
      onEnd: () => {
        if (finished) return;
        finished = true;
        stage.applyStreamEnd(gen);
        flushCompetitorStage();
        setLoadingCompetitors(false);
      },
    });

    return () => {
      controller.abort();
      if (streamAbortRef.current === controller) {
        streamAbortRef.current = null;
      }
    };
  }, [runId, token, router, flushCompetitorStage, sessionId]);

  // Trigger cancel does NOT close SSE (onEnd never fires). Poll run status
  // so a canceled/failed backend run always clears the dino.
  useEffect(() => {
    if (!runId || !loadingCompetitors) return;

    let stopped = false;
    const tick = async () => {
      try {
        const res = await fetch(
          `/api/research/run-status?runId=${encodeURIComponent(runId)}`,
        );
        if (!res.ok || stopped) return;
        const body = (await res.json()) as {
          canceled?: boolean;
          failed?: boolean;
          completed?: boolean;
          status?: string;
        };
        if (stopped) return;
        if (body.canceled) {
          stopCompetitorsUi({
            canceled: true,
            message: "Alternatives stage cancelled. Try again.",
          });
          return;
        }
        if (body.failed) {
          stopCompetitorsUi({
            message: `Alternatives stage failed (${body.status ?? "FAILED"}). Try again.`,
          });
          return;
        }
        // COMPLETED without UI result yet: record completion time so the
        // session-poll effect can apply a grace period and then stop.
        if (body.completed && !competitors) {
          runCompletedAtRef.current ??= Date.now();
        }
      } catch {
        /* next tick */
      }
    };

    void tick();
    const interval = setInterval(() => {
      void tick();
    }, 2000);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [runId, loadingCompetitors, competitors, stopCompetitorsUi]);

  const cancelCompetitors = useCallback(() => {
    const id = runId;
    // Hide dino immediately — do not wait for SSE or cancel API.
    stopCompetitorsUi({ canceled: true });
    if (id) {
      void fetch("/api/research/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: id, sessionId }),
      });
    }
  }, [runId, sessionId, stopCompetitorsUi]);

  const runCompetitors = useCallback(async () => {
    const prevId = runId;
    if (prevId) {
      void fetch("/api/research/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: prevId, sessionId }),
      });
    }

    stageRef.current.beginRun();
    flushCompetitorStage();
    setRunId(null);
    setToken(null);

    try {
      const res = await fetch("/api/research/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          url: product.url,
          productName: product.productName,
          description: product.description,
          keyFeatures: product.keyFeatures,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      writeCompetitorStageMarker(sessionId, {
        status: "running",
        runId: body.runId,
      });
      setRunId(body.runId);
      setToken(body.publicAccessToken);
    } catch (err) {
      stageRef.current.applyError(
        err instanceof Error ? err.message : "Something went wrong",
        stageRef.current.getSnapshot().gen,
      );
      writeCompetitorStageMarker(sessionId, { status: "idle" });
      flushCompetitorStage();
    }
  }, [product, sessionId, runId, flushCompetitorStage]);

  // Resume stream from new-research handoff, or recover running runId from marker.
  // Never leave the dino spinning after cancel/refresh with nothing in flight.
  const competitorHandoffRef = useRef(false);
  useEffect(() => {
    if (readOnly || initialCompetitors || competitorHandoffRef.current) return;
    competitorHandoffRef.current = true;

    const marker = readCompetitorStageMarker(sessionId);

    // Idle / done — stage mutation only, React state already at defaults.
    if (marker?.status === "idle" || marker?.status === "done") {
      mutateCompetitorStage({ idle: true, message: null });
      return;
    }

    // Canceled — stage mutation + sync React state from stage (includes error banner).
    if (marker?.status === "canceled") {
      mutateCompetitorStage({ canceled: true });
      flushCompetitorStage();
      return;
    }

    let handoff: { runId?: string; publicAccessToken?: string } | null = null;
    try {
      const raw = sessionStorage.getItem(`competitor-stream:${sessionId}`);
      if (raw) {
        handoff = JSON.parse(raw) as {
          runId?: string;
          publicAccessToken?: string;
        };
        sessionStorage.removeItem(`competitor-stream:${sessionId}`);
      }
    } catch {
      /* ignore */
    }

    if (handoff?.runId && handoff.publicAccessToken) {
      const hRunId = handoff.runId;
      const hToken = handoff.publicAccessToken;
      writeCompetitorStageMarker(sessionId, {
        status: "running",
        runId: hRunId,
      });
      stageRef.current.beginRun();
      flushCompetitorStage();
      startTransition(() => {
        setStreamStatus("Connecting…");
        setLoadingCompetitors(true);
        setRunId(hRunId);
        setToken(hToken);
      });
      return;
    }

    // Marker says running but we only have runId (no stream token) — poll status + session.
    if (marker?.status === "running" && marker.runId) {
      const mRunId = marker.runId;
      startTransition(() => {
        setStreamStatus("Waiting for alternatives stage…");
        setLoadingCompetitors(true);
        setRunId(mRunId);
      });
      return;
    }

    // No in-flight signal at all (e.g. refresh after cancel without marker, or old session).
    // Do not spin forever — idle with try-again.
    mutateCompetitorStage({ idle: true, message: null });
  }, [
    readOnly,
    initialCompetitors,
    sessionId,
    mutateCompetitorStage,
    flushCompetitorStage,
  ]);

  useEffect(() => {
    if (readOnly || competitors || !loadingCompetitors) return;
    // Streaming path owns completion when we have a run handle + token.
    if (runId && token) return;

    let cancelled = false;
    const started = Date.now();
    // Without a live stream, only wait briefly for a persisted result.
    const GRACE_MS = 15_000;
    // After run-status reports COMPLETED, allow this long for the DB row to
    // appear before we give up and stop the loading UI.
    const COMPLETED_GRACE_MS = 10_000;
    runCompletedAtRef.current = null;

    const poll = async () => {
      try {
        const res = await fetch(`/api/research/sessions/${sessionId}`);
        if (!res.ok || cancelled) return;
        const body = (await res.json()) as {
          session?: { competitor_result?: CompetitorResult | null };
        };
        const next = body.session?.competitor_result ?? null;
        if (next && !cancelled) {
          stageRef.current.applyResult(
            next as StageCompetitorResult,
            stageRef.current.getSnapshot().gen,
          );
          writeCompetitorStageMarker(sessionId, { status: "done" });
          flushCompetitorStage();
          router.refresh();
          return;
        }
        // No result yet — check whether we should give up.
        const elapsed = Date.now() - started;
        const completedGrace =
          runCompletedAtRef.current !== null &&
          Date.now() - runCompletedAtRef.current > COMPLETED_GRACE_MS;
        if (
          !cancelled &&
          !competitors &&
          ((runId && completedGrace) || (!runId && elapsed > GRACE_MS))
        ) {
          stopCompetitorsUi({
            idle: true,
            message: null,
          });
        }
      } catch {
        /* next tick */
      }
    };

    void poll();
    const interval = setInterval(() => {
      void poll();
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [
    readOnly,
    competitors,
    loadingCompetitors,
    runId,
    token,
    sessionId,
    router,
    flushCompetitorStage,
    stopCompetitorsUi,
  ]);

  // Channels stay locked until we have a competitor payload (incl. empty list).
  const channelsLocked = !competitors;
  const competitorsPending = !readOnly && !competitors && loadingCompetitors;
  const status: "idle" | "competitors" | "reddit" | "hn" = loadingCompetitors
    ? "competitors"
    : reddit.loading
      ? "reddit"
      : hn.loading
        ? "hn"
        : "idle";
  const activeStreamStatus = loadingCompetitors
    ? streamStatus ?? "Waiting for alternatives stage…"
    : reddit.loading
      ? reddit.streamStatus
      : hn.loading
        ? hn.streamStatus
        : null;
  const activeElapsed = loadingCompetitors
    ? elapsed
    : reddit.loading
      ? redditElapsed
      : hn.loading
        ? hnElapsed
        : 0;
  const elapsedDisplay =
    activeElapsed < 60
      ? `${activeElapsed}s`
      : `${Math.floor(activeElapsed / 60)}m ${activeElapsed % 60}s`;

  const handleTabSwitch = useCallback((tab: "reddit" | "hn") => {
    setActiveResult(tab);
  }, []);

  const cancelCurrent = () => {
    // Prefer explicit competitor cancel whenever that stage owns the UI,
    // even if a race flipped loadingCompetitors already.
    if (loadingCompetitors || (!competitors && !reddit.loading && !hn.loading)) {
      cancelCompetitors();
    } else if (reddit.loading) {
      reddit.cancel();
    } else if (hn.loading) {
      hn.cancel();
    }
  };

  return (
    <div>
      {!readOnly && (
        <div className="mb-6 flex items-center justify-between border-b border-border/30 pb-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Research session
          </span>
          <button
            type="button"
            onClick={copyShareUrl}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] transition-all",
              shareCopied
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
                : "border-border/60 bg-card/40 text-foreground/80 hover:border-brand/50 hover:bg-brand/5 hover:text-foreground",
            )}
          >
            {shareCopied ? (
              <Check className="size-3" />
            ) : (
              <Share2 className="size-3" />
            )}
            {shareCopied ? "Copied" : "Share"}
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-start lg:gap-8">
        <div>
          <ProductHeader
            result={product}
            competitors={competitors}
            competitorsPending={competitorsPending}
            competitorsError={error}
            onReFindCompetitors={runCompetitors}
            readOnly={readOnly}
          />
        </div>

        <div className="lg:sticky lg:top-10 lg:h-[calc(100vh-5rem)]">
          <Console
            status={status}
            hasCompetitors={!channelsLocked}
            competitorsRunning={loadingCompetitors}
            hasReddit={!!redditScan}
            hasHN={!!hnResult}
            redditCount={redditScan?.top_threads?.length ?? 0}
            hnCount={hnResult?.threads.length ?? 0}
            onFindReddit={reddit.run}
            onCancel={cancelCurrent}
            streamStatus={activeStreamStatus}
            elapsedDisplay={elapsedDisplay}
            error={error || hn.error || reddit.error || streamError}
            redditScan={redditScan}
            hnResult={hnResult}
            loadingReddit={reddit.loading}
            loadingHN={hn.loading}
            activeResult={activeResult}
            onSwitchResult={handleTabSwitch}
            subsSearch={subsSearch}
            subsSearchOpen={subsSearchOpen}
            onToggleSubsSearch={() => setSubsSearchOpen((p) => !p)}
            onChangeSubsSearch={setSubsSearch}
            readOnly={readOnly}
            isAuthed={isAuthed}
            signupHref={signupHref}
            showHNDraft={showHNDraft}
            loadingShowHN={loadingShowHN}
            onDraftShowHN={() => {
              setActiveHNChannel("draft");
              void draftShowHN();
            }}
            onCancelDraft={cancelDraftShowHN}
            onPersistShowHN={persistShowHNDraft}
            activeHNChannel={activeHNChannel}
            onActivateHNChannel={setActiveHNChannel}
            onFindHN={() => {
              setActiveHNChannel("find");
              hn.run();
            }}
          />
        </div>
      </div>
    </div>
  );
}
