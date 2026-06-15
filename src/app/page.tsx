"use client";

import { motion } from "motion/react";
import {
  ArrowRight,
  Search,
  Users,
  BarChart3,
  SendHorizonal,
  Globe,
  Star,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8c2.648 0 5.028.826 6.675 2.14a2.5 2.5 0 0 1 2.326 4.36c0 3.59-4.03 6.5-9 6.5-4.875 0-8.845-2.8-9-6.294l-1-.206a2.5 2.5 0 0 1 2.326-4.36c1.646-1.313 4.026-2.14 6.674-2.14z" />
      <path d="M12 8l1-5 6 1" />
      <path d="M18 4a1 1 0 1 0 2 0 1 1 0 1 0-2 0" />
      <path d="M8.5 13a.5.5 0 1 0 1 0 .5.5 0 1 0-1 0" />
      <path d="M14.5 13a.5.5 0 1 0 1 0 .5.5 0 1 0-1 0" />
      <path d="M10 17c.667.333 1.333.5 2 .5s1.333-.167 2-.5" />
    </svg>
  );
}

function HNIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
      <path d="M8 7l4 6 4-6" />
      <path d="M12 13v4" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0c-2.4-1.6-3.5-1.3-3.5-1.3a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 10c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2v3.5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4.267L8.267 4H4z" />
      <path d="M4 20l6.768-6.768m2.46-2.46L20 4" />
    </svg>
  );
}

const features = [
  {
    icon: Search,
    title: "Market Research",
    description:
      "Two discovery tracks — pain-point discovery (problem-first) and competitor discovery (tool-first, dissatisfaction signals). Scans Reddit, HN, Twitter, Product Hunt, and GitHub issues across both.",
    span: "lg:col-span-2",
    stat: "12K+ conversations analyzed daily",
    tags: ["Reddit", "HN", "Twitter", "Product Hunt", "GitHub"],
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
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="GitHub"
          >
            <GitHubIcon className="size-5" />
          </a>
          <Button size="sm">Get Early Access</Button>
        </div>
      </div>
    </header>
  );
}

function PipelineDiagram() {
  const sources = [
    { label: "Reddit", desc: "PRAW API", color: "border-orange-500/30 bg-orange-500/5", icon: <RedditIcon className="size-4 text-orange-500" /> },
    { label: "HN", desc: "Algolia API", color: "border-orange-500/30 bg-orange-500/5", icon: <HNIcon className="size-4 text-orange-500" /> },
    { label: "GitHub", desc: "Search API", color: "border-border/30 bg-muted/50", icon: <GitHubIcon className="size-4 text-foreground" /> },
    { label: "Twitter", desc: "X API", color: "border-border/30 bg-muted/50", icon: <XIcon className="size-4 text-foreground" /> },
  ];

  return (
    <div className="overflow-hidden rounded-xl border bg-card p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex flex-wrap justify-center gap-2">
          {sources.map((s) => (
            <div key={s.label} className={`rounded-lg border px-3 py-2 ${s.color}`}>
              <div className="flex items-center gap-1.5">
                {s.icon}
                <span className="text-xs font-medium text-foreground">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
          className="h-6 w-0.5 origin-top bg-border"
        />

        <div className="flex flex-wrap justify-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex-1 min-w-[180px] rounded-lg border border-brand/30 bg-brand/5 p-3"
          >
            <div className="flex items-center gap-2">
              <Search className="size-4 text-brand" />
              <span className="text-xs font-medium text-brand">Track 1 — Pain-Point Discovery</span>
            </div>
            <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
              <div>&ldquo;is there a tool&rdquo; / &ldquo;frustrated with&rdquo;</div>
              <div>&ldquo;how do I&rdquo; / &ldquo;manual process&rdquo;</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex-1 min-w-[180px] rounded-lg border border-purple-500/30 bg-purple-500/5 p-3"
          >
            <div className="flex items-center gap-2">
              <Star className="size-4 text-purple-400" />
              <span className="text-xs font-medium text-purple-400">Track 2 — Competitor Discovery</span>
            </div>
            <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
              <div>&ldquo;alternative&rdquo; / &ldquo;switching from&rdquo;</div>
              <div>&ldquo;too expensive&rdquo; / &ldquo;won&apos;t fix&rdquo;</div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.6 }}
          className="h-6 w-0.5 origin-top bg-border"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
          className="w-full rounded-lg border border-green-500/30 bg-green-500/5 p-3"
        >
          <div className="flex items-center justify-center gap-2">
            <Target className="size-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Scored Lead Pipeline</span>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <span>47 pain-point leads</span>
            <span className="text-purple-400">16 competitor leads</span>
            <span>tagged by intent</span>
          </div>
        </motion.div>
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
          { icon: RedditIcon, text: "47 pain-point conversations on Reddit", color: "text-orange-500" },
          { icon: GitHubIcon, text: "16 devs frustrated with existing tools on GitHub", color: "text-foreground" },
          { icon: HNIcon, text: "12 posts on HN: \"looking for alternatives\"", color: "text-orange-500" },
          { icon: Target, text: "All leads sorted by intent score", color: "text-green-400" },
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
              <Button size="lg" className="w-full sm:w-auto">
                Get Early Access
                <ArrowRight className="size-4" />
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
                Dual-Track Pipeline
              </Badge>
              <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
                Two Tracks. One Pipeline.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Track 1 finds people with the problem (pain-point discovery).
                Track 2 finds people dissatisfied with competitors (intent
                signals). Both sweep the same sources — Reddit, HN, GitHub,
                Twitter, Product Hunt — but with different query strategies.
                Leads merge into a single scored pipeline.
              </p>
            </div>
            <PipelineDiagram />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid divide-x divide-border/50 text-center sm:grid-cols-3">
            {[
              { value: "2", label: "Discovery Tracks" },
              { value: "10K+", label: "Users Identified" },
              { value: "100%", label: "Autonomous" },
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
              <Button size="lg" className="w-full sm:w-auto">
                Get Early Access
                <ArrowRight className="size-4" />
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
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 text-sm text-muted-foreground">
          <span className="font-heading">OpenCorp</span>
          <span>Built for builders who need users</span>
        </div>
      </footer>
    </>
  );
}
