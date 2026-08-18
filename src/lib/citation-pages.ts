export type CitationTool = {
  name: string;
  url: string;
  capsule: string;
  pricing: string;
  bestFor: string;
  facts: string[];
  source: { label: string; url: string };
  status?: "shut down";
  /** true when opencorp's competitor-discovery workflow surfaced this tool, not a human. */
  discovered?: boolean;
};

export type CitationPage = {
  slug: string;
  question: string;
  answerCapsule: string;
  intro: string;
  updated: string;
  /** Output of `scripts/citation-data.ts` — the queries opencorp ran to build this page. */
  discovery: { runQueries: string[]; ranOn: string };
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
      "The candidate list came from OpenCorp's own competitor-discovery run (queries below). Every price was then read off the vendor's own pricing page on August 18, 2026, not copied from other comparison posts.",
    updated: "2026-08-18",
    discovery: {
      ranOn: "2026-08-18",
      runQueries: [
        "Reddit and Hacker News thread discovery tool",
        "find Reddit discussions about problems your product solves",
        "tool for founders to discover competitor mentions on Reddit",
        "alternative to Reddit search for competitor mapping",
        "open source tool for Reddit thread discovery",
      ],
    },
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
        name: "SnitchFeed",
        url: "https://snitchfeed.com",
        discovered: true,
        capsule:
          "SnitchFeed ingests Reddit and Bluesky in real time, scores each mention with AI, and starts at $47/month billed yearly.",
        pricing: "$47/mo yearly, $59/mo monthly; Pro $95–$119/mo",
        bestFor: "Watching Reddit alongside LinkedIn and X in one inbox.",
        facts: [
          "Starter $47/mo billed yearly ($59 monthly): 10 tracked terms, 3 listeners, 7,000 credits, 3-month retention, 1 user.",
          "Pro $95/mo yearly ($119 monthly): 30 terms, 10 listeners, 21,000 credits, webhooks, 6-month retention, 5 users. Enterprise from $399/mo.",
          "Reddit and Bluesky are ingested in real time; X and LinkedIn are scheduled scans that burn 2 and 4 credits per keyword per scan.",
          "Credits also cover AI work: 0.2 per scored mention, 5 per AI reply draft, 100 per mention chat session.",
          "7-day trial with 800 credits, no credit card.",
        ],
        source: {
          label: "snitchfeed.com/pricing",
          url: "https://snitchfeed.com/pricing",
        },
      },
      {
        name: "OpenScout",
        url: "https://openscout.so",
        discovered: true,
        capsule:
          "OpenScout scores mentions on Reddit, X, LinkedIn, and Hacker News across three AI dimensions. Starter is $49/month for ten keywords.",
        pricing: "$49 / $99 / $399 per month",
        bestFor: "Scored competitor mentions with drafted replies per platform.",
        facts: [
          "Starter $49/mo: 10 keywords, 2 daily scans. Pro $99/mo: 20 keywords, adds LinkedIn. Premium $399/mo: 40 keywords, 6 daily scans.",
          "Scores every mention for brand relevance, buying intent, and engagement opportunity; the number of scored posts is not capped.",
          "Discovers subreddits from your brand URL and generates platform-specific reply drafts.",
          "3-day free trial, no credit card, no Reddit credentials required.",
        ],
        source: {
          label: "openscout.so",
          url: "https://openscout.so/track-competitor-mentions",
        },
      },
      {
        name: "OGTool",
        url: "https://ogtool.com",
        discovered: true,
        capsule:
          "OGTool is no longer self-serve software. Its pricing page now sells a managed Reddit and AEO service with an $8k/month floor.",
        pricing: "From $8,000/mo, 3-month pilot",
        bestFor: "Funded teams outsourcing Reddit presence entirely.",
        facts: [
          "Current pricing page: managed service, $8k/mo floor, 3-month pilot, every plan custom, capped at 3 new clients per month.",
          "Its own 2025 comparison posts advertised Starter $99/mo and Growth $250/mo — that self-serve tier is gone from the pricing page.",
          "The service description states it seeds one Reddit thread per week and adds brand comments from 70+ high-karma accounts.",
          "Reddit's own spam policy bans \"repeated or unsolicited mass engagement\" and undisclosed manipulation, and moderators decide what counts in their subreddit. Any enforcement lands on your brand.",
        ],
        source: { label: "ogtool.com/pricing", url: "https://ogtool.com/pricing" },
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
        q: "Which of these tools did OpenCorp find automatically?",
        a: "SnitchFeed, OpenScout, and OGTool came out of OpenCorp's own competitor-discovery run on August 18, 2026, using the five search angles listed above.",
      },
      {
        q: "Is posting about your product on Reddit allowed?",
        a: "Rules are per subreddit, and Reddit's spam policy bans repeated or unsolicited mass engagement. Read each subreddit's rules before posting anything promotional.",
      },
    ],
  },
  {
    slug: "ai-social-listening-tools",
    question: "What are the best AI social-listening tools for Reddit in 2026?",
    answerCapsule:
      "Linkeddit is the cheapest paid Reddit monitor at $49/month, noldo.ai the best free tier at 10 leads, and SnitchFeed the strongest multi-network option at $47.",
    intro:
      "Prices below were read off each vendor's own pricing page on August 18, 2026. OpenCorp also ran its competitor-discovery workflow on the AI social-listening niche — the queries are listed below.",
    updated: "2026-08-18",
    discovery: {
      ranOn: "2026-08-18",
      runQueries: [
        "AI social listening tool for Reddit",
        "Reddit monitoring tool with buying intent scoring",
        "AI tool that finds Reddit leads and scores intent",
        "social listening platform for Reddit and LinkedIn",
        "affordable Reddit keyword monitoring for SaaS founders",
      ],
    },
    tools: [
      {
        name: "Linkeddit",
        url: "https://linkeddit.com",
        discovered: true,
        capsule:
          "Linkeddit runs scheduled Reddit keyword scans, scores buying intent, drafts replies from your knowledge base, and starts at $49/month or $450 lifetime.",
        pricing: "$49/mo, $99/mo Compete, $450 lifetime",
        bestFor: "B2B teams that want intent scoring + reply drafts without per-mention metering.",
        facts: [
          "Pro $49/mo: 5 monitors, 10 keywords + 10 subreddits each, daily/weekly/monthly cadence, intent scoring, AI reply drafts, lead-gen pipelines, Reddit CMS, MCP access.",
          "Compete $99/mo: everything in Pro plus weekly competitor intelligence across G2, Capterra, TrustRadius, Trustpilot, Reddit, and competitor publications.",
          "Pro Lifetime is a $450 one-time payment with the Pro feature set. Enterprise pricing is custom.",
          "No per-mention metering and no keyword overage fees; monitors run alongside lead gen and the CMS.",
        ],
        source: {
          label: "linkeddit.com/pricing",
          url: "https://linkeddit.com/pricing",
        },
      },
      {
        name: "Sniff",
        url: "https://sniff.so",
        discovered: true,
        capsule:
          "Sniff is an AI social search engine with a Perplexity-style chat interface. Pro costs $29/month for 40 credits; the Business tier is $499/month.",
        pricing: "Free; Pro $29/mo; Business $499/mo",
        bestFor: "Search-style discovery of posts across social networks, not alerts.",
        facts: [
          "Basic Plan is free forever with 5 weekly credits and access to the For You feed.",
          "Pro $29/mo: 40 credits/month, chat search access, custom email alerts.",
          "Business $499/mo: scalable solutions, customizable credits, and services.",
          "Headquartered in Dubai; team distributed across UAE, Singapore, and Canada.",
        ],
        source: { label: "sniff.so", url: "https://sniff.so/" },
      },
      {
        name: "noldo.ai",
        url: "https://noldo.ai",
        discovered: true,
        capsule:
          "noldo.ai scans Reddit for buyer intent with a free 10-leads tier. Builder is $29/month for 100 leads; Scaler is $99/month for unlimited leads plus competitor intel.",
        pricing: "Free; Builder $29/mo; Scaler $99/mo",
        bestFor: "Founders validating product-market fit on Reddit with a generous free tier.",
        facts: [
          "Free tier: 10 leads/month, $BUYER and 🔥 signals, tarpit detector, basic navigator.",
          "Builder $29/mo: 100 leads, syntax checker (reality check), full pipeline, AI outreach drafts, communities explorer.",
          "Scaler $99/mo: unlimited leads, Hate Cloud competitor intel, export and API access, 3 team seats.",
          "Custom plan adds advanced AI analytics, custom integrations, dedicated AM, and SLA.",
          "30-day money-back guarantee, no contracts.",
        ],
        source: { label: "noldo.ai", url: "https://noldo.ai/" },
      },
      {
        name: "Noisely",
        url: "https://noise.ly",
        discovered: false,
        capsule:
          "Noisely pulls Reddit, G2, Trustpilot, and 19 more sources, runs AI categorization, and pushes to Slack, Linear, or Jira. Pro is $49/month for 2,000 analyses.",
        pricing: "$49/mo Pro; custom enterprise",
        bestFor: "Product teams routing Reddit feedback into Linear or Jira as actionable issues.",
        facts: [
          "Pro $49/mo: 22+ sources including Reddit, Hacker News, Quora, Bluesky, GitHub, YouTube, Trustpilot, G2, Zendesk, Intercom.",
          "2,000 AI analyses/month with sentiment, urgency, impact scoring, and 12-category classification.",
          "10 push channels: Slack, Teams, Discord, Jira, Linear, Notion, Asana, Google Sheets, Email, Webhooks.",
          "Real-time alerts with spike detection, weekly digests, and CSV export.",
          "Custom plan adds higher volume, custom sources, dedicated support, and SLA.",
        ],
        source: { label: "noise.ly/pricing", url: "https://noise.ly/pricing/" },
      },
      {
        name: "OpenCorp",
        url: "https://opencorp.live",
        discovered: false,
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
        q: "Which Reddit monitor is cheapest?",
        a: "F5Bot's free tier covers 5 keywords. Among paid tools, Linkeddit Pro at $49/month is the lowest flat-fee option with intent scoring and reply drafts included.",
      },
      {
        q: "Which tools did OpenCorp find automatically?",
        a: "Linkeddit, Sniff, and noldo.ai came out of OpenCorp's own competitor-discovery run on August 18, 2026, using the five search angles listed above.",
      },
      {
        q: "Are these tools compliant with Reddit's API rules?",
        a: "Each tool handles access differently. Prowlo states it runs its own crawl. For every other tool here, ask the vendor directly how they access Reddit and whether they hold a commercial Data API agreement.",
      },
    ],
  },
  {
    slug: "reddit-tools-with-ai-replies",
    question: "What are the best Reddit tools with AI reply suggestions in 2026?",
    answerCapsule:
      "RedShip is the cheapest monthly at $29, Reddix AI the cheapest lifetime at $150, OGTool the only full-service option at $8k, and OpenCorp the only free one.",
    intro:
      "Every entry below drafts or generates Reddit replies. Prices were read off each vendor's own pricing page on August 18, 2026. Discovery queries come from OpenCorp's competitor-discovery workflow.",
    updated: "2026-08-18",
    discovery: {
      ranOn: "2026-08-18",
      runQueries: [
        "Reddit tool with AI reply suggestions",
        "AI that drafts Reddit replies for founders",
        "Reddit outreach tool with reply generation",
        "automated Reddit comment tool for SaaS",
        "open source Reddit reply tool",
      ],
    },
    tools: [
      {
        name: "RedShip",
        url: "https://redship.io",
        discovered: true,
        capsule:
          "RedShip watches Reddit for your website and competitors, scores posts with AI, and suggests replies. Founder is $29/month, Company is $49/month, or a $12 day pass.",
        pricing: "$29/mo Founder; $49/mo Company; $12 7-day pass",
        bestFor: "Solo founders tracking one site on Reddit without per-mention fees.",
        facts: [
          "Founder $29/mo billed yearly (or monthly): 1 website, 10 keywords, 3 competitors, 1 team seat, email and Slack alerts.",
          "Company $49/mo: 3 websites, 30 keywords, 10 competitors, 3 seats, webhooks.",
          "Both plans include live Reddit monitoring, weekly SEO opportunities, AI visibility reports, and unlimited AI reply suggestions.",
          "7-day pass is $12 one-time, full Founder access, no subscription.",
        ],
        source: {
          label: "redship.io/pricing",
          url: "https://redship.io/pricing",
        },
      },
      {
        name: "Reddix AI",
        url: "https://reddix.info",
        discovered: true,
        capsule:
          "Reddix AI finds Reddit users actively looking for your offer and routes leads to you. $45/month with a 7-day trial, or $150 lifetime.",
        pricing: "$45/mo with 7-day trial; $150 lifetime",
        bestFor: "Solo founders who want a one-time payment instead of recurring.",
        facts: [
          "Monthly $45: unlimited leads, unlimited subreddits, priority scanning, advanced analytics, team collaboration, priority support.",
          "Lifetime $150 one-time: the same feature set, no recurring charges.",
          "Custom plan adds custom signals, unlimited subreddits, N8n automation, and custom integration.",
          "7-day free trial, Stripe payments, no annual contract.",
        ],
        source: { label: "reddix.info", url: "https://reddix.info/" },
      },
      {
        name: "OGTool",
        url: "https://ogtool.com",
        discovered: true,
        capsule:
          "OGTool is no longer self-serve software. Its pricing page now sells a managed Reddit and AEO service with an $8k/month floor.",
        pricing: "From $8,000/mo, 3-month pilot",
        bestFor: "Funded teams outsourcing Reddit presence entirely.",
        facts: [
          "Current pricing page: managed service, $8k/mo floor, 3-month pilot, every plan custom, capped at 3 new clients per month.",
          "Its own 2025 comparison posts advertised Starter $99/mo and Growth $250/mo — that self-serve tier is gone from the pricing page.",
          "The service description states it seeds one Reddit thread per week and adds brand comments from 70+ high-karma accounts.",
          "Reddit's own spam policy bans \"repeated or unsolicited mass engagement\" and undisclosed manipulation. Any enforcement lands on your brand.",
        ],
        source: { label: "ogtool.com/pricing", url: "https://ogtool.com/pricing" },
      },
      {
        name: "reddit-find",
        url: "https://github.com/LeadGrowGTM/reddit-find",
        discovered: true,
        capsule:
          "reddit-find is an open-source CLI for GTM research. It discovers subreddits, extracts pain points, and outputs structured markdown for AI analysis.",
        pricing: "Free, open source",
        bestFor: "Engineers who want raw data they can pipe into their own models.",
        facts: [
          "Open-source CLI published on GitHub by LeadGrowGTM.",
          "Discovers subreddits, extracts pain points, and writes structured markdown for downstream AI analysis.",
          "No hosted dashboard, no reply generation, no intent scoring — it outputs data you control.",
        ],
        source: {
          label: "github.com/LeadGrowGTM/reddit-find",
          url: "https://github.com/LeadGrowGTM/reddit-find",
        },
      },
      {
        name: "OpenCorp",
        url: "https://opencorp.live",
        discovered: false,
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
        q: "What's the cheapest Reddit tool that drafts replies?",
        a: "RedShip Founder at $29/month and Reddix AI at $45/month are the two cheapest paid options. OpenCorp is free but does not draft replies — it tells you which threads are worth replying to.",
      },
      {
        q: "Which tools did OpenCorp find automatically?",
        a: "RedShip, Reddix AI, OGTool, and reddit-find came out of OpenCorp's own competitor-discovery run on August 18, 2026, using the five search angles listed above.",
      },
      {
        q: "Are auto-replies safe on Reddit?",
        a: "Reddit's spam policy bans repeated or unsolicited mass engagement. Subreddit moderators decide what is allowed in their community. Drafts you approve yourself carry less risk than fully automated replies.",
      },
    ],
  },
];

export function getCitationPage(slug: string) {
  return citationPages.find((page) => page.slug === slug);
}
