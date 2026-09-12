import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";
import { Button } from "@/components/ui/button";
import { CompetitorForm } from "./form";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://opencorp.live";
const TOOL_URL = `${SITE_URL}/tools/competitor-scraper`;

export const metadata: Metadata = {
  title: "Free competitor scraper — find competitors for any product URL, no login",
  description:
    "Paste any product URL. Get the top 5-10 competitors, deduped across 5 search angles. Free, no account. Powered by the same engine OpenCorp uses for full research.",
  alternates: { canonical: "/tools/competitor-scraper" },
  openGraph: {
    title: "Free competitor scraper — OpenCorp",
    description:
      "Paste any product URL. Get the top competitors, free, no login.",
    url: TOOL_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free competitor scraper — OpenCorp",
    description: "Find competitors for any product URL. Free, no login.",
  },
};

const FAQ = [
  {
    q: "How does it work?",
    a: "Reads your homepage, plans 5 search angles (direct, pain, audience, alternative, OSS), runs each via Exa, dedupes by domain, and synthesizes the top competitors.",
  },
  {
    q: "How long does it take?",
    a: "30-60 seconds for most URLs. The tool fetches your homepage and a few subpages first, then runs 5 parallel searches.",
  },
  {
    q: "Is this tool really free?",
    a: "Yes. No login, no account. Same model and search backend as the full OpenCorp research flow — only the wrapper is stripped down.",
  },
  {
    q: "What does the full OpenCorp research give me beyond this?",
    a: "The full flow adds Reddit thread scan, HN thread scan, Show HN draft, and saves the report to your dashboard. This scraper returns just the competitor list.",
  },
];

export default function CompetitorScraperPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Competitor scraper",
        url: TOOL_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description:
          "Free tool. Paste a product URL. Get the top 5-10 competitors, deduped across 5 search angles.",
        provider: { "@type": "Organization", name: "OpenCorp", url: SITE_URL },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };

  return (
    <MarketingShell>
      <main className="flex-1 pt-20">
        <article className="mx-auto max-w-3xl px-6 pb-24 pt-12 sm:pt-20">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
              Free tool · No login
            </p>
            <h1 className="mt-3 font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
              Find competitors for any product URL
            </h1>
            <p className="mt-5 border-l-2 border-brand pl-4 text-lg leading-8 text-muted-foreground">
              Paste any product URL. Get the top 5-10 competitors, deduped
              across 5 search angles. Free, no account, runs in under a minute.
            </p>
          </header>

          <div className="mt-10">
            <CompetitorForm />
          </div>

          <section className="mt-20 border-t border-border/40 pt-12">
            <h2 className="font-heading text-2xl tracking-tight sm:text-3xl">
              How it works
            </h2>
            <ol className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">1. Read your product.</span>{" "}
                Fetches your homepage and 3-5 subpages, extracts product name,
                description, features, audience.
              </li>
              <li>
                <span className="font-medium text-foreground">2. Plan 5 searches.</span>{" "}
                A planner LLM turns your product into 5 Exa queries across
                fixed angles: direct, pain, audience, alternative, OSS.
              </li>
              <li>
                <span className="font-medium text-foreground">3. Search and dedupe.</span>{" "}
                5 parallel searches, deduped by domain. Capped at 30 unique
                results.
              </li>
              <li>
                <span className="font-medium text-foreground">4. Synthesize.</span>{" "}
                A synthesizer LLM returns the top competitors with name, URL,
                one-sentence description, and source angles.
              </li>
            </ol>
          </section>

          <section className="mt-16 border-t border-border/40 pt-12">
            <h2 className="font-heading text-2xl tracking-tight sm:text-3xl">
              Questions
            </h2>
            <dl className="mt-5 space-y-5">
              {FAQ.map(({ q, a }) => (
                <div key={q}>
                  <dt className="text-sm font-medium text-foreground">{q}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {a}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-16 rounded-2xl border border-brand/30 bg-brand/5 p-6 text-center sm:p-8">
            <Search className="mx-auto size-6 text-brand" />
            <h2 className="mt-3 font-heading text-2xl tracking-tight sm:text-3xl">
              Got your competitor map?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              OpenCorp reads your product page, then surfaces the Reddit and
              Hacker News threads where each competitor is mentioned and where
              buyers describe the problem you solve. Free, open source.
            </p>
            <Button size="lg" className="mt-5" asChild>
              <Link href="/dashboard">
                Run full research
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </section>
        </article>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </MarketingShell>
  );
}
