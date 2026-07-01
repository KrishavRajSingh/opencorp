"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useActiveId } from "./project-list";
import { ScanlineBackdrop } from "@/components/dashboard/scanline-backdrop";
import { Logo } from "@/components/dashboard/logo";
import { Sidebar } from "./sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { SessionSummary } from "./project-list";

type Props = {
  sessions: SessionSummary[];
  activeName: string | null;
  user: { email?: string | null } | null;
  children: React.ReactNode;
};

function MobileTopBar({ activeName }: { activeName: string | null }) {
  return (
    <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-border/40 bg-background/80 px-5 backdrop-blur-sm md:hidden">
      <Link href="/" className="flex items-center gap-2">
        <Logo size={16} />
        <span className="font-heading text-sm tracking-tight text-foreground">
          OpenCorp
        </span>
      </Link>
      <span className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
        {activeName ?? "dashboard"}
      </span>
      <Link
        href="/dashboard"
        className="text-muted-foreground transition-colors hover:text-foreground"
        aria-label="New research"
      >
        <Plus className="size-4" />
      </Link>
    </header>
  );
}

export function DashboardShell({ sessions, activeName, user, children }: Props) {
  const activeId = useActiveId();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex min-h-svh">
        <Sidebar
          sessions={sessions}
          activeId={activeId}
          user={user}
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <MobileTopBar activeName={activeName} />
          <main className="relative flex-1">
            <ScanlineBackdrop />
            <div className="relative px-6 pb-24 pt-10 sm:px-10 md:pt-14">
              <div className="mx-auto w-full max-w-6xl">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
