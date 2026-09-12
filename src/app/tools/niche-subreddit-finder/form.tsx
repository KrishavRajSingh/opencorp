"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { runSubFinder, type SubFinderResult } from "./actions";
import { SubResultsList } from "./results";

const TIME_OPTIONS = [
  { value: "year", label: "Past year" },
  { value: "month", label: "Past month" },
  { value: "week", label: "Past week" },
  { value: "all", label: "All time" },
] as const;

export function SubFinderForm() {
  const [q, setQ] = useState("");
  const [time, setTime] = useState<(typeof TIME_OPTIONS)[number]["value"]>("year");
  const [result, setResult] = useState<SubFinderResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    trackEvent({ name: "tool_run", data: { tool: "niche_subreddit_finder" } });
    startTransition(async () => {
      const res = await runSubFinder({ q, time });
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
            placeholder='topic, e.g. "indie hacking", "AI form filler", "competitor research"'
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
            maxLength={200}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
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
          <div />
        </div>

        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Searching
            </>
          ) : (
            <>
              Find subs
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {result && <SubResultsList result={result} />}
    </div>
  );
}
