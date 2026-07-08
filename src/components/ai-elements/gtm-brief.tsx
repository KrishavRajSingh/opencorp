"use client";

import { Lock, ExternalLink, Mail, Target } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type GtmBriefThread = {
  id: string;
  sub: string;
  title: string;
  link: string;
  author?: string;
  updated?: string;
  score?: number;
  num_comments?: number;
};

export type GtmBrief = {
  run_id?: string;
  generated_at?: string;
  top_threads: GtmBriefThread[];
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

const ANON_PREVIEW_COUNT = 5;

function ThreadRow({ t, rank }: { t: GtmBriefThread; rank: number }) {
  return (
    <article className="rounded-md border border-border/40 bg-card/30 p-3">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded bg-[#FF4500]/10 font-mono text-[10px] font-semibold text-[#FF4500]">
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <a
            href={t.link}
            target="_blank"
            rel="noreferrer"
            className="group flex items-start gap-1 text-sm font-medium leading-tight hover:text-[#FF4500]"
          >
            <span className="line-clamp-2">{t.title}</span>
            <ExternalLink className="mt-0.5 size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            <Badge variant="outline" className="h-4 px-1 text-[10px]">
              r/{t.sub}
            </Badge>
            {t.author && <span>u/{t.author}</span>}
            {t.updated && <span>· {ageLabel(t.updated)} ago</span>}
            {typeof t.score === "number" && (
              <span>· {t.score} pts</span>
            )}
            {typeof t.num_comments === "number" && (
              <span>· {t.num_comments} comments</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function LockedRow({ rank, title }: { rank: number; title: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-dashed border-border/30 bg-card/10 px-3 py-2 opacity-60">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded bg-muted-foreground/10 font-mono text-[10px] font-semibold text-muted-foreground/50">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-xs font-medium text-muted-foreground/70">
          {title}
        </p>
      </div>
      <Lock className="mt-0.5 size-3 shrink-0 text-muted-foreground/40" />
    </div>
  );
}

export function GtmBriefView({
  brief,
  isAuthed = true,
  signupHref = "/auth/sign-up",
}: {
  brief: GtmBrief;
  isAuthed?: boolean;
  signupHref?: string;
}) {
  const totalCount = brief.top_threads.length;
  const hiddenCount = Math.max(0, totalCount - ANON_PREVIEW_COUNT);
  const visibleThreads = isAuthed
    ? brief.top_threads
    : brief.top_threads.slice(0, ANON_PREVIEW_COUNT);

  return (
    <div className="space-y-6">
      {totalCount > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4 text-[#FF4500]" />
              <span>
                {totalCount} threads found, ranked by relevance
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {visibleThreads.map((t, i) => (
              <ThreadRow key={t.id} t={t} rank={i + 1} />
            ))}

            {!isAuthed && hiddenCount > 0 && (
              <>
                {brief.top_threads
                  .slice(ANON_PREVIEW_COUNT)
                  .map((t, i) => (
                    <LockedRow
                      key={t.id}
                      rank={i + 1 + ANON_PREVIEW_COUNT}
                      title={t.title}
                    />
                  ))}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {!isAuthed && hiddenCount > 0 && (
        <Card className="border-[#FF4500]/30 bg-[#FF4500]/5">
          <CardContent className="space-y-2 py-4">
            <div className="flex items-start gap-2">
              <Lock className="mt-0.5 size-4 shrink-0 text-[#FF4500]/80" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground/90">
                  {hiddenCount} more threads behind signup
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground/75">
                  Sign up to see all {totalCount} ranked threads, full
                  conversation context, and a list of target subreddits to track.
                </p>
              </div>
            </div>
            <Link
              href={signupHref}
              className={cn(
                "mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md border bg-background/60 px-3 py-2 text-xs font-medium transition-all",
                "border-[#FF4500]/40 text-foreground hover:border-[#FF4500]/70 hover:bg-[#FF4500]/10",
              )}
            >
              <Mail className="size-3.5" />
              Sign up to unlock {hiddenCount} more threads
            </Link>
          </CardContent>
        </Card>
      )}

      <p className="text-center font-mono text-[10px] text-muted-foreground/60">
        Generated by opencorp
        {brief.generated_at
          ? ` · ${new Date(brief.generated_at).toLocaleString()}`
          : ""}
      </p>
    </div>
  );
}
