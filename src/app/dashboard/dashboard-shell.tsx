"use client";

import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { LogOut } from "lucide-react";
import {
  ProjectSwitcher,
  type SessionSummary,
} from "./project-switcher";

export function DashboardShell({
  sessions,
  activeName,
  children,
}: {
  sessions: SessionSummary[];
  activeName: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 transition-colors hover:text-muted-foreground"
            >
              OpenCorp
            </Link>
            <ProjectSwitcher sessions={sessions} activeName={activeName} />
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              title="Sign out"
            >
              <LogOut className="size-3" />
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-6 pb-20 pt-12">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>
    </div>
  );
}
