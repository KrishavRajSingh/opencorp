"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { RedditIcon } from "@/components/dashboard/reddit-icon";
import { HNIcon } from "@/components/dashboard/hn-icon";

/** Idle channel bay — radar lock waiting for the founder to fire. */
export function ChannelArmingBay({
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
