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
    q: "How is this different from searching Reddit myself?",
    a: "OpenCorp reads your product page first, then searches for the problem you solve — not your product name — and ranks threads with a reason attached to each.",
  },
  {
    q: "Does it post or comment for me?",
    a: "No auto-posting. OpenCorp finds where to show up and why. The words you write are yours.",
  },
];

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
        // Accept bare domains ("filler.live") — normalize to a full URL
        // before the native GET submits.
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
      <div className="flex flex-1 items-center gap-2 rounded-lg border border-border/60 bg-card/50 px-3 py-2.5 backdrop-blur-sm transition-colors focus-within:border-brand/50">
        <Search className="size-4 shrink-0 text-muted-foreground" />
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
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
        />
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Find my users
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

function FounderSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="grid items-start gap-8 sm:grid-cols-[auto_1fr]"
      >
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://github.com/KrishavRajSingh.png"
            alt="Krishav Raj Singh"
            loading="lazy"
            className="size-14 rounded-full border border-border/60"
          />
          <div className="sm:hidden">
            <div className="font-heading text-base">Founder</div>
            <div className="text-[11px] text-muted-foreground">
              {FOUNDER_HANDLE}
            </div>
          </div>
        </div>
        <div>
          <div className="hidden sm:block">
            <div className="font-heading text-base">Founder</div>
            <div className="text-[11px] text-muted-foreground">
              builder of filler.live
            </div>
          </div>
          <h2 className="mt-3 font-heading text-2xl leading-snug tracking-tight sm:text-3xl">
            I shipped filler.live and didn&apos;t know who my alternatives were
            — or where people who needed it were already talking. So I built
            OpenCorp: paste a link, get the map.
          </h2>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href={`https://x.com/${FOUNDER_HANDLE}`} target="_blank">
                Follow the build on X →
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-center font-heading text-3xl tracking-tight sm:text-4xl">
          Questions, answered
        </h2>
        <Accordion type="single" collapsible className="mt-8">
          {FAQS.map((f, i) => (
            <AccordionItem key={f.q} value={`q-${i}`}>
              <AccordionTrigger className="text-base">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}

function TryItWidget() {
  return (
    <section className="border-t border-border/50 bg-muted/20">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
            Get the map.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Paste your product link. See who&apos;s already looking for what
            you built.
          </p>
          <div className="mt-8">
            <UrlCtaForm location="footer" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground/70">
            Free & open source · account unlocks full thread lists
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <MarketingShell>
      <main className="flex-1">
        <section className="relative overflow-hidden px-6 pb-20 pt-24 sm:pt-28">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_at_top_left,oklch(0.72_0.15_75_/_0.12),transparent_55%)]" />
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div className="flex flex-col">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border/50 bg-card/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-sm">
                <span className="size-1 rounded-full bg-brand" />
                Market intel for builders
              </div>
              <h1 className="font-heading text-[2.4rem] leading-[1.05] tracking-tight sm:text-5xl md:text-[3.4rem]">
                Your next users
                <br />
                are already talking.
                <br />
                <span className="text-muted-foreground/60">We find them.</span>
              </h1>
              <p className="mt-6 max-w-md text-base text-muted-foreground sm:text-lg">
                Paste your product link. OpenCorp maps your alternatives, ranks
                the Reddit threads where buyers describe the problem you solve,
                and queues the Hacker News discussions ready to join — each
                with a reason.
              </p>
              <div className="mt-7 w-full max-w-xl">
                <UrlCtaForm location="hero" />
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/70">
                  <span>Free & open source</span>
                  <span className="text-border">·</span>
                  <span>No credit card</span>
                  <span className="text-border">·</span>
                  <span>2-min signup</span>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative"
            >
              <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand/20 via-brand/5 to-emerald-400/10 opacity-70 blur-2xl" />
              <div className="relative">
                <LandingConsole data={RESULTS} />
              </div>
            </motion.div>
          </div>
        </section>

        <FounderSection />
        <Faq />
        <TryItWidget />
      </main>
    </MarketingShell>
  );
}
