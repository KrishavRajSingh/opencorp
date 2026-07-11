import "dotenv/config";
import { serperRedditSearch } from "@/lib/serper";
import { fetchGoogleRedditThreads } from "@/mastra/tools/google-reddit";

const QUERIES = [
  "manually retype",
  "form asks same",
  "retype same",
  "fill multiple applications",
  "same questions every form",
  "stop retyping resume",
  "manual form filling",
  "duplicate info every form",
];

const SUBS = ["jobs", "jobsearchhacks", "careerguidance", "recruitinghell"];

async function testSingle() {
  console.log("=== Test 1: Single query (manual retype) ===\n");
  const t0 = Date.now();
  const results = await serperRedditSearch("manually retype", { num: 10, time: "m" });
  const elapsed = Date.now() - t0;
  console.log(`Got ${results.length} results in ${elapsed}ms\n`);
  for (const r of results.slice(0, 5)) {
    console.log(`  r/${r.sub.padEnd(22)} | ${r.date ?? "?"}`);
    console.log(`    "${r.title.slice(0, 80)}"`);
    console.log(`    ${r.snippet.slice(0, 130).replace(/\n/g, " ")}`);
  }
}

async function testMulti() {
  console.log("\n=== Test 2: Multi-query with sub scoping (Filler pain) ===\n");
  const t0 = Date.now();
  const threads = await fetchGoogleRedditThreads({
    queries: QUERIES,
    subs: SUBS,
    limit: 10,
    time: "m",
  });
  const elapsed = Date.now() - t0;
  console.log(`Got ${threads.length} unique threads in ${elapsed}ms\n`);
  for (const t of threads.slice(0, 10)) {
    console.log(`  r/${t.sub.padEnd(22)} | ${t.updated ?? "?"}`);
    console.log(`    "${t.title.slice(0, 80)}"`);
    if (t.content) console.log(`    body: ${t.content.slice(0, 130).replace(/\n/g, " ")}`);
  }
}

async function testSub() {
  console.log("\n=== Test 3: Without sub scoping (broad) ===\n");
  const t0 = Date.now();
  const threads = await fetchGoogleRedditThreads({
    queries: ["fill out 50 applications", "is there a chrome extension that fills out"],
    limit: 10,
    time: "m",
  });
  const elapsed = Date.now() - t0;
  console.log(`Got ${threads.length} unique threads in ${elapsed}ms\n`);
  for (const t of threads.slice(0, 10)) {
    console.log(`  r/${t.sub.padEnd(22)} | ${t.updated ?? "?"}`);
    console.log(`    "${t.title.slice(0, 80)}"`);
  }
}

async function main() {
  if (!process.env.SERPER_API_KEY) {
    console.error("SERPER_API_KEY is not set");
    process.exit(1);
  }
  await testSingle();
  await testMulti();
  await testSub();
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exit(1);
});
