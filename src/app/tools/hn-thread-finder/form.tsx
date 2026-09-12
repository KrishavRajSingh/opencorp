"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { runHNFinder, type HNFinderResult } from "./actions";
import { HNResultsList } from "./results";

const SORT_OPTIONS = [
  { value: "search", label: "Relevance" },
  { value: "points", label: "Most points" },
  { value: "num_comments", label: "Most comments" },
  { value: "created_at", label: "Newest" },
] as const;

const FILTER_OPTIONS = [
  { value: "all", label: "All stories" },
  { value: "show_hn", label: "Show HN only" },
  { value: "ask_hn", label: "Ask HN only" },
] as const;

export function HNFinderForm() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]["value"]>("search");
  const [filter, setFilter] = useState<(typeof FILTER_OPTIONS)[number]["value"]>("all");
  const [result, setResult] = useState<HNFinderResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    trackEvent({ name: "tool_run", data: { tool: "hn_thread_finder" } });
    startTransition(async () => {
      const res = await runHNFinder({ q, sort, filter });
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
            placeholder='keyword, e.g. "AI agents" or "open source CRM"'
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
            maxLength={200}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="h-10 rounded-lg border border-border/60 bg-card/50 px-3 text-sm text-foreground outline-none backdrop-blur-sm"
            aria-label="Filter by"
          >
            {FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
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
        </div>

        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Searching HN
            </>
          ) : (
            <>
              Find threads
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {result && <HNResultsList result={result} />}
    </div>
  );
}
