"use client";

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
      return min < 1 ? "now" : `${min}m`;
    }
    return `${hr}h`;
  }
  if (day < 30) return `${day}d`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.floor(mo / 12)}y`;
}

export function HNCardHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 pt-3 pb-2">
      <div className="flex min-w-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest">
        <HNIcon className="size-3 text-orange-400" />
        <span className="text-muted-foreground/60">news.ycombinator.com</span>
      </div>
      <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground/45">
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
      className="group/row block border-b border-border/25 px-3 py-2.5 transition-colors last:border-b-0 hover:bg-card/30"
    >
      <div className="flex items-baseline gap-2">
        <p className="min-w-0 flex-1 truncate text-sm text-foreground/90 group-hover/row:text-foreground">
          {t.title}
        </p>
        <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-muted-foreground/45 group-hover/row:text-foreground/70">
          ▲ {t.points}
        </span>
      </div>
      {t.whyRelevant && (
        <p className="mt-0.5 truncate text-[11px] italic text-muted-foreground/55">
          {t.whyRelevant}
        </p>
      )}
      <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground/45">
        @{t.author || "unknown"} · {relativeHNDate(t.date)} · {t.comments} cmts
        <span className="ml-1.5 text-muted-foreground/25">·</span>
        <span className="ml-1.5 text-muted-foreground/35">#{rank}</span>
      </p>
    </a>
  );
}
