"use client";

import { ArrowUpRight, MessageSquare, ThumbsUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { formatRedditAge, type RedditThread } from "@/lib/tools/reddit";
import type { RedditFinderResult } from "./actions";

export function ResultsList({ result }: { result: RedditFinderResult }) {
  if (!result.ok) {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-medium text-foreground">Couldn&apos;t fetch Reddit</p>
          <p className="mt-1 text-xs text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  if (result.empty) {
    return (
      <div className="mt-6 rounded-lg border border-border/50 bg-card/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No threads found for{" "}
          <span className="font-medium text-foreground">
            &ldquo;{result.query.q}&rdquo;
          </span>
          . Try a broader keyword or remove the subreddit filter.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {result.threads.length} threads for{" "}
          <span className="font-medium text-foreground">
            &ldquo;{result.query.q}&rdquo;
          </span>
          {result.query.subreddit ? (
            <>
              {" in "}
              <span className="font-medium text-foreground">
                r/{result.query.subreddit.replace(/^r\//, "")}
              </span>
            </>
          ) : null}
        </span>
        <span>
          sorted by {result.query.sort} · {result.query.time}
        </span>
      </div>

      <ol className="space-y-2">
        {result.threads.map((t, i) => (
          <ThreadRow key={t.id} thread={t} rank={i + 1} />
        ))}
      </ol>

      <div className="mt-8 rounded-lg border border-brand/30 bg-brand/5 p-5 text-center">
        <p className="text-sm font-medium text-foreground">
          Want this + HN threads + competitor map for any URL?
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          OpenCorp scans Reddit, Hacker News, and the product&apos;s own site in
          under a minute. Free, no card.
        </p>
        <Button
          size="sm"
          className="mt-3"
          asChild
          onClick={() =>
            trackEvent({ name: "tool_to_dashboard", data: { tool: "reddit_thread_finder" } })
          }
        >
          <Link href="/dashboard">Run the full research →</Link>
        </Button>
      </div>
    </div>
  );
}

function ThreadRow({ thread, rank }: { thread: RedditThread; rank: number }) {
  return (
    <li className="group rounded-lg border border-border/50 bg-card/40 p-4 transition-colors hover:border-brand/40 hover:bg-card/70">
      <div className="flex items-start gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/50 bg-muted/40 font-mono text-[11px] text-muted-foreground">
          {rank}
        </div>
        <div className="min-w-0 flex-1">
          <a
            href={thread.permalink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent({
                name: "tool_thread_click",
                data: { tool: "reddit_thread_finder", rank },
              })
            }
            className="block text-sm font-medium text-foreground transition-colors group-hover:text-brand"
          >
            {thread.title}
          </a>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="rounded-md border border-border/50 bg-background/40 px-1.5 py-0.5 font-mono">
              r/{thread.subreddit}
            </span>
            <span className="inline-flex items-center gap-1">
              <ThumbsUp className="size-3" />
              {formatScore(thread.score)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="size-3" />
              {formatScore(thread.numComments)}
            </span>
            <span>by u/{thread.author}</span>
            <span>{formatRedditAge(thread.createdUtc)}</span>
            <a
              href={thread.permalink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open on Reddit"
              className="ml-auto inline-flex items-center gap-0.5 text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              open
              <ArrowUpRight className="size-3" />
            </a>
          </div>
        </div>
      </div>
    </li>
  );
}

function formatScore(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
