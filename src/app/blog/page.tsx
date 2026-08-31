import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { blogPosts } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Field notes — OpenCorp",
  description:
    "Founder-voice essays on programmatic SEO, Reddit research, and finding users before they show up on your landing page.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const sorted = [...blogPosts].sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0,
  );

  return (
    <MarketingShell>
      <main className="flex-1 pt-20">
        <article className="mx-auto max-w-3xl px-6 pb-24 pt-12 sm:pt-20">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
              Field notes
            </p>
            <h1 className="mt-3 font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
              Field notes from the founder of OpenCorp
            </h1>
            <p className="mt-6 border-l-2 border-brand pl-4 text-lg leading-8 text-foreground">
              Essays on programmatic SEO, Reddit research, and what it actually
              takes to find users before they show up on your landing page.
            </p>
          </header>

          <ul className="mt-12 space-y-10">
            {sorted.map((post) => (
              <li key={post.slug} className="border-b border-border/30 pb-10">
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
                  Published {post.publishedAt}
                </p>
                <h2 className="mt-2 font-heading text-2xl tracking-tight text-foreground">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="underline decoration-brand/60 underline-offset-4 hover:decoration-brand"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 text-[15px] leading-7 text-foreground/85">
                  {post.description}
                </p>
              </li>
            ))}
          </ul>
        </article>
      </main>
    </MarketingShell>
  );
}