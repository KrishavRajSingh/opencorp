import "dotenv/config";
import { mastra } from "@/mastra";

async function main() {
  const wf = mastra.getWorkflow("gtmRedditScanWorkflow") as unknown as {
    createRun: (opts?: { runId?: string }) => Promise<{
      runId: string;
      start: (input: { inputData: Record<string, unknown> }) => Promise<{ result: unknown }>;
    }>;
  };
  if (!wf) throw new Error("workflow missing");

  const run = await wf.createRun({ runId: `test_${Date.now().toString(36)}` });
  const out = await run.start({
    inputData: {
      userQuery: "Find me users for an AI marketing assistant that helps solo SaaS founders write content without hiring an agency.",
      productName: "Okara AI CMO",
      description: "AI marketing assistant that helps solo SaaS founders write content without hiring an agency.",
      keyFeatures: ["AI content writer", "social media automation", "weekly post drafts"],
      targetAudience: "solo SaaS founder, indie hacker",
      pricingModel: "$49/month",
      subsSearch: ["SaaS", "startups", "sideproject", "indiehackers", "Entrepreneur"],
    },
  });
  const r = (out as { result?: Record<string, unknown> }).result;
  console.log("\n=== Workflow result ===");
  console.log("intent.product_name:", r?.intent && (r.intent as { product_name?: string }).product_name);

  const threads = (r?.top_threads ?? []) as Array<{
    rank: number;
    thread: { id: string; sub: string; title: string; author?: string; score?: number; num_comments?: number };
    buyer_reason?: string;
    top_quotes?: string[];
  }>;
  const dropped = (r?.dropped ?? []) as Array<{ id: string; title: string; drop_reason: string }>;

  console.log("\n--- KEPT (real buyers) ---");
  for (const t of threads) {
    console.log(`[${t.rank}] r/${t.thread.sub} score=${t.thread.score} u/${t.thread.author ?? "?"}`);
    console.log(`    "${t.thread.title.slice(0, 80)}"`);
    if (t.buyer_reason) console.log(`    why: ${t.buyer_reason}`);
    if (t.top_quotes) {
      for (const q of t.top_quotes.slice(0, 2)) {
        console.log(`    > "${q.slice(0, 100)}${q.length > 100 ? "..." : ""}"`);
      }
    }
  }

  console.log(`\n--- DROPPED (${dropped.length}) ---`);
  for (const d of dropped.slice(0, 10)) {
    console.log(`  - ${d.title.slice(0, 60)}`);
    console.log(`    reason: ${d.drop_reason}`);
  }
  if (dropped.length > 10) console.log(`  ... +${dropped.length - 10} more`);

  console.log("\nstats:", JSON.stringify(r?.stats, null, 2));
}

main().catch((err) => {
  console.error("FAIL:", err.message ?? err);
  process.exit(1);
});
