"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
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
import { trackEvent } from "@/lib/analytics";

const FOUNDER_HANDLE = "opencorpai";

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

const COLUMNS = [
  {
    n: "I",
    kicker: "Inputs",
    title: "Paste a product link",
    body: "Drop your landing page URL. The Product Analyst reads the homepage, the pricing, the docs, the about — every signal that says who you are and who you are not.",
    glyph: "→",
  },
  {
    n: "II",
    kicker: "Method",
    title: "Agents scan the map",
    body: "Discovery picks its own queries and how many searches to run. It crosses alternatives, Reddit threads, and Hacker News discussions, re-ranked against your product, not your product name.",
    glyph: "◍",
  },
  {
    n: "III",
    kicker: "Output",
    title: "Show up and talk",
    body: "A ranked report with a reason attached to every item. You pick the conversations; you write the words. OpenCorp never posts, never comments, never pretends to be you.",
    glyph: "◢",
  },
];

const PLATE_EXCERPTS = {
  alternatives: {
    label: "ALTERNATIVES",
    items: [
      {
        rank: "01",
        name: "FormPilot",
        meta: "github · chrome store · hacker news",
        note: "Direct competitor. Privacy-first model and SPA setter bypass are the wedge.",
      },
      {
        rank: "02",
        name: "Superfill.ai",
        meta: "github · hacker news",
        note: "Open-source with a Q&A memory layer. Cite the LLM-agnostic backend.",
      },
      {
        rank: "03",
        name: "Fillify",
        meta: "chrome store",
        note: "Plain-language prompting. Lead with the no-account, local-keys story.",
      },
    ],
  },
  reddit: {
    label: "REDDIT",
    items: [
      {
        rank: "01",
        sub: "r/SaaS",
        title: "How do you find early users without cold email spam?",
        meta: "156 pts · 78 cmts · u/indie_hacker",
        note: "Founders asking the exact question OpenCorp is built to answer.",
      },
      {
        rank: "02",
        sub: "r/Entrepreneur",
        title: "Just shipped my first extension. Where do I talk to real users?",
        meta: "63 pts · 39 cmts · u/shipped_it",
        note: "Meta-thread. Show the workflow, not the pitch.",
      },
      {
        rank: "03",
        sub: "r/privacy",
        title: "Do AI form fillers send my personal data to the cloud?",
        meta: "97 pts · 54 cmts · u/no_telemetry",
        note: "Privacy-first buyers actively rejecting cloud autofill.",
      },
    ],
  },
  hn: {
    label: "HACKER NEWS",
    items: [
      {
        rank: "01",
        title: "Show HN: Superfill.ai – Open-source AI extension for intelligent form autofill",
        meta: "4 pts · 0 cmts · superfill_team · 29 Jun",
        note: "Direct competitor launch. Thread names the retype problem.",
      },
      {
        rank: "02",
        title: "Show HN: I made a Chrome extension to auto-apply to jobs",
        meta: "12 pts · 3 cmts · instaapply · 26 Jun",
        note: "Founder describes the loop. Active job-seeker discussion.",
      },
      {
        rank: "03",
        title: "Show HN: Drafting AI – Human-in-the-loop AI automation",
        meta: "29 pts · 2 cmts · drafting_ai · 15 Jun",
        note: "Thesis-aligned: AI drafts, humans submit.",
      },
    ],
  },
};

const FAQS = [
  {
    q: "What do I actually get?",
    a: "A ranked map of where your next users already are: alternatives to study, Reddit threads where buyers describe the problem you solve, and Hacker News discussions ready to join — each with a reason attached.",
  },
  {
    q: "Is it really free?",
    a: "Yes. OpenCorp is open source with no pricing tier. A free account unlocks full thread lists and saves your reports.",
  },
  {
    q: "Where does the data come from?",
    a: "Public sources only: Reddit threads, Hacker News discussions, and live web results for alternatives. Every item links back to its source.",
  },
  {
    q: "What do I get without an account?",
    a: "The full alternatives list plus a preview of the top Reddit and Hacker News threads. Sign up free to see everything and keep your history.",
  },
  {
    q: "How is this different from searching Reddit myself?",
    a: "OpenCorp reads your product page first, then searches for the problem you solve — not your product name — and ranks threads with a reason attached to each.",
  },
  {
    q: "Does it post or comment for me?",
    a: "No auto-posting. OpenCorp finds where to show up and why. The words you write are yours.",
  },
];

const HALFTONE_STYLE = {
  backgroundImage:
    "radial-gradient(circle, oklch(0.72 0.15 75 / 0.16) 1px, transparent 1.5px)",
  backgroundSize: "6px 6px",
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
      className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"
    >
      <label className="flex flex-1 items-center gap-2 border border-brand/30 bg-background/60 px-3 py-2.5 transition-colors focus-within:border-brand">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand/80">
          URL
        </span>
        <span className="h-4 w-px bg-brand/30" aria-hidden />
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
          className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
        />
        <Search className="size-3.5 shrink-0 text-muted-foreground/50" />
      </label>
      <Button
        type="submit"
        size="lg"
        className="w-full gap-2 rounded-none border border-brand bg-brand font-display text-sm font-black uppercase tracking-[0.12em] text-[oklch(0.12_0.02_60)] hover:bg-brand/90 sm:w-auto"
      >
        Find My Users
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

function MastheadRunning() {
  return (
    <div className="relative z-10 mt-14 border-b border-brand/25 bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
        <span>Vol. 1 · No. 01</span>
        <span className="hidden text-brand sm:inline">
          The Map · August 2026
        </span>
        <span>Free · Open Source</span>
      </div>
    </div>
  );
}

function Cover() {
  return (
    <section className="relative overflow-hidden border-b border-brand/25">
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0"
        style={HALFTONE_STYLE}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-14 pt-10 sm:pb-20 sm:pt-14 lg:grid-cols-12 lg:gap-10 lg:pb-24 lg:pt-16">
        <div className="min-w-0 lg:col-span-7">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-brand/90">
            <span className="inline-block h-px w-8 bg-brand" />
            <span>Cover Story</span>
            <span className="text-muted-foreground/50">·</span>
            <span className="text-muted-foreground/70">The Map</span>
          </div>

          <h1 className="mt-5 font-display text-[2.8rem] font-black uppercase leading-[0.88] tracking-[-0.01em] text-foreground sm:text-[4rem] md:text-[5rem] lg:text-[5.6rem] xl:text-[6.4rem]">
            Where
            <br />
            Your Users
            <br />
            <span className="text-brand">Already Talk.</span>
          </h1>

          <p className="mt-6 w-full max-w-md break-words font-serif text-base italic leading-relaxed text-foreground/85 sm:text-lg">
            Paste a product link. OpenCorp reads the page, finds the
            alternatives, the Reddit threads, the Hacker News discussions — and
            tells you why each one is worth your time.
          </p>

          <div className="mt-8">
            <UrlCtaForm location="hero" />
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
              <span>Free · No Card · No Account</span>
              <Link
                href="#plate-i"
                className="text-brand/80 transition-colors hover:text-brand"
              >
                ↓ See Plate I
              </Link>
            </div>
          </div>
        </div>

        <div id="plate-i" className="min-w-0 lg:col-span-5">
          <Plate
            number="Plate I"
            title="Field Report"
            byline="filler.live · Synthetic demo · Aug 2026"
            caption="A synthetic excerpt from the report you receive — same shape as real output. 8 alternatives, 10 threads, 12 discussions, each with a written reason."
          >
            <LandingConsole data={RESULTS} />
          </Plate>
        </div>
      </div>
    </section>
  );
}

function Plate({
  number,
  title,
  byline,
  caption,
  children,
}: {
  number: string;
  title: string;
  byline: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="relative">
      <div className="relative border border-brand/30 bg-card/60 p-3 sm:p-4">
        <div className="absolute -top-3 left-3 inline-flex items-center gap-1.5 bg-background px-2 font-display text-[10px] font-black uppercase tracking-[0.18em] text-brand">
          {number}
        </div>
        <div className="border-b border-brand/20 pb-2">
          <div className="font-display text-base font-black uppercase leading-tight tracking-tight text-foreground sm:text-lg">
            {title}
          </div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
            {byline}
          </div>
        </div>
        <div className="mt-3">{children}</div>
      </div>
      <figcaption className="mt-2 font-serif text-[11px] italic leading-snug text-muted-foreground/80">
        {caption}
      </figcaption>
    </figure>
  );
}

function Mechanism() {
  return (
    <section className="border-b border-brand/25">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <header className="grid grid-cols-12 items-baseline gap-4 border-b border-brand/30 pb-3">
          <div className="col-span-12 flex items-baseline gap-4 sm:col-span-3">
            <span className="font-display text-3xl font-black uppercase leading-none text-brand sm:text-4xl">
              I
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              The Method
            </span>
          </div>
          <h2 className="col-span-12 font-display text-2xl font-black uppercase leading-tight tracking-tight text-foreground sm:col-span-9 sm:text-3xl">
            How a link becomes a list of conversations.
          </h2>
        </header>

        <div className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {COLUMNS.map((c) => (
            <article
              key={c.n}
              className="relative border-t border-brand/20 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5"
            >
              <div className="mb-3 flex items-baseline justify-between">
                <span className="font-display text-5xl font-black uppercase leading-none tracking-tight text-brand sm:text-6xl">
                  {c.n}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
                  {c.kicker}
                </span>
              </div>
              <h3 className="font-display text-lg font-black uppercase leading-tight tracking-tight text-foreground">
                {c.title}
              </h3>
              <p className="mt-2 font-serif text-sm leading-relaxed text-foreground/80">
                {c.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatsInTheReport() {
  return (
    <section className="border-b border-brand/25 bg-muted/20">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <header className="grid grid-cols-12 items-baseline gap-4 border-b border-brand/30 pb-3">
          <div className="col-span-12 flex items-baseline gap-4 sm:col-span-3">
            <span className="font-display text-3xl font-black uppercase leading-none text-brand sm:text-4xl">
              II
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Inside the Report
            </span>
          </div>
          <h2 className="col-span-12 font-display text-2xl font-black uppercase leading-tight tracking-tight text-foreground sm:col-span-9 sm:text-3xl">
            Three columns. Every result with a written reason.
          </h2>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {(
            [
              PLATE_EXCERPTS.alternatives,
              PLATE_EXCERPTS.reddit,
              PLATE_EXCERPTS.hn,
            ] as const
          ).map((col) => (
            <article
              key={col.label}
              className="flex flex-col border border-brand/20 bg-card/40"
            >
              <header className="flex items-center justify-between border-b border-brand/20 px-3 py-2">
                <span className="font-display text-sm font-black uppercase tracking-[0.12em] text-foreground">
                  {col.label}
                </span>
                <span className="font-mono text-[10px] tabular-nums uppercase tracking-[0.18em] text-muted-foreground/60">
                  {String(col.items.length).padStart(2, "0")} of many
                </span>
              </header>
              <ul className="divide-y divide-brand/10">
                {col.items.map((item) => {
                  const it = item as Record<string, string>;
                  return (
                    <li
                      key={it.rank}
                      className="grid grid-cols-[auto_1fr] gap-3 px-3 py-3"
                    >
                      <span className="font-mono text-[10px] tabular-nums text-brand/80">
                        {it.rank}
                      </span>
                      <div className="min-w-0">
                        {it.sub ? (
                          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
                            {it.sub}
                          </div>
                        ) : null}
                        <p className="font-serif text-[13px] leading-snug text-foreground/90">
                          {it.title ?? it.name}
                        </p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/55">
                          {it.meta}
                        </p>
                        <p className="mt-1.5 font-serif text-[12px] italic leading-snug text-muted-foreground/80">
                          {it.note}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderLetter() {
  return (
    <section className="border-b border-brand/25">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <header className="grid grid-cols-12 items-baseline gap-4 border-b border-brand/30 pb-3">
          <div className="col-span-12 flex items-baseline gap-4 sm:col-span-3">
            <span className="font-display text-3xl font-black uppercase leading-none text-brand sm:text-4xl">
              III
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Letter
            </span>
          </div>
          <h2 className="col-span-12 font-display text-2xl font-black uppercase leading-tight tracking-tight text-foreground sm:col-span-9 sm:text-3xl">
            From the editor.
          </h2>
        </header>

        <div className="mt-8 grid items-start gap-8 sm:grid-cols-[auto_1fr]">
          <div>
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://github.com/KrishavRajSingh.png"
                alt="Krishav Raj Singh"
                loading="lazy"
                className="size-20 border border-brand/30 grayscale sm:size-24"
              />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-background px-2 font-mono text-[9px] uppercase tracking-[0.22em] text-brand/80">
                Editor
              </span>
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
              Krishav Raj Singh · @opencorpai · Builder of filler.live
            </div>
            <p className="mt-4 font-serif text-lg italic leading-relaxed text-foreground sm:text-xl">
              I shipped filler.live and didn&apos;t know who my alternatives
              were — or where people who needed it were already talking. So I
              built OpenCorp: paste a link, get the map. No posting, no bots,
              no pretending to be you. Just the next conversation, with a
              reason attached.
            </p>
            <p className="mt-3 font-serif text-base leading-relaxed text-foreground/75">
              The platform does the recon. You show up and talk.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-none border-brand/40 font-display text-[11px] font-black uppercase tracking-[0.16em]"
              >
                <Link
                  href={`https://x.com/${FOUNDER_HANDLE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Follow the build on X →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReaderMail() {
  return (
    <section className="border-b border-brand/25 bg-muted/20">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <header className="grid grid-cols-12 items-baseline gap-4 border-b border-brand/30 pb-3">
          <div className="col-span-12 flex items-baseline gap-4 sm:col-span-3">
            <span className="font-display text-3xl font-black uppercase leading-none text-brand sm:text-4xl">
              IV
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Reader Mail
            </span>
          </div>
          <h2 className="col-span-12 font-display text-2xl font-black uppercase leading-tight tracking-tight text-foreground sm:col-span-9 sm:text-3xl">
            Questions, answered.
          </h2>
        </header>

        <Accordion type="single" collapsible className="mt-6">
          {FAQS.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`q-${i}`}
              className="border-brand/20"
            >
              <AccordionTrigger className="font-serif text-base italic text-foreground sm:text-lg [&>svg]:text-brand">
                <span className="mr-3 font-mono text-[10px] not-italic uppercase tracking-[0.18em] text-brand/80 tabular-nums">
                  Q.{String(i + 1).padStart(2, "0")}
                </span>
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="font-serif text-[15px] leading-relaxed text-foreground/80">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function Subscription() {
  return (
    <section className="relative overflow-hidden border-b border-brand/25">
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, ease: "easeOut", delay: 0.2 }}
        className="pointer-events-none absolute inset-0"
        style={HALFTONE_STYLE}
      />
      <div className="relative mx-auto max-w-3xl px-6 py-16 text-center sm:py-24">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand/80">
          Section V · Subscribe
        </div>
        <h2 className="mt-3 font-display text-4xl font-black uppercase leading-[0.9] tracking-[0.02em] text-foreground sm:text-6xl">
          Begin Your <span className="text-brand">Subscription.</span>
        </h2>
        <p className="mt-4 font-serif text-base italic text-foreground/80 sm:text-lg">
          Paste your product link. Receive the next report. Show up where it
          points.
        </p>
        <div className="mx-auto mt-8 max-w-xl">
          <UrlCtaForm location="footer" />
        </div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/55">
          Free &amp; open source · account unlocks full thread lists
        </p>
      </div>
    </section>
  );
}

function Colophon() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-4 border-t border-brand/20 pt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 sm:grid-cols-3">
          <div>
            <span className="text-brand/80">Colophon</span> · Set in Anton,
            Source Serif 4, and Geist Mono.
          </div>
          <div className="sm:text-center">
            <span className="text-brand/80">Edition</span> · Vol. 1, No. 01 ·
            The Map
          </div>
          <div className="sm:text-right">
            <span className="text-brand/80">Print</span> · Free · Open Source
            (MIT-style)
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <MarketingShell>
      <MastheadRunning />
      <main className="flex-1">
        <Cover />
        <Mechanism />
        <WhatsInTheReport />
        <FounderLetter />
        <ReaderMail />
        <Subscription />
        <Colophon />
      </main>
    </MarketingShell>
  );
}
