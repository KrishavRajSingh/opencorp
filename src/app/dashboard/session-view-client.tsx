"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ExternalLink,
  Link2,
  Share2,
  Check,
  Radar,
} from "lucide-react";
import { ProductFavicon } from "@/components/dashboard/product-favicon";
import { DinoLoader } from "@/components/dashboard/dino-loader";
import { HNIcon } from "@/components/dashboard/hn-icon";
import { RedditIcon } from "@/components/dashboard/reddit-icon";
import { Card, CardContent } from "@/components/ui/card";
import { GtmBriefView, type GtmBrief } from "@/components/ai-elements/gtm-brief";
import {
  ANON_PREVIEW_COUNT,
  LockedThreadRow,
  SignupUnlockBar,
} from "@/components/dashboard/thread-gate";
import type { HNThread } from "@/app/dashboard/hn-threads-block";
import { cn } from "@/lib/utils";
import {
  createCompetitorStage,
  readSSEStream as readSseUrl,
  shouldStartCompetitorLoading,
  writeCompetitorStageMarker,
  readCompetitorStageMarker,
  type CompetitorResult as StageCompetitorResult,
  type StreamEvent,
} from "@/lib/competitor-stage";

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
  onEnd?: () => void,
) {
  const url = `https://api.trigger.dev/realtime/v1/streams/${runId}/${streamKey}`;
  readSseUrl(url, accessToken, onData, onError, signal, onEnd);
}

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

/** Idle / aborted / empty alternatives panel — simple card, plain language. */
function AlternativesStageCard({
  tone,
  eyebrow,
  title,
  body,
  actionLabel,
  onAction,
  readOnly,
}: {
  tone: "idle" | "aborted" | "empty";
  eyebrow: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  readOnly?: boolean;
}) {
  const isAborted = tone === "aborted";
  const isEmpty = tone === "empty";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border",
        isAborted
          ? "border-red-400/25 bg-red-400/[0.04]"
          : isEmpty
            ? "border-border/50 bg-card/25"
            : "border-brand/25 bg-brand/[0.04]",
      )}
    >
      <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <div
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-full border bg-card/80",
            isAborted
              ? "border-red-400/40 text-red-400/90"
              : "border-brand/40 text-brand",
          )}
        >
          {isAborted ? (
            <AlertTriangle className="size-4" strokeWidth={1.75} />
          ) : (
            <Radar className="size-4" strokeWidth={1.75} />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.2em]",
              isAborted ? "text-red-400/80" : "text-brand/75",
            )}
          >
            {eyebrow}
          </span>
          <p className="font-heading text-base tracking-tight text-foreground/90 sm:text-[17px]">
            {title}
          </p>
          <p className="max-w-md text-[12px] leading-relaxed text-muted-foreground/70">
            {body}
          </p>
        </div>

        {!readOnly && actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className={cn(
              "group/alt-cta inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-left transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isAborted
                ? "border-red-400/35 bg-red-400/10 text-foreground hover:border-red-400/55 hover:bg-red-400/15"
                : "border-brand/40 bg-brand/10 text-foreground hover:border-brand/60 hover:bg-brand/15",
            )}
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.16em]">
              {actionLabel}
            </span>
            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover/alt-cta:translate-x-0.5 group-hover/alt-cta:text-foreground/80" />
          </button>
        )}
      </div>
    </div>
  );
}

function ProductHeader({
  result,
  competitors,
  competitorsPending,
  competitorsError,
  onReFindCompetitors,
  readOnly = false,
}: {
  result: ProductResult;
  competitors: CompetitorResult | null;
  /** True while backend stage is running or we are waiting for it. */
  competitorsPending: boolean;
  /** Cancel / fail message from stage machine (null = clean idle). */
  competitorsError: string | null;
  onReFindCompetitors: () => void;
  readOnly?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const alts = competitors?.competitors ?? [];
  const aborted =
    !!competitorsError &&
    /cancel|abort|stopped|fail/i.test(competitorsError);

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
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground/60">
              Alternatives on the market
            </span>
            {alts.length > 0 && (
              <span className="font-mono text-[10px] tabular-nums text-brand/70">
                {String(alts.length).padStart(2, "0")}
              </span>
            )}
          </div>
          {!readOnly && alts.length > 0 && (
            <button
              type="button"
              onClick={onReFindCompetitors}
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-brand"
            >
              re-run
            </button>
          )}
          {!readOnly && competitorsPending && (
            <button
              type="button"
              onClick={onReFindCompetitors}
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-brand"
            >
              restart
            </button>
          )}
        </div>

        {competitorsPending ? (
          <DinoLoader
            instanceKey="competitors-header"
            label="Finding alternatives…"
            loading
            sublabel="Searching the web for products that overlap with yours. Usually 3–5 minutes — Reddit and HN unlock when this finishes."
            tone="brand"
          />
        ) : alts.length > 0 ? (
          <div
            className={cn(
              "relative max-h-[min(28rem,55vh)] overflow-y-auto overscroll-contain pr-0.5",
              alts.length > 6 &&
                "mask-[linear-gradient(to_bottom,black_0%,black_88%,transparent_100%)]",
            )}
          >
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {alts.map((c, i) => (
                <motion.li
                  key={`${c.url || c.name}-${i}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { delay: Math.min(i * 0.03, 0.36), duration: 0.28 }
                  }
                >
                  <a
                    href={c.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/alt flex h-full items-start gap-2.5 rounded-md border border-border/40 bg-card/30 px-2.5 py-2 transition-all hover:border-brand/40 hover:bg-card/60"
                  >
                    <span className="mt-0.5 w-4 shrink-0 font-mono text-[9px] tabular-nums text-muted-foreground/35 group-hover/alt:text-brand/50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <ProductFavicon
                      url={c.url}
                      size={16}
                      rounded="sm"
                      className="mt-0.5 ring-1 ring-border/30"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground/90 group-hover/alt:text-foreground">
                          {c.name}
                        </span>
                        <ExternalLink className="size-2.5 shrink-0 text-muted-foreground/30 opacity-0 transition-opacity group-hover/alt:opacity-100 group-hover/alt:text-brand/60" />
                      </div>
                      {c.description && (
                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground/65">
                          {c.description}
                        </p>
                      )}
                    </div>
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
        ) : competitors ? (
          <AlternativesStageCard
            tone="empty"
            eyebrow="no results"
            title="No alternatives found"
            body="Nothing clear came back. Try again, or run Reddit and HN with product context only."
            actionLabel={readOnly ? undefined : "Try again"}
            onAction={readOnly ? undefined : onReFindCompetitors}
            readOnly={readOnly}
          />
        ) : readOnly ? (
          <AlternativesStageCard
            tone="empty"
            eyebrow="not in report"
            title="No alternatives in this report"
            body="This shared report has product analysis only."
            readOnly
          />
        ) : aborted ? (
          <AlternativesStageCard
            tone="aborted"
            eyebrow="stopped"
            title="Alternatives didn’t finish"
            body={
              competitorsError ??
              "This step stopped before results were saved. Run it again to unlock Reddit and HN."
            }
            actionLabel="Find alternatives"
            onAction={onReFindCompetitors}
          />
        ) : (
          <AlternativesStageCard
            tone="idle"
            eyebrow="next step"
            title="Find alternatives"
            body="Discover products that compete with yours. Reddit and Hacker News unlock after this finishes."
            actionLabel="Find alternatives"
            onAction={onReFindCompetitors}
          />
        )}
      </div>
    </div>
  );
}

// Distinct markets: two large consumer verticals + indie SaaS founders.
const SUB_PRESETS: { label: string; subs: string[] }[] = [
  {
    // huge consumer money market: budgeting, investing, debt
    label: "finance",
    subs: ["personalfinance", "povertyfinance", "investing", "FinancialPlanning", "ynab"],
  },
  {
    // huge consumer health market
    label: "fitness",
    subs: ["fitness", "loseit", "bodyweightfitness", "xxfitness", "nutrition"],
  },
  {
    // peer founders / indie software
    label: "indie SaaS",
    subs: ["SaaS", "startups", "sideproject", "indiehackers", "bootstrapping"],
  },
];

/** Locked channel — simple disabled state until alternatives finish. */
function ChannelWaitingBay({
  channel,
  active,
}: {
  channel: "reddit" | "hn";
  /** True while alternatives are still running. */
  active: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const isReddit = channel === "reddit";
  const channelName = isReddit ? "Reddit" : "Hacker News";
  const accent = isReddit ? "#FF4500" : "#FF6600";

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-3 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(1 0 0 / 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(1 0 0 / 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 42%, black 20%, transparent 75%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-[17.5rem] flex-col items-center text-center">
        <div className="relative mb-5 grid size-[4.5rem] place-items-center">
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-full border border-dashed border-border/40"
            animate={
              reduceMotion || !active ? undefined : { rotate: 360 }
            }
            transition={
              reduceMotion || !active
                ? undefined
                : { duration: 36, repeat: Infinity, ease: "linear" }
            }
          />
          <div className="relative grid size-12 place-items-center overflow-hidden rounded-full border border-border/50 bg-card/80 opacity-50 grayscale ring-4 ring-border/20">
            {isReddit ? (
              <RedditIcon className="size-6" />
            ) : (
              <HNIcon className="size-6" />
            )}
          </div>
        </div>

        <div className="mb-1 flex items-center gap-2">
          <span
            className={cn(
              "size-1 rounded-full",
              active ? "animate-pulse bg-brand" : "bg-muted-foreground/40",
            )}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/55">
            {active ? "locked · waiting" : "locked"}
          </span>
        </div>

        <p className="mt-3 font-heading text-[15px] leading-snug tracking-tight text-foreground/80">
          {channelName} unlocks after alternatives
        </p>
        <p className="mt-1.5 max-w-[15rem] text-[11px] leading-relaxed text-muted-foreground/55">
          {active
            ? "Still finding alternatives. This channel stays locked until that finishes."
            : "Find alternatives on the left, then run this channel."}
        </p>

        <div
          aria-disabled
          className="mt-5 flex w-full cursor-not-allowed items-center justify-between gap-3 rounded-lg border border-border/35 bg-card/20 px-4 py-3 opacity-70"
        >
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
            <span
              className="size-1.5 rounded-full"
              style={{ background: accent, opacity: 0.35 }}
            />
            disabled
          </span>
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground/40">
            —
          </span>
        </div>
      </div>
    </div>
  );
}

/** Idle channel bay — radar lock waiting for the founder to fire. */
function ChannelArmingBay({
  channel,
  label,
  onRun,
  busy,
  badge,
  footer,
}: {
  channel: "reddit" | "hn";
  label: string;
  onRun: () => void;
  busy: boolean;
  badge?: string;
  footer?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const isReddit = channel === "reddit";
  // Reddit #FF4500 · HN official #FF6600
  const accent = isReddit ? "#FF4500" : "#FF6600";
  const accentSoft = isReddit
    ? "rgba(255,69,0,0.12)"
    : "rgba(255,102,0,0.12)";
  const accentMid = isReddit
    ? "rgba(255,69,0,0.35)"
    : "rgba(255,102,0,0.35)";
  const accentBorder = isReddit
    ? "border-[#FF4500]/40"
    : "border-[#FF6600]/40";
  const accentBorderHover = isReddit
    ? "hover:border-[#FF4500]/70 hover:bg-[#FF4500]/10"
    : "hover:border-[#FF6600]/70 hover:bg-[#FF6600]/10";
  const accentText = isReddit ? "text-[#FF4500]" : "text-[#FF6600]";
  const accentRing = isReddit ? "ring-[#FF4500]/25" : "ring-[#FF6600]/25";

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-3 py-10">
      {/* void field — crosshair grid, not decorative gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(1 0 0 / 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(1 0 0 / 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 42%, black 20%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] size-44 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: accentSoft }}
      />

      <div className="relative z-10 flex w-full max-w-[17.5rem] flex-col items-center">
        {/* signature: idle radar lock */}
        <div className="relative mb-5 grid size-[4.5rem] place-items-center">
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-full border border-dashed"
            style={{ borderColor: accentMid }}
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 28, repeat: Infinity, ease: "linear" }
            }
          />
          <motion.div
            aria-hidden
            className="absolute inset-1.5 rounded-full border"
            style={{ borderColor: accentMid }}
            animate={
              reduceMotion
                ? undefined
                : { opacity: [0.35, 0.85, 0.35], scale: [0.96, 1, 0.96] }
            }
            transition={
              reduceMotion
                ? undefined
                : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
            }
          />
          {!reduceMotion && (
            <motion.div
              aria-hidden
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "linear" }}
            >
              <div
                className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom"
                style={{
                  background: `linear-gradient(to top, transparent, ${accent})`,
                  opacity: 0.7,
                }}
              />
            </motion.div>
          )}
          <div
            className={cn(
              "relative grid size-12 place-items-center overflow-hidden rounded-full border bg-card/80 shadow-[0_0_0_1px_oklch(1_0_0/0.04)] ring-4",
              accentBorder,
              accentRing,
            )}
          >
            {isReddit ? (
              <RedditIcon className="size-6" />
            ) : (
              <HNIcon className="size-6" />
            )}
          </div>
        </div>

        <div className="mb-1 flex items-center gap-2">
          <span
            className="size-1 rounded-full"
            style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/55">
            signal · idle
          </span>
        </div>

        <button
          type="button"
          onClick={onRun}
          disabled={busy}
          className={cn(
            "group/arm relative mt-4 flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg border px-4 py-3.5 text-left transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            busy
              ? "cursor-not-allowed border-border/40 bg-card/30 text-muted-foreground/50"
              : cn(
                  "bg-card/50 text-foreground",
                  accentBorder,
                  accentBorderHover,
                  isReddit
                    ? "focus-visible:ring-[#FF4500]/50"
                    : "focus-visible:ring-[#FF6600]/50",
                ),
          )}
        >
          {!busy && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-px"
              style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
            />
          )}
          <span className="min-w-0">
            <span className="block font-heading text-[15px] leading-none tracking-tight">
              {label}
            </span>
            {badge && (
              <span
                className={cn(
                  "mt-1.5 inline-block font-mono text-[9px] uppercase tracking-wider",
                  accentText,
                )}
              >
                {badge}
              </span>
            )}
          </span>
          <ArrowRight
            className={cn(
              "size-4 shrink-0 transition-transform",
              busy
                ? "text-muted-foreground/40"
                : cn(
                    accentText,
                    "opacity-70 group-hover/arm:translate-x-0.5 group-hover/arm:opacity-100",
                  ),
            )}
          />
        </button>

        {footer && <div className="mt-3 w-full">{footer}</div>}
      </div>
    </div>
  );
}

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
    <div className="space-y-1.5 rounded-md border border-[#FF4500]/20 bg-[#FF4500]/[0.04] p-2.5">
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
          presets
        </span>
        {SUB_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            disabled={disabled}
            title={preset.subs.join(", ")}
            onClick={() => onChange(preset.subs)}
            className="rounded border border-border/40 bg-card/40 px-1.5 py-0.5 font-mono text-[10px] text-foreground/70 transition-colors hover:border-[#FF4500]/40 hover:text-foreground disabled:opacity-50"
          >
            {preset.label}
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
      <p className="text-[10px] leading-snug text-muted-foreground/55">
        Leave empty to auto-pick subs from your product. Pin to force those only.
      </p>
    </div>
  );
}

type ConsoleProps = {
  status: "idle" | "competitors" | "reddit" | "hn";
  hasCompetitors: boolean;
  /** Alternatives stage actively running (for wait-bay motion/copy). */
  competitorsRunning: boolean;
  hasReddit: boolean;
  hasHN: boolean;
  redditCount: number;
  hnCount: number;
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
  competitorsRunning,
  hasReddit,
  hasHN,
  redditCount,
  hnCount,
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
  const busy = status !== "idle";
  // Independent channels — both unlock after competitors; neither waits on the other.
  const waitingOnCompetitors = !hasCompetitors;
  const showRedditBtn = hasCompetitors && !hasReddit;
  const showHNBtn = hasCompetitors && !hasHN;
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
        <div className="flex shrink-0 items-center gap-3">
          {busy && (
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
              {elapsedDisplay}
            </span>
          )}
          {busy && !readOnly && (
            <button
              type="button"
              onClick={onCancel}
              className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              cancel
            </button>
          )}
        </div>
      </div>

      {streamStatus && busy && (
        <div className="border-b border-border/30 px-4 py-2.5 font-mono text-[11px] text-brand/80 truncate">
          <span className="text-muted-foreground/50">&gt; </span>
          {streamStatus}
        </div>
      )}

      {/* Tabs stay put; results pane is the only scroll region (flex min-h-0 chain). */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="m-3 flex shrink-0 items-center rounded-lg border border-border/30 bg-card/30 p-0.5">
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
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
            {waitingOnCompetitors && !readOnly ? (
              <ChannelWaitingBay
                channel="reddit"
                active={competitorsRunning}
              />
            ) : redditScan && (redditScan.top_threads?.length ?? 0) > 0 ? (
              <GtmBriefView
                brief={redditScan}
                isAuthed={isAuthed}
                signupHref={signupHref}
              />
            ) : loadingReddit ? (
              <div className="flex min-h-full flex-col items-center justify-center py-8">
                <DinoLoader
                  instanceKey="reddit"
                  label="Scanning Reddit for your market..."
                  loading={loadingReddit}
                  sublabel="This usually takes 20-40 seconds. We're running 3-5 sharp search terms against the target subs and curating the best threads."
                  tone="brand"
                />
              </div>
            ) : redditScan ? (
              <div className="flex min-h-full flex-col items-center justify-center gap-2 py-10 text-center">
                <p className="font-mono text-[11px] text-muted-foreground/60">
                  No Reddit threads found.
                </p>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={onFindReddit}
                    disabled={busy}
                    className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-[#FF4500] disabled:opacity-50"
                  >
                    re-run
                  </button>
                )}
              </div>
            ) : showRedditBtn && !readOnly ? (
              <ChannelArmingBay
                channel="reddit"
                label="Find Reddit users"
                onRun={onFindReddit}
                busy={busy}
                badge={
                  subsSearch.length > 0
                    ? `${subsSearch.length} subs pinned`
                    : undefined
                }
                footer={
                  <>
                    <button
                      type="button"
                      onClick={onToggleSubsSearch}
                      disabled={busy}
                      className="flex w-full items-center justify-center gap-1.5 rounded-md py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50 transition-colors hover:text-foreground/75 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span>
                        {subsSearch.length > 0
                          ? `${subsSearch.length} pinned · edit`
                          : "pin subreddits"}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-3 transition-transform",
                          subsSearchOpen && "rotate-180",
                        )}
                      />
                    </button>
                    {subsSearchOpen && (
                      <div className="mt-2">
                        <SubsSearchInput
                          value={subsSearch}
                          onChange={onChangeSubsSearch}
                          disabled={busy || !!redditScan}
                        />
                      </div>
                    )}
                  </>
                }
              />
            ) : readOnly && !redditScan ? (
              <p className="py-10 text-center font-mono text-[11px] text-muted-foreground/50">
                No Reddit scan in this report.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
            {waitingOnCompetitors && !readOnly ? (
              <ChannelWaitingBay channel="hn" active={competitorsRunning} />
            ) : hnResult && hnResult.threads.length > 0 ? (
              <HNResultView
                result={hnResult}
                isAuthed={isAuthed}
                signupHref={signupHref}
              />
            ) : loadingHN ? (
              <div className="flex min-h-full flex-col items-center justify-center py-8">
                <DinoLoader
                  instanceKey="hn"
                  label="Searching Hacker News…"
                  loading={loadingHN}
                  sublabel="This usually takes 1–2 minutes. We're searching Hacker News for threads where your future users are already talking — hang tight."
                  tone="orange"
                />
              </div>
            ) : hnResult ? (
              <div className="flex min-h-full flex-col items-center justify-center gap-2 py-10 text-center">
                <p className="font-mono text-[11px] text-muted-foreground/60">
                  No HN threads found.
                </p>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={onFindHN}
                    disabled={busy}
                    className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-orange-400 disabled:opacity-50"
                  >
                    re-run
                  </button>
                )}
              </div>
            ) : showHNBtn && !readOnly ? (
              <ChannelArmingBay
                channel="hn"
                label="Find HN threads"
                onRun={onFindHN}
                busy={busy}
              />
            ) : readOnly && !hnResult ? (
              <p className="py-10 text-center font-mono text-[11px] text-muted-foreground/50">
                No HN threads in this report.
              </p>
            ) : null}
          </div>
        )}
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
  const startLoadingRef = useRef(
    shouldStartCompetitorLoading({
      sessionId,
      hasResult: !!initialCompetitors,
      readOnly,
    }),
  );
  const stageRef = useRef(
    createCompetitorStage({
      initial: initialCompetitors as StageCompetitorResult | null,
      readOnly,
      startLoading: startLoadingRef.current,
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
    () => startLoadingRef.current,
  );
  const [loadingHN, setLoadingHN] = useState(false);
  const [loadingReddit, setLoadingReddit] = useState(false);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const flushCompetitorStage = useCallback(() => {
    const s = stageRef.current.getSnapshot();
    setCompetitors(toUiCompetitors(s.competitors));
    setLoadingCompetitors(s.loading);
    setError(s.error);
    setStreamStatus(s.streamStatus);
    setStreamError(s.streamError);
  }, []);

  /** Hard stop: stage + React + drop stream handles. Dino must disappear. */
  const stopCompetitorsUi = useCallback(
    (opts?: {
      canceled?: boolean;
      /** omit or undefined = no banner on idle */
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
    [sessionId],
  );

  const [hnStreamStatus, setHNStreamStatus] = useState<string | null>(null);
  const [hnElapsed, setHNElapsed] = useState(0);
  const [hnError, setHNError] = useState<string | null>(null);
  const [redditStreamStatus, setRedditStreamStatus] = useState<string | null>(null);
  const [redditElapsed, setRedditElapsed] = useState(0);
  const [redditError, setRedditError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const redditTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    streamAbortRef.current = controller;
    const stage = stageRef.current;
    const gen = stage.getSnapshot().gen;
    let finished = false;

    readSSEStream(
      runId,
      "research",
      token,
      (data) => {
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
      (err) => {
        if (finished) return;
        finished = true;
        stage.applyStreamTransportError(err, gen);
        flushCompetitorStage();
        // Force loader off even if stage gen mismatched
        setLoadingCompetitors(false);
      },
      controller.signal,
      () => {
        if (finished) return;
        finished = true;
        stage.applyStreamEnd(gen);
        flushCompetitorStage();
        setLoadingCompetitors(false);
      },
    );

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
        // COMPLETED without UI result yet: keep polling session for payload;
        // don't spin forever if stream missed the result event.
        if (body.completed && !competitors) {
          // session poll effect handles result; give it a few cycles, then stop
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

    // Refresh after cancel / idle — show try-again, not dino.
    if (marker?.status === "canceled") {
      stopCompetitorsUi({
        canceled: true,
        message: "Alternatives stage cancelled. Try again.",
      });
      return;
    }
    if (marker?.status === "idle" || marker?.status === "done") {
      stopCompetitorsUi({
        idle: true,
        message: null,
      });
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
      writeCompetitorStageMarker(sessionId, {
        status: "running",
        runId: handoff.runId,
      });
      setStreamStatus("Connecting…");
      setLoadingCompetitors(true);
      stageRef.current.beginRun();
      flushCompetitorStage();
      setRunId(handoff.runId);
      setToken(handoff.publicAccessToken);
      return;
    }

    // Marker says running but we only have runId (no stream token) — poll status + session.
    if (marker?.status === "running" && marker.runId) {
      setStreamStatus("Waiting for alternatives stage…");
      setLoadingCompetitors(true);
      setRunId(marker.runId);
      return;
    }

    // No in-flight signal at all (e.g. refresh after cancel without marker, or old session).
    // Do not spin forever — idle with try-again.
    stopCompetitorsUi({
      idle: true,
      message: null,
    });
  }, [
    readOnly,
    initialCompetitors,
    sessionId,
    stopCompetitorsUi,
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
        if (!cancelled && Date.now() - started > GRACE_MS && !runId) {
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
    const id = hnRunId;
    setHNRunId(null);
    setHNToken(null);
    setLoadingHN(false);
    if (id) {
      void fetch("/api/research/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: id, sessionId }),
      });
    }
  }, [hnRunId, sessionId]);

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
    const id = redditRunId;
    setRedditRunId(null);
    setRedditToken(null);
    setLoadingReddit(false);
    if (id) {
      void fetch("/api/research/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: id, sessionId }),
      });
    }
  }, [redditRunId, sessionId]);

  // Channels stay locked until we have a competitor payload (incl. empty list).
  const channelsLocked = !competitors;
  const competitorsPending = !readOnly && !competitors && loadingCompetitors;
  const status: "idle" | "competitors" | "reddit" | "hn" = loadingCompetitors
    ? "competitors"
    : loadingReddit
      ? "reddit"
      : loadingHN
        ? "hn"
        : "idle";
  const activeStreamStatus = loadingCompetitors
    ? streamStatus ?? "Waiting for alternatives stage…"
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
    // Prefer explicit competitor cancel whenever that stage owns the UI,
    // even if a race flipped loadingCompetitors already.
    if (loadingCompetitors || (!competitors && !loadingReddit && !loadingHN)) {
      cancelCompetitors();
    } else if (loadingReddit) {
      cancelReddit();
    } else if (loadingHN) {
      cancelHN();
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

function relativeHNDate(iso: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.max(0, Date.now() - then);
  const day = Math.floor(diff / 86_400_000);
  if (day < 1) {
    const hr = Math.floor(diff / 3_600_000);
    if (hr < 1) {
      const min = Math.floor(diff / 60_000);
      return min < 1 ? "now" : `${min}m ago`;
    }
    return `${hr}h ago`;
  }
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

function HNCardHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between gap-3 px-(--card-spacing) pt-1">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground/60">
          Signal
        </span>
        <span className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground/30">
          ·
        </span>
        <span className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground/60">
          Hacker News
        </span>
        <HNIcon className="ml-1 size-3.5 opacity-80" />
      </div>
      <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground/60">
        {count} threads
      </span>
    </div>
  );
}

function HNLiveRow({ t, rank }: { t: HNThread; rank: number }) {
  const hnUrl = `https://news.ycombinator.com/item?id=${t.objectID}`;
  return (
    <a
      href={hnUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group/row flex items-start gap-2 rounded-md px-1.5 py-1.5 transition-colors hover:bg-card/60"
    >
      <span className="mt-0.5 w-5 shrink-0 text-right font-mono text-[10px] tabular-nums text-orange-400/80 group-hover/row:text-orange-400">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-xs text-foreground/85 group-hover/row:text-foreground">
          {t.title}
        </p>
        {t.whyRelevant && (
          <p className="mt-0.5 text-[11px] italic leading-snug text-muted-foreground/70">
            {t.whyRelevant}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-muted-foreground/50">
          <span className="text-foreground/70">@{t.author || "unknown"}</span>
          {t.date && (
            <>
              <span className="text-muted-foreground/30">·</span>
              <span>{relativeHNDate(t.date)}</span>
            </>
          )}
          <span className="text-muted-foreground/30">·</span>
          <span>▲ {t.points}</span>
          <span className="text-muted-foreground/30">·</span>
          <span>{t.comments} cmts</span>
        </div>
      </div>
      <ExternalLink className="mt-1 size-3 shrink-0 text-muted-foreground/40 opacity-0 transition-opacity group-hover/row:opacity-100" />
    </a>
  );
}

function HNResultView({
  result,
  isAuthed,
  signupHref,
}: {
  result: HNResult | null;
  isAuthed: boolean;
  signupHref: string;
}) {
  const totalCount = result?.threads.length ?? 0;
  const hiddenCount = Math.max(0, totalCount - ANON_PREVIEW_COUNT);
  const visibleThreads = isAuthed
    ? (result?.threads ?? [])
    : (result?.threads ?? []).slice(0, ANON_PREVIEW_COUNT);

  return (
    <Card>
      <HNCardHeader count={totalCount} />
      <CardContent className="space-y-0.5">
        {visibleThreads.map((t, i) => (
          <HNLiveRow key={t.objectID} t={t} rank={i + 1} />
        ))}

        {!isAuthed && hiddenCount > 0 && (
          <SignupUnlockBar
            hiddenCount={hiddenCount}
            signupHref={signupHref}
          />
        )}

        {!isAuthed && result && hiddenCount > 0 && (
          <>
            {result.threads
              .slice(ANON_PREVIEW_COUNT)
              .map((t, i) => (
                <LockedThreadRow
                  key={t.objectID}
                  rank={i + 1 + ANON_PREVIEW_COUNT}
                  title={t.title}
                />
              ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
