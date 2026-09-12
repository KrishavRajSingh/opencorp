import type { MetadataRoute } from "next";
import { citationPages } from "@/lib/citation-pages";
import { blogPosts } from "@/lib/blog/posts";

const TOOL_SLUGS = [
  "reddit-thread-finder",
  "hn-thread-finder",
  "niche-subreddit-finder",
  "show-hn-drafter",
  "competitor-scraper",
];

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://opencorp.live";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...citationPages
      .filter((page) => !page.noindex)
      .map((page) => ({
        url: `${SITE_URL}/best/${page.slug}`,
        lastModified: new Date(page.updated),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    {
      url: `${SITE_URL}/best`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogPosts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt ?? post.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    {
      url: `${SITE_URL}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...TOOL_SLUGS.map((slug) => ({
      url: `${SITE_URL}/tools/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${SITE_URL}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
