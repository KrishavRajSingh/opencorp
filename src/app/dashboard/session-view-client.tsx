"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2,
  AlertTriangle,
  ExternalLink,
  Check,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ActivityFeed,
  type ActivityItem,
} from "@/components/ai-elements/activity-feed";
import { ProductFavicon } from "@/components/dashboard/product-favicon";
import { cn } from "@/lib/utils";

type ProductResult = {
  url: string;
  productName: string;
  description: string;
  keyFeatures: string[];
  targetAudience: string;
  pricingModel: string;
  researchSummary: string;
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

type ToolCallChunk = {
  toolCallId: string;
  toolName: string;
  args?: { url?: string; query?: string };
  url?: string;
  query?: string;
  title?: string;
  snippet?: string;
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-mono text-[10px] uppercase text-muted-foreground/60">
        {label}
      </span>
      <p className="text-xs text-foreground/75">{value || "\u2014"}</p>
    </div>
  );
}

function ProductBlock({ result }: { result: ProductResult }) {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <ProductFavicon
            url={result.url}
            size={40}
            rounded="lg"
            className="mt-1 ring-1 ring-border/40"
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg tracking-tight text-foreground">
              {result.productName}
            </h2>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 text-xs text-brand/70 hover:text-brand transition-colors"
            >
              {result.url}
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
        {result.description && (
          <p className="text-sm text-foreground/75 leading-relaxed">
            {result.description}
          </p>
        )}
      </div>

      {result.keyFeatures.length > 0 && (
        <div className="space-y-2">
          <span className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground/60">
            Key Features
          </span>
          <div className="flex flex-wrap gap-1.5">
            {result.keyFeatures.map((f, i) => (
              <span
                key={i}
                className="inline-flex rounded-md border border-border/60 bg-card px-2.5 py-1 text-xs text-foreground/80 transition-colors hover:border-brand/30 hover:text-foreground"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Pricing" value={result.pricingModel} />
        <Field label="Target Audience" value={result.targetAudience} />
      </div>
    </div>
  );
}

function CompetitorsBlock({ result }: { result: CompetitorResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-10 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm tracking-tight text-foreground">
          Competitors
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
          {result.competitors.length} found
        </span>
      </div>
      {result.competitors.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No competitors found.
        </p>
      ) : (
        <div className="space-y-2">
          {result.competitors.map((c, i) => (
            <div
              key={i}
              className="group rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-brand/30"
            >
              <div className="flex items-center gap-2.5">
                <ProductFavicon
                  url={c.url}
                  size={22}
                  rounded="md"
                  className="ring-1 ring-border/40"
                />
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors group-hover:text-brand"
                >
                  {c.name}
                  <ExternalLink className="size-3" />
                </a>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-foreground/65">
                {c.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function SessionViewClient({
  sessionId,
  product,
  competitors: initialCompetitors,
}: {
  sessionId: string;
  product: ProductResult;
  competitors: CompetitorResult | null;
}) {
  const router = useRouter();
  const [competitors, setCompetitors] = useState<CompetitorResult | null>(
    initialCompetitors,
  );
  const [loadingCompetitors, setLoadingCompetitors] = useState(false);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [runId, setRunId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

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
            if (chunk.toolCallId) {
              const id = chunk.toolCallId;
              setActivity((prev) => {
                if (prev.some((c) => c.id === id)) return prev;
                return [
                  ...prev.map((c) =>
                    c.status === "in-flight" ? { ...c, status: "done" as const } : c,
                  ),
                  {
                    id,
                    track: "competitor",
                    toolName: chunk.toolName,
                    url: chunk.url ?? chunk.args?.url,
                    query: chunk.query ?? chunk.args?.query,
                    title: chunk.title,
                    snippet: chunk.snippet,
                    status: "in-flight",
                    arrivedAt: Date.now(),
                  },
                ];
              });
            }
            break;
          }
          case "result": {
            controller.abort();
            if (done.current) break;
            done.current = true;
            setActivity((prev) =>
              prev.map((c) =>
                c.status === "in-flight" ? { ...c, status: "done" as const } : c,
              ),
            );
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
        body: JSON.stringify(product),
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

  const currentItems = activity.filter((c) => c.track === "competitor");
  const currentMaxSteps = 8;
  const currentDoneCount = currentItems.filter(
    (c) => c.status === "done" || c.status === "error",
  ).length;
  const elapsedDisplay =
    elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;

  return (
    <div className="space-y-8">
      <ProductBlock result={product} />

      {!competitors && !loadingCompetitors && (
        <div className="flex flex-col items-center gap-3 pt-4">
          <p className="text-xs text-muted-foreground">Want to dig deeper?</p>
          <button
            onClick={runCompetitors}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-4 py-2.5 text-sm transition-all",
              "text-foreground/70 hover:border-brand/30 hover:text-foreground",
            )}
          >
            <Users className="size-4" />
            Find competitors
          </button>
        </div>
      )}

      <AnimatePresence>
        {loadingCompetitors && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="rounded-2xl border border-brand/30 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 px-5 py-4">
                <Loader2 className="size-5 shrink-0 animate-spin text-brand" />
                <span className="flex-1 truncate text-sm text-foreground/60">
                  Finding competitors
                </span>
                <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
                  {elapsedDisplay}
                </span>
                <button
                  onClick={cancelCompetitors}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  cancel
                </button>
              </div>
            </div>
            {streamStatus && (
              <div className="truncate text-xs text-brand/70 font-mono">
                &gt; {streamStatus}
              </div>
            )}
            <ActivityFeed
              items={currentItems}
              doneCount={currentDoneCount}
              maxSteps={currentMaxSteps}
            />
          </motion.div>
        )}

        {competitors && (
          <CompetitorsBlock key="result" result={competitors} />
        )}

        {error && competitors && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400">
            <AlertTriangle className="size-3.5 shrink-0" />
            {error}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
