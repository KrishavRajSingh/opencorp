import "dotenv/config";
import { mastra } from "@/mastra";

const wf = mastra.getWorkflow("gtmRedditScanWorkflow") as unknown as {
  createRun: (opts?: { runId?: string }) => Promise<{
    runId: string;
    start: (input: { inputData: Record<string, unknown> }) => Promise<{ result: unknown }>;
  }>;
};

async function main() {
  const productArg = process.argv[2] ?? "filler";

  const fixtures = {
    filler: {
      productName: "Filler",
      description:
        "Filler is a free Chrome extension that eliminates the tedium of retyping the same information across different online forms. It reads the actual natural-language question the form asks, not the HTML field name, and intelligently matches it to the right piece of data in your profile. Free, no account required, privacy-first.",
      keyFeatures: [
        "one-time profile setup stored locally",
        "intelligent natural-language question reading",
        "answer reuse across forms",
        "smart guessing with review flags",
        "Google Forms, Ashby ATS, Tally, etc.",
        "privacy-first, no account needed",
      ],
      targetAudience:
        "job applicants filling multiple applications, students filling surveys, anyone repeating same answers",
      pricingModel: "Free",
      subsSearch: [
        "jobs",
        "jobsearchhacks",
        "careerguidance",
        "cscareerquestions",
        "ExperiencedDevs",
        "recruitinghell",
        "AskHR",
        "jobboard",
      ],
      competitors: [
        { name: "JobWizard", url: "https://jobwizard.ai" },
        { name: "Simplify", url: "https://simplify.jobs" },
        { name: "Fillr", url: "https://fillr.com.au" },
      ],
      userQuery:
        "Find me users for Filler — a free Chrome extension that auto-fills repetitive online forms (job apps, surveys, signups) by reading natural-language questions.",
    },
    okara: {
      productName: "Okara",
      description:
        "Okara is an AI CMO for small businesses. It creates blog posts, social media captions, and email newsletters in your brand voice automatically. Set up your brand once and Okara produces a week of content in minutes.",
      keyFeatures: [
        "brand voice cloning from existing website copy",
        "weekly content calendar auto-generation",
        "blog post + social + email bundles",
        "built-in SEO optimization",
        "one-click publish to WordPress, Shopify, social platforms",
      ],
      targetAudience:
        "small business owners doing their own marketing, indie founders, solopreneurs",
      pricingModel: "$49/mo starter, $149/mo growth",
      subsSearch: [],
      competitors: [
        { name: "Jasper", url: "https://jasper.ai" },
        { name: "Surfer SEO", url: "https://surferseo.com" },
        { name: "Copy.ai", url: "https://copy.ai" },
      ],
      userQuery: "Find me users for Okara — an AI CMO for small businesses.",
    },
  };

  const fixture = fixtures[productArg as keyof typeof fixtures];
  if (!fixture) {
    console.error("Usage: tsx scripts/inspect-intent.ts <filler|okara>");
    process.exit(1);
  }

  const run = await wf.createRun({
    runId: `inspect_${Date.now().toString(36)}`,
  });
  const out = await run.start({
    inputData: fixture,
  });
  const r = out.result as {
    intent: {
      pain_signals: string[];
      query_angles: string[];
      target_subs: string[];
      exclude_patterns: string[];
      competitor_deflection_queries: string[];
    };
  };
  console.log(`\n=== Intent classifier LLM output (${productArg}) ===`);
  console.log("pain_signals:", JSON.stringify(r.intent.pain_signals, null, 2));
  console.log("query_angles:", JSON.stringify(r.intent.query_angles, null, 2));
  console.log("target_subs:", JSON.stringify(r.intent.target_subs, null, 2));
  console.log("exclude_patterns:", JSON.stringify(r.intent.exclude_patterns, null, 2));
  console.log(
    "competitor_deflection_queries:",
    JSON.stringify(r.intent.competitor_deflection_queries, null, 2),
  );
}

main().catch((err) => {
  console.error("FAIL:", err.message ?? err);
  process.exit(1);
});
