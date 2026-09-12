import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageSquare, Search, Trophy } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";
import { Button } from "@/components/ui/button";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://opencorp.live";

export const metadata: Metadata = {
  title: "Free tools for founders — OpenCorp",
  description:
    "Zero-login tools for SaaS founders: find Reddit threads, find HN discussions, draft Show HN posts, and map competitors. Free, no account.",
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "Free tools for founders — OpenCorp",
    description:
      "Zero-login tools for SaaS founders. Find Reddit threads, find HN discussions, draft Show HN posts, and map competitors.",
    url: `${SITE_URL}/tools`,
    type: "website",
  },
};

const TOOLS = [
  {
    slug: "reddit-thread-finder",
    name: "Reddit thread finder",
    blurb:
      "Type a keyword, get the top 25 Reddit threads ranked by relevance, upvotes, comments, or recency. Filter by subreddit.",
    cta: "Open tool",
    icon: MessageSquare,
    available: true,
  },
  {
    slug: "hn-thread-finder",
    name: "Hacker News thread finder",
    blurb:
      "Type a keyword, get the top HN threads with relevance scoring. Includes Show HN and Ask HN posts.",
    cta: "Open tool",
    icon: Search,
    available: true,
  },
  {
    slug: "niche-subreddit-finder",
    name: "Niche subreddit finder",
    blurb:
      "Type a topic, get the top Reddit subreddits ranked by post count, score, and comments. Free, no login.",
    cta: "Open tool",
    icon: MessageSquare,
    available: true,
  },
  {
    slug: "show-hn-drafter",
    name: "Show HN drafter",
    blurb:
      "Paste your product URL, get a Show HN post draft in the HN community format. Plain titles, no marketing adjectives.",
    cta: "Open tool",
    icon: Trophy,
    available: true,
  },
  {
    slug: "competitor-scraper",
    name: "Competitor scraper",
    blurb:
      "Paste any product URL, get the top 5-10 competitors deduped across 5 search angles. Same engine as the full OpenCorp research, no login.",
    cta: "Open tool",
    icon: ArrowRight,
    available: true,
  },
  {
    slug: "show-hn-drafter",
    name: "Show HN drafter",
    blurb:
      "Paste your product URL, get three Show HN post drafts that follow the HN community's format. Plain titles, no adjectives.",
    cta: "Coming soon",
    icon: Trophy,
    available: false,
  },
];

export default function ToolsIndexPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "OpenCorp free founder tools",
    numberOfItems: TOOLS.length,
    itemListElement: TOOLS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/tools/${t.slug}`,
      name: t.name,
      description: t.blurb,
    })),
  };

  return (
    <MarketingShell>
      <main className="flex-1 pt-20">
        <article className="mx-auto max-w-4xl px-6 pb-24 pt-12 sm:pt-20">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
              Free tools · No login
            </p>
            <h1 className="mt-3 font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
              Founder tools that earn their keep without a paywall
            </h1>
            <p className="mt-5 border-l-2 border-brand pl-4 text-lg leading-8 text-muted-foreground">
              Each tool below runs in your browser, no account, no card. If
              you need the full research report (alternatives, HN threads,
              and Reddit threads for your own product), OpenCorp&apos;s main
              workflow is also free.
            </p>
          </header>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const inner = (
                <div className="flex h-full flex-col rounded-xl border border-border/50 bg-card/40 p-5 transition-colors hover:border-brand/40">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-brand" />
                    <h2 className="font-heading text-lg tracking-tight text-foreground">
                      {tool.name}
                    </h2>
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {tool.blurb}
                  </p>
                  <p className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-foreground">
                    {tool.cta}
                    <ArrowRight className="size-3" />
                  </p>
                </div>
              );
              return (
                <li key={tool.slug}>
                  {tool.available ? (
                    <Link href={`/tools/${tool.slug}`} className="block h-full">
                      {inner}
                    </Link>
                  ) : (
                    <div className="block h-full cursor-not-allowed opacity-60">
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <section className="mt-16 rounded-2xl border border-brand/30 bg-brand/5 p-6 text-center sm:p-8">
            <h2 className="font-heading text-2xl tracking-tight sm:text-3xl">
              Need the full picture?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Drop your product link. OpenCorp returns alternatives, ranked
              Reddit threads, ranked Hacker News discussions, and a Show HN
              draft in under a minute. Free, open source.
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
