import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { citationPages } from "@/lib/citation-pages";

const HUB_FAQ = [
  {
    q: "How does OpenCorp build these comparison lists?",
    a: "OpenCorp runs its competitor-discovery workflow on each niche — five search angles designed to surface tools the founder audience actually evaluates. Every surviving tool is then verified against its own pricing page; only the verifiable ones land on the list.",
  },
  {
    q: "Are these comparisons updated regularly?",
    a: "Each list was re-verified through September 1, 2026, with prices checked against the vendor's own pricing page. Tools that shut down or pivot pricing are flagged in their entry — see the GummySearch shutdown note on the Reddit lead generation page.",
  },
  {
    q: "Why does OpenCorp show up on every list?",
    a: "OpenCorp is the product behind this site, and it's free — so it earns its place on every comparison it fits. Where it doesn't fit (cold email, landing pages, analytics) it's omitted. The same five picking criteria apply to it as to any other tool.",
  },
];

export const metadata: Metadata = {
  title: "Best SaaS tools in 2026 — OpenCorp comparisons",
  description:
    "Eight best-of comparisons for SaaS founders, with verified pricing and the search angles used to build each list.",
  alternates: { canonical: "/best" },
};

export default function BestIndexPage() {
  const sorted = [...citationPages].sort((a, b) =>
    a.updated < b.updated ? 1 : a.updated > b.updated ? -1 : 0,
  );

  const hubJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: "OpenCorp best-of SaaS comparisons 2026",
        numberOfItems: sorted.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: sorted.map((page, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `https://opencorp.live/best/${page.slug}`,
          name: page.question,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: HUB_FAQ.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubJsonLd) }}
      />
      <main className="flex-1 pt-20">
        <article className="mx-auto max-w-3xl px-6 pb-24 pt-12 sm:pt-20">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
              Comparisons
            </p>
            <h1 className="mt-3 font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
              Best SaaS tools in 2026
            </h1>
            <p className="mt-6 border-l-2 border-brand pl-4 text-lg leading-8 text-foreground">
              Eight lists of the tools SaaS founders actually compare in 2026,
              with prices read off each vendor&rsquo;s own page and the search
              angles used to build each candidate list.
            </p>
            <p className="mt-3 font-mono text-[11px] text-muted-foreground">
              By{" "}
              <a
                href="https://opencorp.live"
                className="underline decoration-brand/60 underline-offset-4 hover:text-foreground"
              >
                Krishav Raj Singh
              </a>
              , Founder, OpenCorp
            </p>
          </header>

          <ul className="mt-12 space-y-10">
            {sorted.map((page) => (
              <li key={page.slug} className="border-b border-border/30 pb-10">
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
                  Verified {page.updated}
                </p>
                <h2 className="mt-2 font-heading text-2xl tracking-tight text-foreground">
                  <Link
                    href={`/best/${page.slug}`}
                    className="underline decoration-brand/60 underline-offset-4 hover:decoration-brand"
                  >
                    {page.question}
                  </Link>
                </h2>
                <p className="mt-3 text-[15px] leading-7 text-foreground/85">
                  {page.answerCapsule}
                </p>
                <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
                  <Link
                    href={`/best/${page.slug}`}
                    className="underline decoration-brand/60 underline-offset-4 hover:decoration-brand"
                  >
                    Read the {page.tools.length}-tool comparison →
                  </Link>
                </p>
              </li>
            ))}
          </ul>

          <section className="mt-16 space-y-8">
            <h2 className="font-heading text-xl tracking-tight text-foreground">
              Questions about these lists
            </h2>
            {HUB_FAQ.map((item) => (
              <section key={item.q}>
                <h3 className="text-[15px] font-medium text-foreground">
                  {item.q}
                </h3>
                <p className="mt-2 text-[15px] leading-7 text-foreground/80">
                  {item.a}
                </p>
              </section>
            ))}
          </section>

          <p className="mt-16 border-t border-border/50 pt-8 text-[15px] leading-7 text-muted-foreground">
            OpenCorp finds the exact Reddit and Hacker News threads where your
            buyers describe the problem you solve.{" "}
            <Link
              href="/dashboard"
              className="text-foreground underline decoration-brand/60 underline-offset-4 hover:decoration-brand"
            >
              Run it free on your product
            </Link>
            .
          </p>
        </article>
      </main>
    </MarketingShell>
  );
}
