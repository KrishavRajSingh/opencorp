// ponytail: generate 100+ public-reply drafts from X search JSONs.
// Each draft: 2-3 sentences, lowercase, ≤280 chars, mirrors recipient's tweet/bio.
// Outputs to data/outreach/day-1-list.csv with handle, hook, draft, status.

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

function buildDraft(hook: string): string {
  // Use the full cleaned tweet as the hook. The opener + closer are fixed.
  // If the resulting draft exceeds 280 chars, truncate the hook to fit.
  const opener = `hey, saw "`;
  const closer = `". opencorp finds the reddit + HN threads where your users actually compare tools. free, no signup. want a report?`;
  const cleaned = cleanText(hook, 200);
  const maxHook = 280 - opener.length - closer.length;
  const snippet = cleaned.length > maxHook ? cleaned.slice(0, maxHook - 3).trim() + "..." : cleaned;
  return opener + snippet + closer;
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
  const lines = ["#,handle,name,hook,draft,status"];
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i]!;
    const h = t.author.screenName;
    const name = t.author.name ?? "";
    const hook = cleanText(t.text, 60);
    const draft = buildDraft(t.text);
    // CSV-escape: wrap fields with commas/quotes/newlines in double quotes
    const esc = (s: string) => `"${s.replace(/"/g, '""').replace(/\n/g, " ")}"`;
    lines.push(
      [
        i + 1,
        h,
        esc(name),
        esc(hook),
        esc(draft),
        "pending",
      ].join(","),
    );
  }

  writeFileSync(OUTPUT_CSV, lines.join("\n"));
  console.log(`[outreach] wrote ${targets.length} drafts to ${OUTPUT_CSV}`);
  // Show first 5 for sanity
  for (let i = 0; i < Math.min(5, targets.length); i++) {
    console.log(`[${i + 1}] @${targets[i]!.author.screenName} (${targets[i]!.author.name}): ${buildDraft(targets[i]!.text).slice(0, 100)}...`);
  }
}

main().catch((err) => {
  console.error("[outreach] failed:", err);
  process.exit(1);
});
