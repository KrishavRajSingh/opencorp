import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ponytail: every /best/* and /blog/* page renders this in its closing CTA
// block so existing surfaces (which already get organic traffic) funnel
// visitors into the new zero-login tools. The /tools/* pages themselves are
// what we're trying to discover — the interlink is the SEO + UX graph that
// makes a single visitor count for more than one signal.

type ToolLink = {
  slug: string;
  label: string;
  blurb: string;
};

const TOOL_CATALOG: Record<string, ToolLink> = {
  "reddit-thread-finder": {
    slug: "reddit-thread-finder",
    label: "Free Reddit thread finder",
    blurb: "Type a keyword, get ranked threads.",
  },
  "hn-thread-finder": {
    slug: "hn-thread-finder",
    label: "Free HN thread finder",
    blurb: "Search Show HN + Ask HN by keyword.",
  },
  "niche-subreddit-finder": {
    slug: "niche-subreddit-finder",
    label: "Free niche subreddit finder",
    blurb: "Top subs ranked by signal.",
  },
  "show-hn-drafter": {
    slug: "show-hn-drafter",
    label: "Free Show HN drafter",
    blurb: "Paste a URL, get an HN-format draft.",
  },
  "competitor-scraper": {
    slug: "competitor-scraper",
    label: "Free competitor scraper",
    blurb: "Paste a URL, get the top 5-10 competitors.",
  },
};

export function ToolCta({
  toolSlugs,
  variant = "default",
}: {
  toolSlugs: string[];
  variant?: "default" | "compact";
}) {
  const tools = toolSlugs
    .map((s) => TOOL_CATALOG[s])
    .filter((t): t is ToolLink => Boolean(t));

  if (tools.length === 0) return null;

  if (variant === "compact") {
    return (
      <div className="mt-8 flex flex-wrap gap-2">
        {tools.map((t) => (
          <Link
            key={t.slug}
            href={`/tools/${t.slug}?utm_source=opencorp&utm_medium=cta&utm_campaign=interlink`}
            className="inline-flex items-center gap-1 rounded-md border border-brand/40 bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/20"
          >
            {t.label}
            <ArrowRight className="size-3" />
          </Link>
        ))}
      </div>
    );
  }

  return (
    <section className="mt-12 rounded-2xl border border-brand/30 bg-brand/5 p-6 sm:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
        Free tools · No login
      </p>
      <h2 className="mt-2 font-heading text-2xl tracking-tight text-foreground sm:text-3xl">
        Try the tools behind this research
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Each tool runs in your browser, no account, no card. Open one and the
        same engine that built this page surfaces the answer in seconds.
      </p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {tools.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/tools/${t.slug}?utm_source=opencorp&utm_medium=cta&utm_campaign=interlink`}
              className="group flex h-full flex-col rounded-lg border border-border/50 bg-card/40 p-4 transition-colors hover:border-brand/40"
            >
              <p className="text-sm font-medium text-foreground group-hover:text-brand">
                {t.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{t.blurb}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-brand">
                Open tool
                <ArrowRight className="size-3" />
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function getToolCtaSlugsForCitation(slug: string): string[] {
  const map: Record<string, string[]> = {
    "reddit-lead-generation-tools": ["reddit-thread-finder", "niche-subreddit-finder"],
    "ai-social-listening-tools": ["reddit-thread-finder", "hn-thread-finder"],
    "reddit-tools-with-ai-replies": ["reddit-thread-finder", "niche-subreddit-finder"],
    "programmatic-seo-tools": ["competitor-scraper"],
    "cold-email-outreach-tools": ["competitor-scraper"],
    "privacy-first-web-analytics-tools": [],
    "ai-writing-tools-for-marketers": [],
    "landing-page-builders": ["show-hn-drafter"],
  };
  return map[slug] ?? [];
}

export function getToolCtaSlugsForBlog(slug: string): string[] {
  const map: Record<string, string[]> = {
    "how-to-find-leads-on-reddit": ["reddit-thread-finder", "niche-subreddit-finder"],
    "what-is-social-listening": ["reddit-thread-finder", "hn-thread-finder"],
    "what-is-programmatic-seo": ["competitor-scraper"],
    "cold-email-deliverability-benchmark-2026": [],
  };
  return map[slug] ?? [];
}
