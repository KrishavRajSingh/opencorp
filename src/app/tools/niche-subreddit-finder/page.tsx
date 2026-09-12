import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";
import { Button } from "@/components/ui/button";
import { SubFinderForm } from "./form";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://opencorp.live";
const TOOL_URL = `${SITE_URL}/tools/niche-subreddit-finder`;

export const metadata: Metadata = {
  title: "Free niche subreddit finder — discover the right Reddit subs, no login",
  description:
    "Type a topic, get the Reddit subreddits with the most active discussions ranked by post count, score, and comments. Free, no login.",
  alternates: { canonical: "/tools/niche-subreddit-finder" },
  openGraph: {
    title: "Free niche subreddit finder — OpenCorp",
    description:
      "Discover the Reddit subs where your topic is most active. Free, no login.",
    url: TOOL_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free niche subreddit finder — OpenCorp",
    description:
      "Discover the Reddit subs where your topic is most active. Free, no login.",
  },
};

const FAQ = [
  {
    q: "Is this tool really free?",
    a: "Yes. No login, no account, no API key. We hit the public Reddit search endpoint and cache results at the edge for ten minutes.",
  },
  {
    q: "How are the subreddits ranked?",
    a: "By signal — a blend of post count, total score, and total comments from the last year. The most-active subs for your topic rise to the top.",
  },
  {
    q: "Why not just use Reddit's subreddit search?",
    a: "Reddit's native search shows results one post at a time. This tool groups posts by subreddit, ranks the subs, and shows you the top post from each, so you can spot the right home for your topic in seconds.",
  },
  {
    q: "What can I do with the results?",
    a: "Pick the top 2-3 subs, then run the full OpenCorp research on your product to surface the exact threads in those subs where your future users are most active.",
  },
];

export default function NicheSubredditFinderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Niche subreddit finder",
        url: TOOL_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description:
          "Free tool. Type a topic, get the Reddit subreddits with the most active discussions, ranked by signal.",
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
              Find the Reddit subs where your topic actually lives
            </h1>
            <p className="mt-5 border-l-2 border-brand pl-4 text-lg leading-8 text-muted-foreground">
              Type a topic, get the top 12 subreddits with the most active
              discussions, ranked by post count, score, and comments. Free, no
              account.
            </p>
          </header>

          <div className="mt-10">
            <SubFinderForm />
          </div>

          <section className="mt-20 border-t border-border/40 pt-12">
            <h2 className="font-heading text-2xl tracking-tight sm:text-3xl">
              How founders use this
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">
                  Find where your future users are.
                </span>{" "}
                Search the topic your product solves. The top 2-3 subs are
                where the high-intent questions live.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Validate a niche.
                </span>{" "}
                Compare the post count and engagement across related subs.
                Bigger sub + low competition topic = real distribution.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  See what people actually post.
                </span>{" "}
                Each entry shows the top post from that sub, so you read
                real-threads-not-marketing, not just sub stats.
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
            <Users className="mx-auto size-6 text-brand" />
            <h2 className="mt-3 font-heading text-2xl tracking-tight sm:text-3xl">
              Found your subs?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              OpenCorp reads your product page, then returns alternatives and
              the specific threads in those subs where your future users are
              most active. Free, open source.
            </p>
            <Button size="lg" className="mt-5" asChild>
              <Link href="/dashboard">
                Run full research
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
