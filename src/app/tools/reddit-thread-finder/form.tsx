"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { runRedditFinder, type RedditFinderResult } from "./actions";
import { ResultsList } from "./results";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "top", label: "Top" },
  { value: "new", label: "New" },
  { value: "comments", label: "Most comments" },
] as const;

const TIME_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "year", label: "Past year" },
  { value: "month", label: "Past month" },
  { value: "week", label: "Past week" },
  { value: "day", label: "Past 24h" },
] as const;

export function RedditFinderForm() {
  const [q, setQ] = useState("");
  const [subreddit, setSubreddit] = useState("");
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]["value"]>("relevance");
  const [time, setTime] = useState<(typeof TIME_OPTIONS)[number]["value"]>("all");
  const [result, setResult] = useState<RedditFinderResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    trackEvent({ name: "tool_run", data: { tool: "reddit_thread_finder" } });
    startTransition(async () => {
      const res = await runRedditFinder({ q, subreddit, sort, time });
      setResult(res);
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border/60 bg-card/50 px-3 py-2.5 backdrop-blur-sm transition-colors focus-within:border-brand/50">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            name="q"
            required
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='keyword, e.g. "AI form filler" or "competitor research"'
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
            maxLength={200}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/50 px-3 py-2 backdrop-blur-sm">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
              r/
            </span>
            <input
              type="text"
              name="subreddit"
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
              placeholder="any subreddit"
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
              maxLength={50}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="h-10 rounded-lg border border-border/60 bg-card/50 px-3 text-sm text-foreground outline-none backdrop-blur-sm"
            aria-label="Sort by"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value as typeof time)}
            className="h-10 rounded-lg border border-border/60 bg-card/50 px-3 text-sm text-foreground outline-none backdrop-blur-sm"
            aria-label="Time range"
          >
            {TIME_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Searching Reddit
            </>
          ) : (
            <>
              Find threads
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {result && <ResultsList result={result} />}
    </div>
  );
}
