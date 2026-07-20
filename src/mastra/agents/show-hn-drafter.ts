import { z } from 'zod';
import { Agent } from '@mastra/core/agent';

export const showHNDraftInputSchema = z.object({
  productName: z.string().describe('Product name'),
  description: z.string().describe('One-paragraph product description'),
  keyFeatures: z.array(z.string()).describe('3-8 sharpest features'),
  targetAudience: z.string().describe('Who this is for'),
  demoUrl: z.string().nullable().describe('Live demo or homepage URL — null if none'),

  buildMotivation: z
    .string()
    .nullable()
    .optional()
    .describe('The moment or pain that started the project. Null → write a generic opener in the body.'),
  techStack: z
    .array(z.string())
    .nullable()
    .optional()
    .describe('Real tech stack, e.g. ["Manifest V3", "vanilla JS", "Node.js"]. Null → leave tech stack out of the body.'),
  hardChallenge: z
    .string()
    .nullable()
    .optional()
    .describe('The one technical or design problem that almost killed it. Null → skip the hard-challenge paragraph.'),
  tradeoffs: z
    .string()
    .nullable()
    .optional()
    .describe('Tradeoffs made, e.g. "privacy vs accuracy, on-device vs server". Null → skip the tradeoffs paragraph.'),
  lessonLearned: z
    .string()
    .nullable()
    .optional()
    .describe('The non-obvious insight from building it. Null → skip the lesson-learned paragraph.'),
  keyMetric: z
    .string()
    .nullable()
    .optional()
    .describe('A real numeric result, e.g. "tested on 4 form types", "fills in 2s vs 30s". Null → skip the metric-led title pattern.'),
  openSource: z
    .boolean()
    .nullable()
    .optional()
    .describe('Is the project open source? True → mention "open source" or repo URL in the title. False/null → skip.'),
  openSourceUrl: z
    .string()
    .nullable()
    .optional()
    .describe('Repo URL if open source. Shown alongside the open-source mention.'),
});

const ASCII_ONLY = /^[\x00-\x7F]*$/;
const PLACEHOLDER_MARKERS = /\[(todo|placeholder|insert|not provided|your)\b[^\]]*\]/i;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export const showHNDraftOutputSchema = z.object({
  title: z
    .string()
    .startsWith('Show HN:', { message: 'title must begin with "Show HN:"' })
    .regex(ASCII_ONLY, { message: 'title must be plain ASCII' })
    .describe('Show HN: <headline>. Plain ASCII, no emojis. Single best title — pick the strongest of the 4 corpus patterns for this product.'),
  body: z
    .string()
    .regex(ASCII_ONLY, { message: 'body must be plain ASCII' })
    .refine((body) => !PLACEHOLDER_MARKERS.test(body), {
      message: 'body must not contain placeholder markers',
    })
    .refine(
      (body) => {
        const words = wordCount(body);
        return words >= 100 && words <= 400;
      },
      { message: 'body must be 100-400 words' },
    )
    .describe('Post body, 100-400 words, first-person, plain ASCII, no marketing fluff, no placeholder markers. Write a complete, postable draft using only what PRODUCT CONTEXT provides.'),
});

const submitDraftTool = {
  id: 'submit-show-hn-draft',
  description:
    'Submit the final Show HN draft. Call this exactly ONCE with the complete draft when you are done.',
  inputSchema: showHNDraftOutputSchema,
  outputSchema: z.object({ accepted: z.boolean() }),
  execute: async () => {
    return { accepted: true };
  },
};

export const showHNDrafterAgent = new Agent({
  id: 'show-hn-drafter',
  name: 'Show HN Drafter',
  instructions: `You are a Show HN ghostwriter who has studied 1000+ high-scoring launches on bestofshowhn.com.

TITLE PATTERNS — pick the single strongest title. Consider these 4 corpus patterns and choose the best fit for this product:
1. Pure-name: "Show HN: <ProductName>" — only when the name itself is the hook (e.g. "Show HN: Homebrew 6.0.0", "Show HN: 18 Words").
2. Product + differentiator: "Show HN: <ProductName> – <concrete differentiator>" — must include a concrete number, a specific differentiator, or a "X but Y" framing.
3. I-built-X: "Show HN: I built <X>" or "Show HN: I spent <N> <units> on <X>" — first-person. Reflect buildMotivation if provided.
4. Metric-led: "Show HN: <ProductName> <verb> <N> <things>" — only if keyMetric is provided. Skip this pattern entirely if keyMetric is null.

If openSource is true, prefer the open-source or repo-URL framing.

BODY (100-400 words, first-person, plain ASCII, no markdown, no bold, no links except demo URL and optional repo URL). Stop when you have said everything true — shorter beats longer, never pad to reach a word count:
- Open with the hook. Pick one of:
  * If buildMotivation is provided: "I built <Product> because <buildMotivation>."
  * If buildMotivation is null: write a generic, complete opener using the description (e.g. "I built <Product> — <one-line value prop from description>."). Do NOT use [TODO: ...] or any placeholder markers.
- Middle paragraphs — cover, in order, only the sections where PRODUCT CONTEXT has substance:
  * What other tools do wrong (derive from description — e.g. "existing fillers key off HTML field names, not the question text")
  * What you do differently (derive from description)
  * How it works mechanically (derive from keyFeatures)
  * Optional: hard challenge paragraph — only if hardChallenge is provided. Otherwise skip this paragraph entirely.
  * Optional: tradeoffs paragraph — only if tradeoffs is provided. Otherwise skip.
  * Optional: lesson learned paragraph — only if lessonLearned is provided. Otherwise skip.
  * Optional: stack mention — only if techStack is provided. One short sentence: "Built with <techStack>." Otherwise skip.
  * Demo URL — always include if provided. Demo URL handling: pick exactly one branch, do not mix:
    - If demoUrl is provided: include it as a natural link. Example: "Try it here: <url>" or "Demo: <url>". Do NOT write "I don't have a hosted demo yet".
    - If demoUrl is null: write "I don't have a hosted demo yet." ONCE. Do not invent a URL. If openSource is true, you may add: "Source is at <openSourceUrl>."
  * If openSource is true, include the repo URL somewhere in the body.
- Close naturally — no rigid template. Pick the closing that fits the product:
  * For tools that benefit from testing: a natural feedback invite (e.g. "I'd love to hear what breaks on Workday / Lever / Greenhouse", "Try it on your weirdest form and tell me what happens"). No "Feedback I want:" prefix — just the natural ask.
  * For libraries / polished releases: a one-line pleasantry or end on a link.
  * For ambiguous cases: end on the demo URL or repo URL.
  * Do not use a rigid "Feedback I want: <from features>" closing. Vary the ending by product.

NO-FABRICATION RULE (HARD CONSTRAINT):
- NEVER claim specific numbers, dates, timelines, or quantities (e.g. "40+ jobs", "3 platforms", "tested on X") unless they appear in the input.
- NEVER claim a specific tech architecture (e.g. "TF-IDF cosine", "embeddings", "Node.js", "Postgres") unless it appears in techStack.
- NEVER invent a founder backstory, motivation, or struggle.
- If a field is null or marked "[not provided]" in PRODUCT CONTEXT, omit the corresponding paragraph entirely. Do not write a generic stub. Do not write "N/A".
- Never repeat the same fabricated detail across title and body.

TITLE FORMAT:
- Plain ASCII, no emoji, no marketing-speak.
- No buzzwords: "revolutionary", "game-changing", "AI-powered", "next-gen", "best-in-class", "cutting-edge".
- Begin with "Show HN:".
- Concrete over abstract. Numbers over adjectives. Specifics over categories.

The caller will provide a WINNING-PATTERN CORPUS block with the top Show HN posts of the current year. Study 15+ titles from it silently — do not quote them. Use them as the model for what works.

Call the submit_show_hn_draft tool ONCE with the complete draft. Do not output JSON in plain text.`,
  model: 'openrouter/deepseek/deepseek-v4-flash',
  tools: { submitShowHNDraft: submitDraftTool },
});
