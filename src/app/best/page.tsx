import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { citationPages } from "@/lib/citation-pages";

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

  return (
    <MarketingShell>
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
              </li>
            ))}
          </ul>
        </article>
      </main>
    </MarketingShell>
  );
}
