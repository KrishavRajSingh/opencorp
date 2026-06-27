# opencorp

> **Find your users while you build.** Drop in a link to what you're building — opencorp runs a research agent that finds your competitors and surfaces the Hacker News threads where your future users are already talking.

[![License: Elastic 2.0](https://img.shields.io/badge/License-Elastic_2.0-blue.svg)](./LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![Mastra AI](https://img.shields.io/badge/Mastra-AI-purple)](https://mastra.ai)
[![pnpm](https://img.shields.io/badge/pnpm-only-orange)](https://pnpm.io)

---

## What it does

opencorp is an autonomous user-acquisition platform. Drop in a link to what you're building, and it runs a research agent that returns two things:

- **Competitors** — who else is building something similar, with the sources behind them
- **Hacker News threads** — where your future users are already talking, ranked by how relevant each thread is to your product

The agent picks its own queries, decides how many searches to run, and re-ranks results. You stay in your editor.

### Features

- **Product analysis** — autonomously reads a product's site to extract name, description, features, audience, and pricing
- **Competitor discovery** — searches the web for adjacent tools, with each result traced back to a source
- **HN thread discovery** — surfaces Show HN launches, Ask HN threads, and discussions where the user can pitch
- **Streaming UI** — research results stream to the dashboard in real time, so the user sees tool calls and partial results as they happen
- **Auth + persistence** — per-user research sessions, full history (each session row stores product analysis, competitors, and HN threads)
- **Multi-source research** — combines web search, Hacker News, and the product's own site for grounded context

---

## How it works

```
Product URL
    │
    ▼
Product Analyst ───► Reads the product's site
    │                  (homepage, pricing, docs, about, ...)
    ▼
┌──────────────────────┐
│  Discovery Agent     │  Picks queries, decides how many to run,
│  (autonomous)        │  re-ranks results
└──────────────────────┘
    │
    ├──► Competitor research task ──► List of competitors with sources
    │
    └──► HN threads task ──► Curated HN threads with relevance reasons
                                      │
                                      ▼
                              Dashboard UI (live stream)
```

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
git clone https://github.com/KrishavRajSingh/opencorp.git
cd opencorp
pnpm install
```

### Configure environment

Copy and fill in `.env`:

```bash
cp .env.example .env
```

See [Environment variables](#environment-variables) below for the full list.

### Run the database migrations

Open the Supabase SQL editor for your project and run the migrations in order:

1. `supabase/migrations/0001_research_sessions.sql` — creates the `research_sessions` table and its RLS policies
2. `supabase/migrations/0002_hn_threads_result.sql` — adds the `hn_threads_result` column for persisting curated HN thread output

See `supabase/README.md` for details.

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
│   │   ├── page.tsx               # Landing page
│   │   ├── auth/                  # Sign-in / sign-up flows
│   │   ├── dashboard/             # Research dashboard (projects, sessions)
│   │   └── api/research/          # Streaming research API + task triggers + persistence
│   ├── components/
│   │   ├── ui/                    # shadcn/ui primitives
│   │   ├── ai-elements/           # Custom AI chat / artifact UI
│   │   └── dashboard/             # Dashboard-specific blocks (HN threads, etc.)
│   ├── mastra/                    # Mastra AI framework
│   │   ├── agents/                # discovery, product-analyst, weather
│   │   ├── tools/                 # search-web, search-hn, fetch-page, weather
│   │   └── workflows/             # weather-workflow (example)
│   ├── trigger/                   # Trigger.dev task definitions
│   │   ├── research.ts            # product-research, competitor-research, hn-threads
│   │   └── streams.ts             # Real-time event streaming
│   └── lib/                       # Shared utilities (supabase clients, cn, etc.)
├── supabase/
│   └── migrations/                # SQL migrations (run in order)
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

- **Streaming research** — research results stream to the dashboard in real time as the agent works, not after it finishes.
- **One agent, three tasks** — `productAnalystAgent` runs alone for product analysis; `discoveryAgent` powers both the `competitor-research` task and the `hn-threads` task. Each task writes its structured output back into its own column on the `research_sessions` row.
- **Mastra storage** uses LibSQL by default and DuckDB for observability. Local files (`mastra.db`, `mastra.duckdb`) are git-ignored.

---

## Deployment

Any platform that runs Next.js 16 will work — [Vercel](https://vercel.com) is the path of least resistance. You will also need to:

1. **Deploy the Trigger.dev worker** — `pnpm dlx trigger.dev deploy` (requires a `TRIGGER_SECRET_KEY` set in the worker environment).
2. **Run the Supabase migrations** in your production project (both files in `supabase/migrations/`, in order).
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
- The Hacker News community — the people posting, asking, and Show-HN-ing in those threads are the actual product.
