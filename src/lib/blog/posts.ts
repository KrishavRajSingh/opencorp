export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  body: string[];
  /** ISO date string */
  publishedAt: string;
  updatedAt?: string;
  relatedSlugs?: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "what-is-programmatic-seo",
    title: "What is programmatic SEO? A founder's guide to ranking thousands of pages",
    description:
      "Programmatic SEO is the practice of generating hundreds of pages from a template plus structured data. Here's the definition, three failure modes, and a working stack for indie hackers.",
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-01",
    relatedSlugs: ["programmatic-seo-tools"],
    body: [
      "Programmatic SEO (pSEO) is the practice of generating hundreds or thousands of web pages from a single template plus a structured dataset — one URL per row of your data. The canonical examples are the comparison sites you use daily without thinking about it: 'best CRM for [industry]', 'data breach report for [company]', '[city] weather averages'.",
      "For a solo founder, pSEO is the cheapest paid-acquisition channel that scales past launch. A single well-built template, can 500 URLs pointing at the same audience — and each one has a real chance of ranking for a long-tail query your competitors never bothered to optimize for. The economics work because the marginal cost of the thousandth page is roughly zero, while the marginal benefit compounds.",
      "The reason most founders fail at pSEO is not the generation step. It is the planning step. I'll explain what works, what doesn't, and a stack you can ship this week.",
      "## The mechanics, in three lines",
      "You pick a query pattern with high long-tail volume and weak SERP competition — 'best [tool] for [role]','[service] in [city]','[company] [data point]'. You build a single page template that pulls structured data per row — name, price, integrations, photos, customer language. You publish one URL per row, each one with unique per-page content Google cannot flag as templated.",
      "The result is hundreds of URLs indexed in weeks, each targeting a query volume you could never write individual blog posts to cover.",
      "## The three failure modes I see every week",
      "**Failure one: thin templated content.** You generate 'best CRM for dentists' and the only thing that changes is the word 'dentists' versus 'lawyers'. Google's helpful-content systems flag this within a crawl cycle, and your whole template, can collapses. The fix: real per-page data. Photos, pricing, real feature distinctions, customer reviews per industry — anything that makes 'best CRM for dentists' genuinely different from 'best CRM for lawyers'.",
      "**Failure two: skipped keyword research.** The biggest pSEO sites rank because they picked patterns where the SERP is winnable, not because their generation pipeline is clever. Before you build a template, check: are the top 10 results weak content directories with thin answers? Are there any tool-list roundups dominating? Is there a single canonical guide that everyone links to? If the answer is no on all three, the SERP is winnable. If the answer is yes on any, you need a different angle (data, interactivity, freshness) or a different pattern.",
      "**Failure three: no internal linking graph.** pSEO pages need to link to each other in clusters — 'best CRM for dentists' links to 'best CRM for lawyers' and 'CRM pricing comparison 2026'. Without that graph, each page is an island competing on its own merits. With the graph, the cluster ranks together. Ahrefs has a feature called Topical Authority that measures exactly this. Use it.",
      "## A stack that works on a solo budget",
      "For OpenCorp itself, the /best/ pages are programmatic SEO with three pieces: a Next.js template that pulls tool data from a TypeScript module, a structured data array keyed by row, and per-page FAQs written by a human. Costs roughly $30/month to host on Vercel. Indexes within 48 hours for most patterns.",
      "The full stack I'd recommend for a new pSEO site in 2026:",
      "**Keyword + backlink research (planning layer):** Ahrefs or Surfer. You cannot skip this — most pSEO failures are planning failures.",
      "**Content generation (production layer):** Byword, SEOmatic, Cuppa.sh, or Frase depending on whether you want bulk CSV-to-page, no-code templates, or SERP-driven briefs.",
      "**Hosting + CMS:** Webflow, Next.js, or Framer. Webflow and Framer are faster to ship; Next.js is faster to scale.",
      "**Monitoring:** Search Console (free) for what Google sees. Ahrefs or Semrush for what competitors rank for.",
      "I broke down all the pSEO tools I have actually used, with prices read off each vendor's own page, on the /best/programmatic-seo-tools comparison. The list covers everything from $49/mo autonomous agents to the canonical keyword research suites.",
      "## What to do this week",
      "Pick one query pattern. Verify the SERP is winnable with the three checks above. Build a 20-row dataset — yes, twenty, not two hundred, because you'll iterate on template and structure. Publish the 20 URLs. Submit them in Search Console. Wait two weeks. Measure which ones indexed and what position. Now scale.",
      "The first 20 URLs teach you what to fix in the template — the structure, the FAQ selection, the data you forgot to include. By the time you've shipped 200 URLs, the template, can handle 2,000. By 2,000, it handles 20,000.",
      "Programmatic SEO is the rare marketing channel where the hundred-thousandth visitor costs roughly the same as the thousandth. The only constraint is your willingness to do the planning step that most founders skip.",
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}