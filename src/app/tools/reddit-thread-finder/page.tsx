import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";
import { Button } from "@/components/ui/button";
import { RedditFinderForm } from "./form";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://opencorp.live";
const TOOL_URL = `${SITE_URL}/tools/reddit-thread-finder`;

export const metadata: Metadata = {
  title: "Free Reddit thread finder — search Reddit by keyword, no login",
  description:
    "Type a keyword, get the top Reddit threads ranked by relevance, upvotes, comments, and recency. Filter by subreddit, sort by top/new/comments. Free, no login.",
  alternates: { canonical: "/tools/reddit-thread-finder" },
  openGraph: {
    title: "Free Reddit thread finder — OpenCorp",
    description:
      "Find the Reddit threads where your future users are already talking. Free, no login.",
    url: TOOL_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Reddit thread finder — OpenCorp",
    description:
      "Find Reddit threads by keyword. Free, no login.",
  },
};

const FAQ = [
  {
    q: "Is this tool really free?",
    a: "Yes. No login, no account, no rate limit beyond what Reddit allows for unauthenticated requests. We cache results for five minutes to keep the experience fast.",
  },
  {
    q: "How fresh are the results?",
    a: "Each query fetches the live Reddit search endpoint, so results reflect the most recent threads Reddit returns for your keyword at the time you search.",
  },
  {
    q: "Can I search a single subreddit?",
    a: "Yes. Add a subreddit in the r/ field and the tool will restrict the search to that subreddit only.",
  },
  {
    q: "Why use this instead of Reddit's own search?",
    a: "Reddit's native search UI buries threads in noise. This tool surfaces the top 25 results ranked by relevance (or upvotes, or comments), with author and age metadata, ready to scan in seconds.",
  },
  {
    q: "What can I do with the results?",
    a: "Read the threads, then run the full OpenCorp research on your product to map alternatives and the Hacker News discussions where your future users are also active.",
  },
];

export default function RedditThreadFinderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Reddit thread finder",
        url: TOOL_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description:
          "Free Reddit search tool. Find the top threads for any keyword, filtered by subreddit and sorted by relevance, upvotes, recency, or comments.",
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
              Find the Reddit threads where your users already talk
            </h1>
            <p className="mt-5 border-l-2 border-brand pl-4 text-lg leading-8 text-muted-foreground">
              Type a keyword, get the top 25 threads ranked by relevance,
              upvotes, comments, or recency. Filter by subreddit. Free, no
              account.
            </p>
          </header>

          <div className="mt-10">
            <RedditFinderForm />
          </div>

          <section className="mt-20 border-t border-border/40 pt-12">
            <h2 className="font-heading text-2xl tracking-tight sm:text-3xl">
              How founders use this
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">
                  Find your first 10 customers.
                </span>{" "}
                Search for the problem your product solves. The threads with
                the most comments are where buyers are most actively comparing
                options.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Track competitor mentions.
                </span>{" "}
                Search for a competitor&apos;s name. The threads that show up
                are the same ones their marketing team is monitoring — yours
                should be too.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Validate a feature request.
                </span>{" "}
                Search for the pain point your last release addressed. Count
                how many threads ask for it. That&apos;s your launch angle.
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
