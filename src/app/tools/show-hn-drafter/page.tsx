import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";
import { Button } from "@/components/ui/button";
import { ShowHNForm } from "./form";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://opencorp.live";
const TOOL_URL = `${SITE_URL}/tools/show-hn-drafter`;

export const metadata: Metadata = {
  title: "Free Show HN drafter — write a Show HN post that respects the guidelines",
  description:
    "Paste your product URL, get a Show HN draft in the HN community format. Plain titles, no marketing adjectives, first-person voice. Free, no login.",
  alternates: { canonical: "/tools/show-hn-drafter" },
  openGraph: {
    title: "Free Show HN drafter — OpenCorp",
    description:
      "Draft a Show HN post the community actually engages with. Free, no login.",
    url: TOOL_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Show HN drafter — OpenCorp",
    description: "Draft a Show HN post the community actually engages with. Free, no login.",
  },
};

const FAQ = [
  {
    q: "What does this tool do?",
    a: "It drafts a Show HN post in the HN community format: plain noun-form title, first-person body, the sections the community expects (what it is, why you built it, technical detail, what's unfinished).",
  },
  {
    q: "Is this tool really free?",
    a: "Yes. No login, no account. The model is the same one we use for the full OpenCorp research flow.",
  },
  {
    q: "How do I make a Show HN that doesn't flop?",
    a: "Plain noun title, no marketing adjectives, first comment with what you actually built and what's still rough, reply in-thread for 48 hours. The drafter follows that format. The rest is the substance of your tool.",
  },
  {
    q: "Why not just write the post yourself?",
    a: "You should. Use the drafter as a starting point, then rewrite every section in your own voice. The point of the tool is to surface the format, not the words.",
  },
];

export default function ShowHNDrafterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Show HN drafter",
        url: TOOL_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description:
          "Free tool. Draft a Show HN post in the HN community format from your product URL.",
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
              Draft a Show HN post in the format HN actually respects
            </h1>
            <p className="mt-5 border-l-2 border-brand pl-4 text-lg leading-8 text-muted-foreground">
              Paste your product URL, get a draft with a noun-form title and a
              first-person body. Plain, specific, no marketing adjectives. Free,
              no account.
            </p>
          </header>

          <div className="mt-10">
            <ShowHNForm />
          </div>

          <section className="mt-20 border-t border-border/40 pt-12">
            <h2 className="font-heading text-2xl tracking-tight sm:text-3xl">
              Why most Show HN posts flop
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">
                  Marketing adjectives get flagged on sight.
                </span>{" "}
                &ldquo;Beautiful,&rdquo; &ldquo;revolutionary,&rdquo; &ldquo;AI-powered&rdquo; — the community
                reads these as a founder who doesn&apos;t know the format.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  The body should be a first-person narrative.
                </span>{" "}
                &ldquo;I built X because Y. Here&apos;s how it works. Here&apos;s what&apos;s
                still rough.&rdquo; Not a feature list.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  The first comment matters more than the post.
                </span>{" "}
                Live in the thread for 48 hours. Answer the &ldquo;why not just use Z&rdquo;
                questions with substance.
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
            <Sparkles className="mx-auto size-6 text-brand" />
            <h2 className="mt-3 font-heading text-2xl tracking-tight sm:text-3xl">
              Drafted your post?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              OpenCorp surfaces the threads where your future users already
              are, so you can leave useful comments and grow while your Show
              HN is on the front page. Free, open source.
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
