"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Check,
  Users,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Severity = "high" | "medium" | "low";

interface Competitor {
  name: string;
  url: string;
  description: string;
  featureSet: string;
  pricingModel: string;
  targetAudience: string;
  strengths: string;
  weaknesses: string;
  mentionSources: string[];
}

interface Finding {
  painPoint: string;
  severity: string;
  frequency: string;
  verbatimQuote: string;
  quoteSource: string;
  userRole: string;
  companyType: string;
  toolStack: string;
  wishlist: string;
}

interface ProductResult {
  url: string;
  productName: string;
  description: string;
  keyFeatures: string[];
  targetAudience: string;
  pricingModel: string;
  techStack: string;
  marketPosition: string;
  researchSummary: string;
}

type Status = "idle" | "streaming" | "success" | "error";

function mapSeverity(s: string): Severity {
  const lower = s.toLowerCase();
  if (lower.includes("high") || lower.includes("severe")) return "high";
  if (lower.includes("low") || lower.includes("minor")) return "low";
  return "medium";
}

const severityColors: Record<Severity, string> = {
  high: "text-red-400 bg-red-500/10 border-red-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-muted-foreground bg-muted/50 border-border",
};

type ToolCallChunk = {
  toolCallId: string;
  toolName: string;
  args?: { url?: string };
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

function ProductResultCard({ result }: { result: ProductResult }) {
  return (
    <div className="mt-8 w-full space-y-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
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
        <Field label="Tech Stack" value={result.techStack} />
        <Field label="Market Position" value={result.marketPosition} />
      </div>
    </div>
  );
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

export default function DashboardPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [url, setUrl] = useState("");
  const [productResult, setProductResult] = useState<ProductResult | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[] | null>(null);
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toolCalls, setToolCalls] = useState<string[]>([]);
  const [loadingCompetitors, setLoadingCompetitors] = useState(false);
  const [loadingSentiment, setLoadingSentiment] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [productRunId, setProductRunId] = useState<string | null>(null);
  const [productToken, setProductToken] = useState<string | null>(null);
  const [competitorsRunId, setCompetitorsRunId] = useState<string | null>(null);
  const [competitorsToken, setCompetitorsToken] = useState<string | null>(null);
  const [sentimentRunId, setSentimentRunId] = useState<string | null>(null);
  const [sentimentToken, setSentimentToken] = useState<string | null>(null);

  const isRunning = status === "streaming" || loadingCompetitors || loadingSentiment;

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning]);

  // ---- Stream subscribers (single "research" stream per run) ----

  useEffect(() => {
    if (!productRunId || !productToken) return;
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreamStatus("Connecting...");

    readSSEStream(productRunId, "research", productToken, (data) => {
      try {
        const event = JSON.parse(data) as { type: string } & Record<string, unknown>;
        switch (event.type) {
          case "tool-call": {
            const chunk = event as unknown as ToolCallChunk;
            const label = chunk.args?.url
              ? `Reading ${chunk.args.url}...`
              : chunk.toolName;
            setToolCalls((prev) => [...prev, label]);
            setStreamStatus(label);
            break;
          }
          case "result": {
            controller.abort();
            setProductResult(event as unknown as ProductResult);
            setStatus("success");
            setStreamStatus("Done");
            break;
          }
          case "error": {
            controller.abort();
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
  }, [productRunId, productToken]);

  useEffect(() => {
    if (!competitorsRunId || !competitorsToken) return;
    const controller = new AbortController();
    const done = { current: false };

    readSSEStream(competitorsRunId, "research", competitorsToken, (data) => {
      try {
        const event = JSON.parse(data) as { type: string } & Record<string, unknown>;
        switch (event.type) {
          case "tool-call": {
            const chunk = event as unknown as ToolCallChunk;
            const label = chunk.args?.url
              ? `Reading ${chunk.args.url}...`
              : chunk.toolName;
            setToolCalls((prev) => [...prev, label]);
            setStreamStatus(label);
            break;
          }
          case "result": {
            controller.abort();
            if (done.current) break;
            done.current = true;
            setCompetitors((event as unknown as { competitors: Competitor[] }).competitors);
            setLoadingCompetitors(false);
            setStreamStatus("Competitors done");
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
  }, [competitorsRunId, competitorsToken]);

  useEffect(() => {
    if (!sentimentRunId || !sentimentToken) return;
    const controller = new AbortController();
    const done = { current: false };

    readSSEStream(sentimentRunId, "research", sentimentToken, (data) => {
      try {
        const event = JSON.parse(data) as { type: string } & Record<string, unknown>;
        switch (event.type) {
          case "tool-call": {
            const chunk = event as unknown as ToolCallChunk;
            const label = chunk.args?.url
              ? `Reading ${chunk.args.url}...`
              : chunk.toolName;
            setToolCalls((prev) => [...prev, label]);
            setStreamStatus(label);
            break;
          }
          case "result": {
            controller.abort();
            if (done.current) break;
            done.current = true;
            setFindings((event as unknown as { findings: Finding[] }).findings);
            setLoadingSentiment(false);
            setStreamStatus("Pain points done");
            break;
          }
          case "error": {
            controller.abort();
            setError((event as unknown as { error: string }).error);
            setLoadingSentiment(false);
            break;
          }
        }
      } catch { /* skip */ }
    }, (err) => setStreamError(`Sentiment: ${err}`), controller.signal);

    return () => controller.abort();
  }, [sentimentRunId, sentimentToken]);

  // ---- Handlers ----

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
    setProductResult(null);
    setCompetitors(null);
    setFindings(null);
    setToolCalls([]);
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

      setProductRunId(body.runId);
      setProductToken(body.publicAccessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }, [url]);

  const runCompetitors = useCallback(async () => {
    if (!productResult) return;
    setLoadingCompetitors(true);
    setError(null);
    setCompetitorsRunId(null);
    setCompetitorsToken(null);

    try {
      const res = await fetch("/api/research/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productResult),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      setCompetitorsRunId(body.runId);
      setCompetitorsToken(body.publicAccessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoadingCompetitors(false);
    }
  }, [productResult]);

  const runSentiment = useCallback(async () => {
    if (!productResult) return;
    setLoadingSentiment(true);
    setError(null);
    setSentimentRunId(null);
    setSentimentToken(null);

    try {
      const res = await fetch("/api/research/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productResult),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      setSentimentRunId(body.runId);
      setSentimentToken(body.publicAccessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoadingSentiment(false);
    }
  }, [productResult]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSubmit();
    },
    [handleSubmit],
  );

  const handleCancel = useCallback(() => {
    setProductRunId(null);
    setProductToken(null);
    setCompetitorsRunId(null);
    setCompetitorsToken(null);
    setSentimentRunId(null);
    setSentimentToken(null);
    setStatus("idle");
    setLoadingCompetitors(false);
    setLoadingSentiment(false);
  }, []);

  const handleReset = useCallback(() => {
    setStatus("idle");
    setProductResult(null);
    setCompetitors(null);
    setFindings(null);
    setError(null);
    setToolCalls([]);
    setElapsed(0);
    setProductRunId(null);
    setProductToken(null);
    setCompetitorsRunId(null);
    setCompetitorsToken(null);
    setSentimentRunId(null);
    setSentimentToken(null);
  }, []);

  const elapsedDisplay =
    elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-heading text-sm tracking-tight text-foreground"
          >
            OpenCorp
          </Link>
          <span className="text-xs text-muted-foreground">Dashboard</span>
        </div>
      </header>

      <main className="flex-1 px-6 pb-20 pt-16">
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-auto flex max-w-xl flex-col items-center pt-24"
            >
              <h1 className="font-heading text-2xl tracking-tight text-foreground">
                What are you building?
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Enter a product URL. We&apos;ll research it, then you can drill
                into competitors or user pain points.
              </p>

              <div className="mt-8 w-full">
                <div className="group relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm transition-colors focus-within:border-brand/40">
                  <div className="flex items-center gap-3 px-5 py-4">
                    <Search className="size-5 shrink-0 text-muted-foreground" />
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
              </div>
            </motion.div>
          )}

          {status === "streaming" && (
            <motion.div
              key="streaming"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto flex max-w-xl flex-col items-center pt-24"
            >
              <div className="relative w-full">
                <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-[radial-gradient(ellipse_at_center,oklch(0.72_0.15_75_/_0.06),transparent_70%)]" />
                <div className="relative rounded-2xl border border-brand/30 bg-card/50 backdrop-blur-sm">
                  <motion.div
                    className="absolute inset-0 rounded-2xl border border-brand/40"
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <div className="flex items-center gap-3 px-5 py-4">
                    <Loader2 className="size-5 shrink-0 animate-spin text-brand" />
                    <span className="flex-1 truncate bg-transparent text-sm text-foreground/60">
                      {url}
                    </span>
                    <button
                      onClick={handleCancel}
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      cancel
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Analyzing product</span>
                  <span>{elapsedDisplay}</span>
                </div>

                {streamStatus && (
                  <div className="mt-2 text-xs text-brand/70 font-mono">
                    {streamStatus}
                  </div>
                )}
                {streamError && (
                  <div className="mt-1 text-xs text-red-400 font-mono">
                    {streamError}
                  </div>
                )}

                {toolCalls.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    {toolCalls.map((label, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-muted-foreground"
                      >
                        <Loader2 className="size-3 shrink-0 animate-spin text-brand" />
                        {label}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {status === "error" && !productResult && (
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

          {(status === "success" || (status === "error" && productResult)) && productResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-xl"
            >
              <ProductResultCard result={productResult} />

              {/* Action buttons */}
              <div className="mt-8 flex flex-col items-center gap-3">
                <p className="text-xs text-muted-foreground">
                  Want to dig deeper?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={runCompetitors}
                    disabled={loadingCompetitors || loadingSentiment}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all",
                      competitors
                        ? "border-green-500/30 bg-green-500/5 text-green-400"
                        : loadingCompetitors
                          ? "border-brand/30 bg-brand/5 text-brand"
                          : "border-border/60 bg-card/40 text-foreground/70 hover:border-brand/30 hover:text-foreground",
                    )}
                  >
                    {loadingCompetitors ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : competitors ? (
                      <Check className="size-4" />
                    ) : (
                      <Users className="size-4" />
                    )}
                    {competitors ? "Competitors found" : "Find competitors"}
                  </button>
                  <button
                    onClick={runSentiment}
                    disabled={loadingCompetitors || loadingSentiment}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all",
                      findings
                        ? "border-green-500/30 bg-green-500/5 text-green-400"
                        : loadingSentiment
                          ? "border-brand/30 bg-brand/5 text-brand"
                          : "border-border/60 bg-card/40 text-foreground/70 hover:border-brand/30 hover:text-foreground",
                    )}
                  >
                    {loadingSentiment ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : findings ? (
                      <Check className="size-4" />
                    ) : (
                      <MessageSquare className="size-4" />
                    )}
                    {findings ? "Pain points found" : "Find user pain points"}
                  </button>
                </div>
              </div>

              {/* Loading for sub-research */}
              {(loadingCompetitors || loadingSentiment) && (
                <div className="mt-4 space-y-1.5">
                  {toolCalls.slice(productResult ? -10 : 0).map((label, i) => (
                    <motion.div
                      key={`sub-${i}`}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      <Loader2 className="size-3 shrink-0 animate-spin text-brand" />
                      {label}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Competitors result */}
              {competitors && competitors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 space-y-4"
                >
                  <h3 className="font-heading text-sm tracking-tight text-foreground">
                    Competitors
                  </h3>
                  <div className="space-y-3">
                    {competitors.map((c, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3"
                      >
                        <div>
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-brand transition-colors"
                          >
                            {c.name}
                            <ExternalLink className="size-3" />
                          </a>
                          <p className="mt-1 text-xs text-foreground/65">
                            {c.description}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Field label="Features" value={c.featureSet} />
                          <Field label="Pricing" value={c.pricingModel} />
                          <Field label="Audience" value={c.targetAudience} />
                          <Field label="Strengths" value={c.strengths} />
                        </div>
                        {c.weaknesses && (
                          <div className="rounded-lg border border-red-500/10 bg-red-500/5 px-3 py-2">
                            <span className="text-[10px] uppercase text-red-400/70">
                              Weakness
                            </span>
                            <p className="mt-0.5 text-xs text-red-300/80">
                              {c.weaknesses}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Findings result */}
              {findings && findings.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 space-y-4"
                >
                  <h3 className="font-heading text-sm tracking-tight text-foreground">
                    User Pain Points
                  </h3>
                  <div className="space-y-3">
                    {findings.map((f, i) => {
                      const sev = mapSeverity(f.severity);
                      return (
                        <div
                          key={i}
                          className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm text-foreground/85 font-medium">
                              {f.painPoint}
                            </p>
                            <span
                              className={cn(
                                "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase",
                                severityColors[sev],
                              )}
                            >
                              {f.severity}
                            </span>
                          </div>
                          {f.verbatimQuote && (
                            <blockquote className="border-l-2 border-brand/30 pl-3 text-xs text-foreground/55 italic">
                              &ldquo;{f.verbatimQuote}&rdquo;
                              {f.quoteSource && (
                                <span className="ml-1.5 text-[10px] not-italic text-muted-foreground">
                                  — {f.quoteSource}
                                </span>
                              )}
                            </blockquote>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="User Role" value={f.userRole} />
                            <Field label="Company Type" value={f.companyType} />
                            <Field label="Tool Stack" value={f.toolStack} />
                            <Field label="Frequency" value={f.frequency} />
                          </div>
                          {f.wishlist && (
                            <div className="rounded-lg border border-brand/10 bg-brand/5 px-3 py-2">
                              <span className="text-[10px] uppercase text-brand/70">
                                Wishlist
                              </span>
                              <p className="mt-0.5 text-xs text-foreground/70">
                                {f.wishlist}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Error during sub-research */}
              {error && status === "success" && (
                <div className="mt-6 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  {error}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
