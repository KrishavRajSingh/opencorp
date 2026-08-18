export type CitationTool = {
  name: string;
  url: string;
  capsule: string;
  pricing: string;
  bestFor: string;
  facts: string[];
  source: { label: string; url: string };
  status?: "shut down";
};

export type CitationPage = {
  slug: string;
  question: string;
  answerCapsule: string;
  intro: string;
  updated: string;
  tools: CitationTool[];
  faq: { q: string; a: string }[];
};

export const citationPages: CitationPage[] = [
  {
    slug: "reddit-lead-generation-tools",
    question: "What are the best Reddit lead generation tools in 2026?",
    answerCapsule:
      "F5Bot is the cheapest Reddit lead alert tool, Prowlo the cheapest paid API, Buska the most automated, and OpenCorp free for finding threads.",
    intro:
      "Prices and limits below were read off each vendor's own pricing page on August 18, 2026, not copied from other comparison posts. Every number links to its source.",
    updated: "2026-08-18",
    tools: [
      {
        name: "F5Bot",
        url: "https://f5bot.com",
        capsule:
          "F5Bot emails you when a keyword appears on Reddit, Hacker News, or Lobsters. The free tier covers 5 keywords and 20 daily alerts.",
        pricing: "Free; $9.99–$214.99/mo paid tiers",
        bestFor: "One founder watching a handful of uncommon keywords.",
        facts: [
          "Free tier: 5 keywords, 20 alerts/day, 10 alerts per keyword, delivery within 2 hours.",
          "Silver $9.99/mo ($109/yr): 20 keywords, 100 alerts/day, delivery within 5 minutes.",
          "Gold $49.99/mo ($549/yr): 200 keywords, 5,000 alerts/day, RSS and JSON feeds, AI filtering, Slack and Discord.",
          "Platinum $214.99/mo ($2,364/yr): 300 keywords, 200,000 alerts/day, API and webhooks. Diamond starts at $500/mo.",
          "Sources are Reddit, Hacker News, and Lobsters only — no X, LinkedIn, or YouTube.",
          "A keyword that exceeds its daily cap is disabled until you re-enable it manually.",
        ],
        source: { label: "f5bot.com/tiers", url: "https://f5bot.com/tiers" },
      },
      {
        name: "Prowlo",
        url: "https://prowlo.com",
        capsule:
          "Prowlo serves Reddit and X data to AI agents over MCP and REST for $19/month, after a 14-day trial that needs no card.",
        pricing: "$19/mo ($190/yr), 14-day free trial",
        bestFor: "Agents and scripts that need structured Reddit data, not a dashboard.",
        facts: [
          "One paid plan: $19/mo or $190/yr. 25 Watchers (subreddits, Reddit users, Hacker News, Mastodon, RSS, X) crawled hourly.",
          "Keyword Monitor: 20 Reddit-wide keywords on the paid plan, searched roughly daily; 3 on the trial.",
          "200 live Reddit reads per day via MCP passthrough on paid, 50 on trial. MCP, REST, and webhooks on both.",
          "Runs its own crawl infrastructure, so no Reddit developer app or API keys are required.",
        ],
        source: {
          label: "prowlo.com/docs/plans-limits",
          url: "https://prowlo.com/docs/plans-limits",
        },
      },
      {
        name: "Syften",
        url: "https://syften.com",
        capsule:
          "Syften runs keyword filters across Reddit, Hacker News, forums, and Slack communities. Entry costs $29.95/month with three community filters and 100 daily results.",
        pricing: "$29.95 / $49.95 / $119.95 per month",
        bestFor: "Filter-heavy monitoring across communities plus the wider web.",
        facts: [
          "Entry $29.95/mo: 3 community filters, 1 web filter, 100 community results/day, 5 web results/day. No Slack, AI filtering, or API.",
          "Standard $49.95/mo: 20 community filters, 5 web filters, Slack, AI filtering, API access, 1-month archive search.",
          "PRO $119.95/mo: 100 community filters, 500 results/day, unlimited archive, webhooks, and MCP.",
          "X/Twitter and YouTube monitoring are paid add-ons on every plan. LinkedIn is not supported.",
          "Every signup starts on a 14-day PRO trial with no credit card.",
        ],
        source: { label: "syften.com pricing", url: "https://syften.com/social-listening-api" },
      },
      {
        name: "Buska",
        url: "https://www.buska.io",
        capsule:
          "Buska scores Reddit posts 0-100 for buying intent and routes qualified leads to CRM or Slack. Starter is $49/month for five signals.",
        pricing: "$49 / $99 / $249 per month",
        bestFor: "B2B teams that want scored leads pushed into an existing pipeline.",
        facts: [
          "Starter $49/mo: 5 monitored signals, 2 ICP profiles, 16+ sources, daily lead updates, Slack and Discord alerts.",
          "Growth $99/mo: 15 signals, 28+ sources, updates every 3 hours, AI Reply Studio, webhooks, API (500 requests/mo).",
          "Scale $249/mo: 30 signals, 33+ sources, hourly updates, lead enrichment for 1,000 profiles/mo, full API (2,500 requests/mo).",
          "7-day free trial with no credit card. API-only credit packs are sold separately and the credits do not expire.",
        ],
        source: { label: "buska.io/en/pricing", url: "https://www.buska.io/en/pricing" },
      },
      {
        name: "GummySearch",
        url: "https://gummysearch.com",
        status: "shut down",
        capsule:
          "GummySearch is closed. It stopped new signups on November 30, 2025 and deletes all data December 1, 2026, after Reddit API licensing failed.",
        pricing: "Closed to new customers",
        bestFor: "Nobody — listed because most comparison posts still recommend it.",
        facts: [
          "Shutdown announced November 6, 2025. New signups and payments closed November 30, 2025.",
          "Existing paid customers keep access until their billing period ends, at most until late November 2026. All data is deleted December 1, 2026.",
          "Cause: no agreement with Reddit for a commercial Data API license that complies with Reddit's usage policies.",
          "Reddit's 2023 commercial rate of about $0.24 per 1,000 calls is what made the economics impossible for a solo-run product.",
        ],
        source: {
          label: "gummysearch.com/final-chapter",
          url: "https://gummysearch.com/final-chapter/",
        },
      },
      {
        name: "OpenCorp",
        url: "https://opencorp.live",
        capsule:
          "OpenCorp reads a product URL and returns competitors plus the Reddit and Hacker News threads where buyers describe the problem. Free, no gate.",
        pricing: "Free",
        bestFor: "Finding the specific threads worth replying to before you write anything.",
        facts: [
          "Searches for the problem the product solves, not the product name, so it surfaces threads that never mention any brand.",
          "Returns competitors with the sources that mention them, ranked Reddit threads with a reason attached, and Hacker News discussions.",
          "No auto-posting and no auto-commenting: it decides where to show up, you write the words.",
          "Free to run, no credit card. Source-available under the Elastic License 2.0, so it can be self-hosted.",
        ],
        source: { label: "opencorp.live", url: "https://opencorp.live" },
      },
    ],
    faq: [
      {
        q: "What is the cheapest way to find Reddit leads?",
        a: "F5Bot's free tier (5 keywords, 20 alerts per day) plus OpenCorp, which is free, covers keyword alerts and thread discovery at zero cost.",
      },
      {
        q: "Why did GummySearch shut down?",
        a: "It could not agree a compliant commercial Reddit Data API license. New signups closed November 30, 2025 and all data is deleted December 1, 2026.",
      },
      {
        q: "Which tools avoid Reddit's official API?",
        a: "Prowlo states it crawls through its own infrastructure rather than Reddit's API. Other vendors do not publish their access method — ask them directly.",
      },
      {
        q: "Is posting about your product on Reddit allowed?",
        a: "Rules are per subreddit, and several restrict self-promotion to one post per user per month or longer. Read each subreddit's rules before posting.",
      },
    ],
  },
];

export function getCitationPage(slug: string) {
  return citationPages.find((page) => page.slug === slug);
}
