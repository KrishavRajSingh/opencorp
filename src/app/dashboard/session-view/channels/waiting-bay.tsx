"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { RedditIcon } from "@/components/dashboard/reddit-icon";
import { HNIcon } from "@/components/dashboard/hn-icon";

/** Locked channel — simple disabled state until alternatives finish. */
export function ChannelWaitingBay({
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
