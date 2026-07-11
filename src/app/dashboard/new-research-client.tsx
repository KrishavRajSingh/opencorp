"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ActivityFeed,
  type ActivityItem,
  type ActivityTrack,
} from "@/components/ai-elements/activity-feed";
import { ProductFavicon } from "@/components/dashboard/product-favicon";
import { Logo } from "@/components/dashboard/logo";
import { cn } from "@/lib/utils";

interface ProductResult {
  url: string;
  productName: string;
  description: string;
  keyFeatures: string[];
  targetAudience: string;
  pricingModel: string;
}

type Status = "idle" | "streaming" | "success" | "error";

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

function ProductResultCard({ result }: { result: ProductResult }) {
  return (
    <div className="mt-8 w-full space-y-6">
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
                className="inline-flex rounded-md border border-border/60 bg-card/40 px-2.5 py-1 text-xs text-foreground/70"
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

export function NewResearchClient({
  initialUrl = "",
}: {
  initialUrl?: string;
} = {}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [url, setUrl] = useState(initialUrl);
  const [result, setResult] = useState<ProductResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [runId, setRunId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (status === "streaming") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status]);

  useEffect(() => {
    if (!runId || !token) return;
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreamStatus("Connecting...");

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
                    track: "product",
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
            setActivity((prev) =>
              prev.map((c) =>
                c.status === "in-flight" ? { ...c, status: "done" as const } : c,
              ),
            );
            const r = event as unknown as ProductResult;
            setResult(r);
            setStatus("success");
            setStreamStatus("Done");
            fetch("/api/research/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                input: { url: r.url },
                product_analyst_result: r,
              }),
            })
              .then((res) => res.json())
              .then(
                (body: {
                  id?: string;
                  error?: string;
                  competitorRunId?: string;
                  publicAccessToken?: string;
                }) => {
                  if (body.id) {
                    if (body.competitorRunId && body.publicAccessToken) {
                      try {
                        sessionStorage.setItem(
                          `competitor-stream:${body.id}`,
                          JSON.stringify({
                            runId: body.competitorRunId,
                            publicAccessToken: body.publicAccessToken,
                          }),
                        );
                        sessionStorage.setItem(
                          `competitor-stage:${body.id}`,
                          JSON.stringify({
                            status: "running",
                            runId: body.competitorRunId,
                          }),
                        );
                      } catch {
                        /* private mode / quota — session view will poll */
                      }
                    }
                    setStreamStatus("Saved. Opening project…");
                    router.push(`/dashboard/${body.id}`);
                  } else {
                    setError(body.error ?? "Failed to save");
                    setStatus("error");
                  }
                },
              )
              .catch((err) => {
                setError(err instanceof Error ? err.message : "Save failed");
                setStatus("error");
              });
            break;
          }
          case "error": {
            controller.abort();
            setActivity((prev) =>
              prev.map((c) =>
                c.status === "in-flight" ? { ...c, status: "error" as const } : c,
              ),
            );
            setError((event as unknown as { error: string }).error);
            setStatus("error");
            break;
          }
        }
      } catch (e) {
        setStreamError(`Parse: ${String(e).slice(0, 80)}`);
      }
    }, (err) => setStreamError(`Stream: ${err}`), controller.signal);

    return () => controller.abort();
  }, [runId, token, router]);

  useEffect(() => {
    if (initialUrl) {
      document.cookie = "pending_url=; path=/; max-age=0";
    }
  }, [initialUrl]);

  const handleSubmit = useCallback(async () => {
    let trimmed = url.trim();
    if (!trimmed) return;

    trimmed = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
      new URL(trimmed);
    } catch {
      setError("Enter a valid URL (e.g. https://example.com)");
      return;
    }

    setStatus("streaming");
    setError(null);
    setStreamStatus(null);
    setStreamError(null);
    setResult(null);
    setActivity([]);
    setElapsed(0);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      setRunId(body.runId);
      setToken(body.publicAccessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }, [url, router]);

  const handleCancel = useCallback(() => {
    const id = runId;
    setRunId(null);
    setToken(null);
    setStatus("idle");
    if (id) {
      void fetch("/api/research/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: id }),
      });
    }
  }, [runId]);

  const handleReset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setActivity([]);
    setElapsed(0);
    setRunId(null);
    setToken(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSubmit();
    },
    [handleSubmit],
  );

  const currentTrack: ActivityTrack = "product";
  const currentItems = activity.filter((c) => c.track === currentTrack);
  const currentMaxSteps = 6;
  const currentDoneCount = currentItems.filter(
    (c) => c.status === "done" || c.status === "error",
  ).length;
  const elapsedDisplay =
    elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;

  return (
    <AnimatePresence mode="wait">
      {status === "idle" && (
        <motion.div
          key="idle"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mx-auto flex max-w-2xl flex-col items-center pt-12 sm:pt-20"
        >
          <div className="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            <Logo size={14} />
            <span>scope · market research</span>
          </div>

          <h1 className="text-center font-heading text-3xl tracking-tight text-foreground sm:text-4xl">
            What are you building?
          </h1>
          <p className="mt-3 max-w-md text-center text-sm text-muted-foreground">
            Drop a product URL. We&apos;ll scan the sources and hand you a
            ready pipeline of users who need it.
          </p>

          <div className="mt-10 w-full">
            <div className="group relative">
              <div className="pointer-events-none absolute -inset-3 rounded-3xl bg-[radial-gradient(ellipse_at_center,oklch(0.72_0.15_75_/_0.08),transparent_70%)] opacity-0 transition-opacity duration-500 group-focus-within:opacity-100" />
              <div className="relative flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 px-5 py-4 backdrop-blur-sm transition-all focus-within:border-brand/50 focus-within:shadow-[0_0_0_4px_oklch(0.72_0.15_75/0.08),0_24px_48px_-24px_oklch(0.72_0.15_75/0.4)]">
                <Logo size={20} className="shrink-0" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="yourproduct.com"
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!url.trim()}
                  className="shrink-0"
                >
                  <span className="hidden sm:inline">Research</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
            {error && (
              <p className="mt-3 text-center text-xs text-red-400">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                or try one
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  "https://linear.app",
                  "https://notion.so",
                  "https://vercel.com",
                ].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => {
                      setUrl(example);
                      setError(null);
                    }}
                    className="group/chip flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-foreground/75 transition-colors hover:border-brand/40 hover:text-foreground"
                  >
                    <ProductFavicon
                      url={example}
                      size={12}
                      rounded="sm"
                    />
                    {example.replace(/^https?:\/\//, "")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {status === "streaming" && (
        <motion.div
          key="streaming"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mx-auto flex max-w-3xl flex-col items-stretch pt-16"
        >
          <div className="relative w-full">
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-[radial-gradient(ellipse_at_center,oklch(0.72_0.15_75_/_0.06),transparent_70%)]" />
            <div className="relative rounded-2xl border border-brand/30 bg-card/50 backdrop-blur-sm">
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl border border-brand/40"
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div className="relative z-10 flex items-center gap-3 px-5 py-4">
                <ProductFavicon url={url} size={20} rounded="sm" />
                <Loader2 className="size-5 shrink-0 animate-spin text-brand" />
                <span className="flex-1 truncate bg-transparent text-sm text-foreground/60">
                  {url}
                </span>
                <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
                  {elapsedDisplay}
                </span>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="relative z-10 shrink-0 px-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  cancel
                </button>
              </div>
            </div>

            {streamStatus && (
              <div className="mt-3 truncate text-xs text-brand/70 font-mono">
                &gt; {streamStatus}
              </div>
            )}
            {streamError && (
              <div className="mt-1 text-xs text-red-400 font-mono">
                {streamError}
              </div>
            )}

            <ActivityFeed
              items={currentItems}
              doneCount={currentDoneCount}
              maxSteps={currentMaxSteps}
            />
          </div>
        </motion.div>
      )}

      {status === "error" && !result && (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mx-auto flex max-w-xl flex-col items-center pt-24"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="size-8 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
            <Button size="sm" onClick={handleReset} variant="outline">
              Try again
            </Button>
          </div>
        </motion.div>
      )}

      {status === "success" && result && (
        <motion.div
          key="result"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-xl"
        >
          <ProductResultCard result={result} />
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin text-brand" />
            Opening your project…
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
