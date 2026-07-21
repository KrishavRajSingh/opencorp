import "dotenv/config";
import { mastra } from "@/mastra";
import { buildShowHNDraftPrompt } from "@/mastra/agents/show-hn-drafter";

const PRODUCT = {
  productName: "Filler",
  description:
    "Filler is a free Chrome extension that eliminates the tedium of retyping the same information across web forms. Users save their personal details (name, work, school, links, plus custom long-form answers) into a local profile once. Then, when they encounter any form — Google Forms, job applications, surveys, or signups — they simply click 'Fill' and Filler intelligently maps their saved profile data to the form's questions. Crucially, it reads what the form actually asks (semantically), not just HTML field names, so it can match 'When did you finish college?' to a saved 'Graduation year: 2025' even when the field names differ. The extension never auto-submits; it fills in answers and flags anything it guessed on so the user can review and edit before manually submitting. It is built by an individual developer (Krishavraj Singh) and is completely free, with no account required.",
  keyFeatures: [
    "Save-once profile — store name, work, education, links, and custom long answers locally",
    "Semantic form understanding — reads what the form asks in plain language",
    "Answer reuse across forms",
    "Intelligent guessing with visual flags for review",
    "User control — never auto-submits",
    "Privacy-first — data stays on device until 'Fill' is clicked",
    "Works on Google Forms, Ashby, Tally, and most standard web forms",
    "No account required, completely free",
  ],
  targetAudience:
    "job seekers, students, freelancers, anyone retyping the same personal details across sites",
  demoUrl: "https://filler.live",
  openSource: null as boolean | null,
  openSourceUrl: null as string | null,
  buildMotivation: null as string | null,
  techStack: null as string[] | null,
  hardChallenge: null as string | null,
  tradeoffs: null as string | null,
  lessonLearned: null as string | null,
  keyMetric: null as string | null,
};

type Args = Partial<typeof PRODUCT>;

const args: Args = (() => {
  const a: Record<string, string> = {};
  for (let i = 2; i < process.argv.length; i += 2) {
    const k = process.argv[i]!.replace(/^--/, "");
    const v = process.argv[i + 1]!;
    if (k === "techStack") a[k] = v.split(",").map((s) => s.trim());
    else if (k === "openSource") a[k] = v === "true";
    else a[k] = v;
  }
  return a as Args;
})();

const input = { ...PRODUCT, ...args };

const userQ = buildShowHNDraftPrompt(input);

async function main() {
  const agent = mastra.getAgent("showHNDrafterAgent");
  if (!agent) throw new Error("showHNDrafterAgent not registered");

  const t0 = Date.now();
  const result = await agent.generate([{ role: "user", content: userQ }]);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  let parsed: Record<string, unknown> | null = null;
  for (const tc of result.toolCalls ?? []) {
    if (tc.payload?.toolName === "submitShowHNDraft") {
      parsed = (tc.payload.args ?? {}) as Record<string, unknown>;
      break;
    }
  }
  if (!parsed) {
    const text = (result.text ?? "").trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
  }

  console.log(`\n=== done in ${elapsed}s ===`);
  if (!parsed) {
    console.log("NO TOOL CALL. raw text:\n", (result.text ?? "").slice(0, 2000));
    process.exit(1);
  }

  const title = parsed.title as string;
  const body = parsed.body as string;

  console.log(`\n=== TITLE ===\n${title}`);

  console.log(`\n=== POST BODY (${body.length} chars) ===\n${body}`);
}

main().catch((err) => {
  console.error("FAIL:", err instanceof Error ? err.message : err);
  process.exit(1);
});
