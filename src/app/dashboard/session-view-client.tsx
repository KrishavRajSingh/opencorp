"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Users,
  Link2,
  Share2,
  Check,
} from "lucide-react";
import { ProductFavicon } from "@/components/dashboard/product-favicon";
import { DinoLoader } from "@/components/dashboard/dino-loader";
import { HNIcon } from "@/components/dashboard/hn-icon";
import type { HNThread } from "@/app/dashboard/hn-threads-block";
import { cn } from "@/lib/utils";

type ProductResult = {
  url: string;
  productName: string;
  description: string;
  keyFeatures: string[];
  targetAudience: string;
  pricingModel: string;
};

type Competitor = {
  name: string;
  url: string;
  description: string;
  mentionSources: string[];
};

type CompetitorResult = {
  competitors: Competitor[];
  searchQueriesUsed?: string[];
};

type HNResult = {
  threads: HNThread[];
};

type ToolCallChunk = {
  toolCallId: string;
  toolName: string;
  args?: { url?: string; query?: string };
  url?: string;
  query?: string;
  title?: string;
  snippet?: string;
  track?: string;
};

function readSSEStream(
  runId: string,
  streamKey: string,
  accessToken: string,
  onData: (data: string) => void,
  onError: (err: string) => void,
  signal: AbortSignal,
) {
  const url = `https://api.trigger.dev/realtime/v1/streams/${runId}/${streamKey}`;
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
            const obj = JSON.parse(data);
            if (eventType === "batch" && obj.records) {
              for (const r of obj.records) {
                const body = JSON.parse(r.body);
                onData(body.data);
              }
            }
          } catch { /* skip */ }
        }
        if (done) break;
      }
    })
    .catch((err) => {
      if (err instanceof DOMException && err.name === "AbortError") return;
      onError(err.message ?? String(err));
    });
}

function ProductHeader({ result }: { result: ProductResult }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3.5">
        <ProductFavicon
          url={result.url}
          size={40}
          rounded="lg"
          className="mt-0.5 ring-1 ring-border/40"
        />
        <div className="min-w-0 flex-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
            subject
          </span>
          <h2 className="mt-0.5 font-heading text-xl tracking-tight text-foreground sm:text-2xl">
            {result.productName}
          </h2>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-brand/70 hover:text-brand transition-colors"
          >
            <Link2 className="size-3" />
            <span className="truncate">{result.url}</span>
            <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        </div>
      </div>

      {result.description && (
        <p className="max-w-2xl text-sm leading-relaxed text-foreground/80">
          {result.description}
        </p>
      )}

      {result.keyFeatures.length > 0 && (
        <div className="space-y-2">
          <span className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground/60">
            Key Features
          </span>
          <div className="flex flex-wrap gap-1.5">
            {result.keyFeatures.map((f, i) => (
              <span
                key={i}
                className="inline-flex rounded-md border border-border/40 bg-card/30 px-2 py-0.5 text-[11px] text-foreground/80"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {(result.pricingModel || result.targetAudience) && (
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {result.pricingModel && (
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                Pricing
              </dt>
              <dd className="mt-1 text-sm text-foreground/85 leading-relaxed">
                {result.pricingModel}
              </dd>
            </div>
          )}
          {result.targetAudience && (
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                Target Audience
              </dt>
              <dd className="mt-1 text-sm text-foreground/85 leading-relaxed">
                {result.targetAudience}
              </dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}

type ConsoleProps = {
  status: "idle" | "competitors" | "hn";
  hasCompetitors: boolean;
  hasHN: boolean;
  competitorCount: number;
  hnCount: number;
  url: string;
  onFindCompetitors: () => void;
  onFindHN: () => void;
  onCancel: () => void;
  streamStatus: string | null;
  elapsedDisplay: string;
  error: string | null;
  competitors: CompetitorResult | null;
  hnResult: HNResult | null;
  loadingCompetitors: boolean;
  loadingHN: boolean;
  activeResult: "competitors" | "hn";
  onSwitchResult: (tab: "competitors" | "hn") => void;
  readOnly?: boolean;
};

function Console({
  status,
  hasCompetitors,
  hasHN,
  competitorCount,
  hnCount,
  url,
  onFindCompetitors,
  onFindHN,
  onCancel,
  streamStatus,
  elapsedDisplay,
  error,
  competitors,
  hnResult,
  loadingCompetitors,
  loadingHN,
  activeResult,
  onSwitchResult,
  readOnly = false,
}: ConsoleProps) {
  const domain = (() => {
    try {
      return new URL(url).host.replace(/^www\./, "");
    } catch {
      return url;
    }
  })();

  const busy = status !== "idle";
  const showCompetitorBtn = !hasCompetitors;
  const showHNBtn = hasCompetitors && !hasHN;
  const allDone = hasCompetitors && hasHN && !busy;

  const statusMeta = {
    idle: {
      dot: "bg-muted-foreground/50",
      label: "READY",
      tone: "text-muted-foreground/70",
    },
    allComplete: {
      dot: "bg-emerald-400",
      label: "ALL COMPLETE",
      tone: "text-emerald-400/80",
    },
    competitors: {
      dot: "bg-brand",
      label: "FINDING COMPETITORS",
      tone: "text-brand",
    },
    hn: {
      dot: "bg-orange-400",
      label: "FINDING HN THREADS",
      tone: "text-orange-400",
    },
  }[allDone ? "allComplete" : status];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm">
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-b border-border/30 px-4 py-3",
          status === "competitors" && "border-brand/30",
          status === "hn" && "border-orange-400/30",
          allDone && "border-emerald-400/30",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "inline-block size-1.5 rounded-full",
              statusMeta.dot,
              busy && "animate-pulse",
            )}
          />
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-widest",
              statusMeta.tone,
            )}
          >
            {statusMeta.label}
          </span>
        </div>
        {busy && (
          <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground/60">
            {elapsedDisplay}
          </span>
        )}
      </div>

      {streamStatus && busy && (
        <div className="border-b border-border/30 px-4 py-2.5 font-mono text-[11px] text-brand/80 truncate">
          <span className="text-muted-foreground/50">&gt; </span>
          {streamStatus}
        </div>
      )}

      {!readOnly && (showCompetitorBtn || showHNBtn) && (
        <div className="space-y-2 border-b border-border/30 px-4 py-3">
          {showCompetitorBtn && (
            <button
              onClick={onFindCompetitors}
              disabled={busy}
              className={cn(
                "group/btn flex w-full items-center justify-between gap-3 rounded-xl border bg-card/60 px-4 py-2.5 text-left text-sm transition-all",
                busy
                  ? "cursor-not-allowed border-border/40 text-muted-foreground/50"
                  : "border-border/60 text-foreground/85 hover:border-brand/50 hover:bg-brand/5 hover:text-foreground",
              )}
            >
              <div className="flex items-center gap-2.5">
                <Users className="size-4 text-brand" />
                <span className="font-medium">Find competitors</span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 group-hover/btn:text-brand/70">
                Stage 1
              </span>
            </button>
          )}
          {showHNBtn && (
            <button
              onClick={onFindHN}
              disabled={busy}
              className={cn(
                "group/btn flex w-full items-center justify-between gap-3 rounded-xl border bg-card/60 px-4 py-2.5 text-left text-sm transition-all",
                busy
                  ? "cursor-not-allowed border-border/40 text-muted-foreground/50"
                  : "border-orange-400/30 text-foreground hover:border-orange-400/60 hover:bg-orange-400/10 hover:text-foreground",
              )}
            >
              <div className="flex items-center gap-2.5">
                <HNIcon className="size-5" />
                <span className="font-medium">Find HN threads</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-orange-400/70 group-hover/btn:text-orange-400">
                  Stage 2
                </span>
                <ArrowRight className="size-3.5 text-orange-400/50 transition-all group-hover/btn:translate-x-0.5 group-hover/btn:text-orange-400" />
              </div>
            </button>
          )}
          {busy && (
            <button
              onClick={onCancel}
              className="block w-full py-1 text-center text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              cancel
            </button>
          )}
        </div>
      )}


      <div className="flex-1 overflow-y-auto">
        <div className="m-3 flex items-center rounded-lg border border-border/30 bg-card/30 p-0.5">
          <button
            onClick={() => onSwitchResult("competitors")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-all",
              activeResult === "competitors"
                ? "bg-brand/10 text-foreground"
                : "text-muted-foreground/70 hover:text-foreground/80",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                activeResult === "competitors" ? "bg-brand" : "bg-brand/40",
              )}
            />
            <span>Competitors</span>
            {competitorCount > 0 && (
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
                {competitorCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onSwitchResult("hn")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-all",
              activeResult === "hn"
                ? "bg-orange-400/10 text-foreground"
                : "text-muted-foreground/70 hover:text-foreground/80",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                activeResult === "hn"
                  ? "bg-orange-400"
                  : "bg-orange-400/40",
              )}
            />
            <span>Hacker News</span>
            {hnCount > 0 && (
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
                {hnCount}
              </span>
            )}
           </button>
         </div>

        {activeResult === "competitors" ? (
          <div className="border-t border-border/30 px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground/60">
                Stage 1 · Competitors
              </span>
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
                {competitorCount}
              </span>
            </div>
            {competitors && competitors.competitors.length > 0 ? (
              <div className="space-y-2">
                {competitors.competitors.map((c, i) => (
                  <a
                    key={i}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-border/60 bg-card/40 p-3 transition-all hover:border-brand/40 hover:bg-card/70"
                  >
                    <div className="flex items-center gap-2">
                      <ProductFavicon
                        url={c.url}
                        size={16}
                        rounded="sm"
                        className="ring-1 ring-border/40"
                      />
                      <span className="inline-flex items-center gap-1 truncate text-sm font-medium text-foreground transition-colors group-hover:text-brand">
                        {c.name}
                      </span>
                      <ExternalLink className="ml-auto size-3 shrink-0 text-muted-foreground/40" />
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-foreground/65">
                      {c.description}
                    </p>
                    {c.mentionSources.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {c.mentionSources.slice(0, 3).map((s, j) => (
                          <span
                            key={j}
                            className="rounded border border-border/40 bg-background/50 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            ) : loadingCompetitors ? (
              <DinoLoader
                instanceKey="competitors"
                label="Scanning for competitors…"
                loading={loadingCompetitors}
                sublabel="This usually takes 5–7 minutes. We’re reading the page, searching for competitors, and ranking the results — hang tight."
                tone="brand"
              />
            ) : (
              <p className="py-2 text-xs text-muted-foreground/50">
                Click{" "}
                <span className="text-foreground/70">Find competitors</span>{" "}
                above
              </p>
            )}
          </div>
        ) : (
          <div className="border-t border-border/30 px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground/60">
                Stage 2 · Hacker News
              </span>
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
                {hnCount}
              </span>
            </div>
            {hnResult && hnResult.threads.length > 0 ? (
              <div className="space-y-0.5">
                {hnResult.threads.map((t, i) => {
                  const rank = String(i + 1).padStart(2, "0");
                  const hnUrl = `https://news.ycombinator.com/item?id=${t.objectID}`;
                  return (
                    <a
                      key={t.objectID}
                      href={hnUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/row flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-card/60"
                    >
                      <span className="mt-0.5 w-5 shrink-0 text-right font-mono text-[10px] tabular-nums text-orange-400/80">
                        {rank}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs text-foreground/85 group-hover/row:text-foreground">
                          {t.title}
                        </p>
                        <p className="mt-0.5 text-[11px] italic text-muted-foreground/70">
                          {t.whyRelevant}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/50">
                          <span>▲ {t.points}</span>
                          <span className="text-muted-foreground/30">·</span>
                          <span>{t.comments} comments</span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : loadingHN ? (
              <DinoLoader
                instanceKey="hn"
                label="Searching Hacker News…"
                loading={loadingHN}
                sublabel="This usually takes 1–2 minutes. We’re searching Hacker News for threads where your future users are already talking — hang tight."
                tone="orange"
              />
            ) : (
              <p className="py-2 text-xs text-muted-foreground/50">
                {hasCompetitors
                  ? "Click Find HN threads above"
                  : "Run Stage 1 first"}
              </p>
            )}
          </div>
        )}

        <div className="px-4 py-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
              session
            </span>
          </div>
          <dl className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                domain
              </dt>
              <dd className="truncate text-xs text-foreground/80" title={domain}>
                {domain || "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 border-t border-border/30 px-4 py-3 text-xs text-red-400">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export function SessionViewClient({
  sessionId,
  product,
  competitors: initialCompetitors,
  hnResult: initialHNResult,
  readOnly = false,
}: {
  sessionId: string;
  product: ProductResult;
  competitors: CompetitorResult | null;
  hnResult: HNResult | null;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [competitors, setCompetitors] = useState<CompetitorResult | null>(
    initialCompetitors,
  );
  const [hnResult, setHNResult] = useState<HNResult | null>(initialHNResult);
  const [loadingCompetitors, setLoadingCompetitors] = useState(false);
  const [loadingHN, setLoadingHN] = useState(false);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hnStreamStatus, setHNStreamStatus] = useState<string | null>(null);
  const [hnElapsed, setHNElapsed] = useState(0);
  const [hnError, setHNError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [runId, setRunId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hnRunId, setHNRunId] = useState<string | null>(null);
  const [hnToken, setHNToken] = useState<string | null>(null);

  const [activeResult, setActiveResult] = useState<"competitors" | "hn">(
    "competitors",
  );

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
    if (loadingHN) {
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
  }, [loadingHN]);

  useEffect(() => {
    if (!runId || !token) return;
    const controller = new AbortController();
    const done = { current: false };

    readSSEStream(runId, "research", token, (data) => {
      try {
        const event = JSON.parse(data) as { type: string } & Record<string, unknown>;
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
            setStreamStatus(label);
            break;
          }
          case "result": {
            controller.abort();
            if (done.current) break;
            done.current = true;
            const r = event as unknown as CompetitorResult;
            setCompetitors(r);
            setLoadingCompetitors(false);
            setStreamStatus("Saved");
            fetch("/api/research/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: sessionId,
                competitor_result: r,
              }),
            })
              .then((res) => {
                if (res.ok) router.refresh();
              })
              .catch(() => {});
            break;
          }
          case "error": {
            controller.abort();
            setError((event as unknown as { error: string }).error);
            setLoadingCompetitors(false);
            break;
          }
        }
      } catch { /* skip */ }
    }, (err) => setStreamError(`Competitors: ${err}`), controller.signal);

    return () => controller.abort();
  }, [runId, token, sessionId, router]);

  const runCompetitors = useCallback(async () => {
    setLoadingCompetitors(true);
    setError(null);
    setRunId(null);
    setToken(null);
    setStreamStatus(null);
    setStreamError(null);

    try {
      const res = await fetch("/api/research/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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

      setRunId(body.runId);
      setToken(body.publicAccessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoadingCompetitors(false);
    }
  }, [product]);

  const cancelCompetitors = useCallback(() => {
    setRunId(null);
    setToken(null);
    setLoadingCompetitors(false);
  }, []);

  useEffect(() => {
    if (!hnRunId || !hnToken) return;
    const controller = new AbortController();
    const done = { current: false };

    readSSEStream(hnRunId, "research", hnToken, (data) => {
      try {
        const event = JSON.parse(data) as { type: string } & Record<string, unknown>;
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
            setHNStreamStatus(label);
            break;
          }
          case "result": {
            controller.abort();
            if (done.current) break;
            done.current = true;
            const r = event as unknown as HNResult;
            setHNResult(r);
            setLoadingHN(false);
            setHNStreamStatus("Saved");
            fetch("/api/research/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: sessionId,
                hn_threads_result: r,
              }),
            })
              .then((res) => {
                if (res.ok) router.refresh();
              })
              .catch(() => {});
            break;
          }
          case "error": {
            controller.abort();
            setHNError((event as unknown as { error: string }).error);
            setLoadingHN(false);
            break;
          }
        }
      } catch { /* skip */ }
    }, (err) => setStreamError(`HN: ${err}`), controller.signal);

    return () => controller.abort();
  }, [hnRunId, hnToken, sessionId, router]);

  const runHN = useCallback(async () => {
    setLoadingHN(true);
    setHNError(null);
    setHNRunId(null);
    setHNToken(null);
    setHNStreamStatus(null);

    try {
      const res = await fetch("/api/research/hn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: product.url,
          productName: product.productName,
          description: product.description,
          keyFeatures: product.keyFeatures,
          competitors:
            competitors?.competitors?.map((c) => ({
              name: c.name,
              url: c.url,
            })) ?? [],
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      setHNRunId(body.runId);
      setHNToken(body.publicAccessToken);
    } catch (err) {
      setHNError(err instanceof Error ? err.message : "Something went wrong");
      setLoadingHN(false);
    }
  }, [product, competitors]);

  const cancelHN = useCallback(() => {
    setHNRunId(null);
    setHNToken(null);
    setLoadingHN(false);
  }, []);

  const status: "idle" | "competitors" | "hn" = loadingCompetitors
    ? "competitors"
    : loadingHN
      ? "hn"
      : "idle";
  const activeStreamStatus = loadingCompetitors
    ? streamStatus
    : loadingHN
      ? hnStreamStatus
      : null;
  const activeElapsed = loadingCompetitors ? elapsed : loadingHN ? hnElapsed : 0;
  const elapsedDisplay =
    activeElapsed < 60
      ? `${activeElapsed}s`
      : `${Math.floor(activeElapsed / 60)}m ${activeElapsed % 60}s`;

  const handleTabSwitch = useCallback((tab: "competitors" | "hn") => {
    setActiveResult(tab);
  }, []);

  const cancelCurrent = () => {
    if (loadingCompetitors) cancelCompetitors();
    else if (loadingHN) cancelHN();
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
          <ProductHeader result={product} />
        </div>

        <div className="lg:sticky lg:top-10 lg:h-[calc(100vh-5rem)]">
          <Console
            status={status}
            hasCompetitors={!!competitors}
            hasHN={!!hnResult}
            competitorCount={competitors?.competitors.length ?? 0}
            hnCount={hnResult?.threads.length ?? 0}
            url={product.url}
            onFindCompetitors={runCompetitors}
            onFindHN={runHN}
            onCancel={cancelCurrent}
            streamStatus={activeStreamStatus}
            elapsedDisplay={elapsedDisplay}
            error={error || hnError || streamError}
            competitors={competitors}
            hnResult={hnResult}
            loadingCompetitors={loadingCompetitors}
            loadingHN={loadingHN}
            activeResult={activeResult}
            onSwitchResult={handleTabSwitch}
            readOnly={readOnly}
          />
        </div>
      </div>
    </div>
  );
}
