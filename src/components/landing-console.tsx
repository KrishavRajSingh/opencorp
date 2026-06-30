"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ExternalLink, MessageSquare } from "lucide-react";
import { ProductFavicon } from "@/components/dashboard/product-favicon";
import { cn } from "@/lib/utils";

export type Competitor = {
  name: string;
  url: string;
  description: string;
  mentionSources: string[];
};

export type HNThread = {
  objectID: string;
  title: string;
  url: string | null;
  points: number;
  comments: number;
  author: string;
  date: string;
  whyRelevant: string;
  topCommentSnippet: string | null;
};

export type LandingConsoleData = {
  domain: string;
  competitors: Competitor[];
  hnThreads: HNThread[];
};

type Tab = "competitors" | "hn";

export function LandingConsole({ data }: { data: LandingConsoleData }) {
  const [activeTab, setActiveTab] = useState<Tab>("competitors");

  return (
    <div className="flex h-full max-h-[520px] min-h-0 flex-col overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm">
      <div className="flex items-center gap-3 border-b border-border/30 px-4 py-3">
        <span className="inline-block size-1.5 rounded-full bg-emerald-400" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400/80">
          DONE
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
          stage 1 + 2
        </span>
      </div>

      <div className="m-3 flex items-center rounded-lg border border-border/30 bg-card/30 p-0.5">
        <button
          type="button"
          onClick={() => setActiveTab("competitors")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-all",
            activeTab === "competitors"
              ? "bg-brand/10 text-foreground"
              : "text-muted-foreground/70 hover:text-foreground/80",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              activeTab === "competitors" ? "bg-brand" : "bg-brand/40",
            )}
          />
          <span>Competitors</span>
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
            {data.competitors.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("hn")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-all",
            activeTab === "hn"
              ? "bg-orange-400/10 text-foreground"
              : "text-muted-foreground/70 hover:text-foreground/80",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              activeTab === "hn" ? "bg-orange-400" : "bg-orange-400/40",
            )}
          />
          <span>Hacker News</span>
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
            {data.hnThreads.length}
          </span>
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === "competitors" ? (
          <CompetitorsPanel competitors={data.competitors} />
        ) : (
          <HNPanel threads={data.hnThreads} />
        )}

        <div className="border-t border-border/30 px-4 py-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
              session
            </span>
          </div>
          <dl className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                domain
              </dt>
              <dd
                className="truncate text-xs text-foreground/80"
                title={data.domain}
              >
                {data.domain || "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function CompetitorsPanel({ competitors }: { competitors: Competitor[] }) {
  if (competitors.length === 0) {
    return (
      <div className="border-t border-border/30 px-4 py-8 text-center text-xs text-muted-foreground">
        No competitors found.
      </div>
    );
  }
  return (
    <div className="border-t border-border/30 px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground/60">
          Stage 1 · Competitors
        </span>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
          {competitors.length}
        </span>
      </div>
      <div className="space-y-2">
        {competitors.map((c, i) => (
          <motion.a
            key={c.url}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="block rounded-lg border border-border/60 bg-card/40 p-3 transition-all hover:border-brand/40 hover:bg-card/70"
          >
            <div className="flex items-center gap-2">
              <ProductFavicon
                url={c.url}
                size={16}
                rounded="sm"
                className="ring-1 ring-border/40"
              />
              <span className="inline-flex items-center gap-1 truncate text-sm font-medium text-foreground">
                {c.name}
              </span>
              <ExternalLink className="ml-auto size-3 shrink-0 text-muted-foreground/40" />
            </div>
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-foreground/65">
              {c.description}
            </p>
            {c.mentionSources.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {c.mentionSources.slice(0, 3).map((s, j) => (
                  <span
                    key={j}
                    className="rounded border border-border/40 bg-background/50 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </motion.a>
        ))}
      </div>
    </div>
  );
}

function HNPanel({ threads }: { threads: HNThread[] }) {
  if (threads.length === 0) {
    return (
      <div className="border-t border-border/30 px-4 py-8 text-center text-xs text-muted-foreground">
        No relevant threads found.
      </div>
    );
  }
  return (
    <div className="border-t border-border/30 px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground/60">
          Stage 2 · Hacker News
        </span>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
          {threads.length}
        </span>
      </div>
      <div className="space-y-0.5">
        {threads.map((t, i) => {
          const rank = String(i + 1).padStart(2, "0");
          const hnUrl = `https://news.ycombinator.com/item?id=${t.objectID}`;
          return (
            <motion.a
              key={t.objectID}
              href={t.url ?? hnUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group/row flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-card/60"
            >
              <span className="mt-0.5 w-5 shrink-0 text-right font-mono text-[10px] tabular-nums text-orange-400/80">
                {rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-xs text-foreground/85 group-hover/row:text-foreground">
                  {t.title}
                </p>
                <p className="mt-0.5 text-[11px] italic text-muted-foreground/70">
                  {t.whyRelevant}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/50">
                  <span>▲ {t.points}</span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="size-3" />
                    {t.comments}
                  </span>
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
