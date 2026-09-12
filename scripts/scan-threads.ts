// Scan target subs for high-intent threads. Output: data/reddit/threads.csv
// Filters by problem keywords (someone describing the problem opencorp solves).

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const SUBS = [
  "SideProject",
  "buildinpublic",
  "EntrepreneurRideAlong",
  "AlphaandBetausers",
  "indiehackers",
  "SaaS",
  "microsaas",
];

// Keywords that indicate someone describing the problem opencorp solves.
const KEYWORDS = [
  "find users",
  "first customer",
  "where do my users",
  "competitor",
  "competitors",
  "where to market",
  "how to market",
  "looking for users",
  "looking for beta",
  "looking for testers",
  "need beta",
  "need testers",
  "first paying",
  "first sale",
  "0 users",
  "no traction",
  "marketing help",
  "distribution",
  "no users",
  "no signups",
  "no sign-ups",
  "validate",
  "validation",
  "icp",
  "target audience",
  "audience",
  "cold outreach",
  "cold email",
  "pain point",
  "pain points",
  "reddit thread",
  "where to post",
  "where to share",
  "best subreddit",
  "where do you find",
  "how did you get",
  "how'd you get",
  "first 100",
  "first 10",
  "first user",
  "how to find",
  "research",
];

type SubPost = {
  id: string;
  title: string;
  selftext: string;
  author: string;
  score: number;
  num_comments: number;
  subreddit: string;
  created_utc: number;
  url: string;
};

function isRelevant(text: string): boolean {
  const lower = text.toLowerCase();
  return KEYWORDS.some((k) => lower.includes(k));
}

function fetchSub(name: string, sort: "new" | "hot" = "new"): SubPost[] {
  try {
    const out = execFileSync(
      "rdt",
      ["sub", name, "--sort", sort, "-n", "50", "--json"],
      { encoding: "utf8", timeout: 60_000 },
    );
    const d = JSON.parse(out) as { data?: { data?: { children?: Array<{ data: SubPost }> } } };
    const children = d?.data?.data?.children ?? [];
    return children.map((c) => c.data).filter(Boolean);
  } catch (e) {
    console.error(`[scan] ${name} fetch failed: ${(e as Error).message.slice(0, 100)}`);
    return [];
  }
}

function main() {
  const outDir = join(process.cwd(), "data", "reddit");
  mkdirSync(outDir, { recursive: true });
  const allMatches: Array<SubPost & { keyword: string }> = [];

  for (const sub of SUBS) {
    console.log(`[scan] r/${sub}...`);
    const posts = fetchSub(sub, "new");
    let hits = 0;
    for (const p of posts) {
      const text = `${p.title} ${p.selftext ?? ""}`;
      const matchedKw = KEYWORDS.find((k) => text.toLowerCase().includes(k));
      if (matchedKw) {
        allMatches.push({ ...p, keyword: matchedKw });
        hits++;
      }
    }
    console.log(`  ${posts.length} posts, ${hits} relevant`);
  }

  // Sort by recency
  allMatches.sort((a, b) => b.created_utc - a.created_utc);

  const esc = (s: string) => `"${(s ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`;
  const lines = ["subreddit,post_id,author,title,score,comments,keyword,url,scanned_at"];
  const now = new Date().toISOString();
  for (const m of allMatches) {
    lines.push(
      [
        m.subreddit,
        m.id,
        m.author,
        esc(m.title),
        m.score,
        m.num_comments,
        m.keyword,
        m.url,
        now,
      ].join(","),
    );
  }
  const csv = join(outDir, "threads.csv");
  writeFileSync(csv, lines.join("\n"));
  console.log(`\n[scan] wrote ${allMatches.length} threads → ${csv}`);
  for (const m of allMatches.slice(0, 8)) {
    console.log(`  r/${m.subreddit} [${m.keyword}]: ${m.title.slice(0, 80)}`);
  }
}

main();
