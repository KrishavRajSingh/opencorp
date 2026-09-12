import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";
import { Button } from "@/components/ui/button";
import { HNFinderForm } from "./form";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://opencorp.live";
const TOOL_URL = `${SITE_URL}/tools/hn-thread-finder`;

export const metadata: Metadata = {
  title: "Free Hacker News thread finder — search HN by keyword, no login",
  description:
    "Type a keyword, get the top Hacker News threads ranked by relevance, points, comments, or recency. Filter by Show HN or Ask HN. Free, no login.",
  alternates: { canonical: "/tools/hn-thread-finder" },
  openGraph: {
    title: "Free HN thread finder — OpenCorp",
    description:
      "Find the Hacker News threads where your future users are talking. Free, no login.",
    url: TOOL_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free HN thread finder — OpenCorp",
    description:
      "Find HN threads by keyword. Free, no login.",
  },
};

const FAQ = [
  {
    q: "Is this tool really free?",
    a: "Yes. No login, no account, no API key. We hit the public HN Algolia search endpoint and cache results at the edge for five minutes.",
  },
  {
    q: "How fresh are the results?",
    a: "HN Algolia indexes new threads within seconds, so the results reflect the most recent posts for your keyword at search time.",
  },
  {
    q: "Can I filter to Show HN only?",
    a: "Yes. Use the filter dropdown to restrict results to Show HN, Ask HN, or all stories.",
  },
  {
    q: "Why use this instead of the HN search bar?",
    a: "HN's native search bar is limited to relevance and time. This tool exposes points, comments, and recency as first-class sort options, and the filter to Show HN is a one-click toggle.",
  },
  {
    q: "What can I do with the results?",
    a: "Read the threads, then run the full OpenCorp research on your product to map alternatives and the Reddit discussions where your future users are also active.",
  },
];

export default function HNThreadFinderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Hacker News thread finder",
        url: TOOL_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description:
          "Free HN search tool. Find the top threads for any keyword, filter by Show HN or Ask HN, and sort by points, comments, or recency.",
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
              Find the HN threads where your users already talk
            </h1>
            <p className="mt-5 border-l-2 border-brand pl-4 text-lg leading-8 text-muted-foreground">
              Type a keyword, get the top 25 Hacker News threads ranked by
              relevance, points, comments, or recency. Filter to Show HN or
              Ask HN. Free, no account.
            </p>
          </header>

          <div className="mt-10">
            <HNFinderForm />
          </div>

          <section className="mt-20 border-t border-border/40 pt-12">
            <h2 className="font-heading text-2xl tracking-tight sm:text-3xl">
              How founders use this
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">
                  Mine Show HN for distribution ideas.
                </span>{" "}
                Search for the category your product lives in. Read every Show
                HN post that landed on the front page. Pattern-match the
                titles and first-comment formats that worked.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Find the exact threads to comment on.
                </span>{" "}
                Search for problems your product solves. Each thread is a
                place to leave a useful, non-promotional reply that links to
                your product as a resource.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Watch competitor launches.
                </span>{" "}
                Search for a competitor&apos;s name. Their Show HN post is
                the highest-intent thread on the internet for people
                evaluating alternatives.
              </li>
            </ul>
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
              Want this for your product?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              OpenCorp reads your product page, then returns alternatives, the
              Reddit threads, and the Hacker News discussions where your
              future users are already active — free.
            </p>
            <Button size="lg" className="mt-5" asChild>
              <Link href="/dashboard">
                Research your product
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <p className="mt-3 text-xs text-muted-foreground/70">
              No card · No expiry
            </p>
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
