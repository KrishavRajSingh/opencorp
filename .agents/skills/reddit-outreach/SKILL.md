---
name: reddit-outreach
description: "Reddit user-acquisition playbook for opencorp. Use when researching where a product's potential users talk on Reddit, finding subreddits/threads to engage in, drafting or posting comments, or deciding whether/when to reply. Covers endpoint reliability gotchas, fixed time windows, reply-vs-top-level decisions, humanized comment writing, and anti-ban rules. Includes the agent-reach/rdt-cli toolchain used in this repo."
---

# Reddit Outreach & User Acquisition Playbook

Find where a product's future users talk on Reddit, then engage there without getting banned or ignored. Built from field experience in this repo; every rule below was learned the hard way in a real campaign.

## 1. Tooling

- **agent-reach skill** routes Reddit access; in this repo the active backend is **rdt-cli** (`rdt`), installed via pipx, authenticated with browser cookies (`rdt login`).
- Core commands (NOTE: subreddit names take NO `r/` prefix — `rdt sub SaaS`, not `rdt sub r/SaaS`; the prefixed form returns `not_found`):
  - `rdt sub <sub> -s new -n 100 --json` — subreddit listing, newest first. JSON is wrapped at `data.data.children` (not `data.children`)
  - `rdt search "<query>" -t hour` — keyword search, needs a real query string (different cache pool than listing). The `q=*` wildcard form only works via the raw API below
  - `rdt read <post_id>` — post + comments (use `--expand-more` to unfold hidden replies)
  - `rdt comment <fullname> "<text>"` — post a comment/reply (see §6 for parent selection)
  - `rdt whoami` / `rdt status` — confirm auth before anything
- Credentials live at `~/.config/rdt-cli/credential.json` (do not commit, do not print fully).
- Direct API fallback (bypasses rdt quirks; supports the `q=*` wildcard search form):
  ```bash
  curl -s -H "Cookie: <cookies>" -A "Mozilla/5.0 research/1.0" \
    "https://api.reddit.com/r/<sub>/new?limit=100&raw_json=1"
  ```

## 2. Data Reliability — Read This Before Trusting Any Count

**Endpoint inconsistency is the #1 source of wrong data.** Different endpoints hit different caches and return different results for the same subreddit.

- **Listing feeds (`/new`, `hot`) can serve stale cached data.** In this repo r/buildinpublic returned the same 10-day-old posts through every endpoint for days, while r/SaaS returned live data. This is reddit's server-side cache, not an auth or tool bug. Symptom: newest post timestamp much older than `now - 1h`.
- **Search endpoint misses posts the listing catches, and vice versa.** In the campaign, r/SaaS listing showed 2 posts/hour; search showed 4 (2 recovered). r/micro_saas search showed 0; listing showed 1 (recovered). **Always cross-check both endpoints before reporting a count.**
- **Verification procedure for ANY count:**
  1. Fetch listing `-s new -n 100 --json`, compute timestamps.
  2. Fetch search `?q=*&restrict_sr=1&sort=new&t=hour&limit=100`.
  3. Union the results, filter by `created_utc` within the window.
  4. If a sub returns nothing in-window, state "cannot verify" rather than claiming 0 — a stale feed and an empty hour look identical.
- **`[removed]` selftext = skip.** Posts whose `selftext` is `[removed]` were mod-removed; commenting on them is a flag risk, even if comments still show. Especially suspicious when multiple removed posts share one author.
- **Old.reddit `.json` is blocked** (403). pullpush.io works but is a stale archive (~400 days behind), useless for real-time. Do not offer either as a path.

## 3. Fixed Time Windows

- Use a **fixed, anchored window**: pick `now - 3600s .. now` ONCE at the start of a scan and report it. Never a sliding "last hour" recomputed per post, or threads age in/out mid-report.
- State the window in the report (`WINDOW <start>..<end> = 1h fixed`) so results are reproducible.
- Posts are 0–59 min old when scanned; expect borderline ones to age out. Re-read before posting.

## 4. Finding Where Users Talk

- **ICP-first.** For opencorp: indie founders/devs who built something and can't find users. Their shared pain: *"I built the product, nobody knows."*
- Priority subreddits for that ICP: r/SaaS, r/SideProject, r/buildinpublic, r/microsaas, r/micro_saas, r/indiehackers, r/startups, r/Entrepreneur, r/SmallBusiness.
- Gold threads are not launch posts. They are:
  - "I built X but getting users feels impossible" style vent posts (huge comment counts, OP is the archetype buyer)
  - "What actually got you your first 10 paying customers" honest-advice asks
  - Celebration posts ("first user!", "$50 MRR") — comment sections full of people wanting to replicate
- Posting rate varies in bursts, not flat. A sub averaging 13/hr may genuinely post 4 in one hour and 24 in another. Don't infer "should be ~12" from an average.

## 5. Choosing Targets — reply vs top-level

Per thread, decide BEFORE drafting:

| Condition | Action |
|---|---|
| 0 comments | **Top-level comment** — you set the thread. |
| 1+ comments / live debate | **Reply** to the specific commenter/OP. Top-level looks like spam. |
| Thread OP already engaged you | **Reply to them**, keep the chain alive. |
| Off-topic, removed, or mod-flagged thread | **Skip entirely.** |
| Conversation-ender reply ("I think X is so good for now") | **Don't reply.** The exchange is complete; restating adds noise. |

- **Check for existing comments from the target account first** (`grep -c '"author": "<user>"'`). Never double-post a thread.
- **Expand hidden replies.** A `[more]` stub under your comment with `more_count: 1` means a real unloaded reply. Expand via `https://api.reddit.com/api/morechildren?link_id=t3_<id>&children=<id>&api_type=json`. A `[more]` stub is NOT noise — it's a real reply. Also verify parent: a comment whose `parent_fullname` is `t3_<post>` is top-level, NOT a reply to you, even if it appears adjacent.

## 6. Posting — Getting the Parent Right

**The most common placement bug: posting top-level when you meant to reply.**

- `rdt comment 1vfpbya "text"` resolves the bare id to the **post** (`t3_1vfpbya`) → top-level comment.
- `rdt comment t1_p1smjbf "text"` passes a **comment fullname** → properly threaded reply under that comment.
- Always find the target comment's `fullname` (`t1_...`) first, then pass that.
- Verify placement after posting: re-read the thread and confirm your comment appears inside the target comment's `replies` subtree, not as a top-level sibling.
- One post can only be commented once per account; if the first attempt was top-level and wrong, it must be deleted before a correct threaded reply.

## 6b. Checking for replies — use the INBOX, never re-read threads

**Never "check replies" by re-reading one thread.** You will guess the wrong thread and miss replies that landed elsewhere.

- The authoritative source is the account inbox: `https://www.reddit.com/message/inbox/.json` (with cookie header). One query returns EVERY reply to any of your comments, newest first.
- Parse `data.children`; each item has `data.author`, `data.body`, `data.name` (the `t1_...` to reply to). Filter out `AutoModerator` and old items.
- Re-reading a thread (rdt read / api comments) will silently drop replies: reddit returns collapsed comment trees and needs `morechildren` expansion to see everything. Use it only for CONTENT of a known thread, not for reply detection.
- When the user says "check replies": hit the inbox, list every new human reply with author + snippet, then decide per reply whether a reply-back is worth it (see §5 conversation-ender rule).

## 7. Writing Comments That Get Engagement

- **Value first, always.** Answer the question, teach the pattern, then (optionally) let the product angle appear naturally. Never open with the product.
- **The opencorp soft-pitch pattern** (worked in the campaign): give real advice whose substance is "the threads where your users already talk are your launch list." No link, no name — the audience connects it.
- **Reply to the actual content.** Quote nothing back; engage with the specific claim (OP said "going to start applying this" → give practical tips for starting).
- **Humanize** (see humanizer skill; core rules):
  - No em dashes or en dashes.
  - No rule-of-three lists, no "-ing" tag-ons, no "delve/landscape/testament" vocabulary.
  - Vary sentence length; write like a friend, not a press release.
  - No signposting ("Let's dive in"), no fake-candid openers ("Honestly?"), no manufactured punchlines.
  - Concrete specifics beat generic praise. A real observation ("the privacy point was below the fold") engages; "great product!" gets ignored.
- **Length:** 1 short paragraph for replies to replies; 2–3 sentences of real content beats 100 words of padding.

## 8. Subreddit Rules — Check Before Every Post

Fetch before posting: `https://api.reddit.com/r/<sub>/about/rules?raw_json=1`

Common r/SaaS-class rules that matter:
- Max 1 product mention or 3 links per 60 days; disclose affiliation.
- No selling/soliciting/fundraising; no "I'll review/audit/roast your thing" offers.
- No low-effort comments; originality required.
- No shortened/obfuscated URLs.
- Promotion allowed "occasionally"; accounts focused solely on it get removed.

## 9. Anti-Ban Rules (grounded, not invented)

Two-layer model — this section is layer 2. **Layer 1 (subreddit rules, §8) is checked before every post** and governs mod bans; section 9 governs a separate thing mods can't decide: reddit's sitewide spam filter (shadowbans). Both apply; neither replaces the other.

There is **no platform-wide "1 comment per hour" rule** — that was an invented false rule in an early draft of this playbook. The real spam triggers are patterns:

1. **Same/similar comment text repeated across threads** = #1 flag. Rewrite every comment fresh.
2. **Link-dropping ratio** — if most comments carry links, you're flagged. Keep comments link-free.
3. **Promotional language** — "check out my", "just launched", "link in bio" trigger filters.
4. **Promo:help ratio** — 4–5 genuine helpful comments per product mention is the safe ratio.
5. **Bursts** — identical promo across many subs in minutes = flag. Vary spacing naturally.
6. **Mod-removed threads** — never comment where selftext is `[removed]`.

Expected outcome honesty: a value comment on a low-traffic thread often stays at score 1 (your own upvote). That's not failure — no downvotes/removals means the account stays clean. Traction comes from time-in-community, not one-pass batches.

## 10. Output Format

Deliverable = CSV with columns: `post_link, subreddit, thread_id, age_min, num_comments, action (TOP-LEVEL COMMENT | REPLY-ONLY), comment, reason`. Include the fixed window in the summary. Never include a thread whose in-window status is unverified.
