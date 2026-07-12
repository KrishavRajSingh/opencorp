"use client";

import { ExternalLink } from "lucide-react";
import { HNIcon } from "@/components/dashboard/hn-icon";
import type { HNThread } from "@/lib/types/session";

export function relativeHNDate(iso: string): string {
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

export function HNCardHeader({ count }: { count: number }) {
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

export function HNLiveRow({ t, rank }: { t: HNThread; rank: number }) {
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
