"use client";

import { ArrowUpRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import type { CompetitorResult } from "./actions";

export function CompetitorResults({ result }: { result: CompetitorResult }) {
  if (!result.ok) {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-medium text-foreground">Couldn&apos;t scrape competitors</p>
          <p className="mt-1 text-xs text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="rounded-xl border border-border/50 bg-card/40 p-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/70">
          Detected product
        </p>
        <h3 className="mt-1 font-heading text-xl text-foreground">
          {result.product.productName}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {result.product.description}
        </p>
        {result.product.keyFeatures.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {result.product.keyFeatures.slice(0, 6).map((f, i) => (
              <li
                key={i}
                className="rounded-md border border-border/40 bg-background/40 px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {f}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        {result.competitors.length} competitors across{" "}
        {result.searchQueriesUsed.length} search angles.
      </p>

      <ol className="space-y-2">
        {result.competitors.map((c, i) => (
          <li
            key={`${c.url}-${i}`}
            className="group rounded-lg border border-border/50 bg-card/40 p-4 transition-colors hover:border-brand/40 hover:bg-card/70"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/50 bg-muted/40 font-mono text-[11px] text-muted-foreground">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent({
                        name: "tool_thread_click",
                        data: { tool: "competitor_scraper", rank: i + 1 },
                      })
                    }
                    className="text-sm font-medium text-foreground transition-colors group-hover:text-brand"
                  >
                    {c.name}
                  </a>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${c.name}`}
                    className="inline-flex items-center gap-0.5 text-muted-foreground/70 transition-colors hover:text-foreground"
                  >
                    <ArrowUpRight className="size-3" />
                  </a>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {c.description}
                </p>
                {c.mentionSources.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.mentionSources.slice(0, 3).map((s, j) => (
                      <span
                        key={j}
                        className="rounded-md border border-border/40 bg-background/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/80"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-lg border border-brand/30 bg-brand/5 p-5 text-center">
        <p className="text-sm font-medium text-foreground">
          Want this + the Reddit + HN threads where each competitor is mentioned?
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          OpenCorp runs the full research and surfaces the threads where buyers
          describe the problem your product solves. Free, no card.
        </p>
        <Button
          size="sm"
          className="mt-3"
          asChild
          onClick={() =>
            trackEvent({ name: "tool_to_dashboard", data: { tool: "competitor_scraper" } })
          }
        >
          <Link href="/dashboard">Run the full research →</Link>
        </Button>
      </div>
    </div>
  );
}
