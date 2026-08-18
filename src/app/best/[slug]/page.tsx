import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/marketing-shell";
import { citationPages, getCitationPage } from "@/lib/citation-pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return citationPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getCitationPage(slug);
  if (!page) return {};
  return {
    title: page.question,
    description: page.answerCapsule,
    openGraph: { title: page.question, description: page.answerCapsule },
    twitter: { title: page.question, description: page.answerCapsule },
    alternates: { canonical: `/best/${page.slug}` },
  };
}

export default async function CitationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getCitationPage(slug);
  if (!page) notFound();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { q: page.question, a: page.answerCapsule },
      ...page.faq,
    ].map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="flex-1 pt-20">
        <article className="mx-auto max-w-3xl px-6 pb-24 pt-12 sm:pt-20">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
              Tool data
            </p>
            <h1 className="mt-3 font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
              {page.question}
            </h1>
            <p className="mt-6 border-l-2 border-brand pl-4 text-lg leading-8 text-foreground">
              {page.answerCapsule}
            </p>
            <p className="mt-6 text-[15px] leading-7 text-muted-foreground">
              {page.intro}
            </p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
              Verified {page.updated}
            </p>
          </header>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  <th className="py-2 pr-4 font-normal">Tool</th>
                  <th className="py-2 pr-4 font-normal">Price</th>
                  <th className="py-2 font-normal">Best for</th>
                </tr>
              </thead>
              <tbody>
                {page.tools.map((tool) => (
                  <tr key={tool.name} className="border-b border-border/30">
                    <td className="py-3 pr-4 align-top text-foreground">
                      {tool.name}
                      {tool.status && (
                        <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                          {tool.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 align-top text-foreground/80">
                      {tool.pricing}
                    </td>
                    <td className="py-3 align-top text-foreground/80">
                      {tool.bestFor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-16 space-y-12">
            {page.tools.map((tool) => (
              <section key={tool.name}>
                <h2 className="font-heading text-xl tracking-tight text-foreground">
                  {tool.name}
                  {tool.status && (
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                      {tool.status}
                    </span>
                  )}
                </h2>
                <p className="mt-3 text-[15px] leading-7 text-foreground/85">
                  {tool.capsule}
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-6 text-[15px] leading-7 text-foreground/80">
                  {tool.facts.map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                </ul>
                <p className="mt-4 font-mono text-[11px] text-muted-foreground">
                  Source:{" "}
                  <a
                    href={tool.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-brand/60 underline-offset-4 hover:text-foreground"
                  >
                    {tool.source.label}
                  </a>
                </p>
              </section>
            ))}
          </div>

          <div className="mt-16 space-y-8">
            <h2 className="font-heading text-xl tracking-tight text-foreground">
              Questions
            </h2>
            {page.faq.map((item) => (
              <section key={item.q}>
                <h3 className="text-[15px] font-medium text-foreground">
                  {item.q}
                </h3>
                <p className="mt-2 text-[15px] leading-7 text-foreground/80">
                  {item.a}
                </p>
              </section>
            ))}
          </div>

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
