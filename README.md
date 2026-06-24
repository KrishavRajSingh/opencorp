# opencorp

> **Find your users while you build.** Tell opencorp what you're building — it researches the market, finds the people who need your product, and hands you a scored pipeline of leads. Fully autonomous.

[![License: Elastic 2.0](https://img.shields.io/badge/License-Elastic_2.0-blue.svg)](./LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![Mastra AI](https://img.shields.io/badge/Mastra-AI-purple)](https://mastra.ai)
[![pnpm](https://img.shields.io/badge/pnpm-only-orange)](https://pnpm.io)

---

## What it does

opencorp is an autonomous user-acquisition platform. Give it a product description, and it runs a two-track discovery pipeline against the sources where real users complain, recommend, and switch tools:

| Track | Question it answers | Signals it hunts |
| --- | --- | --- |
| **Pain-Point Discovery** | Who has the problem I'm solving? | "is there a tool", "frustrated with", "how do I", "manual process" |
| **Competitor Discovery** | Who's unhappy with my competitors? | "alternative", "switching from", "too expensive", "won't fix" |

Both tracks scan the same sources — **Reddit, Hacker News, GitHub, Twitter/X, Product Hunt** — but with different query strategies. Results merge into a single scored lead pipeline.

### Features

- **Market research** — scans Reddit, HN, Twitter, Product Hunt, and GitHub issues for problem- and competitor-fit signals
- **User discovery** — extracts real people (handle, context, sentiment) from the noise
- **Product analysis** — autonomously reads a product's site, pricing, and docs to build a structured understanding
- **SEO & content** — keyword research, competitive analysis, and content strategy
- **Outreach engine** — personalized multi-channel message drafting (email, Twitter DM, LinkedIn)
- **Streaming UI** — research results stream to the dashboard in real time via Server-Sent Events
- **Auth + persistence** — Supabase auth, per-user research sessions, full history

---

## How it works

```
Product description
        │
        ▼
  Product Analyst  ──►  Fetches & reads the product's site
        │                  (homepage, pricing, docs, about, ...)
        ▼
   ┌────────────┐         ┌─────────────────────┐
   │  Track 1   │ ──────► │  Pain-Point Leads   │
   │ Discovery  │         └─────────────────────┘
   └────────────┘                  │
   ┌────────────┐                  ▼
   │  Track 2   │         ┌─────────────────────┐
   │ Discovery  │ ──────► │ Competitor Leads    │
   └────────────┘         └─────────────────────┘
                                  │
                                  ▼
                       Scored Lead Pipeline
                                  │
                                  ▼
                          Dashboard UI
```

Under the hood:

- **Mastra** orchestrates agents and tools (`src/mastra/`)
- **Trigger.dev** runs the long-running discovery tasks asynchronously (`src/trigger/`)
- **OpenRouter** is the LLM provider — swap models in `src/mastra/agents/*.ts`
- **Supabase** handles auth, the `research_sessions` table, and row-level security
- **LibSQL + DuckDB** are Mastra's storage and observability backends
- **Next.js 16 App Router** serves the UI and API routes

---

## Tech stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router) on React 19
- **AI:** [Mastra](https://mastra.ai) agents + workflows, [OpenRouter](https://openrouter.ai) for LLM routing
- **Tools:** [Exa](https://exa.ai) (web search), [HN Algolia API](https://hn.algolia.com/api), [Jina Reader](https://jina.ai/reader) (page fetch → markdown)
- **Jobs:** [Trigger.dev v4](https://trigger.dev) for long-running async research
- **Auth & DB:** [Supabase](https://supabase.com) (Postgres + RLS)
- **Storage:** LibSQL (default), DuckDB (observability)
- **UI:** [shadcn/ui](https://ui.shadcn.com), [Tailwind CSS v4](https://tailwindcss.com), [Motion](https://motion.dev), [lucide-react](https://lucide.dev), [Geist](https://vercel.com/font)
- **Language:** TypeScript, Zod v4

---

## Quick start

### Prerequisites

- **Node.js 20+**
- **pnpm** (this project uses pnpm exclusively — `pnpm-workspace.yaml` blocks other package managers' lifecycle scripts)
- Accounts + API keys for: [OpenRouter](https://openrouter.ai), [Exa](https://exa.ai), [Jina](https://jina.ai), [Supabase](https://supabase.com), [Trigger.dev](https://trigger.dev)

### Install

```bash
git clone https://github.com/<your-username>/opencorp.git
cd opencorp
pnpm install
```

### Configure environment

Copy and fill in `.env`:

```bash
cp .env.example .env
```

See [Environment variables](#environment-variables) below for the full list.

### Run the database migration

Open the Supabase SQL editor for your project, paste the contents of
`supabase/migrations/0001_research_sessions.sql`, and run it. This creates the
`research_sessions` table and its RLS policies. See `supabase/README.md`.

### Start the dev server

```bash
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

In a separate terminal, start the Trigger.dev worker (optional, only needed for background research tasks):

```bash
pnpm dlx trigger.dev dev
```

---

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | yes | LLM provider — Mastra routes all model calls through OpenRouter |
| `JINA_API_KEY` | yes | Used by `fetchPageTool` to read product pages as clean markdown |
| `EXA_API_KEY` | yes | Used by `searchWebTool` for semantic web search |
| `COMPOSIO_API_KEY` | yes | Reddit access via Composio |
| `COMPOSIO_REDDIT_ACCOUNT_ID` | yes | Specific Reddit account the agent posts/reads as |
| `TRIGGER_SECRET_KEY` | yes | Authenticates the Next.js app → Trigger.dev worker |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL (browser-safe) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Supabase anon key (browser-safe) |
| `SUPABASE_SECRET_KEY` | yes | Supabase service-role key (server-only) |
| `NEXT_PUBLIC_SITE_URL` | yes | Public origin used for OAuth redirects and email links |

`.env` is git-ignored. Never commit secrets.

---

## Project structure

```
opencorp/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (marketing)/           # Landing page
│   │   ├── auth/                  # Sign-in / sign-up flows
│   │   ├── dashboard/             # Research dashboard (projects, sessions)
│   │   └── api/research/          # Streaming research API (SSE)
│   ├── components/
│   │   ├── ui/                    # shadcn/ui primitives
│   │   └── ai-elements/           # Custom AI chat / artifact UI
│   ├── mastra/                    # Mastra AI framework
│   │   ├── agents/                # discovery, product-analyst, weather
│   │   ├── tools/                 # search-web, search-hn, fetch-page
│   │   └── workflows/             # weather-workflow (example)
│   ├── trigger/                   # Trigger.dev task definitions
│   │   ├── research.ts            # Long-running research orchestrator
│   │   └── streams.ts             # Real-time event streaming
│   └── lib/                       # Shared utilities
├── supabase/
│   └── migrations/                # SQL migrations
├── trigger.config.ts              # Trigger.dev project config
├── next.config.ts
├── components.json                # shadcn/ui config
└── pnpm-workspace.yaml
```

---

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the Next.js dev server with HMR |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | ESLint (no typecheck script is configured — run `tsc --noEmit` if needed) |

---

## Architecture notes

- **Streaming research** — the dashboard consumes Server-Sent Events from `/api/research/sse`, so the user sees tool calls and partial results as agents work, not after they finish.
- **Two agents, one task** — `productAnalystAgent` and `discoveryAgent` run as independent Trigger.dev tasks and write back into the same `research_sessions` row when each completes.
- **Tools are scoped** — `fetchPageTool` uses Jina, `searchWebTool` uses Exa, `searchHNTool` uses the public HN Algolia API. Each tool is described to the model with intentional guidance (e.g. *"Exa is semantic — paraphrasing returns duplicates; vary your angle"*) so the agents behave like an experienced researcher, not a chatbot.
- **Mastra storage** is LibSQL (default domain) + DuckDB (observability domain). Local files (`mastra.db`, `mastra.duckdb`) are git-ignored.

---

## Deployment

Any platform that runs Next.js 16 will work — [Vercel](https://vercel.com) is the path of least resistance. You will also need to:

1. **Deploy the Trigger.dev worker** — `pnpm dlx trigger.dev deploy` (requires a `TRIGGER_SECRET_KEY` set in the worker environment).
2. **Run the Supabase migration** in your production project.
3. **Set every environment variable** from the table above in your hosting platform. Treat `SUPABASE_SECRET_KEY` as server-only.

---

## Contributing

Issues and PRs are welcome. Before opening a PR:

1. Run `pnpm lint`.
2. Run `pnpm build` to make sure type-checking passes.
3. If you change an agent's instructions, add a short note in your PR describing the expected behavior change.

There is no test suite wired up yet — manual testing through the dashboard is the current expectation.

---

## License

This project is licensed under the **Elastic License 2.0** (ELv2). See [`LICENSE`](./LICENSE).

In short: you can use, copy, modify, and distribute the code, but you **may not provide it to third parties as a hosted or managed service** that gives users access to a substantial set of its features. Internal forks and modifications are fine; spinning up a competing hosted product is not.

This is **not an OSI-approved open-source license**. If you need a different license for your use case, contact the project owner.

---

## Acknowledgments

- [Mastra](https://mastra.ai) for the agent framework
- [Exa](https://exa.ai) for semantic search
- [Jina](https://jina.ai) for clean page extraction
- [Trigger.dev](https://trigger.dev) for reliable long-running tasks
- [Supabase](https://supabase.com) for auth and Postgres
- [shadcn/ui](https://ui.shadcn.com) for the component primitives
- The `r/SomebodyMakeThis`, `r/SaaS`, `r/Entrepreneur`, HN, and GitHub Issues communities — the people posting in these places are the actual product.
