"use client";

import { motion } from "motion/react";
import {
  ArrowRight,
  Search,
  Users,
  BarChart3,
  SendHorizonal,
  Target,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Search,
    title: "Market Research",
    description:
      "Scans Reddit, HN, Twitter, Product Hunt, and GitHub issues to surface your ideal users and their pain points.",
  },
  {
    icon: Users,
    title: "User Discovery",
    description:
      "Identifies real people talking about the problems you solve. Name, context, sentiment — ready for outreach.",
  },
  {
    icon: BarChart3,
    title: "SEO & Content",
    description:
      "Automates keyword research, competitive analysis, and content strategy to get you found organically.",
  },
  {
    icon: SendHorizonal,
    title: "Outreach Engine",
    description:
      "Crafts personalized messages across channels. Finds decision-makers and opens conversations at scale.",
  },
];

const heroTerminalLines = [
  { text: '> openco:research("AI note-taking app")', delay: 0.2 },
  { text: "  ✓ Scanning Reddit (r/productivity, r/Notion)...", delay: 0.8 },
  { text: "  ✓ Found 89 conversations about pain points", delay: 1.4 },
  { text: "  ✓ Analyzing sentiment and need patterns...", delay: 2.0 },
  { text: "", delay: 2.4 },
  { text: "  Top Pain Points (across 47 users):", delay: 2.6 },
  { text: '    • "Offline sync is broken" — 23 mentions', delay: 3.0 },
  { text: '    • "Can\'t organize by project" — 18 mentions', delay: 3.4 },
  { text: '    • "Too expensive" — 15 mentions', delay: 3.8 },
  { text: "", delay: 4.2 },
  { text: "  ✓ 47 potential users identified — profiles saved", delay: 4.4 },
  { text: "  ✓ Ready for outreach in 3 channels", delay: 5.0 },
];

const pipelineTerminalLines = [
  { text: "> Pipeline: find-users (openco)", delay: 0.2 },
  { text: "  ├─ Source: Reddit — 47 leads found", delay: 0.7 },
  { text: "  ├─ Source: Hacker News — 23 leads found", delay: 1.2 },
  { text: "  ├─ Source: Twitter/X — 89 leads found", delay: 1.7 },
  { text: "  ├─ Source: Product Hunt — 12 leads found", delay: 2.2 },
  { text: "  └─ Source: GitHub Issues — 34 leads found", delay: 2.7 },
  { text: "", delay: 3.1 },
  { text: "  Top user segment identified:", delay: 3.3 },
  { text: '    "Solo devs who switched from Notion to Obsidian"', delay: 3.7 },
  { text: "    → 128 users — high intent, active on Twitter", delay: 4.1 },
  { text: "", delay: 4.5 },
  { text: "  ✓ Generating personalized outreach sequences...", delay: 4.7 },
];

function Nav() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <span className="font-heading text-lg tracking-tight">
          OpenCompany
        </span>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="GitHub"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
          <Button size="sm">Get Early Access</Button>
        </div>
      </div>
    </header>
  );
}

function Terminal({
  lines,
  className,
}: {
  lines: { text: string; delay: number }[];
  className?: string;
}) {
  const lastDelay = lines.length > 0 ? lines[lines.length - 1].delay : 0;
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-black/40 font-mono text-xs leading-relaxed backdrop-blur",
        className
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-border/30 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-red-500/80" />
        <span className="size-2.5 rounded-full bg-yellow-500/80" />
        <span className="size-2.5 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs text-muted-foreground">openco</span>
      </div>
      <div className="space-y-1 p-4">
        {lines.map((line, i) =>
          line.text === "" ? (
            <div key={i} className="h-2" />
          ) : (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: line.delay,
                duration: 0.25,
                ease: "easeOut",
              }}
              className="text-muted-foreground/80 first:text-foreground"
            >
              {line.text}
            </motion.p>
          )
        )}
        <span
          className="inline-block h-4 w-2 animate-blink bg-foreground/70"
          style={{ animationDelay: `${lastDelay + 0.5}s` }}
        />
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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.72_0.14_195_/_0.08),transparent_60%)]" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
          >
            <Badge variant="secondary" className="mb-6">
              Your Autonomous AI Company
            </Badge>
            <h1 className="font-heading text-4xl leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Find Your Users
              <br />
              While You Build
            </h1>
            <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
              OpenCompany does market research, user discovery, SEO, and
              outreach — autonomously. Tell it what you&apos;re building and
              watch it find people who need it.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Button size="lg">
                Get Early Access
                <ArrowRight className="size-4" />
              </Button>
              <Button variant="outline" size="lg">
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Star on GitHub
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 w-full max-w-2xl"
          >
            <Terminal lines={heroTerminalLines} />
          </motion.div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-16 text-center">
            <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
              What It Does
            </h2>
            <p className="mt-4 text-muted-foreground">
              You build. OpenCompany finds the people who need what you make.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <Card key={feature.title} className="h-full">
                <CardHeader>
                  <feature.icon className="size-5 text-brand" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-border/50 bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <Badge variant="secondary" className="mb-4">
                  Multi-Source Pipeline
                </Badge>
                <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
                  Who Needs What You Build?
                </h2>
                <p className="mt-4 text-muted-foreground">
                  OpenCompany sweeps every corner of the internet — Reddit,
                  Twitter, HN, Product Hunt, GitHub issues — and cross-references
                  conversations to find users actively looking for a solution
                  like yours.
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="size-4 text-brand" />
                  <span>Ranked by intent and relevance, not just keywords</span>
                </div>
              </div>
              <div>
                <Terminal lines={pipelineTerminalLines} />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid divide-x divide-border/50 text-center sm:grid-cols-3">
            {[
              { value: "50+", label: "Sources Scanned" },
              { value: "10K+", label: "Users Identified" },
              { value: "100%", label: "Autonomous" },
            ].map((stat, i) => (
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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.72_0.14_195_/_0.08),transparent_60%)]" />
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
              Stop Searching. Start Building.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Tell OpenCompany what you&apos;re working on. It will scan the
              internet, find your users, and hand you a pipeline of people
              ready to try your product.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Button size="lg">
                Get Early Access
                <ArrowRight className="size-4" />
              </Button>
              <Button variant="outline" size="lg">
                <Globe className="size-4" />
                Watch Demo
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 text-sm text-muted-foreground">
          <span className="font-heading">OpenCompany</span>
          <span>Autonomous user acquisition</span>
        </div>
      </footer>
    </>
  );
}
