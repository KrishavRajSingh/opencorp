"use client";

import Link from "next/link";
import { LogOut, PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { ProjectList, type SessionSummary } from "./project-list";
import { Logo } from "@/components/dashboard/logo";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Props = {
  sessions: SessionSummary[];
  activeId: string | null;
  user: { email?: string | null } | null;
  collapsed: boolean;
  onToggle: () => void;
};

export function Sidebar({
  sessions,
  activeId,
  user,
  collapsed,
  onToggle,
}: Props) {
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col overflow-hidden border-r border-border/40 bg-background/60 backdrop-blur-sm transition-[width] duration-200 ease-out md:flex",
        collapsed ? "w-14" : "w-60",
      )}
    >
      <div
        className={cn(
          "flex",
          collapsed
            ? "flex-col items-center gap-2 px-2 pb-3 pt-4"
            : "items-center justify-between px-5 pb-5 pt-6",
        )}
      >
        <Link
          href="/"
          aria-label="OpenCorp home"
          className={cn(
            "flex min-w-0 items-center gap-2.5",
            collapsed && "justify-center",
          )}
        >
          <Logo size={20} />
          {!collapsed && (
            <span className="truncate font-heading text-base tracking-tight text-foreground">
              OpenCorp
            </span>
          )}
        </Link>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size={collapsed ? "icon-xs" : "icon-sm"}
              onClick={onToggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-3" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={collapsed ? "right" : "bottom"}>
            {collapsed ? "Expand" : "Collapse"}
          </TooltipContent>
        </Tooltip>
      </div>

      <div className={cn(collapsed ? "px-2" : "px-3")}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                size="icon"
                className="w-full shadow-[0_0_0_1px_oklch(0.72_0.15_75/0.4),0_8px_24px_-12px_oklch(0.72_0.15_75/0.6)]"
              >
                <Link href="/dashboard" aria-label="New research">
                  <Plus className="size-3.5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">New research</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            asChild
            size="sm"
            className="w-full justify-center shadow-[0_0_0_1px_oklch(0.72_0.15_75/0.4),0_8px_24px_-12px_oklch(0.72_0.15_75/0.6)]"
          >
            <Link href="/dashboard">
              <Plus className="size-3.5" />
              New research
            </Link>
          </Button>
        )}
      </div>

      {!collapsed && (
        <div className="mt-7 flex items-center gap-2 px-5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Research
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/40">
            {sessions.length}
          </span>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-4">
        <ProjectList
          sessions={sessions}
          activeId={activeId}
          collapsed={collapsed}
        />
      </div>

      <div
        className={cn(
          "mt-auto border-t border-border/40",
          collapsed ? "px-2 py-3" : "px-4 py-4",
        )}
      >
        {!collapsed && user?.email && (
          <div
            className="truncate font-mono text-[11px] text-muted-foreground/70"
            title={user.email}
          >
            {user.email}
          </div>
        )}
        {user && (
          <form action={signOut} className={collapsed ? "" : "mt-2"}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="submit"
                    aria-label="Sign out"
                    className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <LogOut className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogOut className="size-3" />
                Sign out
              </button>
            )}
          </form>
        )}
      </div>
    </aside>
  );
}
