// ponytail: generate 100+ public-reply targets from X search JSONs.
// CSV stores: handle, name, tweet_id, hook (cleaned tweet text), status.
// Drafts are rendered at send time from a 6-opener pool to vary structure
// (X classifier flags templated replies, per 2026 docs).

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

type Tweet = {
  id: string;
  text: string;
  author: { id: string; screenName: string; name: string };
  metrics: { likes: number; retweets: number; replies: number };
  createdAt: string;
};

const INPUT_DIR = "/tmp";
const OUTPUT_CSV = join(process.cwd(), "data", "outreach", "day-1-list.csv");

// Non-indie accounts to skip
const SKIP_HANDLES = new Set([
  "opencorpai", "FilipPanoski",
  "AnthropicAI", "OpenAI", "GoogleAI", "GoogleDeepMind", "Google",
  "Microsoft", "MicrosoftAI", "Meta", "Apple", "Amazon",
  "elonmusk", "sama", "satyanadella", "BillGates",
  "HunterBiden", "BillNye", "Bob_Casey", "anarcholibertea",
  "Disney", "Reuters", "BBCWorld", "CNN", "FoxNews", "WSJ",
  "WrestleOps", "Malay4Product", "Rahul_J_Mathur", "Nithin0dha",
  "reatlashype", "FrameworkPuter", "skeletaldrawing",
  "durov", "natfriedman", "bryan_johnson",
  "GadzhiIman", "warikoo", "justindchapman",
  "thefernandocz", "thenerd_be", "cdithaca", "official8191",
  "asanwal", "jspujji", "RohanNayak2", "ericosiu",
  "BenLang", "BenjiTaylor", "mynameis_davis", "agazdecki",
  "caleb_friesen", "thedankoe", "benln",
  "startupideaspod", "WrestleOps",
]);

// Opencorp-relevant keywords in tweet/bio
const RELEVANT_PATTERNS = [
  /\b(indie|solo founder?|founder|building in public|shipped|launched|mrr|bootstrap|saas|product)\b/i,
  /\b(started|building|shipping|ship|launch|first customer|100 users|revenue)\b/i,
];

function isRelevant(text: string): boolean {
  return RELEVANT_PATTERNS.some((p) => p.test(text));
}

function cleanText(text: string, max: number): string {
  // Strip URLs, mentions, hashtags, collapse whitespace
  const stripped = text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/@\w+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length > max ? stripped.slice(0, max).trim() + "..." : stripped;
}

// Build draft from hook using one of 6 opener variants.
// ponytail: opener pool varies structure (X flags templated replies in 2026).
// Em dashes + parallel structure + same closer are all AI tells. Mixed here.
export const OPENERS: Array<(snippet: string) => string> = [
  (s) => `hey, saw "${s}". opencorp finds the reddit + HN threads where your users compare tools. free, no signup. want a report?`,
  (s) => `noticed your post on "${s}". opencorp surfaces threads where your ICP already complains about tools like yours. free, no signup. want a look?`,
  (s) => `caught your post on "${s}". opencorp pulls the threads where reddit + HN users compare your category. free, no signup. interesting?`,
  (s) => `quick one: saw "${s}". opencorp surfaces the reddit + HN threads your users already use to compare tools. free, no signup. want it?`,
  (s) => `reading "${s}". opencorp finds the reddit + HN threads where your users compare your category head-to-head. free, no signup. worth a try?`,
  (s) => `"${s}" is the exact gap opencorp fills. pulls the reddit + HN threads your ICP is already arguing in. free, no signup. want a sample?`,
];

export function buildDraft(hook: string, openerIdx: number): string {
  const cleaned = cleanText(hook, 200);
  const opener = OPENERS[openerIdx % OPENERS.length]!;
  // Compute max hook length per opener (each opener has different length)
  // Render with full hook first, then trim if >280
  const out = opener(cleaned);
  if (out.length <= 280) return out;
  // Trim the snippet portion
  const maxSnippet = 280 - (out.length - cleaned.length) - 3;
  const trimmed = cleaned.slice(0, Math.max(0, maxSnippet)).trim() + "...";
  return opener(trimmed);
}

async function main() {
  const seen = new Map<string, Tweet>();
  const files = readdirSync(INPUT_DIR)
    .filter((f) => /^t\d+\.json$/.test(f))
    .map((f) => join(INPUT_DIR, f));

  for (const f of files) {
    try {
      const raw = readFileSync(f, "utf8");
      const d = JSON.parse(raw) as { data?: Tweet[] };
      for (const t of d.data ?? []) {
        const h = t.author?.screenName;
        if (!h || SKIP_HANDLES.has(h)) continue;
        const text = t.text ?? "";
        if (!isRelevant(text) && !isRelevant(t.author.name ?? "")) continue;
        if (seen.has(h)) continue;
        seen.set(h, t);
      }
    } catch {
      /* ignore */
    }
  }

  // Sort by likes desc (proxy for engagement signal)
  const sorted = Array.from(seen.values()).sort(
    (a, b) => (b.metrics?.likes ?? 0) - (a.metrics?.likes ?? 0),
  );

  // Take top 100
  const targets = sorted.slice(0, 100);

  // Write CSV
  mkdirSync(join(process.cwd(), "data", "outreach"), { recursive: true });
  const lines = ["#,handle,name,tweet_id,hook,sent_at,reply_id,status"];
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i]!;
    const h = t.author.screenName;
    const name = t.author.name ?? "";
    const tweetId = t.id ?? "";
    const hook = cleanText(t.text, 200);
    // CSV-escape: wrap fields with commas/quotes/newlines in double quotes
    const esc = (s: string) => `"${s.replace(/"/g, '""').replace(/\n/g, " ")}"`;
    lines.push(
      [
        i + 1,
        h,
        esc(name),
        tweetId,
        esc(hook),
        "",
        "",
        "pending",
      ].join(","),
    );
  }

  writeFileSync(OUTPUT_CSV, lines.join("\n"));
  console.log(`[outreach] wrote ${targets.length} targets to ${OUTPUT_CSV}`);
  // Show first 5 for sanity
  for (let i = 0; i < Math.min(5, targets.length); i++) {
    const t = targets[i]!;
    console.log(`[${i + 1}] @${t.author.screenName} (${t.author.name}) tweet=${t.id}`);
  }
}

main().catch((err) => {
  console.error("[outreach] failed:", err);
  process.exit(1);
});
