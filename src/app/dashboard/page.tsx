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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Severity = "high" | "medium" | "low";

interface Competitor {
  name: string;
  url: string;
  mentions: number;
  notes: string;
}

interface PainPoint {
  description: string;
  source: string;
  frequency: string;
  severity: string;
}

interface Opportunity {
  description: string;
  channel: string;
  url: string;
  action: string;
}

interface Discovery {
  competitors: Competitor[];
  painPoints: PainPoint[];
  opportunities: Opportunity[];
  discussionThemes: string[];
  searchQueriesUsed: string[];
}

interface ResearchResult {
  url: string;
  researchSummary: string;
  discovery: Discovery | null;
}

interface StepState {
  id: string;
  label: string;
  status: "pending" | "running" | "done";
}

interface ToolCallState {
  id: string;
  toolName: string;
  label: string;
  status: "running" | "done";
  resultLabel?: string;
}

const stepLabels: Record<string, string> = {
  "research-product": "Analyzing product website",
  "discover-competitors": "Hunting competitors",
  "discover-sentiment": "Mining user pain points",
  "synthesize-results": "Compiling dossier",
};

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

function parseSSEStream(body: ReadableStream<Uint8Array> | null) {
  if (!body) return null;
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (value) buffer += decoder.decode(value, { stream: !done });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          if (!part.trim()) continue;
          let eventType = "message";
          let data = "";

          for (const line of part.split("\n")) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7);
            } else if (line.startsWith("data: ")) {
              data = line.slice(6);
            }
          }

          if (data) {
            try {
              const parsed = JSON.parse(data);
              controller.enqueue({ event: eventType, data: parsed });
            } catch {
              // skip unparseable events
            }
          }
        }

        if (done) {
          controller.close();
          return;
        }
      }
    },
  });
}

function StatCard({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4",
        color === "purple" && "border-purple-500/20",
        color === "brand" && "border-brand/20",
        color === "green" && "border-green-500/20",
      )}
    >
      <span
        className={cn(
          "font-heading text-xs tracking-widest uppercase",
          color === "purple" && "text-purple-400",
          color === "brand" && "text-brand",
          color === "green" && "text-green-400",
        )}
      >
        {label}
      </span>
      <span className="mt-1 block font-mono text-3xl tabular-nums text-foreground">
        {count}
      </span>
    </div>
  );
}

function Dossier({ result }: { result: ResearchResult }) {
  const { discovery } = result;
  const competitors = discovery?.competitors ?? [];
  const painPoints = discovery?.painPoints ?? [];
  const opportunities = discovery?.opportunities ?? [];
  const queries = discovery?.searchQueriesUsed ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-4xl space-y-8"
    >
      <div className="flex items-center gap-2">
        <span className="font-heading text-lg tracking-tight text-foreground">
          DOSSIER
        </span>
        <span className="font-mono text-sm text-muted-foreground">
          {result.url}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Competitors" count={competitors.length} color="purple" />
        <StatCard label="Pain Points" count={painPoints.length} color="brand" />
        <StatCard
          label="Opportunities"
          count={opportunities.length}
          color="green"
        />
      </div>

      <section className="rounded-xl border bg-card p-6">
        <h3 className="font-heading text-xs tracking-widest uppercase text-muted-foreground">
          Summary
        </h3>
        <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
          {result.researchSummary}
        </div>
      </section>

      {competitors.length > 0 && (
        <section className="rounded-xl border bg-card p-6">
          <h3 className="font-heading text-xs tracking-widest uppercase text-purple-400">
            Competitors
          </h3>
          <div className="mt-4 space-y-3">
            {competitors.map((c) => (
              <div
                key={c.name}
                className="flex items-start gap-4 rounded-lg border border-border/50 p-3"
              >
                <span className="mt-0.5 font-mono text-xs tabular-nums text-purple-400/70">
                  {c.mentions}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {c.name}
                    </span>
                    {c.url && (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                  {c.notes && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {painPoints.length > 0 && (
        <section className="rounded-xl border bg-card p-6">
          <h3 className="font-heading text-xs tracking-widest uppercase text-brand">
            Pain Points
          </h3>
          <div className="mt-4 space-y-2">
            {painPoints.map((p, i) => {
              const sev = mapSeverity(p.severity);
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-border/50 p-3"
                >
                  <span
                    className={cn(
                      "shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase",
                      severityColors[sev],
                    )}
                  >
                    {sev}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground/85">
                      {p.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{p.source}</span>
                      {p.frequency && (
                        <>
                          <span className="text-border">|</span>
                          <span>{p.frequency}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {opportunities.length > 0 && (
        <section className="rounded-xl border bg-card p-6">
          <h3 className="font-heading text-xs tracking-widest uppercase text-green-400">
            Opportunities
          </h3>
          <div className="mt-4 space-y-3">
            {opportunities.map((o, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/50 border-l-[oklch(0.62_0.15_150)] p-3"
              >
                <p className="text-sm text-foreground/85">{o.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                    {o.channel}
                  </span>
                  {o.url && (
                    <a
                      href={o.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand transition-colors hover:text-brand/80"
                    >
                      {o.url.replace(/^https?:\/\//, "").slice(0, 40)}
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                  {o.action && (
                    <span className="text-muted-foreground/70">
                      &rarr; {o.action}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {queries.length > 0 && (
        <section className="rounded-xl border bg-card p-6">
          <h3 className="font-heading text-xs tracking-widest uppercase text-muted-foreground">
            Queries Used
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {queries.map((q) => (
              <span
                key={q}
                className="rounded-md border border-border/50 bg-muted/30 px-2.5 py-1 font-mono text-xs text-muted-foreground"
              >
                {q}
              </span>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}

export default function DashboardPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<StepState[]>([]);
  const [toolCalls, setToolCalls] = useState<ToolCallState[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status === "streaming") {
      timerRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
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
  }, [status]);

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
    setResult(null);
    setSteps([]);
    setToolCalls([]);
    setElapsed(0);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/workflows/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      const eventStream = parseSSEStream(res.body);
      if (!eventStream) throw new Error("No response stream");

      const reader = eventStream.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const { event, data } = value as { event: string; data: unknown };

        switch (event) {
          case "connected": {
            setSteps([{
              id: "_connected",
              label: "Connected to research engine",
              status: "done",
            }]);
            break;
          }

          case "workflow-step-start": {
            const d = data as { payload: { id: string; stepName: string } };
            const stepId = d.payload?.id ?? "unknown";
            const stepLabel = stepLabels[stepId] ?? d.payload?.stepName ?? stepId;
            setSteps((prev) => {
              const filtered = prev.filter((s) => s.id !== "_connected");
              const exists = filtered.find((s) => s.id === stepId);
              if (exists) {
                return filtered.map((s) =>
                  s.id === stepId ? { ...s, status: "running" as const } : s,
                );
              }
              return [
                ...filtered,
                { id: stepId, label: stepLabel, status: "running" as const },
              ];
            });
            break;
          }

          case "workflow-step-finish": {
            const d = data as { payload: { id: string } };
            const stepId = d.payload?.id ?? "unknown";
            setSteps((prev) =>
              prev.map((s) =>
                s.id === stepId ? { ...s, status: "done" as const } : s,
              ),
            );
            break;
          }

          case "workflow-step-result": {
            const d = data as {
              payload: {
                id: string;
                stepName: string;
                status: string;
              };
            };
            const stepId = d.payload?.id ?? "unknown";
            const stepLabel = stepLabels[stepId] ?? d.payload?.stepName ?? stepId;
            setSteps((prev) => {
              const filtered = prev.filter((s) => s.id !== "_connected");
              const exists = filtered.find((s) => s.id === stepId);
              if (exists) {
                return filtered.map((s) =>
                  s.id === stepId
                    ? { ...s, status: "done" as const, label: stepLabel }
                    : s,
                );
              }
              return [
                ...filtered,
                { id: stepId, label: stepLabel, status: "done" as const },
              ];
            });
            break;
          }

          case "result": {
            setResult(data as ResearchResult);
            setStatus("success");
            break;
          }

          case "tool-call-input-streaming-start":
          case "tool-call": {
            const d = data as {
              payload: {
                toolCallId: string;
                toolName: string;
                args?: Record<string, unknown>;
              };
            };
            const p = d.payload;
            let label: string;
            if (p.toolName === "fetchPageTool" && p.args?.url) {
              const u = String(p.args.url).replace(/^https?:\/\//, "");
              label = `Fetching ${u.slice(0, 50)}`;
            } else if (p.toolName === "searchHNTool" && p.args?.query) {
              label = `Searching HN: "${String(p.args.query).slice(0, 40)}"`;
            } else if (p.toolName === "searchWebTool" && p.args?.query) {
              label = `Searching web: "${String(p.args.query).slice(0, 40)}"`;
            } else {
              label = p.toolName === "fetchPageTool"
                ? "Fetching page"
                : p.toolName === "searchHNTool"
                  ? "Searching HN"
                  : p.toolName === "searchWebTool"
                    ? "Searching web"
                    : p.toolName;
            }
            setToolCalls((prev) => {
              const exists = prev.find((t) => t.id === p.toolCallId);
              if (exists) {
                return prev.map((t) =>
                  t.id === p.toolCallId ? { ...t, label } : t,
                );
              }
              return [
                ...prev,
                {
                  id: p.toolCallId,
                  toolName: p.toolName,
                  label,
                  status: "running",
                },
              ];
            });
            break;
          }

          case "tool-result": {
            const d = data as {
              payload: {
                toolCallId: string;
                toolName: string;
                result?: unknown;
              };
            };
            const p = d.payload;
            let resultLabel: string | undefined;
            if (p.result != null) {
              if (typeof p.result === "string") {
                resultLabel = p.result.slice(0, 80);
              } else if (typeof p.result === "object" && p.result !== null) {
                const obj = p.result as Record<string, unknown>;
                if (typeof obj.totalHits === "number") {
                  resultLabel = `${obj.totalHits} results`;
                } else if (typeof obj.resultCount === "number") {
                  resultLabel = `${obj.resultCount} results`;
                } else if (typeof obj.title === "string") {
                  const size =
                    typeof obj.contentLength === "number"
                      ? ` (${obj.contentLength}B)`
                      : "";
                  resultLabel = `${obj.title}${size}`;
                } else {
                  resultLabel = "Done";
                }
              } else {
                resultLabel = "Done";
              }
            }
            setToolCalls((prev) =>
              prev.map((t) =>
                t.id === p.toolCallId
                  ? { ...t, status: "done" as const, resultLabel }
                  : t,
              ),
            );
            break;
          }

          case "error": {
            const d = data as { error: string };
            setError(d.error ?? "Research failed");
            setStatus("error");
            break;
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }, [url]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSubmit();
    },
    [handleSubmit],
  );

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
  }, []);

  const handleReset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setSteps([]);
    setToolCalls([]);
  }, []);

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
                Enter your product URL. OpenCorp researches it, finds
                competitors, user pain points, and distribution opportunities.
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
              </div>

              <div className="mt-8 w-full space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-muted-foreground/60">
                    {steps.length === 0 ? "connecting" : steps.some((s) => s.status === "running") ? "active" : "done"}
                  </span>
                </div>
                {steps.map((step, i) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/40 px-4 py-3"
                  >
                    {step.status === "running" ? (
                      <Loader2 className="size-4 shrink-0 animate-spin text-brand" />
                    ) : step.status === "done" ? (
                      <Check className="size-4 shrink-0 text-green-400" />
                    ) : (
                      <div className="size-4 shrink-0 rounded-full border border-border" />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        step.status === "done"
                          ? "text-muted-foreground"
                          : "text-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                  </motion.div>
                ))}
                {steps.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-2 py-2"
                  >
                    <span className="size-1.5 rounded-full bg-muted-foreground/30" />
                    <span className="text-sm text-muted-foreground">
                      Waiting for workflow to start
                    </span>
                  </motion.div>
                )}
              </div>

              {toolCalls.length > 0 && (
                <div className="mt-6 w-full space-y-1.5">
                  <span className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground/60">
                    Activity
                  </span>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {toolCalls.map((tc) => (
                      <motion.div
                        key={tc.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-2 rounded-md px-3 py-1.5"
                      >
                        {tc.status === "running" ? (
                          <Loader2 className="mt-0.5 size-3 shrink-0 animate-spin text-brand" />
                        ) : (
                          <Check className="mt-0.5 size-3 shrink-0 text-green-400" />
                        )}
                        <div className="min-w-0">
                          <span
                            className={cn(
                              "text-xs",
                              tc.status === "done"
                                ? "text-muted-foreground"
                                : "text-foreground/80",
                            )}
                          >
                            {tc.label}
                          </span>
                          {tc.resultLabel && (
                            <span className="ml-2 text-[10px] text-muted-foreground/60">
                              {tc.resultLabel}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {status === "success" && result && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="mx-auto max-w-xl">
                <div className="rounded-xl border border-border/40 bg-card/30 px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Search className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate font-mono text-xs text-foreground/70">
                      {result.url}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="h-7 px-2 text-xs"
                    >
                      New
                    </Button>
                  </div>
                </div>
              </div>

              <Dossier result={result} />
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto flex max-w-xl flex-col items-center pt-24"
            >
              <div className="flex size-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/5">
                <AlertTriangle className="size-5 text-red-400" />
              </div>
              <h2 className="mt-4 font-heading text-lg tracking-tight text-foreground">
                Research Failed
              </h2>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {error ?? "An unexpected error occurred. Please try again."}
              </p>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={handleReset}>
                  Try Again
                </Button>
                <Button onClick={handleSubmit}>Retry</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
