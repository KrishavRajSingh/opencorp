"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Search,
  Users,
  BarChart3,
  SendHorizonal,
  MessageSquare,
  Sparkles,
  Target,
  Volume2,
  VolumeX,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HNIcon } from "@/components/dashboard/hn-icon";
import { MarketingShell } from "@/components/marketing-shell";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

const DEMO_VIDEO_SRC = "https://files.catbox.moe/sqrtf7.mp4";

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

function DemoVideo({ onClose }: { onClose?: () => void }) {
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 shadow-[0_30px_60px_-15px_oklch(0_0_0_/_0.5),0_0_0_1px_oklch(0.72_0.15_75_/_0.06)] backdrop-blur-sm">
      <div className="flex items-center gap-3 border-b border-border/40 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-500/70" />
          <span className="size-2.5 rounded-full bg-yellow-500/70" />
          <span className="size-2.5 rounded-full bg-green-500/70" />
        </span>
        <span className="text-xs text-muted-foreground">opencorp.ai/demo</span>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-brand">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
          </span>
          Live demo
        </div>
      </div>
      <div className="relative">
        <video
          ref={videoRef}
          src={DEMO_VIDEO_SRC}
          autoPlay
          muted={muted}
          loop
          playsInline
          preload="metadata"
          className="aspect-video w-full bg-black"
        />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close demo"
            className="absolute top-3 right-3 z-10 inline-flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <XIcon className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute demo" : "Mute demo"}
          className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          {muted ? (
            <VolumeX className="size-3.5" />
          ) : (
            <Volume2 className="size-3.5" />
          )}
          {muted ? "Tap for sound" : "Sound on"}
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const [showDemo, setShowDemo] = useState(false);

  const toggleDemo = (location: "hero" | "footer") => {
    const willShow = !showDemo;
    setShowDemo(willShow);
    trackEvent({ name: "cta_watch_demo", data: { location } });
    if (location === "footer" && willShow) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <MarketingShell>
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
              <Button
                size="lg"
                className="w-full sm:w-auto"
                asChild
                onClick={() =>
                  trackEvent({ name: "cta_open_dashboard", data: { location: "hero" } })
                }
              >
                <Link href="/dashboard">
                  Open Dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => toggleDemo("hero")}
              >
                {showDemo ? (
                  <>
                    <XIcon className="size-4" />
                    Hide demo
                  </>
                ) : (
                  <>
                    <Play className="size-4" />
                    Watch Demo
                  </>
                )}
              </Button>
            </div>
          </motion.div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={showDemo ? "video" : "input"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-16 w-full max-w-lg"
            >
              {showDemo ? (
                <DemoVideo onClose={() => setShowDemo(false)} />
              ) : (
                <InteractiveInput />
              )}
            </motion.div>
          </AnimatePresence>
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
              <Button
                size="lg"
                className="w-full sm:w-auto"
                asChild
                onClick={() =>
                  trackEvent({ name: "cta_open_dashboard", data: { location: "footer" } })
                }
              >
                <Link href="/dashboard">
                  Open Dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => toggleDemo("footer")}
              >
                {showDemo ? (
                  <>
                    <XIcon className="size-4" />
                    Hide demo
                  </>
                ) : (
                  <>
                    <Play className="size-4" />
                    Watch Demo
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

      </main>
    </MarketingShell>
  );
}
