"use client";

import { useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, ChevronDown, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export type SessionSummary = {
  id: string;
  url: string | null;
  product_name: string | null;
  has_product: boolean;
  has_competitor: boolean;
  updated_at: string;
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.floor(day / 365)}y`;
}

function StatusDot({
  hasProduct,
  hasCompetitor,
}: {
  hasProduct: boolean;
  hasCompetitor: boolean;
}) {
  const color = !hasProduct
    ? "text-muted-foreground/40"
    : hasCompetitor
      ? "text-emerald-400"
      : "text-amber-400";
  return <Circle className={cn("size-2 shrink-0 fill-current", color)} />;
}

export function ProjectSwitcher({
  sessions,
  activeName,
}: {
  sessions: SessionSummary[];
  activeName: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const activeId = useMemo(() => {
    if (!pathname) return null;
    const match = pathname.match(/^\/dashboard\/([0-9a-f-]{36})/);
    return match ? match[1] : null;
  }, [pathname]);

  const triggerLabel = activeName ?? "OpenCorp";

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "group inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors",
          "text-foreground/90 hover:bg-card/40",
          "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        )}
      >
        <span className="font-heading tracking-tight">{triggerLabel}</span>
        <ChevronDown
          className="size-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-1.5">
        <div className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
          Your research
        </div>
        <div className="flex flex-col gap-0.5 max-h-80 overflow-y-auto">
          {sessions.length === 0 && (
            <div className="px-2 py-3 text-xs text-muted-foreground/70">
              No projects yet. Start one below.
            </div>
          )}
          {sessions.map((s) => {
            const isActive = s.id === activeId;
            const label = s.product_name ?? s.url ?? "Untitled";
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (!isActive) router.push(`/dashboard/${s.id}`);
                }}
                className={cn(
                  "group/row flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                  isActive
                    ? "bg-brand/10 text-foreground"
                    : "text-foreground/80 hover:bg-card/40",
                )}
              >
                <StatusDot
                  hasProduct={s.has_product}
                  hasCompetitor={s.has_competitor}
                />
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate",
                    isActive && "font-medium",
                  )}
                >
                  {label}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground/60">
                  {relativeTime(s.updated_at)}
                </span>
              </button>
            );
          })}
        </div>
        <div className="my-1 h-px bg-border/40" />
        <button
          type="button"
          onClick={() => router.push("/dashboard/new")}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
            "text-brand/80 hover:bg-brand/10 hover:text-brand",
          )}
        >
          <Plus className="size-3.5" />
          New research
        </button>
      </PopoverContent>
    </Popover>
  );
}
