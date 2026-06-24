"use client";

import Link from "next/link";
import { LogOut, Plus } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { ProjectList, useActiveId, type SessionSummary } from "./project-list";
import { Logo } from "@/components/dashboard/logo";
import { ScanlineBackdrop } from "@/components/dashboard/scanline-backdrop";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        href="/dashboard/new"
        className="text-muted-foreground transition-colors hover:text-foreground"
        aria-label="New research"
      >
        <Plus className="size-4" />
      </Link>
    </header>
  );
}

function Sidebar({
  sessions,
  activeId,
  user,
}: {
  sessions: SessionSummary[];
  activeId: string | null;
  user: { email?: string | null } | null;
}) {
  return (
    <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-border/40 bg-background/60 backdrop-blur-sm md:flex">
      <div className="flex items-center gap-2.5 px-5 pb-5 pt-6">
        <Logo size={20} />
        <span className="font-heading text-base tracking-tight text-foreground">
          OpenCorp
        </span>
      </div>

      <div className="px-3">
        <Button
          asChild
          size="sm"
          className="w-full justify-center shadow-[0_0_0_1px_oklch(0.72_0.15_75/0.4),0_8px_24px_-12px_oklch(0.72_0.15_75/0.6)]"
        >
          <Link href="/dashboard/new">
            <Plus className="size-3.5" />
            New research
          </Link>
        </Button>
      </div>

      <div className="mt-7 flex items-center gap-2 px-5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
          Research
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/40">
          {sessions.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 pb-4">
        <ProjectList sessions={sessions} activeId={activeId} />
      </div>

      <div className="mt-auto border-t border-border/40 px-4 py-4">
        {user?.email && (
          <div
            className="truncate font-mono text-[11px] text-muted-foreground/70"
            title={user.email}
          >
            {user.email}
          </div>
        )}
        <form action={signOut} className="mt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="size-3" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

export function DashboardShell({ sessions, activeName, user, children }: Props) {
  const activeId = useActiveId();

  return (
    <div className="flex min-h-svh">
      <Sidebar sessions={sessions} activeId={activeId} user={user} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar activeName={activeName} />
        <main
          className={cn(
            "relative flex-1",
          )}
        >
          <ScanlineBackdrop />
          <div className="relative px-6 pb-24 pt-10 sm:px-10 md:pt-14">
            <div className="mx-auto w-full max-w-3xl">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
