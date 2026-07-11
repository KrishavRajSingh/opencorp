"use client";

import { Lock } from "lucide-react";
import Link from "next/link";

/** Anon free preview depth for Reddit + HN thread lists. */
export const ANON_PREVIEW_COUNT = 5;

export function LockedThreadRow({
  rank,
  title,
}: {
  rank: number;
  title: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-md px-1.5 py-1.5 opacity-55">
      <span className="mt-0.5 w-5 shrink-0 text-right font-mono text-[10px] tabular-nums text-muted-foreground/40">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-xs text-foreground/55">{title}</p>
      </div>
      <Lock className="mt-1 size-3 shrink-0 text-muted-foreground/40" />
    </div>
  );
}

export function SignupUnlockBar({
  hiddenCount,
  signupHref,
}: {
  hiddenCount: number;
  signupHref: string;
}) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-border/60 pt-3.5">
      <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground/75">
        <Lock className="size-3.5 shrink-0 text-brand/80" />
        <span className="truncate font-medium text-foreground/85">
          {hiddenCount} more threads
        </span>
      </p>
      <Link
        href={signupHref}
        className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand hover:underline"
      >
        Sign up to unlock
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
