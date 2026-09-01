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
  {
    slug: "what-is-social-listening",
    title: "What is social listening? A founder's guide to monitoring the conversations that matter",
    description:
      "Social listening is monitoring what people say about your problem space across Reddit, X, LinkedIn, and forums. Here's how it differs from social monitoring, the five platforms that matter for indie founders, and the cheapest stack that works.",
    publishedAt: "2026-09-01",
    relatedSlugs: ["ai-social-listening-tools"],
    body: [
      "Social listening is the practice of monitoring what people say about your problem space across social networks, forums, and review sites — then turning those conversations into product, marketing, and sales decisions. It is not the same as social monitoring. Monitoring tells you when someone mentions your brand. Listening tells you what the market wants, before anyone mentions your brand.",
      "For indie founders, social listening is the cheapest market research channel that improves with time. A single well-built query can surface 50 leads a month, every month, for years — without ad spend, without cold email, without posting on anyone's behalf. The marginal effort of the hundredth insight is near zero, once the queries system is wired.",
      "## Social monitoring vs social listening",
      "Most tools labeled 'social listening' actually do social monitoring. The distinction matters.",
      "Monitoring watches for mentions of your brand or your keywords and alerts you when something appears. 'Someone tweeted about OpenCorp' is monitoring. Useful for support, useless for finding new leads.",
      "Listening goes wider. It watches the problem space — not your brand. 'Founders asking how to find leads on Reddit' is listening. It surfaces prospects who never typed your name, never visited your site, and never will until you show up in their thread.",
      "The tools that actually do listening combine three things: keyword monitoring across platforms, intent classification (does this person have a problem you solve?), and reply drafting or routing. Brand24 and Noisely do both in their base plans. Hootsuite and Sil and Sprout Social mostly do monitoring in theirs and sell listening separately.",
      "## The five platforms that matter for indie founders",
      "If you are selling to founders, indie hackers, or B2B SaaS buyers, the volume and signal ratio across platforms breaks down roughly like this:",
      "**Reddit.** Highest-intent B2B conversations on the public internet. A single Reddit thread where someone describes your exact problem in their own words is worth more than 100 Google search results. Tools that surface this: F5Bot (free tier), Syften ($29.95/mo), GummySearch (shut down 2025 — Reddit API licensing failed).",
      "**X / Twitter.** Good for public launches and signal-boosting, weaker for leads. Most 'social listening tools' over-weight X because the firehose is easy to license. Be careful of tools that count X mentions as their primary differentiator.",
      "**LinkedIn.** Best signal-to-noise for B2B intent — but only with a Sales Navigator seat, which is $100/mo minimum. Most indie founders skip LinkedIn listening because of the cost. If you sell to enterprise or mid-market, it is worth it.",
      "**Hacker News.** Underrated. If you sell to technical founders, the Show HN and Ask HN threads are the highest-signal public conversations on the internet. Free monitoring: manual reading. Paid: Prowlo ($19/mo) or a lightweight scraper.",
      "**YouTube and TikTok.** Mostly noise unless you sell to creators. Skip unless that is your ICP.",
      "## The cheapest stack that works for indie founders",
      "For OpenCorp itself, we use a stack that costs $0/month and surfaces the threads worth replying to:",
      "**Step one: a query list of 10-20 keywords tied to the problem you solve.** Not your brand name. Your buyer's problem in their own words. 'how to find leads on reddit' is a query. 'how to do sales outreach without sounding desperate' is a query. 'what is programmatic seo' is a query. Build the list once.",
      "**Step two: a free or $30/mo monitoring tool.** F5Bot free tier for 5 keywords. Syften $29.95/mo for 20+ keywords across Reddit, HN, and forums. Prowlo $19/mo if you want API access for your own scripts.",
      "**Step three: a weekly review cadence.** 30 minutes every Friday. Read every thread that surfaced. Reply to the three highest-intent ones. Archive the rest. The discipline matters more than the tool.",
      "If your volume is high enough that manual review breaks, escalate to Brand24 ($199/mo entry) for AI sentiment + intent scoring, or Buska ($49/mo) for buying-intent scores on Reddit specifically.",
      "I catalogued the AI social listening tools I have actually used, with prices read off each vendor's own page, on the /best/ai-social-listening-tools comparison. The list covers the $9/mo Reddit monitors through the $1,000+/mo enterprise suites like Brandwatch and Sprinklr — and which ones are worth what.",
      "## What to do this week",
      "Pick the five queries that, if you saw them in a Reddit thread today, would mean the poster is a fit for your product. Build a list. Set up F5Bot or Syften. Read the alerts every Friday for a month. By the end of the month you will know which queries surface real intent and which surface noise — and you will have replied to 10-15 prospects you would not have found any other way.",
      "Social listening is the rare distribution channel where the tenth lead costs the same as the first. The only constraint is your willingness to show up in threads you did not start.",
    ],
  },
  {
    slug: "how-to-find-leads-on-reddit",
    title: "How to find leads on Reddit without spamming the community",
    description:
      "Reddit lead generation works when you surface problem threads before they mention your brand. Here are the five query patterns that consistently surface real intent, the cheapest tools that automate it, and the reply workflow that doesn't get you banned.",
    publishedAt: "2026-09-01",
    relatedSlugs: ["reddit-lead-generation-tools", "reddit-tools-with-ai-replies"],
    body: [
      "Reddit lead generation is the highest-signal B2B channel most founders ignore. A single Reddit thread where someone describes your exact problem in their own words is worth more than 100 cold emails — because the poster has already self-qualified by writing the question publicly. The challenge is finding those threads before your competitors do, and replying in a way that doesn't get you banned or shadowed.",
      "Done wrong, you waste hours and damage your brand. Done right, you book 5-10 demos a week from people who never heard of you until you showed up in their thread.",
      "## The five query patterns that surface real intent",
      "Generic 'my industry + Reddit' queries surface noise. The threads worth replying to come from queries built around how buyers describe the problem in their own words. The five patterns that consistently surface real intent for indie founders selling B2B SaaS:",
      "**Pattern one: 'how to [do the thing your product does]'.** 'how to find leads on reddit' surfaces founders explicitly looking for what you sell. The thread title is the buyer's intent statement, written by the buyer, in the buyer's words. Reply with a concrete answer that happens to mention your tool.",
      "**Pattern two: 'alternative to [competitor]' or 'switching from [competitor]'.** 'alternative to Apollo' or 'switching from Lemlist' surfaces buyers actively evaluating. They are downstream-of-decision, often within days of a purchase.",
      "**Pattern three: '[your category] recommendations' or 'best [your category] for [role]'.** 'best cold email tool for solo founders' surfaces buyers comparing options. Reply with your tool plus two honest alternatives — readers notice when you cite competitors and it builds credibility.",
      "**Pattern four: 'why does [problem] keep happening' or 'I hate [problem]'.** 'why does cold email feel spammy' surfaces buyers who feel the pain but do not yet know the solution space. Your reply can reframe the problem in a way your tool addresses.",
      "**Pattern five: '[competitor] vs [competitor]' or 'comparing [A] and [B]'.** Buyers actively comparing two specific tools are downstream-of-decision. Your reply frames the comparison and adds the dimension they missed.",
      "These five patterns, run weekly, surface 10-30 high-intent threads per niche. That is enough volume to keep a solo founder in demos without paid spend.",
      "## The cheapest stack that automates the discovery",
      "For OpenCorp itself, we run a stack that costs $0/month for the core flow:",
      "**Step one: build the query list.** Five to ten query patterns per niche, written in the buyer's language. For a Reddit-monitoring tool, queries include 'how to find leads on reddit', 'reddit monitoring tool', 'alternative to GummySearch', 'best reddit monitoring for saas', 'why does my cold email feel spammy'. Build the list once.",
      "**Step two: monitor continuously.** Free tier: F5Bot for 5 keywords with 20 alerts/day. Paid: Syften at $29.95/mo for 20 community filters + Slack + AI filtering. Prowlo at $19/mo for structured API output if you want to pipe it into your own scripts.",
      "**Step three: route to a reply queue.** Tools like Linkeddit ($49/mo) and Buska ($49/mo) score each mention for buying intent and push qualified leads to Slack or CRM. OpenCorp itself does the discovery step for free — paste a product URL, get the threads plus a reason to reply.",
      "I catalogued the Reddit lead generation tools I have actually used, with prices read off each vendor's own page, on the /best/reddit-lead-generation-tools comparison. For AI-drafted replies specifically (not the same as auto-posting), the /best/reddit-tools-with-ai-replies comparison covers RedShip, Barsee, GummySearch's replacement options, and the open-source CLI reddit-find.",
      "## The reply workflow that does not get you banned",
      "Auto-posting is banned by Reddit's spam policy. Manual replying is fine. The difference: a real reply adds context, references what the poster said, and is honest about whether your tool fits.",
      "**Template:** thank them for the question (1 sentence), restate the problem in your own words to show you read it (1 sentence), share a concrete tactic or tool that helps (1-2 sentences), mention your own tool only if it genuinely fits the case (1 sentence, with a link). Total: 4-6 sentences. Skip the pitch if it would not be relevant.",
      "**Cadence:** one reply per day per subreddit, max. Three replies per week to the same user, max. Never reply to your own mentions. Never use the same reply twice across threads — Reddit users notice.",
      "**Tracking:** every reply goes in a spreadsheet (or Notion table) with columns for date, subreddit, thread URL, reply URL, followup status. Review weekly. The threads that generated demos are the queries worth doubling down on.",
      "## What to do this week",
      "Pick your five query patterns. Build the list. Set up F5Bot free or Syften $29.95/mo. Read the alerts every Friday. Reply to the three highest-intent threads using the 4-6 sentence template. Log every reply. By the end of month two, you will know which queries surface real intent and which surface noise — and you will have replied to 30-50 prospects you would not have found any other way.",
      "Reddit lead generation is the rare channel where the tenth lead costs the same as the first. The only constraint is your willingness to show up in threads you did not start.",
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}