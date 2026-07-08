"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type GtmBriefThread = {
  rank: number;
  thread: {
    id: string;
    sub: string;
    title: string;
    link: string;
    author?: string;
    updated?: string;
    score?: number;
    num_comments?: number;
  };
  buyer_reason?: string;
  top_quotes?: string[];
};

export type GtmBrief = {
  run_id?: string;
  generated_at?: string;
  top_threads: GtmBriefThread[];
  dropped?: Array<{ id: string; title: string; drop_reason: string }>;
};

function ageLabel(updated?: string): string {
  if (!updated) return "";
  const ms = Date.now() - new Date(updated).getTime();
  const hours = ms / 3_600_000;
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = hours / 24;
  if (days < 7) return `${Math.round(days)}d`;
  return `${Math.round(days / 7)}w`;
}

export function GtmBriefView({ brief }: { brief: GtmBrief }) {
  const droppedCount = brief.dropped?.length ?? 0;
  const [droppedOpen, setDroppedOpen] = useState(false);

  return (
    <div className="space-y-6">
      {brief.top_threads.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4 text-[#FF4500]" />
              Top threads ({brief.top_threads.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {brief.top_threads.map((t) => (
              <article
                key={t.thread.id}
                className="rounded-md border border-border/40 bg-card/30 p-3"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded bg-[#FF4500]/10 font-mono text-[10px] font-semibold text-[#FF4500]">
                    {t.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <a
                      href={t.thread.link}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-start gap-1 text-sm font-medium leading-tight hover:text-[#FF4500]"
                    >
                      <span className="line-clamp-2">{t.thread.title}</span>
                      <ExternalLink className="mt-0.5 size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                      <Badge variant="outline" className="h-4 px-1 text-[10px]">
                        r/{t.thread.sub}
                      </Badge>
                      {t.thread.author && <span>u/{t.thread.author}</span>}
                      {t.thread.updated && <span>· {ageLabel(t.thread.updated)} ago</span>}
                      {typeof t.thread.score === "number" && (
                        <span>· {t.thread.score} pts</span>
                      )}
                      {typeof t.thread.num_comments === "number" && (
                        <span>· {t.thread.num_comments} comments</span>
                      )}
                    </div>
                  </div>
                </div>

                {t.top_quotes && t.top_quotes.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {t.top_quotes.slice(0, 3).map((q, qi) => (
                      <blockquote
                        key={qi}
                        className="border-l-2 border-[#FF4500]/40 pl-2 text-xs italic text-muted-foreground"
                      >
                        &ldquo;{q}&rdquo;
                      </blockquote>
                    ))}
                  </div>
                )}

                {t.buyer_reason && (
                  <p className="mt-2 text-[11px] text-foreground/70">
                    <span className="font-mono uppercase tracking-wider text-[#FF4500]/80">why</span>{" "}
                    {t.buyer_reason}
                  </p>
                )}
              </article>
            ))}
          </CardContent>
        </Card>
      )}

      {droppedCount > 0 && (
        <div className="rounded-md border border-border/30 bg-card/20">
          <button
            type="button"
            onClick={() => setDroppedOpen((p) => !p)}
            className="flex w-full items-center justify-between px-3 py-2 font-mono text-[11px] text-muted-foreground/80 transition-colors hover:text-foreground/90"
          >
            <span>
              <span className="text-foreground/80">{droppedCount}</span> dropped
              threads
            </span>
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform",
                droppedOpen && "rotate-180",
              )}
            />
          </button>
          {droppedOpen && (
            <ul className="space-y-1.5 border-t border-border/30 px-3 py-2.5 text-[11px]">
              {brief.dropped!.map((d) => (
                <li
                  key={d.id}
                  className="flex items-start gap-2 leading-snug text-muted-foreground/85"
                >
                  <span className="mt-1 inline-block size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-foreground/80">
                      &ldquo;{d.title.slice(0, 80)}
                      {d.title.length > 80 ? "..." : ""}&rdquo;
                    </p>
                    <p className="mt-0.5 text-muted-foreground/60">
                      {d.drop_reason}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="text-center font-mono text-[10px] text-muted-foreground/60">
        Generated by opencorp{brief.generated_at ? ` · ${new Date(brief.generated_at).toLocaleString()}` : ""}
      </p>
    </div>
  );
}
