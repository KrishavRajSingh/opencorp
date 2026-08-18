import type { MetadataRoute } from "next";
import { citationPages } from "@/lib/citation-pages";

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
    {
      url: `${SITE_URL}/dashboard`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/auth/sign-up`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...citationPages.map((page) => ({
      url: `${SITE_URL}/best/${page.slug}`,
      lastModified: new Date(page.updated),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${SITE_URL}/auth/sign-in`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
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
