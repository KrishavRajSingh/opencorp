"use client";

import { motion } from "motion/react";
import { ExternalLink, MessageSquare } from "lucide-react";
import { HNIcon } from "@/components/dashboard/hn-icon";
import type { HNThread } from "@/lib/types/session";

export type { HNThread };

function relativeDate(iso: string): string {
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

function host(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.host.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function ThreadRow({
  thread,
  index,
}: {
  thread: HNThread;
  index: number;
}) {
  const hnUrl = `https://news.ycombinator.com/item?id=${thread.objectID}`;
  const storyHost = host(thread.url);
  const rank = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: "easeOut" }}
      className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-2 py-3.5 odd:bg-foreground/[0.015] first:border-t-0 border-t border-border/20 transition-colors hover:bg-foreground/[0.025]"
    >
      <div className="row-span-3 flex flex-col items-end pt-0.5 font-mono text-[11px] leading-tight">
        <span className="font-heading text-[15px] font-semibold tracking-tight text-orange-400">
          {rank}
        </span>
        <span className="mt-0.5 text-orange-400/80 tabular-nums">
          ▲ {thread.points}
        </span>
      </div>

      <a
        href={hnUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group/title inline-flex items-start gap-1.5 text-sm font-medium text-foreground/90 transition-colors hover:text-orange-300"
      >
        <span className="line-clamp-2">{thread.title}</span>
        <ExternalLink className="mt-0.5 size-3 shrink-0 opacity-0 transition-opacity group-hover/title:opacity-100" />
      </a>

      <div className="row-span-3 hidden items-start pt-0.5 sm:flex">
        {storyHost ? (
          <a
            href={thread.url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-border/40 bg-background/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70 transition-colors hover:border-orange-400/40 hover:text-orange-300"
          >
            {storyHost}
          </a>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
            self
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-[11px] text-muted-foreground/70 sm:hidden">
        <span className="text-foreground/70">@{thread.author || "unknown"}</span>
        <span className="text-muted-foreground/40">·</span>
        <span>{relativeDate(thread.date)}</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="size-3" />
          {thread.comments}
        </span>
        {storyHost && (
          <>
            <span className="text-muted-foreground/40">·</span>
            <a
              href={thread.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/60 transition-colors hover:text-orange-300"
            >
              {storyHost}
            </a>
          </>
        )}
      </div>

      <div className="hidden flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-[11px] text-muted-foreground/70 sm:flex">
        <span className="text-foreground/70">@{thread.author || "unknown"}</span>
        <span className="text-muted-foreground/40">·</span>
        <span>{relativeDate(thread.date)}</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="size-3" />
          {thread.comments}
        </span>
      </div>

      {thread.whyRelevant && (
        <p className="mt-1 text-xs italic leading-relaxed text-foreground/60">
          {thread.whyRelevant}
        </p>
      )}

      {thread.topCommentSnippet && (
        <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground/70">
          <span className="text-muted-foreground/40">&gt; </span>
          {thread.topCommentSnippet}
        </p>
      )}
    </motion.div>
  );
}

export function HNThreadsBlock({ result }: { result: { threads: HNThread[] } }) {
  const threads = result.threads ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <HNIcon className="size-4" />
          <h3 className="font-heading text-sm tracking-tight text-foreground">
            Hacker News
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
            relevant threads
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
          {threads.length} found
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/30">
        {threads.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground">
            No relevant threads found.
          </div>
        ) : (
          threads.map((t, i) => (
            <ThreadRow key={t.objectID ?? i} thread={t} index={i} />
          ))
        )}
      </div>
    </motion.div>
  );
}
