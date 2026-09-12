"use client";

import { ArrowUpRight, MessageSquare, ThumbsUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { formatSubAge, type SubredditHit } from "@/lib/tools/subreddits";
import type { SubFinderResult } from "./actions";

export function SubResultsList({ result }: { result: SubFinderResult }) {
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
          No subreddits found for{" "}
          <span className="font-medium text-foreground">
            &ldquo;{result.query.q}&rdquo;
          </span>
          . Try a broader topic.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {result.subs.length} subs for{" "}
          <span className="font-medium text-foreground">
            &ldquo;{result.query.q}&rdquo;
          </span>
          {result.totalResults > result.subs.length ? (
            <> · from {result.totalResults}+ matches</>
          ) : null}
        </span>
        <span>{result.query.time === "all" ? "all time" : `past ${result.query.time}`}</span>
      </div>

      <ol className="space-y-2">
        {result.subs.map((s, i) => (
          <SubRow key={s.name} sub={s} rank={i + 1} />
        ))}
      </ol>

      <div className="mt-8 rounded-lg border border-brand/30 bg-brand/5 p-5 text-center">
        <p className="text-sm font-medium text-foreground">
          Want this + the threads already on these subs?
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          OpenCorp surfaces the specific Reddit threads in these subs where your
          future users are most active. Free, no card.
        </p>
        <Button
          size="sm"
          className="mt-3"
          asChild
          onClick={() =>
            trackEvent({ name: "tool_to_dashboard", data: { tool: "niche_subreddit_finder" } })
          }
        >
          <Link href="/dashboard">Run the full research →</Link>
        </Button>
      </div>
    </div>
  );
}

function SubRow({ sub, rank }: { sub: SubredditHit; rank: number }) {
  return (
    <li className="group rounded-lg border border-border/50 bg-card/40 p-4 transition-colors hover:border-brand/40 hover:bg-card/70">
      <div className="flex items-start gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/50 bg-muted/40 font-mono text-[11px] text-muted-foreground">
          {rank}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <a
              href={sub.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent({
                  name: "tool_thread_click",
                  data: { tool: "niche_subreddit_finder", rank },
                })
              }
              className="text-sm font-medium text-foreground transition-colors group-hover:text-brand"
            >
              r/{sub.name}
            </a>
            <span className="text-[11px] text-muted-foreground">
              {sub.postCount} {sub.postCount === 1 ? "post" : "posts"} in window
            </span>
          </div>
          {sub.topPost ? (
            <a
              href={sub.topPost.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-xs leading-relaxed text-muted-foreground transition-colors hover:text-foreground"
            >
              {sub.topPost.title}
            </a>
          ) : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ThumbsUp className="size-3" />
              {formatCount(sub.totalScore)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="size-3" />
              {formatCount(sub.totalComments)}
            </span>
            {sub.topPost ? <span>latest: {formatSubAge(sub.topPost.createdUtc)}</span> : null}
            <a
              href={sub.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open r/${sub.name}`}
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

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
