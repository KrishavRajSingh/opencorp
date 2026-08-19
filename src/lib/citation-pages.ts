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
  {
    slug: "cold-email-outreach-tools",
    question: "What are the best cold email outreach tools in 2026?",
    answerCapsule:
      "Saleshandy is the cheapest entry at $25/mo, Instantly the best unlimited-inbox pick at $47/mo, Lemlist the most creative at $79/seat, and Smartlead the agency default at $39/mo.",
    intro:
      "Below: prices read off each vendor's own pricing page on August 19, 2026. OpenCorp's competitor-discovery workflow can be rerun on the cold email niche — the five search angles that would build a fresh candidate list are below.",
    updated: "2026-08-19",
    discovery: {
      ranOn: "2026-08-19",
      runQueries: [
        "best cold email outreach software for founders",
        "cold email tool with unlimited mailboxes and warmup",
        "affordable cold email platform with built-in lead database",
        "cold email tool that does not charge per seat",
        "multi-channel cold outreach tool email LinkedIn phone",
      ],
    },
    tools: [
      {
        name: "Instantly",
        url: "https://instantly.ai",
        capsule:
          "Instantly combines unlimited sending mailboxes, warmup, and a 450M+ lead database. Growth starts at $30/mo annually or $47/mo monthly.",
        pricing: "Growth $30–47/mo, Hypergrowth $77–97/mo, Light Speed $286–358/mo",
        bestFor:
          "Solo founders wanting sourcing + sending + warmup in one tool.",
        facts: [
          "Unlimited email accounts on every plan.",
          "Growth: 1,000 active leads, 5,000 sends/mo, basic warmup.",
          "Hypergrowth: 25,000 active leads, advanced automation, AI Sales Agent.",
          "Warmup network of ~200,000 active inboxes — largest among general-purpose cold email tools.",
          "Lead database bundled on Hypergrowth and Light Speed; separate on Growth.",
          "14-day free trial; no permanent free tier.",
        ],
        source: { label: "instantly.ai/pricing", url: "https://instantly.ai/pricing" },
      },
      {
        name: "Smartlead",
        url: "https://smartlead.ai",
        capsule:
          "Smartlead offers unlimited mailboxes and unlimited warmup on every plan from $39/mo, the most cost-efficient setup for multi-inbox operations.",
        pricing: "Basic $39/mo, Pro $94/mo, Custom $174+/mo",
        bestFor: "Agencies running 30+ mailboxes at flat platform cost.",
        facts: [
          "Basic: unlimited mailboxes, 2,000 contacts, 6,000 sends/mo.",
          "Pro: unlimited mailboxes, 30,000 contacts, 90,000 sends/mo, master inbox, AI reply categorization.",
          "Custom/Agency tier adds white-label, SmartServers, dedicated client workspaces.",
          "~50,000-inbox warmup network built into every plan.",
          "89% reported inbox placement in vendor benchmark.",
          "Free trial, no credit card.",
        ],
        source: { label: "smartlead.ai/pricing", url: "https://smartlead.ai/pricing" },
      },
      {
        name: "Lemlist",
        url: "https://lemlist.com",
        capsule:
          "Lemlist is the most creative cold email tool — personalized images, video, custom landing pages, plus native LinkedIn and cold call steps. Per-seat from $39/mo annual.",
        pricing: "Email Outreach $39/seat/mo, Sales Engager $69/seat/mo, Multichannel Expert $99/seat/mo",
        bestFor:
          "Personalization-heavy outbound where creativity is the differentiator.",
        facts: [
          "3 mailboxes on Email Outreach, 5 on Multichannel Expert; extras at $9/mo each.",
          "Liquid syntax personalization pulls prospect attributes into copy.",
          "Lemwarm add-on: $29/mo per mailbox for warmup.",
          "450M+ B2B lead database bundled.",
          "AI image and video personalization built in.",
          "14-day free trial on paid plans.",
        ],
        source: { label: "lemlist.com/pricing", url: "https://lemlist.com/pricing" },
      },
      {
        name: "Apollo",
        url: "https://apollo.io",
        capsule:
          "Apollo combines a 200M+ B2B contact database, email sequences, and a built-in CRM. Free tier usable for testing; paid from $49/seat/mo.",
        pricing: "Free, Basic $49/seat/mo, Professional $79/seat/mo, Organization $119/seat/mo",
        bestFor: "Teams wanting database + sequences + CRM in one platform.",
        facts: [
          "Free tier: 100 data credits/mo, basic sequences.",
          "Basic: 5,000 export credits/mo, sequences, integrations.",
          "Professional: AI writing features, advanced sequencing, higher credit volume.",
          "Organization: full CRM, advanced reporting, dedicated support.",
          "Browser extension for LinkedIn prospecting.",
          "Per-seat billing — total cost scales with team size.",
        ],
        source: { label: "apollo.io/pricing", url: "https://apollo.io/pricing" },
      },
      {
        name: "Mailshake",
        url: "https://mailshake.com",
        capsule:
          "Mailshake is the simplest cold email platform with built-in dialer and SHAKEspeare AI copywriter. Email Outreach $59/seat/mo is the usable tier.",
        pricing: "Starter $29/seat/mo (annual only), Email Outreach $59/seat/mo, Sales Engagement $99/seat/mo",
        bestFor:
          "Sales teams wanting simple reliable email + LinkedIn cadence.",
        facts: [
          "No free trial (rare in this category).",
          "Starter $29/seat/mo is annual-only billing.",
          "Email Outreach: Lead Catcher, sending calendar, second inbox, CRM integrations.",
          "Sales Engagement: power dialer, LinkedIn automation, 10 inboxes.",
          "Built-in dialer — no separate Aircall/PowerDialer integration required.",
          "Native Salesforce, HubSpot, Pipedrive integrations.",
        ],
        source: { label: "mailshake.com/pricing", url: "https://mailshake.com/pricing" },
      },
      {
        name: "Saleshandy",
        url: "https://saleshandy.com",
        capsule:
          "Saleshandy is the cheapest credible cold email platform with sequences, A/B testing, warmup, and CRM integration. Outreach Starter $25/mo.",
        pricing: "Outreach Starter $25/mo, Outreach Pro $74/mo, Outreach Scale $149/mo",
        bestFor: "Solo founders and small teams sending under 5,000 emails/mo.",
        facts: [
          "Tiered by send volume, not by seat or mailbox.",
          "Built-in email warmup on all paid plans.",
          "20,000-inbox warmup network.",
          "Outreach Pro: 6,000 prospects, unlimited users, A/B testing.",
          "Outreach Scale: 50,000+ prospects, priority support.",
          "7-day free trial.",
        ],
        source: { label: "saleshandy.com/pricing", url: "https://saleshandy.com/pricing" },
      },
      {
        name: "OpenCorp",
        url: "https://opencorp.live",
        capsule:
          "OpenCorp reads a product URL and returns competitors plus the Reddit and Hacker News threads where buyers describe the problem. Free, no gate.",
        pricing: "Free",
        bestFor:
          "Finding the threads where cold email buyers describe their stack before writing a single line.",
        facts: [
          "Searches for the problem, not the product name — surfaces threads that never mention any brand.",
          "Returns competitors with sources, ranked Reddit threads with a reason attached, and Hacker News discussions.",
          "No auto-posting and no auto-commenting — it decides where to show up, you write the words.",
          "Free to run, no credit card. Source-available under the Elastic License 2.0.",
        ],
        source: { label: "opencorp.live", url: "https://opencorp.live" },
      },
    ],
    faq: [
      {
        q: "Which cold email tool is cheapest?",
        a: "Saleshandy Outreach Starter at $25/mo is the cheapest credible entry. For unlimited mailboxes, Smartlead Basic at $39/mo. For the lowest per-seat tier, Lemlist Email Outreach at $39/seat/mo annual.",
      },
      {
        q: "Which tool is best for agencies running multiple clients?",
        a: "Smartlead Custom/Agency tier from $174/mo: unlimited mailboxes, sub-account permissions, white-labeling, and a master inbox that aggregates replies across every client workspace.",
      },
      {
        q: "Which tool has the largest warmup network?",
        a: "Instantly reports ~200,000 inboxes. Smartlead reports ~50,000. Lemlist relies on its Lemwarm add-on at $29/mo per mailbox, billed separately.",
      },
      {
        q: "Do any of these tools also include a lead database?",
        a: "Instantly and Apollo include databases natively (Instantly's is modular, Apollo's is per-seat credit-bounded). Smartlead, Lemlist, Mailshake, and Saleshandy are sending tools — you bring your own data or buy it separately.",
      },
    ],
  },
  {
    slug: "programmatic-seo-tools",
    question: "What are the best programmatic SEO tools in 2026?",
    answerCapsule:
      "Byword is best for bulk article generation at $99/mo, SEOmatic the best no-code template builder from $49/mo, SEObot the best autonomous AI agent at $49/mo, and SurgeGraph the best long-form cluster engine from $49/mo.",
    intro:
      "Below: prices read off each vendor's own pricing page on August 19, 2026. Programmatic SEO is the niche where each page must carry unique per-page data — exactly the kind of pages OpenCorp builds. The five search angles for re-running competitor discovery are listed below.",
    updated: "2026-08-19",
    discovery: {
      ranOn: "2026-08-19",
      runQueries: [
        "programmatic SEO tool for generating thousands of pages",
        "bulk AI article generator for SEO",
        "pSEO template builder without code",
        "autonomous AI SEO agent",
        "programmatic SEO stack for niche sites",
      ],
    },
    tools: [
      {
        name: "Byword",
        url: "https://byword.ai",
        capsule:
          "Byword generates SEO-optimized articles from keyword CSVs at $99/mo for 25 articles. Volume tiers scale to 1,000+ articles per batch with Webflow, WordPress, and Shopify publishing.",
        pricing: "Starter $99/mo, Standard $299/mo, Scale $999/mo, Unlimited $1,999/mo",
        bestFor:
          "Niche site builders and agencies running hundreds of articles per month.",
        facts: [
          "Per-article cost drops to ~$3.74–$5 on paid tiers.",
          "Built-in image generation and internal linking.",
          "Programmatic SEO support via API for CSV-to-article pipelines.",
          "Direct publishing to WordPress, Webflow, Shopify, Ghost, HubSpot, Notion.",
          "Live research AI with citations.",
          "Free trial: 5 articles.",
        ],
        source: { label: "byword.ai/pricing", url: "https://byword.ai/pricing" },
      },
      {
        name: "SEObot",
        url: "https://seobot.ai",
        capsule:
          "SEObot is an autonomous AI SEO agent with auto keyword research, ~3,000-word articles, internal linking, backlinks, and programmatic SEO. $49/mo entry with a refund-after-first-article guarantee.",
        pricing: "$49/mo (9), $99 (20), $199 (50), $499 (100 + 20 listings), $570 (150), $1,050 (300)",
        bestFor:
          "SaaS founders and indie makers who want SEO on autopilot.",
        facts: [
          "Auto keyword research, AI articles, internal linking, and backlink building all included.",
          "Programmatic SEO template system with dataset support.",
          "50+ languages, 12+ CMS integrations including Next.js and Framer.",
          "Vendor claims: 200K+ articles generated, 1.2B impressions, 30M organic clicks.",
          "Refund guarantee if the first article is unsatisfactory.",
          "3,000-word article length maximum.",
        ],
        source: { label: "seobot.ai/pricing", url: "https://seobot.ai/pricing" },
      },
      {
        name: "SEOmatic",
        url: "https://seomatic.ai",
        capsule:
          "SEOmatic is a no-code pSEO platform: define a template like 'best [service] in [city]', feed it data, get thousands of pages. Webflow publishing integration included.",
        pricing: "Starter from $49/mo, Growth $199/mo, Enterprise custom",
        bestFor:
          "Marketing teams needing template-based pSEO without code.",
        facts: [
          "Template builder with conditional logic.",
          "Automatic internal linking between generated pages.",
          "Indexing API integration for fast crawling.",
          "Best for directory pages, location pages, and comparison pages at scale.",
          "Volume-based pricing on enterprise.",
          "Direct Webflow publishing integration.",
        ],
        source: { label: "seomatic.ai", url: "https://seomatic.ai" },
      },
      {
        name: "SurgeGraph",
        url: "https://surgegraph.ai",
        capsule:
          "SurgeGraph generates 1,500–5,000 word articles using SERP analysis, with built-in topical clustering and LSI keyword optimization. From $49/mo.",
        pricing: "Starter $49/mo, Growth $99/mo, Pro $149/mo, Agency $249/mo",
        bestFor:
          "Long-form AI content with topical authority mapping.",
        facts: [
          "SERP-based generation: analyzes top 20 ranking pages per keyword.",
          "Topical clustering maps the keyword universe into pillar + supporting articles.",
          "SERP-based content scoring for each generated article.",
          "Built-in SEO score and LSI keyword suggestions.",
          "Annual plan: $14.69/mo for entry tier.",
          "WordPress integration primary; limited CMS coverage beyond that.",
        ],
        source: { label: "surgegraph.ai/pricing", url: "https://surgegraph.ai/pricing" },
      },
      {
        name: "AirOps",
        url: "https://airops.com",
        capsule:
          "AirOps is a multi-step AI content workflow builder for custom pSEO pipelines. Pricing is custom; integrates with Postgres, Webflow, Airtable, and Notion.",
        pricing: "Custom / usage-based",
        bestFor:
          "Engineering teams building custom pSEO pipelines that off-the-shelf tools can't fit.",
        facts: [
          "Multi-step workflows: research → generation → enrichment → publish.",
          "Custom templates and integrations.",
          "Used by agencies and content teams with engineer support.",
          "Pricing not publicly listed — contact sales.",
          "Reasonable only when standard tools don't fit the pipeline.",
        ],
        source: { label: "airops.com", url: "https://airops.com" },
      },
      {
        name: "Whalesync",
        url: "https://whalesync.com",
        capsule:
          "Whalesync syncs Airtable or Notion data to Webflow or Framer two-way, supporting linked records and rich text. The plumbing layer for no-code pSEO sites.",
        pricing: "Starter $99/mo, Operator $249/mo, Professional $599+/mo",
        bestFor:
          "Two-way Airtable/Notion-to-Webflow sync for no-code pSEO sites.",
        facts: [
          "Two-way sync with Webflow and Framer.",
          "Linked records and rich text support.",
          "Starter plan supports 10,000 records and 5 syncs.",
          "Operator plan adds more syncs and records.",
          "Used as the sync layer in most no-code pSEO stacks.",
        ],
        source: { label: "whalesync.com/pricing", url: "https://whalesync.com/pricing" },
      },
      {
        name: "OpenCorp",
        url: "https://opencorp.live",
        capsule:
          "OpenCorp reads a product URL and returns competitors plus the Reddit and Hacker News threads where buyers describe the problem. Free, no gate.",
        pricing: "Free",
        bestFor:
          "Finding competitors and the buyer-intent threads worth answering before building a pSEO site.",
        facts: [
          "Searches for the problem, not the product name — surfaces threads that never mention any brand.",
          "Returns competitors with sources that mention them, ranked Reddit threads with a reason attached, and Hacker News discussions.",
          "No auto-posting — research, not distribution.",
          "Free to run, no credit card. Source-available under the Elastic License 2.0.",
        ],
        source: { label: "opencorp.live", url: "https://opencorp.live" },
      },
    ],
    faq: [
      {
        q: "What's the cheapest pSEO tool?",
        a: "SEObot and SurgeGraph both start at $49/mo. Byword at $99/mo is the entry tier for bulk-volume generation above 25 articles per month.",
      },
      {
        q: "Which pSEO tool is best for non-developers?",
        a: "SEOmatic for no-code template-driven pages with Webflow publishing, or SEObot for fully autonomous mode. Both require no engineering to operate.",
      },
      {
        q: "What does a no-code pSEO stack cost per month?",
        a: "Roughly $152/mo for the entry stack: Airtable ($24) + Whalesync Starter ($99) + Webflow CMS ($29). Add Indexing Insight for monitoring and the total runs ~$200/mo.",
      },
      {
        q: "Can these tools replace an SEO writer?",
        a: "They replace the research + drafting layer. Human editing is still required for voice, accuracy, and link quality — Google's helpful-content update penalizes raw AI output that lacks review.",
      },
    ],
  },
  {
    slug: "privacy-first-web-analytics-tools",
    question: "What are the best privacy-first web analytics tools in 2026?",
    answerCapsule:
      "Plausible is cheapest at $9/mo for 10K pageviews, Umami is the only free self-hosted option, Fathom has the best ad-blocker resistance at $15/mo, and Simple Analytics is the most EU-strict at $20/mo.",
    intro:
      "Below: prices read off each vendor's own pricing page on August 19, 2026. OpenCorp itself uses Umami Cloud for analytics on this site. The five search angles for re-running competitor discovery on this niche are listed below.",
    updated: "2026-08-19",
    discovery: {
      ranOn: "2026-08-19",
      runQueries: [
        "privacy-first web analytics alternative to Google Analytics",
        "cookie-free web analytics with self-hosting",
        "lightweight web analytics for small sites",
        "GDPR-compliant analytics without consent banner",
        "privacy analytics with multi-site support",
      ],
    },
    tools: [
      {
        name: "Plausible",
        url: "https://plausible.io",
        capsule:
          "Plausible is the cheapest paid cloud option: $9/mo for 10K pageviews, EU-hosted, cookie-free, and AGPL-licensed for self-hosting.",
        pricing: "10K $9/mo, 100K $19/mo, 1M $69/mo, custom above",
        bestFor:
          "Solo sites and small teams wanting EU-hosted, open-source analytics with goals and funnels.",
        facts: [
          "Cookie-free, GDPR/CCPA/PECR compliant without consent banner.",
          "AGPL-licensed Community Edition for self-hosting.",
          "EU-hosted (Hetzner Frankfurt and Helsinki).",
          "Sub-1KB script size.",
          "Goal and funnel tracking on all plans.",
          "Used by EU institutions including the German government and the EDPB.",
        ],
        source: { label: "plausible.io/pricing", url: "https://plausible.io/pricing" },
      },
      {
        name: "Umami",
        url: "https://umami.is",
        capsule:
          "Umami is the only major analytics tool that is MIT-licensed and free to self-host indefinitely. Cloud free tier covers 1M events/month.",
        pricing: "Self-host free; Cloud Free $0 (1M events/mo); Cloud Pro from $9/mo",
        bestFor:
          "Developers wanting MIT-licensed analytics with full self-host control.",
        facts: [
          "MIT license — more permissive than Plausible's AGPL.",
          "Self-host on any Node.js + PostgreSQL or MySQL stack.",
          "Cloud free tier: 1M events/month.",
          "No cookies, no personal data, GDPR/CCPA compliant by default.",
          "Funnels, retention, custom events, session replay on paid tiers.",
          "OpenCorp uses Umami on this site.",
        ],
        source: { label: "umami.is/pricing", url: "https://umami.is/pricing" },
      },
      {
        name: "Fathom",
        url: "https://fathomanalytics.com",
        capsule:
          "Fathom is the only one with a custom tracking domain on every plan, recovering 10–20% more visitors in markets with high ad-blocker adoption. Starts at $15/mo.",
        pricing: "Starter $15/mo (100K), Plus $34/mo (250K), Pro $90/mo (2M)",
        bestFor:
          "Agencies and multi-site teams wanting custom tracking domains and uptime monitoring.",
        facts: [
          "Unlimited sites on every plan.",
          "Custom tracking domain (track.yourdomain.com) for ad-blocker resistance.",
          "Uptime monitoring included on every tier.",
          "EU isolation routing available.",
          "~2KB script size.",
          "30-day free trial.",
        ],
        source: { label: "fathomanalytics.com/pricing", url: "https://fathomanalytics.com/pricing" },
      },
      {
        name: "Simple Analytics",
        url: "https://simpleanalytics.com",
        capsule:
          "Simple Analytics is the most EU-strict option: Netherlands-hosted, no IPs stored, no fingerprinting, with a unique ad-blocker bypass via custom subdomain.",
        pricing: "Starter EUR 15/mo (100K pageviews), Business EUR 40/mo (1M)",
        bestFor:
          "Marketers and SMBs in Europe wanting minimal data collection.",
        facts: [
          "Netherlands-hosted (EU).",
          "No cookies, no IPs stored, no fingerprinting.",
          "Bypass ad-blockers via custom subdomain — recovers traffic missed by aggressive blockers.",
          "Native Google Search Console import.",
          "Single-page dashboard.",
          "14-day free trial.",
        ],
        source: { label: "simpleanalytics.com/pricing", url: "https://simpleanalytics.com/pricing" },
      },
      {
        name: "Matomo",
        url: "https://matomo.org",
        capsule:
          "Matomo is the on-premise option for teams needing configurable privacy controls and 100% data ownership. Cloud plans start EUR 29/mo; on-premise is free.",
        pricing: "On-premise free; Cloud from EUR 29/mo (50K hits)",
        bestFor:
          "Enterprises needing configurable privacy controls per regulation.",
        facts: [
          "100% data ownership positioning — runs on your infrastructure.",
          "Self-hosted on-premise is free, open source.",
          "Cloud plans start EUR 29/mo for 50K hits.",
          "Configurable privacy controls per regulation.",
          "More setup and governance work than Plausible or Umami.",
          "GA imports available.",
        ],
        source: { label: "matomo.org/pricing", url: "https://matomo.org/pricing" },
      },
      {
        name: "OpenCorp",
        url: "https://opencorp.live",
        capsule:
          "OpenCorp reads a product URL and returns competitors plus the Reddit and Hacker News threads where buyers describe the problem. Free, no gate.",
        pricing: "Free",
        bestFor:
          "Finding the analytics comparisons your buyers actually search before switching from GA4.",
        facts: [
          "Searches for the problem (analytics overhead, GDPR risk), not the product name.",
          "Returns competitors with sources, ranked threads with a reason attached.",
          "No auto-posting — research, not distribution.",
          "Free to run, no credit card.",
        ],
        source: { label: "opencorp.live", url: "https://opencorp.live" },
      },
    ],
    faq: [
      {
        q: "Which privacy analytics tool is cheapest?",
        a: "Umami self-hosted is free. Umami Cloud's free tier covers 1M events/month. Among paid cloud options, Plausible at $9/mo for 10K pageviews is the cheapest entry.",
      },
      {
        q: "Do these tools need a cookie consent banner?",
        a: "No. All are cookie-free and GDPR-compliant by default. Always verify with your legal team for jurisdiction-specific rules (PECR in the UK, LGPD in Brazil, etc.).",
      },
      {
        q: "Which tools can I self-host?",
        a: "Plausible (AGPL Community Edition), Umami (MIT), and Matomo (on-premise, free) are self-hostable. Fathom and Simple Analytics are cloud-only.",
      },
      {
        q: "Which has the best ad-blocker resistance?",
        a: "Fathom — custom tracking domains recover 10–20% more visitors than domain-based scripts in markets with high ad-blocker adoption.",
      },
    ],
  },
  {
    slug: "ai-writing-tools-for-marketers",
    question: "What are the best AI writing tools for marketers in 2026?",
    answerCapsule:
      "Rytr is cheapest at $9/mo for unlimited short-form, Frase the best SEO-focused at $15/mo, Anyword the only one with predictive performance scoring at $49/mo, and Jasper the brand-voice governance pick at $69/seat/mo.",
    intro:
      "Below: prices read off each vendor's own pricing page on August 19, 2026. Most of these tools wrap the same frontier models, so the moat for each is governance, prediction, or price — not raw output quality. The five search angles for re-running competitor discovery are below.",
    updated: "2026-08-19",
    discovery: {
      ranOn: "2026-08-19",
      runQueries: [
        "best AI writing tool for marketing teams",
        "cheapest AI writer for short-form copy",
        "AI writing tool with brand voice training",
        "AI writing tool with SEO optimization",
        "AI writing tool with predictive performance scoring",
      ],
    },
    tools: [
      {
        name: "Jasper",
        url: "https://jasper.ai",
        capsule:
          "Jasper is the original AI writing platform for marketing, now an enterprise content operations tool with brand voice training. Pro $69/seat/mo annual.",
        pricing: "Creator $49/seat/mo, Pro $69/seat/mo, Business custom",
        bestFor:
          "Marketing teams of 5+ needing brand voice governance across the whole team's output.",
        facts: [
          "Brand IQ: 2 voices on Pro, unlimited on Business.",
          "50+ marketing templates and campaign workflows.",
          "7-day free trial (no permanent free tier).",
          "Acquired Phrasee (brand-safe email AI) in 2025.",
          "Pivoted from raw text generation to enterprise + brand voice + workflow.",
          "SOC 2 compliance.",
        ],
        source: { label: "jasper.ai/pricing", url: "https://jasper.ai/pricing" },
      },
      {
        name: "Copy.ai",
        url: "https://copy.ai",
        capsule:
          "Copy.ai pivoted from copywriting to a GTM AI Platform with sales + marketing workflow automation. Chat $29/mo for 5 seats; Growth tier $1,000/mo for 75 seats.",
        pricing: "Free (2K words/mo); Chat $29/mo (5 seats); Growth $1,000/mo annual (75 seats)",
        bestFor:
          "GTM teams wanting workflow automation beyond just writing.",
        facts: [
          "Free tier is usable for light use.",
          "Steep cliff: $29 Chat tier → $1,000/mo Growth tier.",
          "Visual workflow builder for multi-step sequences.",
          "Infobase + Brand Voice on paid tiers.",
          "Acquired Fullcast in October 2025.",
          "SOC 2, GDPR, SSO on enterprise.",
        ],
        source: { label: "copy.ai/pricing", url: "https://copy.ai/pricing" },
      },
      {
        name: "Writesonic",
        url: "https://writesonic.com",
        capsule:
          "Writesonic pivoted to AI Search Growth Engine — tracks brand visibility across ChatGPT, Gemini, Claude, Grok, plus content generation. Starter $79/mo covers ChatGPT only.",
        pricing: "Starter $79/mo annual, Basic $199, Growth $399, Enterprise custom",
        bestFor:
          "Content teams tracking AI search visibility (GEO).",
        facts: [
          "Starter tracks ChatGPT only.",
          "Basic adds Gemini and Google AI Overviews.",
          "Growth tracks 3 AI platforms.",
          "Perplexity, Claude, Grok, DeepSeek, Copilot tracking is Enterprise-only.",
          "15 articles/month on Starter.",
          "SOC 2 Type II, HIPAA, SSO on Enterprise.",
        ],
        source: { label: "writesonic.com/pricing", url: "https://writesonic.com/pricing" },
      },
      {
        name: "Anyword",
        url: "https://anyword.com",
        capsule:
          "Anyword is the only AI writer with predictive performance scoring — scores copy on a CTR/conversion axis before you put budget behind it. Data-Driven $79/mo annual.",
        pricing: "Starter $39/mo (20K words), Data-Driven $79/mo (30K + scoring), Business custom",
        bestFor:
          "Performance marketers wanting scoring before paid spend.",
        facts: [
          "Predictive performance score (CTR/conversion axis).",
          "Custom AI models trained on your data on Business+ only.",
          "Blog Wizard SEO score on paid tiers.",
          "7-day free trial on Starter and Data-Driven.",
          "SOC 2, ISO 27001, GDPR, HIPAA.",
          "API access on Enterprise only.",
        ],
        source: { label: "anyword.com/pricing", url: "https://anyword.com/pricing" },
      },
      {
        name: "Rytr",
        url: "https://rytr.me",
        capsule:
          "Rytr is the cheapest credible AI writing tool — unlimited generation under $10/mo. Free tier is 10,000 characters/month, no credit card.",
        pricing: "Free (10K chars/mo); Unlimited $7.50/mo annual; Premium $24.16/mo annual",
        bestFor:
          "Solo creators and freelancers grinding out high-volume short-form copy on a tight budget.",
        facts: [
          "Only tool that beats ChatGPT/Claude on price for short-form volume.",
          "50+ use-case templates.",
          "30+ tones; custom tones on Premium.",
          "Plagiarism checks: 50 on Unlimited, 100 on Premium.",
          "8M+ users, 4.7/5 G2 across 819 reviews.",
          "Chrome extension included.",
        ],
        source: { label: "rytr.me/pricing", url: "https://rytr.me/pricing" },
      },
      {
        name: "Frase",
        url: "https://frase.io",
        capsule:
          "Frase is the cheapest paid option for SERP-driven content briefs and AI writing. Solo $15/mo; Basic $45/mo adds more documents and research features.",
        pricing: "Solo $15/mo, Basic $45/mo, Pro $115/mo",
        bestFor:
          "SEO-focused content teams wanting SERP-driven briefs with GEO baked in.",
        facts: [
          "SERP-driven content briefs as the core product.",
          "Built-in GEO optimization for AI search visibility.",
          "AI writer for short and long form.",
          "Content editor with optimization scoring.",
          "7-day free trial (or money-back guarantee).",
          "Higher rated than Jasper, Copy.ai, or Writesonic on G2 (4.8/5).",
        ],
        source: { label: "frase.io/pricing", url: "https://frase.io/pricing" },
      },
      {
        name: "OpenCorp",
        url: "https://opencorp.live",
        capsule:
          "OpenCorp reads a product URL and returns competitors plus the Reddit and Hacker News threads where buyers describe the problem. Free, no gate.",
        pricing: "Free",
        bestFor:
          "Finding the AI writing buyers in your niche before you write.",
        facts: [
          "Searches for the problem, not the product name.",
          "Returns competitors with sources, ranked Reddit threads with a reason attached.",
          "No auto-posting — research, not distribution.",
          "Free to run, no credit card.",
        ],
        source: { label: "opencorp.live", url: "https://opencorp.live" },
      },
    ],
    faq: [
      {
        q: "Which AI writing tool is cheapest?",
        a: "Rytr Unlimited at $7.50/mo annual or $9/mo monthly. For SEO-specific work, Frase Solo at $15/mo. Among free tiers, Rytr's 10K chars/mo and Copy.ai's 2K words/mo are usable.",
      },
      {
        q: "Which tool is best for brand voice consistency across a team?",
        a: "Jasper Pro at $69/seat/mo with Brand IQ. Below 5 seats the math doesn't work — at that size, one writer with ChatGPT or Claude is cheaper.",
      },
      {
        q: "Which tool scores copy before you put paid spend behind it?",
        a: "Anyword Data-Driven at $79/mo annual. The predictive performance score is the only AI-writer feature ChatGPT/Claude cannot replicate.",
      },
      {
        q: "Are these tools wrappers around GPT or Claude?",
        a: "Mostly yes. The moat for each: Jasper = governance, Anyword = prediction, Rytr = price, Frase = SEO research. The rest are wrappers that add templates and a UI on top of the same models.",
      },
    ],
  },
  {
    slug: "landing-page-builders",
    question: "What are the best landing page builders in 2026?",
    answerCapsule:
      "Carrd is cheapest at $9/yr for simple pages, Framer the best free tier with Pro from $5/mo, Webflow the design-controlled default from $14/mo, and Unbounce the conversion-optimization pick from $74/mo.",
    intro:
      "Below: prices read off each vendor's own pricing page on August 19, 2026. OpenCorp's competitor-discovery workflow can be rerun on the landing page niche — the five search angles are below.",
    updated: "2026-08-19",
    discovery: {
      ranOn: "2026-08-19",
      runQueries: [
        "best landing page builder for solo founders",
        "cheapest landing page builder with custom domain",
        "landing page builder with A/B testing built in",
        "free landing page builder for SaaS",
        "landing page builder vs website builder for conversion",
      ],
    },
    tools: [
      {
        name: "Webflow",
        url: "https://webflow.com",
        capsule:
          "Webflow is the design-controlled default for non-developers. CMS plan at $29/mo includes 10,000 CMS items; hard ceiling of 20,000 CMS items on the highest plan.",
        pricing: "Starter $14/mo, CMS $29/mo, Business $39/mo (10K CMS items), Enterprise custom",
        bestFor:
          "Design-led teams wanting CMS + custom code control without developers.",
        facts: [
          "Visual CMS with relational content and dynamic pages.",
          "Hard ceiling: 20,000 CMS items on the highest plan.",
          "Hosting, SSL, forms, and email included.",
          "Custom code embed available on all paid plans.",
          "Best for SaaS marketing sites and content-heavy pages.",
          "Free tier available for staging.",
        ],
        source: { label: "webflow.com/pricing", url: "https://webflow.com/pricing" },
      },
      {
        name: "Framer",
        url: "https://framer.com",
        capsule:
          "Framer is a design + publish platform with React components and animations built in. Free tier; Pro from $5/mo; Business $30/mo.",
        pricing: "Free, Mini $5/mo, Basic $15/mo, Business $30/mo",
        bestFor:
          "Designers wanting pixel-perfect control with React components.",
        facts: [
          "Built-in CMS (Collections).",
          "Animations and interactions without code.",
          "AI-assisted site generation.",
          "Custom domains on paid plans.",
          "Free SSL on all tiers.",
          "Native iOS and Android apps for editing.",
        ],
        source: { label: "framer.com/pricing", url: "https://framer.com/pricing" },
      },
      {
        name: "Carrd",
        url: "https://carrd.co",
        capsule:
          "Carrd is the cheapest credible landing page builder — Pro Lite $9/year gives a custom domain and no Carrd branding. Best for one-page sites.",
        pricing: "Pro Lite $9/yr, Pro Standard $19/yr, Pro Plus $49/yr",
        bestFor:
          "One-page sites and simple landing pages on a tight budget.",
        facts: [
          "One-time annual payment, no monthly fee.",
          "70+ templates.",
          "Forms, embeds, and custom code.",
          "Custom domain on all Pro tiers.",
          "No CMS or multi-page structure.",
          "Single-page sites only.",
        ],
        source: { label: "carrd.co/pricing", url: "https://carrd.co/pricing" },
      },
      {
        name: "Unbounce",
        url: "https://unbounce.com",
        capsule:
          "Unbounce is the conversion-optimization landing page builder with built-in A/B testing, Smart Traffic AI, and dynamic text replacement. Launch from $74/mo.",
        pricing: "Launch $74/mo, Optimize $187/mo, Concierge custom",
        bestFor:
          "Conversion-rate optimization teams wanting A/B testing built in.",
        facts: [
          "Smart Traffic AI: routes visitors to variant most likely to convert.",
          "Dynamic text replacement based on search keyword.",
          "Built-in A/B testing on all paid plans.",
          "100+ templates.",
          "AMP support.",
          "Concierge plan includes done-for-you page builds.",
        ],
        source: { label: "unbounce.com/pricing", url: "https://unbounce.com/pricing" },
      },
      {
        name: "Leadpages",
        url: "https://leadpages.com",
        capsule:
          "Leadpages is the small-business landing page builder with built-in lead capture, pop-ups, and A/B testing on Pro. Standard $37/mo, Pro $74/mo.",
        pricing: "Standard $37/mo, Pro $74/mo, Advanced $199/mo",
        bestFor:
          "Small businesses wanting landing pages with email capture and conversion tools.",
        facts: [
          "Drag-and-drop builder.",
          "Built-in email capture and integrations (Mailchimp, HubSpot).",
          "A/B testing on Pro and Advanced.",
          "Pop-ups and alert bars.",
          "Unlimited traffic on all paid plans.",
          "150+ templates.",
        ],
        source: { label: "leadpages.com/pricing", url: "https://leadpages.com/pricing" },
      },
      {
        name: "Convert",
        url: "https://convert.com",
        capsule:
          "Convert is the A/B testing + landing page builder combo for marketers who want split testing without a separate tool. Starter $29/mo, Pro $119/mo.",
        pricing: "Starter $29/mo, Pro $119/mo, Enterprise $389+/mo",
        bestFor:
          "Marketing teams wanting A/B testing + landing page builder combined.",
        facts: [
          "A/B, multivariate, and split URL testing.",
          "100+ integrations.",
          "Visual editor.",
          "Personalization by location, device, and behavior.",
          "HIPAA compliance on Enterprise.",
          "Best for: conversion rate optimization programs.",
        ],
        source: { label: "convert.com/pricing", url: "https://convert.com/pricing" },
      },
      {
        name: "OpenCorp",
        url: "https://opencorp.live",
        capsule:
          "OpenCorp reads a product URL and returns competitors plus the Reddit and Hacker News threads where buyers describe the problem. Free, no gate.",
        pricing: "Free",
        bestFor:
          "Finding the landing page patterns your buyers research before they build.",
        facts: [
          "Searches for the problem, not the product name.",
          "Returns competitors with sources, ranked threads with a reason attached.",
          "No auto-posting — research, not distribution.",
          "Free to run, no credit card.",
        ],
        source: { label: "opencorp.live", url: "https://opencorp.live" },
      },
    ],
    faq: [
      {
        q: "Which landing page builder is cheapest?",
        a: "Carrd Pro Lite at $9/year for one-page sites. Among monthly builders, Framer Mini at $5/mo or Webflow Starter at $14/mo.",
      },
      {
        q: "Which has A/B testing built in?",
        a: "Unbounce (every paid tier) and Convert (A/B + multivariate). Leadpages Pro at $74/mo adds A/B. Webflow and Framer require a third-party tool for split testing.",
      },
      {
        q: "Which is best for SaaS marketing sites?",
        a: "Webflow (design control + CMS) or Framer (animations + React). Carrd is too limited for full SaaS sites. Unbounce is the best pick when conversion is the primary KPI and copy is the main lever.",
      },
      {
        q: "Can I host these on my own domain?",
        a: "Yes — all support custom domains on paid tiers. Carrd includes custom domains even on Pro Lite at $9/year.",
      },
    ],
  },
];

export function getCitationPage(slug: string) {
  return citationPages.find((page) => page.slug === slug);
}

export const relatedSlugs: Record<string, string[]> = {
  "reddit-lead-generation-tools": [
    "ai-social-listening-tools",
    "reddit-tools-with-ai-replies",
  ],
  "ai-social-listening-tools": [
    "reddit-lead-generation-tools",
    "reddit-tools-with-ai-replies",
  ],
  "reddit-tools-with-ai-replies": [
    "ai-social-listening-tools",
    "reddit-lead-generation-tools",
  ],
  "cold-email-outreach-tools": [
    "ai-writing-tools-for-marketers",
    "landing-page-builders",
  ],
  "programmatic-seo-tools": [
    "landing-page-builders",
    "privacy-first-web-analytics-tools",
  ],
  "privacy-first-web-analytics-tools": [
    "programmatic-seo-tools",
    "landing-page-builders",
  ],
  "ai-writing-tools-for-marketers": [
    "cold-email-outreach-tools",
    "landing-page-builders",
  ],
  "landing-page-builders": [
    "cold-email-outreach-tools",
    "programmatic-seo-tools",
  ],
};
