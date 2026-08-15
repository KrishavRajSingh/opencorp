// OPENCORP landing — One-Bit Desktop world (seed e71a1dcf, user-picked).
// THESIS: the indie founder's product launch as a 1990s OS desktop — every
// section of the page is a window on a black canvas, the no-auto-post stance
// is a banner-window, the founder and FAQ are file windows, the closing CTA
// is the last app window, and the whole thing ends on a status bar.
// OWN-WORLD: pure black + pure white, dithered greys, monospaced type only,
// 1px borders, hard 2px offset shadows, diagonal-stripe title bars, marching
// ants on the URL input. No third colour, no slab, no rounded card.
// STORY: visitor pastes a product URL, sees the OPENCORP.APP window with the
// headline FIND YOUR USERS., clicks FIND MY USERS, lands in the dashboard.
// Everything else on the page is proof and grounding: three body windows for
// competitors / Reddit / HN, a glossary directory window, the no-auto-post
// banner, the founder window, the FAQ window, the closing CTA window.
// FIRST VIEWPORT: white menu bar (File Edit View Window Help · OPENCORP.APP
// · LAUNCH APP), black desktop, OPENCORP.APP window centered with a black
// headline "FIND YOUR USERS.", the URL input, the CTA button.
// FORM: One-Bit Desktop. The form supplies the system grammar; the product
// supplies every fact. Mondotech was rejected by the user after a single
// build; this is the re-roll pick.
// FINISH: unreviewed and undocumented is unfinished; this build ends with
// the finish review, the verdict, and DESIGN.md.

"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { trackEvent } from "@/lib/analytics";
import { MarketingShell } from "@/components/marketing-shell";

type Competitor = {
  name: string;
  url: string;
  description: string;
  mentionSources: string[];
};

type RedditThread = {
  id: string;
  sub: string;
  title: string;
  link: string;
  author: string;
  score: number;
  num_comments: number;
  whyRelevant: string;
  isExample?: boolean;
};

type HNThread = {
  objectID: string;
  title: string;
  url: string;
  points: number;
  comments: number;
  author: string;
  date: string;
  whyRelevant: string;
  topCommentSnippet: string | null;
};

const FOUNDER_HANDLE = "opencorpai";

const PAIN_PHRASES = [
  {
    quote: "I'm retyping the same info on every job application.",
    source: "r/productivity · 142↑ · 67c",
  },
  {
    quote: "Hospital said call back tomorrow. Called back again. Voicemail.",
    source: "said by a real human, every day",
  },
  {
    quote: "ATS form is longer than my resume. This is backwards.",
    source: "r/jobs · 318↑ · 124c",
  },
  {
    quote: "Why does every SPA break my browser autofill?",
    source: "r/webdev · 204↑ · 93c",
  },
  {
    quote: "Where do I talk to real users without spamming?",
    source: "r/Entrepreneur · 63↑ · 39c",
  },
];

const RESULTS = {
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
  ] satisfies Competitor[],
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
  ] satisfies RedditThread[],
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
  ] satisfies HNThread[],
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
    q: "How is this different from searching Reddit myself?",
    a: "OpenCorp reads your product page first, then searches for the problem you solve — not your product name — and ranks threads with a reason attached to each.",
  },
  {
    q: "Does it post or comment for me?",
    a: "No auto-posting. OpenCorp finds where to show up and why. The words you write are yours.",
  },
];

const GLOSSARY = [
  {
    k: "PAIN PHRASE",
    d: "2–4 word fragment of how the user describes the problem.",
  },
  {
    k: "WHY RELEVANT",
    d: "One-line reason this thread is a fit for the product.",
  },
  {
    k: "DEFLECTION",
    d: "User actively leaving a named competitor.",
  },
  {
    k: "EXCLUDE",
    d: "Phrase that flags an off-topic thread for the agent to skip.",
  },
  {
    k: "USER VOICE",
    d: "How the buyer actually talks, not the brand.",
  },
  {
    k: "RANK",
    d: "Relevance score returned by the re-ranking step.",
  },
  {
    k: "SHOW HN",
    d: "HN launch post; ASCII title ≤ 80 chars.",
  },
  {
    k: "ANALYST",
    d: "Agent that reads the product's site first.",
  },
];

function TitleBar({
  title,
  invert = false,
  right,
}: {
  title: string;
  invert?: boolean;
  right?: string;
}) {
  return (
    <div
      className="flex items-center gap-2 px-2 py-1"
      style={{
        background: invert ? "#000" : "#fff",
        color: invert ? "#fff" : "#000",
        borderBottom: "1px solid #000",
      }}
    >
      <div
        aria-hidden
        className="flex-1"
        style={{
          height: "8px",
          backgroundImage: invert
            ? "repeating-linear-gradient(45deg, rgba(255,255,255,0.45) 0 2px, transparent 2px 6px)"
            : "repeating-linear-gradient(45deg, rgba(0,0,0,0.3) 0 2px, transparent 2px 6px)",
        }}
      />
      <div
        className="px-2 text-[11px] font-bold tracking-tight"
        style={{ whiteSpace: "nowrap" }}
      >
        {title}
      </div>
      <div
        aria-hidden
        className="flex-1"
        style={{
          height: "8px",
          backgroundImage: invert
            ? "repeating-linear-gradient(45deg, rgba(255,255,255,0.45) 0 2px, transparent 2px 6px)"
            : "repeating-linear-gradient(45deg, rgba(0,0,0,0.3) 0 2px, transparent 2px 6px)",
        }}
      />
      {right ? (
        <div
          className="px-2 text-[10px] font-bold tracking-widest"
          style={{ whiteSpace: "nowrap" }}
        >
          {right}
        </div>
      ) : null}
    </div>
  );
}

function Window({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "#fff",
        color: "#000",
        border: "1px solid #000",
        boxShadow: "2px 2px 0 0 rgba(255,255,255,0.18)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

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
      className="flex flex-col gap-2 sm:flex-row sm:items-stretch"
    >
      <label
        className="flex flex-1 items-center gap-2 border border-black bg-white px-3 py-2 text-[13px] font-bold text-black focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-black"
        style={{ fontFamily: "ui-monospace, Menlo, monospace" }}
      >
        <span
          aria-hidden
          className="inline-block h-3 w-3 shrink-0"
          style={{ background: "#000" }}
        />
        <span className="text-black/60">https://</span>
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
          className="flex-1 bg-transparent text-black outline-none placeholder:text-black/40"
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 border border-black bg-black px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black"
      >
        FIND MY USERS
        <span aria-hidden>→</span>
      </button>
    </form>
  );
}

function PainPhrasesWindow() {
  return (
    <Window>
      <TitleBar title="AGENT/PAIN_PHRASES.TXT" invert right="USER VOICE" />
      <div className="px-4 py-2">
        <div className="mb-1 px-1 text-[10px] font-bold uppercase tracking-widest text-black/60">
          5 lines the agent would search with — verbatim
        </div>
        {PAIN_PHRASES.map((p, i) => (
          <div
            key={i}
            className="grid grid-cols-[22px_1fr] gap-2 border-t border-black/40 py-2.5 first:border-t-0"
          >
            <div className="pt-0.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-black/55">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div>
              <div className="text-[13px] leading-[1.45]">
                &ldquo;{p.quote}&rdquo;
              </div>
              <div className="mt-1.5 text-[9px] font-extrabold uppercase tracking-[0.18em] text-black/55">
                {p.source}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Window>
  );
}

function FoundersWindow() {
  return (
    <Window>
      <TitleBar title="FOUNDER.README" invert />
      <div className="grid grid-cols-[88px_1fr] gap-4 p-4">
        <div
          aria-hidden
          className="h-[88px] w-[88px] border border-black"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #000 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, #000 0 1px, transparent 1px 3px)",
            backgroundSize: "4px 4px",
            backgroundColor: "#fff",
          }}
        />
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-black/70">
            @opencorpai · BUILDER OF FILLER.LIVE
          </div>
          <h2 className="mt-2 text-[17px] font-extrabold uppercase leading-[1.15] tracking-tight text-black">
            <span className="font-mono text-[26px] align-top">“</span>
            I shipped filler.live and didn&apos;t know who my alternatives were — or
            where people who needed it were already talking. So I built OpenCorp:
            paste a link, get the map.
          </h2>
          <p className="mt-3 text-[12px] leading-[1.5] text-black/80">
            OpenCorp reads your product page first, then searches for the problem
            you solve — in user-voice fragments, not in your product name. The
            agent picks its own queries, decides how many to run, and re-ranks
            results. You stay in your editor.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href={`https://x.com/${FOUNDER_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 border border-black bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white"
            >
              FOLLOW ON X →
            </a>
            <a
              href="https://github.com/KrishavRajSingh/opencorp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 border border-black bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white"
            >
              VIEW ON GITHUB →
            </a>
            <a
              href="https://discord.gg/ArQF8jtC9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 border border-black bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white"
            >
              JOIN DISCORD →
            </a>
          </div>
        </div>
      </div>
    </Window>
  );
}

function FaqWindow() {
  return (
    <Window>
      <TitleBar title="FAQ.HELP · 4 ENTRIES" invert />
      <div className="px-4 py-3">
        {FAQS.map((f, i) => (
          <div
            key={f.q}
            className="grid grid-cols-[28px_1fr] gap-3 border-t border-black py-3 first:border-t-0 first:pt-2"
          >
            <div className="text-[14px] font-extrabold leading-tight">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div>
              <div className="text-[12px] font-bold uppercase tracking-tight">
                {f.q}
              </div>
              <div className="mt-1 text-[12px] leading-[1.5] text-black/85">
                {f.a}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Window>
  );
}

function GlossaryWindow() {
  return (
    <Window>
      <TitleBar title="GLOSSARY.DICT · 8 ENTRIES" invert />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {GLOSSARY.map((g) => (
          <div
            key={g.k}
            className="border-t border-black p-3 first:border-t-0 sm:border-l sm:border-t-0 sm:first:border-l-0 lg:border-l lg:border-t-0 lg:nth-[4n+1]:border-l-0"
          >
            <div className="text-[11px] font-extrabold uppercase tracking-widest">
              {g.k}
            </div>
            <div className="mt-1.5 text-[11px] leading-[1.45] text-black/85">
              {g.d}
            </div>
          </div>
        ))}
      </div>
    </Window>
  );
}

function BodyWindow({
  title,
  count,
  children,
  right,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  right?: string;
}) {
  return (
    <Window>
      <TitleBar title={title} invert right={right ?? `${count} ROWS`} />
      <div className="px-3 py-2">{children}</div>
    </Window>
  );
}

function CompetitorRows() {
  return (
    <ul className="divide-y divide-black/40">
      {RESULTS.competitors.map((c, i) => (
        <li key={c.name} className="flex flex-col gap-1 py-2 first:pt-1">
          <div className="flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-widest text-black/80">
            <span className="font-extrabold">C{String(i + 1).padStart(2, "0")}</span>
            <span>{c.mentionSources.join(" · ")}</span>
          </div>
          <div className="text-[13px] font-extrabold uppercase leading-[1.15]">
            {c.name}
          </div>
          <div className="text-[11px] leading-[1.4] text-black/80">
            {c.description}
          </div>
        </li>
      ))}
    </ul>
  );
}

function RedditRows() {
  return (
    <ul className="divide-y divide-black/40">
      {RESULTS.redditThreads.map((t, i) => (
        <li key={t.id} className="flex flex-col gap-1 py-2 first:pt-1">
          <div className="flex items-baseline justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-black/80">
            <span className="flex gap-2">
              <span className="font-extrabold">R{String(i + 1).padStart(2, "0")}</span>
              <span>r/{t.sub}</span>
            </span>
            <span>{t.score}↑ · {t.num_comments}c</span>
          </div>
          <div className="text-[13px] font-extrabold uppercase leading-[1.15]">
            {t.title}
          </div>
          <div className="text-[11px] leading-[1.4] text-black/80">
            {t.whyRelevant}
          </div>
        </li>
      ))}
    </ul>
  );
}

function HnRows() {
  return (
    <ul className="divide-y divide-black/40">
      {RESULTS.hnThreads.map((t, i) => (
        <li key={t.objectID} className="flex flex-col gap-1 py-2 first:pt-1">
          <div className="flex items-baseline justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-black/80">
            <span className="flex gap-2">
              <span className="font-extrabold">H{String(i + 1).padStart(2, "0")}</span>
              <span>{t.author}</span>
            </span>
            <span>{t.points}↑ · {t.comments}c</span>
          </div>
          <div className="text-[13px] font-extrabold uppercase leading-[1.15]">
            {t.title}
          </div>
          <div className="text-[11px] leading-[1.4] text-black/80">
            {t.whyRelevant}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <MarketingShell>
      <main
        className="flex-1"
        style={{
          backgroundColor: "#000",
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 3px)",
          color: "#fff",
        }}
      >
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 py-8 sm:py-10">
          {/* HERO WINDOW */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 gap-5 lg:grid-cols-[1.05fr_1fr]"
          >
            <Window>
              <TitleBar title="OPENCORP.APP" invert right="FILLER.LIVE" />
              <div className="px-6 py-7 sm:px-9 sm:py-9">
                <div className="mb-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-black">
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3"
                    style={{ background: "#000" }}
                  />
                  FIND · WHERE · YOUR · USERS · ALREADY · TALK
                </div>
                <h1
                  className="text-[clamp(40px,8vw,84px)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-black"
                  style={{ fontFamily: "ui-monospace, Menlo, monospace" }}
                >
                  FIND
                  <br />
                  <span
                    className="inline-block px-2 text-white"
                    style={{ background: "#000" }}
                  >
                    YOUR USERS.
                  </span>
                  <br />
                  <span
                    className="text-[0.42em] font-bold leading-none tracking-normal"
                    style={{ verticalAlign: "0.5em" }}
                  >
                    {"// paste a product link"}
                  </span>
                </h1>
                <p className="mt-5 max-w-[640px] text-[13px] leading-[1.55] text-black/85">
                  OpenCorp reads your product page first, then searches for the
                  problem you solve — in user-voice fragments, not in your
                  product name. The agent picks its own queries, decides how
                  many to run, and re-ranks results. You stay in your editor.
                </p>
                <div className="mt-6 max-w-[640px]">
                  <UrlCtaForm location="hero" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-widest text-black">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 border border-black bg-black" />
                    FREE &amp; OPEN SOURCE
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 border border-black bg-black" />
                    NO CREDIT CARD
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 border border-black" />
                    2-MIN SIGNUP
                  </span>
                </div>
              </div>
            </Window>
            <PainPhrasesWindow />
          </motion.div>

          {/* BODY WINDOWS: 3 columns of windows with overlapping data */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 gap-5 lg:grid-cols-3"
          >
            <BodyWindow title="COMPETITORS.LOG" count={RESULTS.competitors.length}>
              <CompetitorRows />
            </BodyWindow>
            <BodyWindow title="REDDIT.SCAN" count={RESULTS.redditThreads.length}>
              <RedditRows />
            </BodyWindow>
            <BodyWindow title="HN.SCAN" count={RESULTS.hnThreads.length}>
              <HnRows />
            </BodyWindow>
          </motion.div>

          {/* GLOSSARY DICT WINDOW */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlossaryWindow />
          </motion.div>

          {/* NO-AUTO-POST BANNER */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 border border-white bg-black px-4 py-3 text-[12px] font-bold uppercase tracking-widest text-white"
          >
            <span className="border border-white px-1.5 py-0.5 text-[10px] tracking-[0.18em]">
              DIRECTIVE 01
            </span>
            <span className="flex-1">
              NO AUTO-POSTING. NO AUTO-COMMENTING. WE FIND WHERE TO SHOW UP — YOU
              WRITE THE WORDS.
            </span>
            <span className="border border-white px-1.5 py-0.5 text-[10px] tracking-[0.18em]">
              BINDING
            </span>
          </motion.div>

          {/* FOUNDER WINDOW */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <FoundersWindow />
          </motion.div>

          {/* FAQ WINDOW */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <FaqWindow />
          </motion.div>

          {/* CLOSING WINDOW */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <Window>
              <TitleBar title="GET_THE_MAP.APP" invert right="DO IT" />
              <div className="px-6 py-7 text-center sm:px-9 sm:py-9">
                <h2
                  className="text-[clamp(28px,5vw,48px)] font-extrabold uppercase leading-[1] tracking-[-0.01em] text-black"
                  style={{ fontFamily: "ui-monospace, Menlo, monospace" }}
                >
                  GET THE MAP.
                </h2>
                <p className="mt-3 text-[12px] leading-[1.5] text-black/85">
                  Paste your product link. See who&apos;s already looking for what
                  you built.
                </p>
                <div className="mx-auto mt-5 max-w-[520px]">
                  <UrlCtaForm location="footer" />
                </div>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-black/60">
                  FREE &amp; OPEN SOURCE · ACCOUNT UNLOCKS FULL THREAD LISTS
                </div>
              </div>
            </Window>
          </motion.div>
        </div>

        {/* STATUS BAR */}
        <div
          className="sticky bottom-0 flex w-full items-center gap-3 border-t border-white bg-black px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white"
        >
          <span className="border border-white px-1.5 py-0.5">● READY</span>
          <span className="opacity-80">OPENCORP.APP</span>
          <span aria-hidden className="h-3 w-px bg-white/60" />
          <span className="opacity-80">8 WINDOWS · 1 BIT</span>
          <span aria-hidden className="h-3 w-px bg-white/60" />
          <span className="opacity-80">{RESULTS.competitors.length} COMPETITORS · {RESULTS.redditThreads.length} REDDIT · {RESULTS.hnThreads.length} HN</span>
          <span className="ml-auto opacity-80">ELASTIC 2.0</span>
        </div>
      </main>
    </MarketingShell>
  );
}
