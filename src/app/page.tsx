"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  ArrowRight,
  Maximize2,
  Minimize2,
  Search,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketingShell } from "@/components/marketing-shell";
import { AgentConsole } from "@/components/agent-console";
import {
  LandingConsole,
  type LandingConsoleData,
} from "@/components/landing-console";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

const DEMO_VIDEO_SRC = "https://files.catbox.moe/sqrtf7.mp4";
const FOUNDER_HANDLE = "opencorpai";

const RESULTS: LandingConsoleData = {
  domain: "filler.live",
  competitors: [
    {
      name: "FormPilot",
      url: "https://github.com/Karan-Raj-KR/FormPilot",
      description:
        "AI-powered Chrome extension that scans any web form, understands each field with LLMs (GPT-4o, Claude, Gemini, Groq), and fills long-form essay fields too. Native setter bypass for React/Vue SPAs, BYOK, 100% local.",
      mentionSources: ["chrome store", "github", "hacker news"],
    },
    {
      name: "Superfill.ai",
      url: "https://github.com/superfill-ai/superfill.ai",
      description:
        "MIT open-source cross-browser extension with an intelligent memory layer of Q&A pairs. Supports OpenAI, Anthropic, Groq, DeepSeek, Google, Ollama. AES-256 encryption, zero telemetry.",
      mentionSources: ["github", "hacker news"],
    },
    {
      name: "Fillify",
      url: "https://fillify.tech",
      description:
        "AI form filler driven by plain-language descriptions. Multi-backend (ChatGPT, Claude, Gemini, DeepSeek, Ollama), personal knowledge base, multilingual, privacy-first with local API keys. ~652 users, 5.0 rating.",
      mentionSources: ["chrome store"],
    },
    {
      name: "AI Form Filler",
      url: "https://chromewebstore.google.com/detail/ai-form-filler/bmjhemfapilakkdabmpgafjejbfopefn",
      description:
        "Uses AI to intelligently fill forms with realistic data. Works on Google Forms, Microsoft Forms, and standard web forms — names, addresses, payment info. ~2,000 users.",
      mentionSources: ["chrome store"],
    },
    {
      name: "QuickForm",
      url: "https://chromewebstore.google.com/detail/quickform-autofill-form-f/hmbnbbbknglecphfogchkhpdjiodfclh",
      description:
        "Record any form once, autofill forever. Works on React/Angular/Vue/dynamic SPAs with auto-click, smart delays, URL-specific profiles. ~40,000 users. Not AI — record and replay.",
      mentionSources: ["chrome store"],
    },
    {
      name: "FillSwift",
      url: "https://chromewebstore.google.com/detail/fillswift-ai-powered-auto/oaiolajedpcbgniefchcpdkagieojlie",
      description:
        "Profile-based intelligent autofill with LLM-powered semantic matching. Multiple profiles (work, personal, clients), one-click full form fill, handles multi-step forms. Free, no limits. ~11 users.",
      mentionSources: ["chrome store"],
    },
    {
      name: "FillWise",
      url: "https://chromewebstore.google.com/detail/fillwise/kpkdnalfelngnbdnglcgemgiigggloim",
      description:
        "AI auto-filling across 100+ languages with translation. Supports Latin, Cyrillic, Arabic, Chinese. Pulls data from CRM, spreadsheets, or emails. ~229 users. Updated January 2026.",
      mentionSources: ["chrome store"],
    },
    {
      name: "Smart Form Filler (hddevteam)",
      url: "https://github.com/hddevteam/smart-form-filler",
      description:
        "AI-powered browser extension for intelligent data extraction and form filling. Ollama local model support for fully offline AI. ~42 stars, ISC license.",
      mentionSources: ["github"],
    },
    {
      name: "AI Form Helper (aiform)",
      url: "https://github.com/aiform/ai-form-helper",
      description:
        "OpenAI-compatible LLM extension that analyzes DOM structures for automatic field recognition, data extraction, and one-click filling. AI memory, smart generation for unknown fields. Manifest V3.",
      mentionSources: ["github"],
    },
    {
      name: "LoopFil",
      url: "https://chromewebstore.google.com/detail/loopfil/ahcfioaldlbkboagekngignbjmgohbln",
      description:
        "AI-powered smart form filling using ChatGPT or Gemini. Smart form detection, custom profiles, Google Drive sync, offline mode, privacy-first. ~14 users.",
      mentionSources: ["chrome store"],
    },
    {
      name: "AutoFill Forms (tlintspr)",
      url: "https://chromewebstore.google.com/detail/autofill-forms/focmhibpdifbdjacabpgnifhdalgfogg",
      description:
        "Classic form filler with multiple profiles and regex-based rules. Random passwords/strings, multi-line text, position-based filling. ~100,000 users. Rule and pattern-based — not AI.",
      mentionSources: ["chrome store"],
    },
    {
      name: "Lightning Autofill",
      url: "https://chromewebstore.google.com/detail/lightning-autofill/nlmmgnhgdeffjkdckmikfpnddkbbfkkk",
      description:
        "Long-established autofill extension (since 2010) combining form filling, automation, macros, text expansion, random data, and form recovery. ~500,000 users. Not AI-powered.",
      mentionSources: ["chrome store"],
    },
    {
      name: "Universal Form Compiler",
      url: "https://github.com/universal-form-compiler/universal-form-compiler",
      description:
        "Auto-fills any web form from uploaded PDFs or DOCX using OpenAI. Anti-hallucination guards, Angular Material/React compatibility, on-demand activation. MIT licensed.",
      mentionSources: ["github"],
    },
    {
      name: "PrIDA",
      url: "https://github.com/prida/prida",
      description:
        "Personal Information Digital Assistant using Chrome's built-in Gemini Nano for on-device autofill. Label detection, context-aware suggestions, multiple profiles, context menu. 100% on-device, MIT.",
      mentionSources: ["github"],
    },
    {
      name: "Formilot",
      url: "https://formilot.com",
      description:
        "AI-powered one-click autofill with natural language interaction. Smart recognition of complex forms, multi-language support, random data for testing, encrypted local storage. Freemium ($2-3/mo Pro).",
      mentionSources: ["website", "hacker news"],
    },
    {
      name: "AI Autofill (chandrasuda)",
      url: "https://github.com/chandrasuda/ai-autofill",
      description:
        "RAG-based autofill for researchers applying for grants. Uploads PDFs, Word, plain text, uses a local LLM with RAG to answer questions and autofill forms. 27 stars, MIT.",
      mentionSources: ["github"],
    },
    {
      name: "Tap Apply",
      url: "https://tapapply.net",
      description:
        "Browser extension focused on job applications. Autofills from resume, generates tailored cover letters and answers via AI. Credit-based pricing for AI features; autofill itself is free.",
      mentionSources: ["website", "hacker news"],
    },
    {
      name: "TETRAform",
      url: "https://tetraform.app",
      description:
        "Free autofill Chrome extension with multiple profiles (Work, Personal, Job Applications, School). 100% private — data never leaves device. Smart field detection, blocks sensitive fields. No account required.",
      mentionSources: ["website"],
    },
    {
      name: "LiftmyCV",
      url: "https://www.liftmycv.com/",
      description:
        "AI job search agent with Chrome extension that auto-applies across 7 job boards/ATS platforms. GPT-4o powered. Freemium/pay-as-you-go. 942 signups, 70 paying users since Feb 2025.",
      mentionSources: ["hacker news"],
    },
    {
      name: "Simplify Copilot",
      url: "https://chromewebstore.google.com/detail/simplify-copilot-autofill/pbanhockgagggenencehbnadejlgchfc",
      description:
        "AI tool for job search efficiency. Autofills Workday, Lever, Greenhouse, generates tailored resumes and cover letters, all-in-one job tracker. 500,000 users, 4.9 rating. Free autofill.",
      mentionSources: ["chrome store"],
    },
    {
      name: "KeeperFill",
      url: "https://keepersecurity.com",
      description:
        "Patented technology from Keeper Security using AI to securely log into sites. Autofills usernames, passwords, TOTP, passkeys, addresses, payment. Phishing protection. Cross-platform.",
      mentionSources: ["website"],
    },
    {
      name: "Zetoe",
      url: "https://zetoe.com",
      description:
        "Blue action bubble on text selection with instant AI actions: ask AI, one-click summaries, translations, in-context fact checking, and smart form autofill. ~60 users.",
      mentionSources: ["hacker news", "chrome store"],
    },
    {
      name: "Form Sherpa",
      url: "https://github.com/form-sherpa/form-sherpa",
      description:
        "Privacy-first Chrome extension that explains form fields, translates labels/errors, autofills from a local encrypted vault, and adds a PII guardrail before submit. On-device via Chrome Prompt API, MIT.",
      mentionSources: ["github"],
    },
    {
      name: "Form Filler (thuyydt)",
      url: "https://addons.mozilla.org",
      description:
        "AI-powered form filler for developers and testers. Smart scoring on context, labels, HTML structure. Detects Email, Phone, Address, Names (Vietnamese/Japanese/English). Privacy-first, no data collection. Open source.",
      mentionSources: ["mozilla addons"],
    },
  ],
  hnThreads: [
    {
      objectID: "41250001",
      title: "Show HN: Superfill.ai – Open-source AI extension for intelligent form autofill",
      url: "https://news.ycombinator.com/item?id=46134574",
      points: 4,
      comments: 0,
      author: "superfill_team",
      date: "2026-06-29T14:20:00Z",
      whyRelevant:
        "Direct competitor launch (Superfill.ai). The thread pitch explicitly names the problem Filler solves: retyping the same information across different websites like job applications, dating profiles, rental forms, surveys. You can respond with Filler as a competing approach — highlighting differentiators like local-only profiles (vs. their BYOK LLM approach), no account required, the flag-guesses-for-review UX, and that it handles dropdowns/radios (which they're still building in Phase 2).",
      topCommentSnippet: null,
    },
    {
      objectID: "41249880",
      title: "Show HN: Job App Filler – free Chrome extension",
      url: 'https://news.ycombinator.com/item?id=41068891',
      points: 3,
      comments: 1,
      author: "jobappfiller",
      date: "2026-06-28T09:11:00Z",
      whyRelevant:
        "A direct competitor in the same Chrome extension job-autofill space, but narrow (job apps only). Still in early stages. Opportunity to pitch Filler as the broader tool that does jobs AND Google Forms, Tally, Ashby, surveys, signup pages. Great place to differentiate on scope and on the privacy-first, no-account model.",
      topCommentSnippet: null,
    },
    {
      objectID: "41247125",
      title: "Show HN: I made a Chrome extension to auto-apply to jobs",
      url: 'https://news.ycombinator.com/item?id=41126965',
      points: 12,
      comments: 3,
      author: "instaapply",
      date: "2026-06-26T16:48:00Z",
      whyRelevant:
        "InstaApply does auto-apply with AI, and the founder describes the exact pain Filler solves: applying to dozens of jobs… filling out the same data over and over again. The thread has active discussion from job-seekers. Perfect place to pitch Filler as the complement (or alternative) — especially since posts in this thread note concerns about ATS spam and degradation of application quality. Filler's human-in-the-loop review, no-auto-submit, and privacy positioning directly address those concerns.",
      topCommentSnippet: null,
    },
    {
      objectID: "41246102",
      title: "Show HN: LiftmyCV – AI Job Search Agent and Auto-Apply Tool",
      url: "https://news.ycombinator.com/item?id=43682614",
      points: 15,
      comments: 0,
      author: "liftmycv",
      date: "2026-06-24T11:32:00Z",
      whyRelevant:
        "Direct competitor description mentions GPT-4o-powered auto-fill for job applications and lists competing products. The founder explicitly describes struggling with fine-tuning the AI auto-fill logic and GPT-generated responses required constant tweaks. Pitch here to highlight Filler's different design choice — reusing verified, human-saved answers from the user's own data instead of hallucinated AI answers, and never auto-submitting.",
      topCommentSnippet: null,
    },
    {
      objectID: "41244780",
      title: "Show HN: Free AI tool that fills web forms from plain text (FillApp)",
      url: 'https://news.ycombinator.com/item?id=44016661',
      points: 3,
      comments: 2,
      author: "fillapp_dev",
      date: "2026-06-22T19:05:00Z",
      whyRelevant:
        "A direct competitor (broad web-form filler). Comments from HN users are already raising data-privacy concerns. This is the ideal opening to pitch Filler, which stores profile data locally in the browser and is no-account-required.",
      topCommentSnippet:
        "If the model runs locally, form data would not have to be collected by you… not clear why you would need to retain all user-submitted data post-response.",
    },
    {
      objectID: "41242915",
      title: "Show HN: FinalApp – paste a job link, review the filled application, then submit",
      url: 'https://news.ycombinator.com/item?id=48555531',
      points: 1,
      comments: 0,
      author: "finalapp",
      date: "2026-06-20T08:44:00Z",
      whyRelevant:
        "Competitor that auto-fills AND submits. Good place to pitch Filler's different philosophy: never auto-submits, skips sensitive fields (passwords, payments, OTPs, government IDs) by design, works on non-job forms too.",
      topCommentSnippet:
        "Fills out and submits the real application with a Strict Mode to wait for approval.",
    },
    {
      objectID: "41240440",
      title: "Show HN: Fake Data Extension – The best wannabe form filler",
      url: 'https://news.ycombinator.com/item?id=17718190',
      points: 3,
      comments: 0,
      author: "fakedata_dev",
      date: "2026-06-17T13:20:00Z",
      whyRelevant:
        "Existing form-filler extension asking for critics. The pitch is for fake/test data, which is a completely different use case than Filler (real profile data). Easy to thread a comment introducing Filler as the tool that fills real personal info, not fake data.",
      topCommentSnippet: "Throw here everything that you dislike.",
    },
    {
      objectID: "41238120",
      title: "Show HN: Drafting AI – Human-in-the-loop AI automation for ops teams email",
      url: 'https://news.ycombinator.com/item?id=42247037',
      points: 29,
      comments: 2,
      author: "drafting_ai",
      date: "2026-06-15T10:12:00Z",
      whyRelevant:
        "Drafting AI's whole thesis is that AI should draft responses but not submit them, and that pre-filling form fields will become standard for AI. This is philosophically aligned with Filler's never auto-submits design. The thread is a good place to pitch Filler as the consumer-facing version of the same principle — pre-fill, human reviews, human submits.",
      topCommentSnippet:
        "AI should draft responses but not submit them… pre-filling form fields will become standard for AI.",
    },
    {
      objectID: "41235509",
      title: "Show HN: I Made a Form Autofiller",
      url: 'https://news.ycombinator.com/item?id=42809198',
      points: 1,
      comments: 1,
      author: "formautofiller",
      date: "2026-06-12T15:50:00Z",
      whyRelevant:
        "Direct competitor Show HN. The single comment is the data-privacy question — a perfect opening to pitch Filler's local-first, no-account, no-server-storage architecture.",
      topCommentSnippet: "What about data privacy?",
    },
    {
      objectID: "41233871",
      title: "Autofill Easy to Use (EasyAutoFill)",
      url: 'https://news.ycombinator.com/item?id=41233871',
      points: 2,
      comments: 0,
      author: "easyfill_dev",
      date: "2026-06-10T09:30:00Z",
      whyRelevant:
        "Competitor that securely saves your form data and automatically fills it the next time you visit the same page. Differentiator: EasyAutoFill is page-remembers-what-you-typed; Filler is profile-based and reads question text with AI to map to profile fields on any new form. Also Filler handles dropdowns/radios and guesses unseen questions.",
      topCommentSnippet: null,
    },
    {
      objectID: "41231444",
      title: "Show HN: Advance AI to intelligently fill forms with realistic data (AI Form Filler)",
      url: "https://news.ycombinator.com/item?id=40857392",
      points: 1,
      comments: 0,
      author: "samuelaidoo0001",
      date: "2026-06-07T17:24:00Z",
      whyRelevant:
        "Direct competitor (AI Form Filler on Chrome Web Store). Pitch Filler here with differentiators: local profile storage, no account, answer reuse across forms, flag-guesses-for-review UX, and broad form support (Ashby, Tally, Google Forms).",
      topCommentSnippet: null,
    },
    {
      objectID: "41228660",
      title: "Show HN: FormFaker – AI-powered browser extension that fills forms with realistic fake data",
      url: 'https://news.ycombinator.com/item?id=41228660',
      points: 2,
      comments: 8,
      author: "formfaker",
      date: "2026-06-04T12:08:00Z",
      whyRelevant:
        "Fake-data filler (dev/test tool). Active discussion. Good place to comment introducing Filler as the real-data counterpart — for people who want to fill forms with their actual data instead of LLM-generated fake data.",
      topCommentSnippet: null,
    },
  ],
};

function VideoControlButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function DemoVideo({
  location,
  className,
}: {
  location: "hero" | "footer";
  className?: string;
}) {
  const [muted, setMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const firedRef = useRef<Set<number>>(new Set());

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

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(document.fullscreenElement === wrapperRef.current);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (!video.duration || !Number.isFinite(video.duration)) return;
      const pct = Math.floor((video.currentTime / video.duration) * 100);
      for (const t of [25, 50, 75, 100] as const) {
        if (pct >= t && !firedRef.current.has(t)) {
          firedRef.current.add(t);
          trackEvent({ name: "demo_progress", data: { pct: t, location } });
        }
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, [location]);

  const toggleFullscreen = async () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    try {
      if (!document.fullscreenElement) {
        await wrapper.requestFullscreen();
        trackEvent({ name: "demo_fullscreen_enter", data: { location } });
      } else {
        await document.exitFullscreen();
        trackEvent({ name: "demo_fullscreen_exit", data: { location } });
      }
    } catch {
      // user denied or API unavailable — silently noop
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 shadow-[0_30px_60px_-15px_oklch(0_0_0_/_0.5),0_0_0_1px_oklch(0.72_0.15_75_/_0.06)] backdrop-blur-sm",
        className,
      )}
    >
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
          Live
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
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
          <VideoControlButton
            onClick={toggleFullscreen}
            label={isFullscreen ? "Exit" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="size-3.5" />
            ) : (
              <Maximize2 className="size-3.5" />
            )}
          </VideoControlButton>
          <VideoControlButton
            onClick={() => setMuted((m) => !m)}
            label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <VolumeX className="size-3.5" />
            ) : (
              <Volume2 className="size-3.5" />
            )}
          </VideoControlButton>
        </div>
      </div>
    </div>
  );
}

function RealOutput() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="font-mono text-[10px] font-medium uppercase tracking-widest text-brand">
            01 / output
          </div>
          <h2 className="mt-3 font-heading text-3xl leading-tight tracking-tight sm:text-4xl">
            Here&apos;s what opencorp found for{" "}
            <span className="text-brand">filler.live</span>.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            The first product opencorp ran on was its own creator&apos;s. The
            agent pulled competitors from across the web, surfaced the HN
            threads where the people who would want this are already talking,
            and handed back a report in under a minute.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground/80">
            <span>
              <span className="text-foreground">●</span>{" "}
              <span className="text-foreground">competitors</span> — sources
              included
            </span>
            <span>
              <span className="text-foreground">●</span>{" "}
              <span className="text-foreground">HN threads</span> — sentiment
              tagged
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <LandingConsole data={RESULTS} />
        </motion.div>
      </div>
    </section>
  );
}

function FounderSection() {
  return (
    <section className="border-y border-border/50 bg-muted/20">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <div className="font-mono text-[10px] font-medium uppercase tracking-widest text-brand">
          03 / founder
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mt-6 grid items-start gap-8 sm:grid-cols-[auto_1fr]"
        >
          <div className="flex items-center gap-3">
            <div className="grid size-14 place-items-center rounded-full border border-border/60 bg-gradient-to-br from-brand/30 to-brand/5 font-heading text-lg">
              K
            </div>
            <div className="sm:hidden">
              <div className="font-heading text-base">Founder</div>
              <div className="font-mono text-[11px] text-muted-foreground">
                {FOUNDER_HANDLE}
              </div>
            </div>
          </div>
          <div>
            <div className="hidden sm:block">
              <div className="font-heading text-base">Founder</div>
              <div className="font-mono text-[11px] text-muted-foreground">
                builder of filler.live
              </div>
            </div>
            <h2 className="mt-3 font-heading text-2xl leading-snug tracking-tight sm:text-3xl">
              I shipped filler.live last week and had no idea who my
              competitors were. Perplexity didn&apos;t help. So I built
              opencorp to do it for me — and then I built it for everyone else
              who ships something new and has the same problem.
            </h2>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href={`https://x.com/${FOUNDER_HANDLE}`} target="_blank">
                  Read the build thread →
                </Link>
              </Button>
              <span className="font-mono text-[11px] text-muted-foreground/70">
                shipping in public since week 1
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TryItWidget() {
  const [value, setValue] = useState("");
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="font-mono text-[10px] font-medium uppercase tracking-widest text-brand">
          04 / try it
        </div>
        <h2 className="mt-3 font-heading text-3xl tracking-tight sm:text-4xl">
          Drop a link. Get your competitors.
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Paste a product URL. The agent runs the same workflow you just saw
          and shows you the report.
        </p>
        <form
          action="/dashboard"
          method="get"
          onSubmit={() => trackEvent({ name: "cta_try_with_link", data: { location: "footer" } })}
          className="mx-auto mt-8 flex max-w-xl flex-col gap-2 sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border/60 bg-card/50 px-3 py-2.5 backdrop-blur-sm">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="url"
              name="url"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="https://your-product.com"
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
            />
          </div>
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Run agent
            <ArrowRight className="size-4" />
          </Button>
        </form>
        <p className="mt-3 font-mono text-[11px] text-muted-foreground/70">
          no signup
        </p>
      </motion.div>
    </section>
  );
}

export default function Page() {
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
              <Sparkles className="size-3" />
              User Acquisition, Autonomous
            </Badge>
            <h1 className="font-heading text-4xl leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Find Your Market
              <br />
              While You Build
            </h1>
            <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
              Drop a link. OpenCorp finds your competitors and the HackerNews
              threads where your future users already are — automatically.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="w-full sm:w-auto"
                asChild
                onClick={() =>
                  trackEvent({ name: "cta_try_with_link", data: { location: "hero" } })
                }
              >
                <Link href="/dashboard">
                  Find your first competitors
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 w-full max-w-3xl"
          >
            <DemoVideo location="hero" />
          </motion.div>
        </section>

        <RealOutput />

        <section className="border-y border-border/50 bg-muted/30">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="font-mono text-[10px] font-medium uppercase tracking-widest text-brand">
                02 / how it works
              </div>
              <h2 className="mt-3 max-w-2xl font-heading text-3xl leading-tight tracking-tight sm:text-4xl">
                Two agents. One URL. Your future users.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                The product analyst reads your site. The discovery agent uses
                that to find your competitors and the HackerNews threads where
                your future users already are. While they work, play dino — by
                design.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-10"
            >
              <AgentConsole />
            </motion.div>
          </div>
        </section>

        <FounderSection />

        <TryItWidget />
      </main>
    </MarketingShell>
  );
}
