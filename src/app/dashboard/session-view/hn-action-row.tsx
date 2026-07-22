"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export type HNAction = "find" | "draft";
export type HNActionState = "idle" | "running" | "done";

type Meta = {
  verb: string;
  description: string;
};

const META: Record<HNAction, Meta> = {
  find: {
    verb: "find",
    description: "scan Show HN, Ask HN, and discussions for your audience",
  },
  draft: {
    verb: "draft",
    description: "launch title + body",
  },
};

type Props = {
  action: HNAction;
  state: HNActionState;
  onRun: () => void;
  onActivate?: () => void;
  onCancel?: () => void;
  busy: boolean;
  isActive?: boolean;
  resultSummary?: string;
};

export function HNActionRow({
  action,
  state,
  onRun,
  onActivate,
  onCancel,
  busy,
  isActive = false,
  resultSummary,
}: Props) {
  const meta = META[action];
  const isRunning = state === "running";
  const isDone = state === "done";

  return (
    <div
      className={cn(
        "group/row relative flex items-center gap-3 px-3 py-2.5 transition-colors",
        "border-b border-border/30 last:border-b-0",
        isActive ? "bg-orange-400/[0.04]" : "hover:bg-card/40",
        busy && !isRunning && "opacity-55",
      )}
    >
      {isActive && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[2px] bg-orange-400"
        />
      )}

      <button
        type="button"
        onClick={isDone && onActivate ? onActivate : onRun}
        disabled={busy}
        className="flex min-w-0 flex-1 items-baseline gap-2.5 rounded-sm text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-400/40"
      >
        <span
          className={cn(
            "w-12 shrink-0 font-mono text-[11px] tracking-tight",
            isActive
              ? "text-orange-400"
              : isDone
                ? "text-foreground/70"
                : "text-foreground/85",
          )}
        >
          {meta.verb}
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-sm",
            isDone && resultSummary
              ? "font-mono text-[10.5px] text-muted-foreground/65"
              : "text-foreground/85 group-hover/row:text-foreground",
          )}
        >
          {isDone && resultSummary ? resultSummary : meta.description}
        </span>
        <span
          className={cn(
            "hidden shrink-0 font-mono text-[10px] uppercase tracking-widest sm:inline",
            isActive
              ? "text-orange-400"
              : isDone
                ? "text-emerald-400/80"
                : isRunning
                  ? "text-orange-400"
                  : "text-muted-foreground/35",
          )}
        >
          {isRunning
            ? "● running"
            : isDone
              ? isActive
                ? "● viewing"
                : "· complete"
              : "· idle"}
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-3">
        {isDone && !isActive && onActivate ? (
          <button
            type="button"
            onClick={onActivate}
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 transition-colors hover:text-orange-400"
          >
            view →
          </button>
        ) : null}
        {isDone ? (
          <button
            type="button"
            onClick={onRun}
            disabled={busy}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 transition-colors hover:text-orange-400 disabled:opacity-50"
          >
            <RotateCcw className="size-3" />
            rerun
          </button>
        ) : isRunning ? (
          onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 transition-colors hover:text-orange-400"
            >
              cancel
            </button>
          ) : null
        ) : (
          <button
            type="button"
            onClick={onRun}
            disabled={busy}
            className="group/cta inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-orange-400/80 transition-colors hover:text-orange-400 disabled:opacity-50"
          >
            run
            <ArrowRight className="size-3 transition-transform group-hover/cta:translate-x-0.5" />
          </button>
        )}
      </div>
    </div>
  );
}
