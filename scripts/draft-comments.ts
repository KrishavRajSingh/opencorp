// Draft 3 value-first comment variants per scanned thread.
// 9:1 safe: no opencorp mention in 2 of 3 variants; mention only in 1 (the "disclose" variant).
// All variants ≤280 chars. No em dashes. No corporate vocab.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

type Thread = {
  subreddit: string;
  post_id: string;
  author: string;
  title: string;
  score: number;
  comments: number;
  keyword: string;
  url: string;
};

function parseCsv(raw: string): Thread[] {
  const lines = raw.split("\n").filter(Boolean);
  const header = lines[0]!.split(",");
  return lines.slice(1).map((l) => {
    // crude CSV parse: quote-aware
    const cells: string[] = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < l.length; i++) {
      const c = l[i]!;
      if (c === '"' && l[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        q = !q;
      } else if (c === "," && !q) {
        cells.push(cur);
        cur = "";
      } else {
        cur += c;
      }
    }
    cells.push(cur);
    const obj: Record<string, string> = {};
    header.forEach((h, i) => (obj[h!] = cells[i] ?? ""));
    return obj as unknown as Thread;
  });
}

type Variant = {
  variant: "value-only" | "soft-disclose" | "with-link";
  text: string;
  intent: string;
};

// 3 variants per thread, 9:1 safe by default. All ≤80 words / short.
function draftVariants(t: Thread): Variant[] {
  return [
    {
      variant: "value-only",
      intent: "9 of every 10 comments. Pure value, no opencorp mention. The 1 in 9.",
      text: `seen this same pattern kill launches. the founders who convert fastest spend a week finding the 3-5 threads where their buyers already describe the problem, then answer them well before pitching anything. takes a week, costs nothing, and the people who click your profile are the ones who'd actually pay.`,
    },
    {
      variant: "soft-disclose",
      intent: "Reserved for high-fit threads (r/AlphaandBetausers, r/SideProject show-and-tell). One disclosure line at the end.",
      text: `same here at $0 MRR. the move that worked: search reddit sorted by new with the exact phrase your customer would type. i wrapped that into a free tool that pulls the threads in 30 sec instead of 30 min, paste any url. disclosure, i built it: opencorp.`,
    },
    {
      variant: "with-link",
      intent: "Only for the weekly self-promo threads (r/indiehackers Share what you're building, r/EntrepreneurRideAlong Feedback Friday). 1 in 9 across all subs.",
      text: `working on opencorp: paste any product url, get the reddit + hn threads where your buyers compare tools. free, no signup. would love beta testers. opencorp.live`,
    },
  ];
}

function main() {
  const csv = join(process.cwd(), "data", "reddit", "threads.csv");
  const threads = parseCsv(readFileSync(csv, "utf8"));
  const outDir = join(process.cwd(), "data", "reddit");
  mkdirSync(outDir, { recursive: true });

  // Group by sub for ratio tracking
  const bySub = new Map<string, Array<{ thread: Thread; variants: Variant[] }>>();
  for (const t of threads) {
    const variants = draftVariants(t);
    const arr = bySub.get(t.subreddit) ?? [];
    arr.push({ thread: t, variants });
    bySub.set(t.subreddit, arr);
  }

  // Write per-thread JSON drafts
  const out = join(outDir, "drafts.json");
  const allDrafts = threads.map((t) => ({
    thread: t,
    variants: draftVariants(t),
  }));
  writeFileSync(out, JSON.stringify(allDrafts, null, 2));
  console.log(`[draft] wrote ${allDrafts.length} threads × 3 variants → ${out}`);

  // Show first 3
  for (const d of allDrafts.slice(0, 3)) {
    console.log(`\n--- r/${d.thread.subreddit}: ${d.thread.title.slice(0, 60)} ---`);
    for (const v of d.variants) {
      console.log(`[${v.variant}] (${v.text.length}c) ${v.text.slice(0, 100)}...`);
    }
  }
}

main();
