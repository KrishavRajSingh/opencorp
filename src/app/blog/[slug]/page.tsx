import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/marketing-shell";
import { blogPosts, getBlogPost } from "@/lib/blog/posts";
import { citationPages } from "@/lib/citation-pages";

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${i}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://opencorp.live";
  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": postUrl,
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        inLanguage: "en",
        author: {
          "@type": "Person",
          name: "Krishav Raj Singh",
          url: SITE_URL,
          jobTitle: "Founder, OpenCorp",
        },
        publisher: {
          "@type": "Organization",
          name: "OpenCorp",
          url: SITE_URL,
          logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
      },
    ],
  };

  const related = (post.relatedSlugs ?? [])
    .map((slug) => citationPages.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1 pt-20">
        <article className="mx-auto max-w-3xl px-6 pb-24 pt-12 sm:pt-20">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
              Field notes
            </p>
            <h1 className="mt-3 font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-6 border-l-2 border-brand pl-4 text-lg leading-8 text-foreground">
              {post.description}
            </p>
            <p className="mt-3 font-mono text-[11px] text-muted-foreground">
              By{" "}
              <a
                href={SITE_URL}
                className="underline decoration-brand/60 underline-offset-4 hover:text-foreground"
              >
                Krishav Raj Singh
              </a>
              , Founder, OpenCorp · Published {post.publishedAt}
              {post.updatedAt && post.updatedAt !== post.publishedAt && (
                <> · Updated {post.updatedAt}</>
              )}
            </p>
          </header>

          <div className="mt-10 space-y-6 text-[15px] leading-7 text-foreground/85">
            {post.body.map((paragraph, i) => {
              if (paragraph.startsWith("## ")) {
                return (
                  <h2
                    key={i}
                    className="font-heading text-2xl tracking-tight text-foreground pt-4"
                  >
                    {paragraph.replace(/^##\s+/, "")}
                  </h2>
                );
              }
              return (
                <p key={i}>
                  {renderInline(paragraph, `p-${i}`)}
                </p>
              );
            })}
          </div>

          {related.length > 0 ? (
            <section className="mt-16 border-t border-border/50 pt-10">
              <h2 className="font-heading text-xl tracking-tight text-foreground">
                Related comparisons
              </h2>
              <ul className="mt-5 space-y-5">
                {related.map((sibling) => (
                  <li key={sibling.slug}>
                    <Link
                      href={`/best/${sibling.slug}`}
                      className="text-foreground underline decoration-brand/60 underline-offset-4 hover:decoration-brand"
                    >
                      {sibling.question}
                    </Link>
                    <p className="mt-2 text-[15px] leading-7 text-muted-foreground">
                      {sibling.answerCapsule}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

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