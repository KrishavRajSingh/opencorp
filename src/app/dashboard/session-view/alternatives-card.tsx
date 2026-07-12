import { ArrowRight, AlertTriangle, Radar } from "lucide-react";
import { cn } from "@/lib/utils";

export function AlternativesStageCard({
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
