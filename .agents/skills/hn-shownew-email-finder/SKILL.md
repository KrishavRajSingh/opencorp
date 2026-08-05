---
name: hn-shownew-email-finder
description: "Scrape HN ShowNew posts, find founder emails and real product URLs, output CSV. Use when user says 'find HN emails', 'HN outreach', 'Show HN email finder', or 'do the HN thing'."
---

# HN ShowNew Email Finder

Scrape Hacker News ShowNew, extract founder emails, resolve real product URLs, produce outreach CSV.

## Workflow (execute in order)

### 1. Scrape 3 pages of HN ShowNew

Open each page, scroll full height, wait 2s for lazy content:

- `https://news.ycombinator.com/shownew`
- `https://news.ycombinator.com/shownew?next=...&n=31` (inspect the "More" link on page 1 for the correct `next` param)
- `https://news.ycombinator.com/shownew?next=...&n=61` (same from page 2)

Extract per post: **title**, **URL** (the `href` on the post link), **author**, **rank number** (1-indexed). Stop at 90 posts.

### 2. Find emails per post

For each post, attempt sources in order. Stop at first email found:

1. **Post URL** — if it's a website, check `/about`, `/contact`, `/privacy`, `/terms` pages. Check page source for `mailto:`.
2. **GitHub repo** — check commits (up to 30), repo `homepage` field via API, profile bio, `README.md`.
3. **HN discussion thread** — `https://news.ycombinator.com/item?id=<id>` — scan comments for email patterns.
4. **HN user profile** — `https://news.ycombinator.com/user?id=<author>` — check "about" section.
5. **Chrome Web Store** — check developer email in store listing.
6. **PyPI / npm / other package registries** — check metadata.

**Email filter:** Keep only personal/creator emails (`*@gmail.com`, `*@proton.me`, `hi@<domain>`, `name@<personal-domain>`). Filter out role addresses (`support@`, `contact@`, `legal@`, `team@`, `help@`, `hello@`, `hi@`). Keep one email per post (the founder/owner, first found).

### 3. Resolve real product URLs

For every post with a GitHub URL, check the GitHub API `homepage` field. If it has a homepage link, use that instead of the GitHub URL.

### 4. Write outputs

Two files (overwrite existing):

**JSON** — `hn_shownew_emails.json` in project root:
```json
[
  {
    "num": 1,
    "title": "Edge Drop – Doing what Microsoft should do for Win+V(Clipboard)",
    "url": "https://edgedrop.vercel.app/",
    "author": "Deepender25",
    "email": "yadavdeepender65@gmail.com"
  }
]
```

**CSV** — `hn_shownew_emails.csv` in project root with columns: `Email`, `Company / Project`, `Link`

### 5. Present results

Tell the user:
- Total posts scanned (90)
- Total with emails found
- How many had URLs resolved to homepage
- Output file paths

### Important notes

- Use browser automation (agent-browser skill) for scraping — HN is JS-heavy.
- Use GitHub API for homepage lookups — faster than scraping.
- Only keep ~30 posts (rank 1-30) to keep scope manageable per session.
