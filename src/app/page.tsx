"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Search,
  Target,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MarketingShell } from "@/components/marketing-shell";
import {
  LandingConsole,
  type LandingConsoleData,
} from "@/components/landing-console";
import { RedditIcon } from "@/components/dashboard/reddit-icon";
import { HNIcon } from "@/components/dashboard/hn-icon";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

const FOUNDER_HANDLE = "opencorpai";

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 64, filter: "blur(8px)" }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const RESULTS: LandingConsoleData = {
  domain: "filler.live",
  competitors: [
    {
      name: "FormPilot",
      url: "https://github.com/Karan-Raj-KR/FormPilot",
      description:
        "AI-powered Chrome extension that scans any web form, understands each field with LLMs, and fills long-form essay fields. Native setter bypass for React/Vue SPAs, BYOK, 100% local.",
      mentionSources: ["chrome store", "github", "hacker news"],
    },
    {
      name: "Superfill.ai",
      url: "https://github.com/superfill-ai/superfill.ai",
      description:
        "MIT open-source cross-browser extension with an intelligent memory layer of Q&A pairs. Supports OpenAI, Anthropic, Groq, DeepSeek, Google, Ollama.",
      mentionSources: ["github", "hacker news"],
    },
    {
      name: "Fillify",
      url: "https://fillify.tech",
      description:
        "AI form filler driven by plain-language descriptions. Multi-backend, personal knowledge base, multilingual, privacy-first with local API keys.",
      mentionSources: ["chrome store"],
    },
    {
      name: "Tap Apply",
      url: "https://tapapply.net",
      description:
        "Browser extension focused on job applications. Autofills from resume, generates tailored cover letters and answers via AI.",
      mentionSources: ["website", "hacker news"],
    },
    {
      name: "Simplify Copilot",
      url: "https://chromewebstore.google.com/detail/simplify-copilot-autofill/pbanhockgagggenencehbnadejlgchfc",
      description:
        "AI tool for job search efficiency. Autofills Workday, Lever, Greenhouse; generates tailored resumes and cover letters.",
      mentionSources: ["chrome store"],
    },
    {
      name: "Formilot",
      url: "https://formilot.com",
      description:
        "AI-powered one-click autofill with natural language interaction. Smart recognition of complex forms, multi-language support.",
      mentionSources: ["website", "hacker news"],
    },
    {
      name: "Form Sherpa",
      url: "https://github.com/form-sherpa/form-sherpa",
      description:
        "Privacy-first Chrome extension that explains form fields, translates labels, and autofills from a local encrypted vault.",
      mentionSources: ["github"],
    },
    {
      name: "Lightning Autofill",
      url: "https://chromewebstore.google.com/detail/lightning-autofill/nlmmgnhgdeffjkdckmikfpnddkbbfkkk",
      description:
        "Long-established autofill extension combining form filling, automation, macros, text expansion, and form recovery.",
      mentionSources: ["chrome store"],
    },
  ],
  redditThreads: [
    {
      id: "1abc001",
      sub: "productivity",
      title:
        "Tired of retyping the same info on every job application / signup form?",
      link: "https://www.reddit.com/r/productivity/comments/example1",
      author: "form_fatigue",
      score: 142,
      num_comments: 67,
      whyRelevant:
        "Core pain Filler solves — people describing the exact retype loop across sites.",
      isExample: true,
    },
    {
      id: "1abc002",
      sub: "jobs",
      title:
        "Anyone else spending more time filling ATS forms than writing the resume?",
      link: "https://www.reddit.com/r/jobs/comments/example2",
      author: "ats_hater",
      score: 318,
      num_comments: 124,
      whyRelevant:
        "High-engagement job-seeker thread. Natural place to show a privacy-first autofill.",
      isExample: true,
    },
    {
      id: "1abc003",
      sub: "chrome_extensions",
      title: "Best form autofill extensions that don't phone home?",
      link: "https://www.reddit.com/r/chrome_extensions/comments/example3",
      author: "privacy_first",
      score: 89,
      num_comments: 41,
      whyRelevant:
        "Buyers comparing tools on privacy — local-only storage is the differentiator.",
      isExample: true,
    },
    {
      id: "1abc004",
      sub: "webdev",
      title: "Why do every SPA form break my browser autofill?",
      link: "https://www.reddit.com/r/webdev/comments/example4",
      author: "react_dev",
      score: 204,
      num_comments: 93,
      whyRelevant:
        "Technical audience hitting React/Vue controlled inputs — Filler's target surface.",
      isExample: true,
    },
    {
      id: "1abc005",
      sub: "SaaS",
      title: "How do you find early users without cold email spam?",
      link: "https://www.reddit.com/r/SaaS/comments/example5",
      author: "indie_hacker",
      score: 156,
      num_comments: 78,
      whyRelevant:
        "Founders looking for warm conversations — same loop OpenCorp is built for.",
      isExample: true,
    },
    {
      id: "1abc006",
      sub: "cscareerquestions",
      title: "Greenhouse / Lever applications are soul-crushing. Alternatives?",
      link: "https://www.reddit.com/r/cscareerquestions/comments/example6",
      author: "new_grad_22",
      score: 412,
      num_comments: 201,
      whyRelevant:
        "Massive thread on the exact form types Filler maps to real profile answers.",
      isExample: true,
    },
    {
      id: "1abc007",
      sub: "privacy",
      title: "Do AI form fillers send my personal data to the cloud?",
      link: "https://www.reddit.com/r/privacy/comments/example7",
      author: "no_telemetry",
      score: 97,
      num_comments: 54,
      whyRelevant:
        "Privacy-minded users actively rejecting cloud autofill — perfect pitch surface.",
      isExample: true,
    },
    {
      id: "1abc008",
      sub: "Entrepreneur",
      title: "Just shipped my first extension. Where do I talk to real users?",
      link: "https://www.reddit.com/r/Entrepreneur/comments/example8",
      author: "shipped_it",
      score: 63,
      num_comments: 39,
      whyRelevant:
        "Meta-thread about finding buyers in communities — OpenCorp's own use case.",
      isExample: true,
    },
    {
      id: "1abc009",
      sub: "selfhosted",
      title: "Looking for local-only password + form tools (no account required)",
      link: "https://www.reddit.com/r/selfhosted/comments/example9",
      author: "homelab_user",
      score: 71,
      num_comments: 28,
      whyRelevant:
        "No-account, local-first buyers — aligns with Filler's architecture.",
      isExample: true,
    },
    {
      id: "1abc010",
      sub: "experienceddevs",
      title: "What do you use to stop retyping company history on every form?",
      link: "https://www.reddit.com/r/experienceddevs/comments/example10",
      author: "senior_eng",
      score: 188,
      num_comments: 96,
      whyRelevant:
        "Practitioners comparing profile-based vs AI-generated answers.",
      isExample: true,
    },
  ],
  hnThreads: [
    {
      objectID: "41250001",
      title:
        "Show HN: Superfill.ai – Open-source AI extension for intelligent form autofill",
      url: "https://news.ycombinator.com/item?id=46134574",
      points: 4,
      comments: 0,
      author: "superfill_team",
      date: "2026-06-29T14:20:00Z",
      whyRelevant:
        "Direct competitor launch. Thread names the retype problem Filler solves — job apps, surveys, rentals.",
      topCommentSnippet: null,
    },
    {
      objectID: "41249880",
      title: "Show HN: Job App Filler – free Chrome extension",
      url: "https://news.ycombinator.com/item?id=41068891",
      points: 3,
      comments: 1,
      author: "jobappfiller",
      date: "2026-06-28T09:11:00Z",
      whyRelevant:
        "Narrow job-only autofill. Room to pitch broader form support + privacy-first model.",
      topCommentSnippet: null,
    },
    {
      objectID: "41247125",
      title: "Show HN: I made a Chrome extension to auto-apply to jobs",
      url: "https://news.ycombinator.com/item?id=41126965",
      points: 12,
      comments: 3,
      author: "instaapply",
      date: "2026-06-26T16:48:00Z",
      whyRelevant:
        "Founder describes filling the same data over and over. Active job-seeker discussion.",
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
        "GPT auto-fill competitor. Pitch verified human-saved answers instead of hallucinated fields.",
      topCommentSnippet: null,
    },
    {
      objectID: "41244780",
      title:
        "Show HN: Free AI tool that fills web forms from plain text (FillApp)",
      url: "https://news.ycombinator.com/item?id=44016661",
      points: 3,
      comments: 2,
      author: "fillapp_dev",
      date: "2026-06-22T19:05:00Z",
      whyRelevant:
        "Comments already raise data-privacy concerns — opening for local-only storage.",
      topCommentSnippet:
        "If the model runs locally, form data would not have to be collected by you…",
    },
    {
      objectID: "41242915",
      title:
        "Show HN: FinalApp – paste a job link, review the filled application, then submit",
      url: "https://news.ycombinator.com/item?id=48555531",
      points: 1,
      comments: 0,
      author: "finalapp",
      date: "2026-06-20T08:44:00Z",
      whyRelevant:
        "Auto-fills and submits. Contrast with never-auto-submit, skip-sensitive-fields design.",
      topCommentSnippet: null,
    },
    {
      objectID: "41240440",
      title: "Show HN: Fake Data Extension – The best wannabe form filler",
      url: "https://news.ycombinator.com/item?id=17718190",
      points: 3,
      comments: 0,
      author: "fakedata_dev",
      date: "2026-06-17T13:20:00Z",
      whyRelevant:
        "Fake/test data tool — easy contrast with real profile data for real forms.",
      topCommentSnippet: "Throw here everything that you dislike.",
    },
    {
      objectID: "41238120",
      title:
        "Show HN: Drafting AI – Human-in-the-loop AI automation for ops teams email",
      url: "https://news.ycombinator.com/item?id=42247037",
      points: 29,
      comments: 2,
      author: "drafting_ai",
      date: "2026-06-15T10:12:00Z",
      whyRelevant:
        "Thesis: AI drafts, humans submit. Philosophically aligned with pre-fill + review.",
      topCommentSnippet:
        "AI should draft responses but not submit them… pre-filling form fields will become standard.",
    },
    {
      objectID: "41235509",
      title: "Show HN: I Made a Form Autofiller",
      url: "https://news.ycombinator.com/item?id=42809198",
      points: 1,
      comments: 1,
      author: "formautofiller",
      date: "2026-06-12T15:50:00Z",
      whyRelevant:
        "Direct competitor Show HN. Single comment is the privacy question.",
      topCommentSnippet: "What about data privacy?",
    },
    {
      objectID: "41233871",
      title: "Autofill Easy to Use (EasyAutoFill)",
      url: "https://news.ycombinator.com/item?id=41233871",
      points: 2,
      comments: 0,
      author: "easyfill_dev",
      date: "2026-06-10T09:30:00Z",
      whyRelevant:
        "Page-remembers-what-you-typed vs profile-based AI mapping on any new form.",
      topCommentSnippet: null,
    },
    {
      objectID: "41231444",
      title:
        "Show HN: Advance AI to intelligently fill forms with realistic data (AI Form Filler)",
      url: "https://news.ycombinator.com/item?id=40857392",
      points: 1,
      comments: 0,
      author: "samuelaidoo0001",
      date: "2026-06-07T17:24:00Z",
      whyRelevant:
        "Chrome store competitor. Differentiate on local profile storage and no account.",
      topCommentSnippet: null,
    },
    {
      objectID: "41228660",
      title:
        "Show HN: FormFaker – AI-powered browser extension that fills forms with realistic fake data",
      url: "https://news.ycombinator.com/item?id=41228660",
      points: 2,
      comments: 8,
      author: "formfaker",
      date: "2026-06-04T12:08:00Z",
      whyRelevant:
        "Fake-data filler with active discussion. Introduce real-data counterpart.",
      topCommentSnippet: null,
    },
  ],
};

function UrlCtaForm({ location }: { location: "hero" | "footer" }) {
  const [value, setValue] = useState("");
  return (
    <form
      action="/dashboard"
      method="get"
      onSubmit={(e) => {
        const input = e.currentTarget.elements.namedItem(
          "url",
        ) as HTMLInputElement;
        const v = input.value.trim();
        if (v && !/^https?:\/\//i.test(v)) {
          input.value = `https://${v}`;
        }
        trackEvent({ name: "cta_try_with_link", data: { location } });
      }}
      className="mx-auto flex w-full max-w-xl flex-col gap-2 sm:flex-row"
    >
      <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 shadow-[0_4px_20px_-12px_rgba(16,19,26,0.15)] transition-colors focus-within:border-signal">
        <Search className="size-4 shrink-0 text-ink-soft" />
        <input
          type="text"
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          name="url"
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="your-product.com"
          className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/60"
        />
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Find my users
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

function RadarPin({
  dot,
  label,
  sub,
  className,
}: {
  dot: string;
  label: string;
  sub: string;
  className?: string;
}) {
  return (
    <div className={cn("absolute flex items-start gap-2", className)}>
      <span className="relative mt-0.5 grid size-2.5 place-items-center">
        <span
          className="absolute inset-0 animate-ping rounded-full"
          style={{ background: dot, opacity: 0.35 }}
        />
        <span
          className="relative size-2 rounded-full ring-2 ring-panel"
          style={{ background: dot }}
        />
      </span>
      <div className="font-mono text-xs leading-tight text-ink-soft">
        <div className="font-medium text-ink">{label}</div>
        <div>{sub}</div>
      </div>
    </div>
  );
}

function Radar() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px] overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_32px_90px_-48px_rgba(16,19,26,0.45)]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(16,19,26,0.14) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute left-4 top-4 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
        Scanning 3 channels
      </div>
      <div className="absolute right-4 top-4 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
        filler.live
      </div>

      <div className="absolute inset-[37.5%] rounded-full border border-line/80" />
      <div className="absolute inset-[25%] rounded-full border border-line/80" />
      <div className="absolute inset-[12.5%] rounded-full border border-line/80" />

      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-line/80" />
      <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-line/80" />
      <div className="absolute left-1/2 top-1/2 h-[141.4%] w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-line/60" />
      <div className="absolute left-1/2 top-1/2 h-[141.4%] w-px -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-line/60" />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(35,81,230,0.22), rgba(35,81,230,0.03) 70deg, transparent 70deg)",
          }}
        />
      </motion.div>

      <div className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ring-4 ring-panel" />
      <div className="absolute left-1/2 top-[56%] -translate-x-1/2 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
        you
      </div>

      <RadarPin
        dot="#ff4500"
        label="r/productivity"
        sub="142 pts · the exact pain"
        className="right-[12%] top-[20%]"
      />
      <RadarPin
        dot="#ff6600"
        label="Show HN form filler"
        sub="29 pts · direct launch"
        className="bottom-[18%] left-[10%]"
      />
      <RadarPin
        dot="#2351e6"
        label="8 alternatives"
        sub="each with sources"
        className="bottom-[12%] right-[14%]"
      />
    </div>
  );
}

function Hero() {
  return (
    <section className="px-6 pb-8 pt-24 sm:pt-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-soft">
              Market research that reads as a map
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 max-w-[680px] font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-ink to-ink-soft bg-clip-text text-transparent">
                Find the <span className="text-signal">thread</span>
                <br />
                your buyers
                <br />
                are already on.
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-[680px] text-pretty text-lg text-ink-soft">
              Paste a product link. OpenCorp maps the Reddit threads and Hacker
              News discussions where people describe the problem you solve, the
              alternatives they compare, and the angle to open with.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8">
              <UrlCtaForm location="hero" />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-ink-soft">
              <span>Free &amp; open source</span>
              <span className="text-ink-soft/40">·</span>
              <span>No credit card</span>
              <span className="text-ink-soft/40">·</span>
              <span>Never auto-posts</span>
            </div>
            <a
              href="#report"
              className="mt-3 inline-flex w-full items-center justify-center gap-1 text-xs font-medium text-signal transition-colors hover:text-ink"
            >
              See what one link got back <ArrowDown className="size-3" />
            </a>
          </Reveal>
        </div>
        <Reveal delay={0.18} className="mx-auto w-full max-w-[460px]">
          <Radar />
        </Reveal>
      </div>
    </section>
  );
}

const BENEFITS = [
  {
    title: "Know every alternative",
    description:
      "The tools doing what you do, where each one is mentioned, and what to learn before you pitch anyone.",
    icon: Target,
    tone: "brand" as const,
  },
  {
    title: "Find the live complaints",
    description:
      "Threads where buyers describe your exact problem, ranked by fit and scored by engagement.",
    icon: RedditIcon,
    tone: "reddit" as const,
  },
  {
    title: "Join the launches early",
    description:
      "Show HNs and discussions worth entering while they are still warm, with an opening line suggested.",
    icon: HNIcon,
    tone: "hn" as const,
  },
];

function Benefits() {
  return (
    <section id="benefits" className="scroll-mt-28 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
            What a report gets you
          </p>
          <h2 className="mt-3 max-w-[680px] font-display text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
            A report is not a list. It is a map.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {BENEFITS.map((b, i) => {
            const Icon = b.icon;
            const iconWrap = {
              brand: "border-signal/30 bg-signal/10 text-signal",
              reddit: "border-reddit/30 bg-reddit/10 text-reddit",
              hn: "border-hn/30 bg-hn/10 text-hn",
            }[b.tone];
            return (
              <Reveal key={b.title} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-6">
                  <div
                    className={cn(
                      "grid size-10 place-items-center overflow-hidden rounded-xl border",
                      iconWrap,
                    )}
                  >
                    {b.tone === "brand" ? (
                      <Icon className="size-5" />
                    ) : (
                      <Icon className="size-8" />
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {b.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const TAGLINE =
  "Building the product is easy. Finding the room where your buyers already are? That's the craft.";

function TaglineReveal() {
  const words = TAGLINE.split(" ");
  return (
    <section className="border-y border-line bg-panel px-6 py-24">
      <p className="mx-auto max-w-[680px] font-display text-3xl font-semibold leading-snug tracking-tight text-balance sm:text-5xl">
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0.3 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.04 }}
          >
            {word}{" "}
          </motion.span>
        ))}
      </p>
    </section>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Drop your link",
    description:
      "OpenCorp reads your landing page to learn what you do and who it is for.",
  },
  {
    n: "02",
    title: "Scan the noise",
    description:
      "Alternatives, Reddit threads, and Hacker News discussions, cross referenced against your product.",
  },
  {
    n: "03",
    title: "Show up with a reason",
    description:
      "A ranked report with a note on every result. The words are yours to write.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-28 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
            How it works
          </p>
          <h2 className="mt-3 max-w-[680px] font-display text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
            Three steps from link to conversation
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.08}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-6">
                <span className="font-mono text-xs text-signal">{step.n}</span>
                <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExampleReport() {
  return (
    <section
      id="report"
      className="scroll-mt-28 border-y border-line bg-panel px-6 py-24"
    >
      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1fr_1.05fr]">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
            Proof, not promises
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
            What one link got back
          </h2>
          <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-ink-soft">
            filler.live, an extension that fills forms for you. One paste in,
            three channels out, every result with the reason it matters.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <LandingConsole data={RESULTS} />
        </Reveal>
      </div>
    </section>
  );
}

function FounderSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <Reveal className="grid items-start gap-8 sm:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://github.com/KrishavRajSingh.png"
            alt="Krishav Raj Singh"
            loading="lazy"
            className="size-14 rounded-full border border-line bg-white"
          />
          <div className="sm:hidden">
            <div className="font-display text-base font-semibold">Founder</div>
            <div className="text-xs text-ink-soft">{FOUNDER_HANDLE}</div>
          </div>
        </div>
        <div>
          <div className="hidden sm:block">
            <div className="font-display text-base font-semibold">Founder</div>
            <div className="text-xs text-ink-soft">
              builder of filler.live
            </div>
          </div>
          <h2 className="mt-3 font-display text-2xl font-semibold leading-snug tracking-tight text-balance sm:text-3xl">
            I shipped filler.live with no idea who my alternatives were, or
            where the people who needed it were already talking. So I built
            OpenCorp: paste a link, get the map.
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href={`https://x.com/${FOUNDER_HANDLE}`} target="_blank">
                Follow the build on X →
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const FAQS = [
  {
    q: "What exactly do I get?",
    a: "A ranked map of where your next users already are: alternatives to study, threads where buyers describe the problem you solve, and launches worth joining, each with a reason.",
  },
  {
    q: "How much does it cost?",
    a: "Nothing. OpenCorp is free and open source, with no pricing tier. A free account unlocks full thread lists and keeps your history.",
  },
  {
    q: "Where does the data come from?",
    a: "Public sources only. Reddit threads, Hacker News discussions, and live web results for alternatives. Every item links back to its source.",
  },
  {
    q: "How is this better than searching myself?",
    a: "It reads your product page first, then searches for the problem you solve, not your product name, and ranks the results with a reason attached to each.",
  },
  {
    q: "Will it post or comment for me?",
    a: "No. OpenCorp shows you where to show up and why. The words you write are yours.",
  },
  {
    q: "My product is brand new. Will it find anything?",
    a: "Yes. It searches the problem space, so new products surface the same conversations established ones do.",
  },
  {
    q: "What if my product has no landing page yet?",
    a: "Any public link works. A GitHub repo, an app store listing, or a bare page gives the agents enough to map the problem you solve.",
  },
  {
    q: "What happens to my link and my report?",
    a: "They are yours. Nothing is posted, published, or sold.",
  },
];

function Faq() {
  return (
    <section id="faq" className="scroll-mt-28 px-6 py-24">
      <Reveal className="mx-auto max-w-3xl">
        <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Questions, answered
        </h2>
        <Accordion type="single" collapsible className="mt-8">
          {FAQS.map((f, i) => (
            <AccordionItem key={f.q} value={`q-${i}`}>
              <AccordionTrigger className="text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="leading-relaxed text-ink-soft">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="border-t border-line bg-panel px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Your thread is out there.
          </h2>
          <p className="mt-3 text-sm text-ink-soft">
            Paste your product link and see who is already looking for what you
            built.
          </p>
          <div className="mt-8">
            <UrlCtaForm location="footer" />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-signal" /> Free &amp; open source
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-signal" /> No credit card
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-signal" /> Never auto-posts
            </span>
          </div>
          <p className="mt-3 text-xs text-ink-soft/70">
            No account needed to preview the report.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <MarketingShell>
      <main className="flex-1">
        <Hero />
        <Benefits />
        <TaglineReveal />
        <HowItWorks />
        <ExampleReport />
        <FounderSection />
        <Faq />
        <FinalCta />
      </main>
    </MarketingShell>
  );
}
