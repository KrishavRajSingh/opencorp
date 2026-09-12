"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { runCompetitorScraper, type CompetitorResult } from "./actions";
import { CompetitorResults } from "./results";

export function CompetitorForm() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<CompetitorResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    trackEvent({ name: "tool_run", data: { tool: "competitor_scraper" } });
    startTransition(async () => {
      const res = await runCompetitorScraper(normalized);
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
            name="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="your-product.com"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
          />
        </div>

        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Scraping
            </>
          ) : (
            <>
              Find competitors
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
        <p className="text-[11px] text-muted-foreground/70">
          Runs in 30-60s. Reads your homepage, plans 5 search angles, dedupes results, synthesizes the top competitors.
        </p>
      </form>

      {result && <CompetitorResults result={result} />}
    </div>
  );
}
