import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { citationPages } from "../src/lib/citation-pages";
import { blogPosts } from "../src/lib/blog/posts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://opencorp.live";
const HOST = new URL(SITE_URL).hostname;
const KEY_PATH = join(process.cwd(), "public", "indexnow-key.txt");
const KEY_URL = `${SITE_URL}/indexnow-key.txt`;

const envKey = process.env.INDEXNOW_KEY;
let key: string;
if (envKey) {
  key = envKey;
} else if (existsSync(KEY_PATH)) {
  key = readFileSync(KEY_PATH, "utf8").trim();
} else {
  key = randomBytes(16).toString("hex");
  writeFileSync(KEY_PATH, key);
  console.log(
    `[indexnow] generated new key at ${KEY_PATH} — host this file at ${KEY_URL} (deploy first, then re-run)`,
  );
}

const urls = [
  `${SITE_URL}/`,
  `${SITE_URL}/best`,
  `${SITE_URL}/blog`,
  ...citationPages.map((p) => `${SITE_URL}/best/${p.slug}`),
  ...blogPosts.map((p) => `${SITE_URL}/blog/${p.slug}`),
];

const body = JSON.stringify({
  host: HOST,
  key,
  keyLocation: KEY_URL,
  urlList: urls,
});

async function main() {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body,
  });

  const text = await res.text();
  console.log(`[indexnow] ${urls.length} URLs → ${res.status} ${text}`);
}

main().catch((err) => {
  console.error("[indexnow] failed:", err);
  process.exit(1);
});
