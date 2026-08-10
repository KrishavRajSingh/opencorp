# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Indie hackers and solo founders who have shipped (or are about to ship) a public product page and do not yet know who their alternatives are or where the people who need their product are already talking. They work alone or in tiny teams, have no growth hire, and have a finite attention budget for user research.

## Product Purpose

Make the next-user loop a five-minute task instead of a week of manual searching. Drop in a product URL, get a ranked map of alternatives and the Reddit / Hacker News threads where the people the product is for are already describing the problem it solves — each with a reason attached.

Success = a founder walks away with at least one conversation starter they would not have found on their own, and the path back to the same map later (auth + saved research).

## Positioning

The agent reads the product's own site first and searches for the *problem the product solves* — not the product's name — and ranks every thread with a written reason. The mechanical differentiators that follow from this position:

- **No auto-posting.** The product finds where to show up and why. The words a user writes are theirs.
- **Open source, free, no pricing tier, no account required to read the map.** A free account unlocks full thread lists and saved reports.
- **Multi-source by default** (the product's site + web search + HN Algolia + Reddit), so results carry a traceable source rather than an opaque score.

A neighboring tool could copy the dashboard, but not the "search the problem, not the product" stance.

## Operating Context

- The product lives on the public web. The hero surface is a marketing landing at `/`; the working surface is a research dashboard at `/dashboard` that streams partial agent results.
- Research is long-running (multi-step web search + product-page fetch + re-ranking). Runs are dispatched via Trigger.dev so the UI can stream.
- Sessions are persisted per authenticated user; the marketing CTA pushes anonymous visitors into the dashboard by passing the URL forward.
- Auth is Supabase (Postgres + RLS). Auth pages live at `/auth/sign-in` and `/auth/sign-up`.
- The product ships with a real demo at `https://github.com/user-attachments/assets/2b013934-a672-436b-9fdf-85b5d0277fff` and a worked example for `filler.live` rendered on the landing page.

## Capabilities and Constraints

Confirmed capabilities:

- Product analysis: read a product's homepage, pricing, docs, about to extract name, description, features, audience, pricing.
- Competitor discovery: web search for adjacent tools, each result traced to a source.
- Reddit + Hacker News thread discovery, ranked by relevance to the inferred problem.
- Streaming dashboard: tool calls and partial results stream to the UI in real time.
- Auth + persistence: per-user research sessions, full history (each session row stores product analysis, competitors, and thread lists).
- Share: a public read-only view of a session.

Confirmed constraints:

- Stack is fixed: Next.js 16 (App Router) on React 19, Mastra agents, OpenRouter for LLM routing, Exa for web search, Jina Reader for page fetch, HN Algolia, Trigger.dev v4 for jobs, Supabase for auth + DB, LibSQL + DuckDB for Mastra storage, shadcn/ui + Tailwind v4 + Motion + Geist fonts.
- LLM access goes through OpenRouter; the only configured model path is `openrouter/deepseek/deepseek-v4-flash`.
- License: Elastic 2.0 (`./LICENSE`).
- "Free & open source" is a load-bearing brand commitment, not a launch stance. The product must not introduce a pricing tier.
- pnpm is the only supported package manager; `pnpm-workspace.yaml` blocks lifecycle scripts for esbuild, sharp, and unrs-resolver.
- No test framework is configured.

Explicitly undecided:

- Whether the product will ever offer hosted-vs-self-hosted variants.
- Any paid surface, add-on, or support tier.

## Brand Commitments

- Name: `opencorp` / "OpenCorp" (display form). Domain: opencorp (subdomain/path TBD).
- Voice: direct, plain, builder-to-builder. No marketing-speak. The founder writes in first person on the landing page (Krishav Raj Singh, `@opencorpai` on X).
- Visual identity already established in code: dark-first (the `<body>` carries the `dark` class), brand color is a warm `oklch(0.72 0.15 75)` accent used sparingly, headings use `GeistPixelSquare` (`--font-heading`), body uses `Geist` (sans + mono). These tokens are locked in `src/app/globals.css` and `src/app/layout.tsx`; treat them as binding until the user reopens the visual world.
- Existing assets in the repo: `src/app/icon.svg`, `src/app/apple-icon.png`, the GitHub repo `KrishavRajSingh/opencorp`, the Discord invite `https://discord.gg/ArQF8jtC9`. Do not invent replacements.
- The "no auto-posting" stance is part of the brand. Do not frame the product as a posting or commenting tool.

## Evidence on Hand

- Demo video: `https://github.com/user-attachments/assets/2b013934-a672-436b-9fdf-85b5d0277fff` (referenced in `README.md`).
- GitHub repo: `KrishavRajSingh/opencorp` (linked from the marketing shell).
- Founder X handle: `opencorpai`; founder name: Krishav Raj Singh; founder reference product: `filler.live`.
- Worked example data for `filler.live` rendered live on the landing page (`src/app/page.tsx`, `LandingConsole`).
- FAQ copy on the landing page is product truth, not placeholder. Treat the four questions ("What do I actually get?", "Is it really free?", "How is this different from searching Reddit myself?", "Does it post or comment for me?") and their answers as confirmed.

Do not fabricate: testimonials, named customers, star counts, HN submission counts, or pricing comparisons. The `GitHubStarsLink` component reads stars at runtime — never hardcode a number.

## Product Principles

1. **Show the work.** Every thread and every competitor carries a source and a reason. The user must be able to retrace why something is on the map.
2. **The product reads the problem, not the brand.** Search runs are framed by the problem the product solves, never by the product's name. This is the load-bearing stance and the only one that justifies the tool.
3. **Free and open is a feature, not a footnote.** "No pricing tier" is in the hero copy on purpose. Any change here is a rebrand, not a copy edit.
4. **Streaming beats waiting.** Partial results are more useful than a perfect batch. Long-running work surfaces in the UI as it happens, not as a finished report.
5. **The words are the user's.** OpenCorp finds where to show up. It does not post, draft, or comment on the user's behalf.
