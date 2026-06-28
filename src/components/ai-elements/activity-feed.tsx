"use client";

import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Check, FileText, Globe } from "lucide-react";
import { HNIcon } from "@/components/dashboard/hn-icon";
import { cn } from "@/lib/utils";

export type ActivityTrack = "product" | "competitor" | "sentiment" | "hn";

export type ActivityItem = {
  id: string;
  track: ActivityTrack;
  toolName: string;
  url?: string;
  query?: string;
  title?: string;
  snippet?: string;
  status: "in-flight" | "done" | "error";
  arrivedAt: number;
};

type Props = {
  items: ActivityItem[];
  doneCount: number;
  maxSteps: number;
};

const TOOL_META: Record<
  string,
  { label: string; Icon: typeof FileText; tone: string }
> = {
  fetchPageTool: { label: "Reading", Icon: FileText, tone: "text-amber-300" },
  "fetch-page": { label: "Reading", Icon: FileText, tone: "text-amber-300" },
  searchWebTool: { label: "Web search", Icon: Globe, tone: "text-foreground/70" },
  "search-web": { label: "Web search", Icon: Globe, tone: "text-foreground/70" },
  searchHNTool: {
    label: "Hacker News",
    Icon: HNIcon,
    tone: "text-orange-400",
  },
  "search-hn": {
    label: "Hacker News",
    Icon: HNIcon,
    tone: "text-orange-400",
  },
};

function toolMeta(name: string) {
  return (
    TOOL_META[name] ?? {
      label: name,
      Icon: FileText,
      tone: "text-muted-foreground",
    }
  );
}

function relativeTime(ms: number): string {
  const diff = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  return `${Math.floor(diff / 60)}m ${diff % 60}s ago`;
}

export function ActivityFeed({ items, doneCount, maxSteps }: Props) {
  const ordered = [...items].reverse();
  const progress = Math.min(doneCount / Math.max(maxSteps, 1), 1);
  const inFlightCount = items.filter((it) => it.status === "in-flight").length;

  return (
    <div className="mt-6 w-full">
      <div className="flex items-center gap-3">
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-border/40">
          <motion.div
            className="absolute inset-y-0 left-0 bg-brand"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {doneCount} of {maxSteps}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="font-heading text-[11px] tracking-widest uppercase text-muted-foreground">
          activity
        </span>
        {inFlightCount > 0 && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-brand/70">
            {inFlightCount} in flight
          </span>
        )}
      </div>

      <div className="mt-2 divide-y divide-border/30 border-t border-border/30">
        {ordered.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence initial={false}>
            {ordered.map((it) => (
              <ActivityRow key={it.id} item={it} />
            ))}
          </AnimatePresence>
        )}
      </div>

      <FooterPulse hasInFlight={inFlightCount > 0} />
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 py-6 font-mono text-xs text-muted-foreground"
    >
      <motion.span
        className="inline-block size-1.5 rounded-full bg-brand"
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <span>waiting for first signal…</span>
    </motion.div>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const { label, Icon, tone } = toolMeta(item.toolName);
  const headline = item.query ?? item.title ?? item.url ?? item.toolName;
  const subline = item.query
    ? prettifyUrl(item.url) ?? item.url
    : item.query
      ? item.query
      : undefined;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex items-start gap-3 py-3"
    >
      <div className={cn("mt-0.5 shrink-0", tone)}>
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-heading text-[10px] tracking-widest uppercase",
              tone,
            )}
          >
            {label}
          </span>
          {item.track && (
            <span className="font-mono text-[10px] text-muted-foreground/60">
              · {item.track}
            </span>
          )}
        </div>
        <div className="mt-0.5 truncate font-mono text-sm text-foreground/85">
          {headline}
        </div>
        {subline && subline !== headline && (
          <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground/60">
            {subline}
          </div>
        )}
        {item.snippet && (
          <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground/80">
            {item.snippet}
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <StatusIndicator status={item.status} />
        <span className="font-mono text-[10px] text-muted-foreground/50">
          {relativeTime(item.arrivedAt)}
        </span>
      </div>
    </motion.div>
  );
}

function StatusIndicator({ status }: { status: ActivityItem["status"] }) {
  if (status === "in-flight") {
    return (
      <motion.span
        className="inline-block size-2 rounded-full bg-brand"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
    );
  }
  if (status === "done") {
    return <Check className="size-3.5 text-emerald-400" />;
  }
  return <AlertTriangle className="size-3.5 text-red-400" />;
}

function FooterPulse({ hasInFlight }: { hasInFlight: boolean }) {
  if (hasInFlight) return null;
  return (
    <div className="mt-4 flex items-center gap-2 font-mono text-[11px] text-muted-foreground/50">
      <motion.span
        className="inline-block size-1 rounded-full bg-muted-foreground/60"
        animate={{ opacity: [0.3, 0.9, 0.3] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <span>awaiting next signal…</span>
    </div>
  );
}

function prettifyUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    const host = u.host.replace(/^www\./, "");
    const path = u.pathname === "/" ? "" : u.pathname;
    return `${host}${path}`;
  } catch {
    return url;
  }
}
