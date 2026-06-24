"use client";

import { useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";
import { Circle } from "lucide-react";
import { ProductFavicon } from "@/components/dashboard/product-favicon";
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

function StatusPulse({
  hasProduct,
  hasCompetitor,
}: {
  hasProduct: boolean;
  hasCompetitor: boolean;
}) {
  const color = !hasProduct
    ? "bg-muted-foreground/30"
    : hasCompetitor
      ? "bg-emerald-400"
      : "bg-amber-400";
  const isActive = hasProduct;
  return (
    <span className="relative inline-flex size-2 shrink-0">
      {isActive && (
        <span
          className={cn(
            "absolute inset-0 animate-ping rounded-full opacity-60",
            color,
          )}
        />
      )}
      <span className={cn("relative inline-block size-2 rounded-full", color)} />
    </span>
  );
}

export function ProjectList({
  sessions,
  activeId,
}: {
  sessions: SessionSummary[];
  activeId: string | null;
}) {
  const router = useRouter();

  if (sessions.length === 0) {
    return (
      <div className="mt-3 px-3 text-xs leading-relaxed text-muted-foreground/60">
        No projects yet. Start one above.
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-0.5 overflow-y-auto px-2">
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
              "group/row relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
              isActive
                ? "bg-brand/10 text-foreground"
                : "text-foreground/80 hover:bg-card/50",
            )}
          >
            {isActive && (
              <span className="absolute inset-y-1 left-0 w-0.5 rounded-r bg-brand" />
            )}
            <ProductFavicon url={s.url} size={14} rounded="sm" />
            <StatusPulse
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
  );
}

export function useActiveId(): string | null {
  const pathname = usePathname();
  return useMemo(() => {
    if (!pathname) return null;
    const match = pathname.match(/^\/dashboard\/([0-9a-f-]{36})/);
    return match ? match[1] : null;
  }, [pathname]);
}

export { Circle };
