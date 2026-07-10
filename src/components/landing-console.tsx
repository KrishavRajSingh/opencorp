"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ExternalLink, MessageSquare } from "lucide-react";
import { ProductFavicon } from "@/components/dashboard/product-favicon";
import { RedditIcon } from "@/components/dashboard/reddit-icon";
import { Badge } from "@/components/ui/badge";
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

export type RedditThread = {
  id: string;
  sub: string;
  title: string;
  link: string;
  author?: string;
  score?: number;
  num_comments?: number;
  whyRelevant?: string;
};

export type LandingConsoleData = {
  domain: string;
  competitors: Competitor[];
  redditThreads: RedditThread[];
  hnThreads: HNThread[];
};

type Tab = "alternatives" | "reddit" | "hn";

export function LandingConsole({ data }: { data: LandingConsoleData }) {
  const [activeTab, setActiveTab] = useState<Tab>("reddit");

  const tabs: {
    id: Tab;
    label: string;
    count: number;
    activeClass: string;
    dotActive: string;
    dotIdle: string;
  }[] = [
    {
      id: "alternatives",
      label: "Alternatives",
      count: data.competitors.length,
      activeClass: "bg-brand/10 text-foreground",
      dotActive: "bg-brand",
      dotIdle: "bg-brand/40",
    },
    {
      id: "reddit",
      label: "Reddit",
      count: data.redditThreads.length,
      activeClass: "bg-[#FF4500]/10 text-foreground",
      dotActive: "bg-[#FF4500]",
      dotIdle: "bg-[#FF4500]/40",
    },
    {
      id: "hn",
      label: "Hacker News",
      count: data.hnThreads.length,
      activeClass: "bg-orange-400/10 text-foreground",
      dotActive: "bg-orange-400",
      dotIdle: "bg-orange-400/40",
    },
  ];

  return (
    <div className="flex h-full max-h-[520px] min-h-0 flex-col overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm">
      <div className="flex items-center gap-3 border-b border-border/30 px-4 py-3">
        <span className="inline-block size-1.5 rounded-full bg-emerald-400" />
        <span className="text-sm text-foreground/90">
          Report · <span className="text-brand">{data.domain}</span>
        </span>
        <span className="ml-auto text-xs text-muted-foreground/60">
          Ready to act on
        </span>
      </div>

      <div className="m-3 flex items-center rounded-lg border border-border/30 bg-card/30 p-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-all sm:px-3",
              activeTab === tab.id
                ? tab.activeClass
                : "text-muted-foreground/70 hover:text-foreground/80",
            )}
          >
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                activeTab === tab.id ? tab.dotActive : tab.dotIdle,
              )}
            />
            <span className="truncate">{tab.label}</span>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeTab === "alternatives" ? (
          <AlternativesPanel competitors={data.competitors} />
        ) : activeTab === "reddit" ? (
          <RedditPanel threads={data.redditThreads} />
        ) : (
          <HNPanel threads={data.hnThreads} />
        )}

      </div>
    </div>
  );
}

function AlternativesPanel({ competitors }: { competitors: Competitor[] }) {
  if (competitors.length === 0) {
    return (
      <div className="border-t border-border/30 px-4 py-8 text-center text-xs text-muted-foreground">
        No alternatives found.
      </div>
    );
  }
  return (
    <div className="border-t border-border/30 px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground/70">
          Alternatives
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

function RedditPanel({ threads }: { threads: RedditThread[] }) {
  if (threads.length === 0) {
    return (
      <div className="border-t border-border/30 px-4 py-8 text-center text-xs text-muted-foreground">
        No relevant Reddit threads found.
      </div>
    );
  }
  return (
    <div className="border-t border-border/30 px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground/70">
            Reddit threads
          </span>
          <RedditIcon className="size-3.5 opacity-80" />
        </div>
        <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground/60">
          {threads.length}
        </span>
      </div>
      <div className="space-y-0.5">
        {threads.map((t, i) => {
          const rank = String(i + 1).padStart(2, "0");
          return (
            <motion.a
              key={t.id}
              href={t.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group/row flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-card/60"
            >
              <span className="mt-0.5 w-5 shrink-0 text-right font-mono text-[10px] tabular-nums text-[#FF4500]/80">
                {rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-xs text-foreground/85 group-hover/row:text-foreground">
                  {t.title}
                </p>
                {t.whyRelevant && (
                  <p className="mt-0.5 text-[11px] italic text-muted-foreground/70">
                    {t.whyRelevant}
                  </p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-muted-foreground/50">
                  <Badge
                    variant="outline"
                    className="h-4 border-[#FF4500]/30 px-1 text-[10px] text-[#FF4500]/80"
                  >
                    r/{t.sub}
                  </Badge>
                  {typeof t.score === "number" && <span>{t.score} pts</span>}
                  {typeof t.num_comments === "number" && (
                    <span>· {t.num_comments} cmts</span>
                  )}
                </div>
              </div>
            </motion.a>
          );
        })}
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
        <span className="text-[11px] font-medium text-muted-foreground/70">
          Hacker News
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
