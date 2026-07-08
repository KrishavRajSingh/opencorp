"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ExternalLink,
  Link2,
  Share2,
  Check,
} from "lucide-react";
import { ProductFavicon } from "@/components/dashboard/product-favicon";
import { DinoLoader } from "@/components/dashboard/dino-loader";
import { HNIcon } from "@/components/dashboard/hn-icon";
import { RedditIcon } from "@/components/dashboard/reddit-icon";
import { GtmBriefView, type GtmBrief } from "@/components/ai-elements/gtm-brief";
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

type RedditScanResult = GtmBrief;

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

function ProductHeader({
  result,
  competitors,
  loadingCompetitors,
  onReFindCompetitors,
}: {
  result: ProductResult;
  competitors: CompetitorResult | null;
  loadingCompetitors: boolean;
  onReFindCompetitors: () => void;
}) {
  return (
    <div className="space-y-5">
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

      <div className="border-t border-dashed border-border/40 pt-4">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground/60">
            Alternatives on the market
          </span>
          {!loadingCompetitors && competitors && competitors.competitors.length > 0 && (
            <button
              type="button"
              onClick={onReFindCompetitors}
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-brand"
            >
              re-run
            </button>
          )}
        </div>
        {loadingCompetitors ? (
          <DinoLoader
            instanceKey="competitors-header"
            label="Finding alternatives..."
            loading={loadingCompetitors}
            sublabel="Searching the web for products that overlap with this one. Usually 3–5 minutes."
            tone="brand"
          />
        ) : competitors && competitors.competitors.length > 0 ? (
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {competitors.competitors.slice(0, 10).map((c, i) => (
              <a
                key={i}
                href={c.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group/alt flex items-center gap-2 rounded-md border border-border/40 bg-card/30 px-2.5 py-1.5 transition-all hover:border-brand/40 hover:bg-card/60"
              >
                <ProductFavicon
                  url={c.url}
                  size={14}
                  rounded="sm"
                  className="ring-1 ring-border/30"
                />
                <span className="min-w-0 flex-1 truncate text-xs text-foreground/85 group-hover/alt:text-foreground">
                  {c.name}
                </span>
                <ExternalLink className="size-2.5 shrink-0 text-muted-foreground/30 group-hover/alt:text-brand/60" />
              </a>
            ))}
            {competitors.competitors.length > 10 && (
              <div className="col-span-full px-2.5 font-mono text-[10px] text-muted-foreground/60">
                +{competitors.competitors.length - 10} more
              </div>
            )}
          </div>
        ) : (
          <p className="px-1 font-mono text-[11px] text-muted-foreground/50">
            Click <span className="text-foreground/70">Find alternatives</span> in the panel to the right
          </p>
        )}
      </div>
    </div>
  );
}

const SUB_PRESETS = [
  "SaaS, startups, sideproject, indiehackers, bootstrapmarked",
  "Entrepreneur, smallbusiness, sysorai, growmybusiness",
  "microsaas, nocode, webdev, ProductManagement",
];

function SubsSearchInput({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const text = value.join(", ");
  return (
    <div className="space-y-1.5 rounded-md border border-[#FF4500]/20 bg-[#FF4500]/5 p-2">
      <label className="block font-mono text-[10px] uppercase tracking-widest text-[#FF4500]/80">
        Target subreddits
      </label>
      <textarea
        value={text}
        disabled={disabled}
        placeholder="SaaS, startups, sideproject, indiehackers"
        onChange={(e) => {
          const next = e.target.value
            .split(/[\s,]+/)
            .map((s) => s.replace(/^r\//, "").trim())
            .filter((s) => s.length > 0 && /^[A-Za-z0-9_]+$/.test(s));
          onChange([...new Set(next)].slice(0, 15));
        }}
        rows={2}
        className="w-full resize-none rounded border border-border/40 bg-background/60 px-2 py-1 font-mono text-[11px] text-foreground/85 placeholder:text-muted-foreground/40 focus:border-[#FF4500]/60 focus:outline-none disabled:opacity-50"
      />
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/50">
          presets:
        </span>
        {SUB_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={disabled}
            onClick={() =>
              onChange(preset.split(",").map((s) => s.trim()).filter(Boolean))
            }
            className="rounded border border-border/40 bg-card/40 px-1.5 py-0.5 font-mono text-[10px] text-foreground/70 transition-colors hover:border-[#FF4500]/40 hover:text-foreground disabled:opacity-50"
          >
            {preset.split(",").length} subs
          </button>
        ))}
        {value.length > 0 && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange([])}
            className="ml-auto rounded px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/60 transition-colors hover:text-foreground disabled:opacity-50"
          >
            clear
          </button>
        )}
      </div>
      <p className="text-[10px] leading-snug text-muted-foreground/60">
        Empty = LLM picks subs from product context. Pinned subs override and force
        a cross-sub search via <code className="font-mono">/search?sr=A+B+...</code>.
      </p>
    </div>
  );
}

type ConsoleProps = {
  status: "idle" | "competitors" | "reddit" | "hn";
  hasCompetitors: boolean;
  hasReddit: boolean;
  hasHN: boolean;
  redditCount: number;
  hnCount: number;
  url: string;
  onFindReddit: () => void;
  onFindHN: () => void;
  onCancel: () => void;
  streamStatus: string | null;
  elapsedDisplay: string;
  error: string | null;
  redditScan: RedditScanResult | null;
  hnResult: HNResult | null;
  loadingReddit: boolean;
  loadingHN: boolean;
  activeResult: "reddit" | "hn";
  onSwitchResult: (tab: "reddit" | "hn") => void;
  subsSearch: string[];
  subsSearchOpen: boolean;
  onToggleSubsSearch: () => void;
  onChangeSubsSearch: (next: string[]) => void;
  readOnly?: boolean;
  isAuthed: boolean;
  signupHref: string;
};

function Console({
  status,
  hasCompetitors,
  hasReddit,
  hasHN,
  redditCount,
  hnCount,
  url,
  onFindReddit,
  onFindHN,
  onCancel,
  streamStatus,
  elapsedDisplay,
  error,
  redditScan,
  hnResult,
  loadingReddit,
  loadingHN,
  activeResult,
  onSwitchResult,
  subsSearch,
  subsSearchOpen,
  onToggleSubsSearch,
  onChangeSubsSearch,
  readOnly = false,
  isAuthed,
  signupHref,
}: ConsoleProps) {
  const domain = (() => {
    try {
      return new URL(url).host.replace(/^www\./, "");
    } catch {
      return url;
    }
  })();

  const busy = status !== "idle";
  const showRedditBtn = hasCompetitors && !hasReddit;
  const showHNBtn = hasReddit && !hasHN;
  const allDone = hasCompetitors && hasReddit && hasHN && !busy;

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
      label: "FINDING ALTERNATIVES",
      tone: "text-brand",
    },
    reddit: {
      dot: "bg-[#FF4500]",
      label: "SCANNING REDDIT",
      tone: "text-[#FF4500]",
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

      {!readOnly && (showRedditBtn || showHNBtn) && (
        <div className="space-y-2 border-b border-border/30 px-4 py-3">
          {showRedditBtn && (
            <>
              <button
                onClick={onFindReddit}
                disabled={busy}
                className={cn(
                  "group/btn flex w-full items-center justify-between gap-3 rounded-xl border bg-card/60 px-4 py-2.5 text-left text-sm transition-all",
                  busy
                    ? "cursor-not-allowed border-border/40 text-muted-foreground/50"
                    : "border-[#FF4500]/30 text-foreground hover:border-[#FF4500]/60 hover:bg-[#FF4500]/10 hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <RedditIcon className="size-5" />
                  <span className="font-medium">Find Reddit users</span>
                  {subsSearch.length > 0 && (
                    <span className="rounded-sm border border-[#FF4500]/40 px-1 font-mono text-[9px] uppercase tracking-wider text-[#FF4500]/80">
                      {subsSearch.length} subs pinned
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#FF4500]/70 group-hover/btn:text-[#FF4500]">
                    Stage 2
                  </span>
                  <ArrowRight className="size-3.5 text-[#FF4500]/50 transition-all group-hover/btn:translate-x-0.5 group-hover/btn:text-[#FF4500]" />
                </div>
              </button>

              <button
                type="button"
                onClick={onToggleSubsSearch}
                disabled={busy}
                className="flex w-full items-center justify-between gap-2 rounded-md px-1.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 transition-colors hover:text-foreground/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>
                  {subsSearch.length > 0
                    ? `${subsSearch.length} pinned · edit`
                    : "pin specific subreddits (optional)"}
                </span>
                <ChevronDown
                  className={cn(
                    "size-3 transition-transform",
                    subsSearchOpen && "rotate-180",
                  )}
                />
              </button>

              {subsSearchOpen && (
                <SubsSearchInput
                  value={subsSearch}
                  onChange={onChangeSubsSearch}
                  disabled={busy || !!redditScan}
                />
              )}
            </>
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
                  Stage 3
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
            onClick={() => onSwitchResult("reddit")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-all",
              activeResult === "reddit"
                ? "bg-[#FF4500]/10 text-foreground"
                : "text-muted-foreground/70 hover:text-foreground/80",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                activeResult === "reddit" ? "bg-[#FF4500]" : "bg-[#FF4500]/40",
              )}
            />
            <span>Reddit</span>
            {redditCount > 0 && (
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
                {redditCount}
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

        {activeResult === "reddit" ? (
          <div className="border-t border-border/30 px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground/60">
                Stage 2 · Reddit market scan
              </span>
              {redditCount > 0 && (
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
                  {redditCount}
                </span>
              )}
            </div>
            {redditScan && (redditScan.top_threads?.length ?? 0) > 0 ? (
              <GtmBriefView
                brief={redditScan}
                isAuthed={isAuthed}
                signupHref={signupHref}
              />
            ) : loadingReddit ? (
              <DinoLoader
                instanceKey="reddit"
                label="Scanning Reddit for your market..."
                loading={loadingReddit}
                sublabel="This usually takes 20-40 seconds. We're running 3-5 sharp search terms against the target subs and curating the best threads."
                tone="brand"
              />
            ) : (
              <div className="space-y-3 py-2">
                <p className="text-xs text-muted-foreground/60">
                  Click <span className="text-foreground/70">Find Reddit users</span> above to scan the subreddits where your future users are talking.
                </p>
                <div className="rounded-md border border-dashed border-border/40 bg-card/20 p-3 text-[11px] text-muted-foreground/60">
                  <p className="font-medium text-foreground/75">What this finds</p>
                  <p className="mt-1">Top threads ranked by signal, with pinned customer quotes. Click any thread to open it on Reddit and DM the author.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border-t border-border/30 px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground/60">
                Stage 3 · Hacker News
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
                sublabel="This usually takes 1–2 minutes. We're searching Hacker News for threads where your future users are already talking — hang tight."
                tone="orange"
              />
            ) : (
              <p className="py-2 text-xs text-muted-foreground/50">
                Click <span className="text-foreground/70">Find HN threads</span> above
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
  redditScan: initialRedditScan = null,
  readOnly = false,
  isAuthed = !readOnly,
  signupHref = "/auth/sign-up",
}: {
  sessionId: string;
  product: ProductResult;
  competitors: CompetitorResult | null;
  hnResult: HNResult | null;
  redditScan?: RedditScanResult | null;
  readOnly?: boolean;
  isAuthed?: boolean;
  signupHref?: string;
}) {
  const router = useRouter();
  const [competitors, setCompetitors] = useState<CompetitorResult | null>(
    initialCompetitors,
  );
  const [hnResult, setHNResult] = useState<HNResult | null>(initialHNResult);
  const [redditScan, setRedditScan] = useState<RedditScanResult | null>(
    initialRedditScan,
  );
  const [loadingCompetitors, setLoadingCompetitors] = useState(false);
  const [loadingHN, setLoadingHN] = useState(false);
  const [loadingReddit, setLoadingReddit] = useState(false);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hnStreamStatus, setHNStreamStatus] = useState<string | null>(null);
  const [hnElapsed, setHNElapsed] = useState(0);
  const [hnError, setHNError] = useState<string | null>(null);
  const [redditStreamStatus, setRedditStreamStatus] = useState<string | null>(null);
  const [redditElapsed, setRedditElapsed] = useState(0);
  const [redditError, setRedditError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const redditTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [runId, setRunId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hnRunId, setHNRunId] = useState<string | null>(null);
  const [hnToken, setHNToken] = useState<string | null>(null);
  const [redditRunId, setRedditRunId] = useState<string | null>(null);
  const [redditToken, setRedditToken] = useState<string | null>(null);

  const [activeResult, setActiveResult] = useState<"reddit" | "hn">(
    "reddit",
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
    if (loadingReddit) {
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
  }, [loadingReddit]);

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

  // Auto-fire competitor scan on mount if missing
  const autoFiredRef = useRef(false);
  useEffect(() => {
    if (readOnly) return;
    if (autoFiredRef.current) return;
    if (initialCompetitors) return;
    if (loadingCompetitors || runId) return;
    autoFiredRef.current = true;
    const t = setTimeout(() => {
      void runCompetitors();
    }, 0);
    return () => clearTimeout(t);
  }, [readOnly, initialCompetitors, loadingCompetitors, runId, runCompetitors]);

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

  // Reddit SSE reader
  useEffect(() => {
    if (!redditRunId || !redditToken) return;
    const controller = new AbortController();
    const done = { current: false };

    readSSEStream(redditRunId, "research", redditToken, (data) => {
      try {
        const event = JSON.parse(data) as { type: string } & Record<string, unknown>;
        switch (event.type) {
          case "tool-call": {
            const chunk = event as unknown as ToolCallChunk & { track?: string };
            if (chunk.track === "reddit") {
              setRedditStreamStatus(chunk.snippet ?? "Scanning Reddit...");
            }
            break;
          }
          case "result": {
            controller.abort();
            if (done.current) break;
            done.current = true;
            const r = event as unknown as RedditScanResult;
            setRedditScan(r);
            setLoadingReddit(false);
            setRedditStreamStatus("Saved");
            fetch("/api/research/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: sessionId,
                reddit_scan_result: r,
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
            setRedditError((event as unknown as { error: string }).error);
            setLoadingReddit(false);
            break;
          }
        }
      } catch { /* skip */ }
    }, (err) => setStreamError(`Reddit: ${err}`), controller.signal);

    return () => controller.abort();
  }, [redditRunId, redditToken, sessionId, router]);

  const runReddit = useCallback(async () => {
    setLoadingReddit(true);
    setRedditError(null);
    setRedditRunId(null);
    setRedditToken(null);
    setRedditStreamStatus(null);

    try {
      const res = await fetch("/api/research/reddit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: product.url,
          productName: product.productName,
          description: product.description,
          keyFeatures: product.keyFeatures,
          targetAudience: product.targetAudience,
          pricingModel: product.pricingModel,
          subsSearch: subsSearch.length > 0 ? subsSearch : undefined,
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

      setRedditRunId(body.runId);
      setRedditToken(body.publicAccessToken);
    } catch (err) {
      setRedditError(err instanceof Error ? err.message : "Something went wrong");
      setLoadingReddit(false);
    }
  }, [product, subsSearch, competitors]);

  const cancelReddit = useCallback(() => {
    setRedditRunId(null);
    setRedditToken(null);
    setLoadingReddit(false);
  }, []);

  const status: "idle" | "competitors" | "reddit" | "hn" = loadingCompetitors
    ? "competitors"
    : loadingReddit
      ? "reddit"
      : loadingHN
        ? "hn"
        : "idle";
  const activeStreamStatus = loadingCompetitors
    ? streamStatus
    : loadingReddit
      ? redditStreamStatus
      : loadingHN
        ? hnStreamStatus
        : null;
  const activeElapsed = loadingCompetitors
    ? elapsed
    : loadingReddit
      ? redditElapsed
      : loadingHN
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
    if (loadingCompetitors) cancelCompetitors();
    else if (loadingReddit) cancelReddit();
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
          <ProductHeader
            result={product}
            competitors={competitors}
            loadingCompetitors={loadingCompetitors}
            onReFindCompetitors={runCompetitors}
          />
        </div>

        <div className="lg:sticky lg:top-10 lg:h-[calc(100vh-5rem)]">
          <Console
            status={status}
            hasCompetitors={!!competitors}
            hasReddit={!!redditScan}
            hasHN={!!hnResult}
            redditCount={redditScan?.top_threads?.length ?? 0}
            hnCount={hnResult?.threads.length ?? 0}
            url={product.url}
            onFindReddit={runReddit}
            onFindHN={runHN}
            onCancel={cancelCurrent}
            streamStatus={activeStreamStatus}
            elapsedDisplay={elapsedDisplay}
            error={error || hnError || redditError || streamError}
            redditScan={redditScan}
            hnResult={hnResult}
            loadingReddit={loadingReddit}
            loadingHN={loadingHN}
            activeResult={activeResult}
            onSwitchResult={handleTabSwitch}
            subsSearch={subsSearch}
            subsSearchOpen={subsSearchOpen}
            onToggleSubsSearch={() => setSubsSearchOpen((p) => !p)}
            onChangeSubsSearch={setSubsSearch}
            readOnly={readOnly}
            isAuthed={isAuthed}
            signupHref={signupHref}
          />
        </div>
      </div>
    </div>
  );
}
