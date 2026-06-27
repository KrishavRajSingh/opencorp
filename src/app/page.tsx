"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  Users,
  BarChart3,
  SendHorizonal,
  Globe,
  Target,
  Sparkles,
  MessageSquare,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0c-2.4-1.6-3.5-1.3-3.5-1.3a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 10c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2v3.5" />
    </svg>
  );
}

function HNIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="3" fill="#FF6600" />
      <path
        d="M6 6H9.5L12 10L14.5 6H18L13 13V18H11V13L6 6Z"
        fill="white"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const features = [
  {
    icon: Search,
    title: "Find your first users",
    description:
      "Drop in a link. OpenCorp figures out who would want your product, who's already building something similar, and where they're talking about it.",
    span: "lg:col-span-2",
    stat: "One link → full report",
  },
  {
    icon: Users,
    title: "User Discovery",
    description:
      "Identifies real people talking about the problems you solve — with name, context, and sentiment.",
    span: "lg:col-span-1",
    stat: "47 users identified / hour",
  },
  {
    icon: BarChart3,
    title: "SEO & Content",
    description:
      "Keyword research, competitive analysis, and content strategy that gets you found organically.",
    span: "lg:col-span-1",
    stat: "Track your ranking daily",
  },
  {
    icon: SendHorizonal,
    title: "Outreach Engine",
    description:
      "Crafts personalized multi-channel messages that open conversations with decision-makers at scale.",
    span: "lg:col-span-2",
    stat: "3 channels active",
    tags: ["Email", "Twitter DM", "LinkedIn"],
  },
];

 function Nav() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <span className="font-heading text-lg tracking-tight">
          OpenCorp
        </span>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/KrishavRajSingh/opencorp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="GitHub"
          >
            <GitHubIcon className="size-5" />
          </a>
          <Button size="sm" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function PipelineDiagram() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-lg border border-brand/30 bg-brand/5 p-4"
        >
          <div className="flex items-center justify-center gap-2">
            <Search className="size-4 text-brand" />
            <span className="text-sm font-medium text-brand">You share a link</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Your product page, a landing page, or just a description
          </div>
        </motion.div>

        <motion.div
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.3 }}
          className="h-6 w-0.5 origin-top bg-border"
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="w-full rounded-lg border bg-card/60 p-4"
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="size-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">OpenCorp does the work</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Reads, searches, ranks — while you keep building
          </div>
        </motion.div>

        <motion.div
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.6 }}
          className="h-6 w-0.5 origin-top bg-border"
        />

        <div className="flex w-full flex-wrap justify-center gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}
            className="flex-1 min-w-[180px] rounded-lg border border-brand/30 bg-brand/5 p-3"
          >
            <div className="flex items-center gap-2">
              <Users className="size-4 text-brand" />
              <span className="text-sm font-medium text-brand">Your competitors</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              with the sources behind them
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
            className="flex-1 min-w-[180px] rounded-lg border border-brand/30 bg-brand/5 p-3"
          >
            <div className="flex items-center gap-2">
              <HNIcon className="size-4" />
              <span className="text-sm font-medium text-brand">Where to talk about it</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              threads where your future users already are
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function InteractiveInput() {
  return (
    <div className="group relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 border-b border-border/40 px-5 py-4">
        <Search className="size-5 shrink-0 text-muted-foreground" />
        <input
          type="text"
          readOnly
          value="AI coding agent for solo founders"
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
          placeholder="What are you building?"
        />
        <div className="flex items-center gap-1.5 text-xs text-brand">
          <span className="size-1.5 rounded-full bg-brand" />
          Scanning
        </div>
      </div>
      <div className="space-y-1 p-5 pt-4">
        {[
          { icon: Users, text: "Who else is building this", color: "text-foreground" },
          { icon: MessageSquare, text: "Where people are already talking about the problem", color: "text-foreground" },
          { icon: Target, text: "Ranked by how likely they are to want what you made", color: "text-brand" },
        ].map((item, i) => (
          <motion.div
            key={item.text}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.6 + i * 0.15 }}
            className="flex items-center gap-3 py-1.5"
          >
            <item.icon className={`size-3.5 shrink-0 ${item.color}`} />
            <span className="text-sm text-foreground/80">{item.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 pt-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.72_0.15_75_/_0.08),transparent_60%)]" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
          >
            <Badge variant="secondary" className="mb-6">
              User Acquisition, Autonomous
            </Badge>
            <h1 className="font-heading text-4xl leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Find Your Users
              <br />
              While You Build
            </h1>
            <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
              Tell OpenCorp what you&apos;re building. It researches your
              market, finds the people who need your product, and hands you a
              pipeline of users — completely autonomously.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/dashboard">
                  Open Dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Globe className="size-4" />
                Watch Demo
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 w-full max-w-lg"
          >
            <InteractiveInput />
          </motion.div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-16 text-center">
            <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
              What It Does
            </h2>
            <p className="mt-4 text-muted-foreground">
              You build. OpenCorp finds the people who need it.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={cn(
                  "group relative overflow-hidden rounded-xl border p-6 transition-all hover:border-brand/30",
                  feature.span
                )}
              >
                <div className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="absolute inset-0 rounded-xl bg-[radial-gradient(ellipse_at_top_right,oklch(0.72_0.15_75_/_0.06),transparent_60%)]" />
                </div>
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <feature.icon className="size-5 text-brand" />
                    {"tags" in feature && feature.tags && (
                      <div className="hidden gap-1.5 sm:flex">
                        {feature.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <h3 className="mt-4 font-heading text-xl tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-brand">
                    <span className="inline-block size-1.5 rounded-full bg-brand" />
                    {feature.stat}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border/50 bg-muted/30">
          <div className="mx-auto max-w-4xl px-6 py-24">
            <div className="mb-12 text-center">
              <Badge variant="secondary" className="mb-4">
                How it works
              </Badge>
              <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
                Drop a link. Get a plan.
              </h2>
              <p className="mt-4 text-muted-foreground">
                OpenCorp reads what you made, figures out who needs it, and
                hands you a list of competitors plus the conversations you
                should join. You stay in your editor.
              </p>
            </div>
            <PipelineDiagram />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid divide-x divide-border/50 text-center sm:grid-cols-3">
            {[
              { value: "1", label: "Link in" },
              { value: "2", label: "Lists out" },
              { value: "0", label: "Manual research" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center py-8"
              >
                <span className="font-heading text-4xl tracking-tight">
                  {stat.value}
                </span>
                <span className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>



        <section className="relative overflow-hidden px-6 py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.72_0.15_75_/_0.08),transparent_60%)]" />
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
              Your users are out there.
              <br />
              OpenCorp finds them.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Tell it what you&apos;re building. It scours every source, finds
              the people who need your product, and hands you a ready pipeline
              of users — so you can focus on what you do best.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/dashboard">
                  Open Dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Globe className="size-4" />
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-border/50">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="font-heading text-foreground">OpenCorp</span>
            <span className="hidden sm:inline">Built for builders who need users</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href="mailto:support@opencorp.live"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Mail className="size-4" />
              support@opencorp.live
            </a>
            <a
              href="https://www.linkedin.com/company/opencorpai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="size-4" />
              LinkedIn
            </a>
            <a
              href="https://x.com/opencorpai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
              aria-label="X (Twitter)"
            >
              <XIcon className="size-3.5" />
              @opencorpai
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
