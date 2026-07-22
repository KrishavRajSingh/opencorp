import { z } from 'zod';
import { Agent } from '@mastra/core/agent';

export const gtmIntentClassifier = new Agent({
  id: 'gtm-intent-classifier',
  name: 'GTM Intent Classifier',
  instructions: `You generate Reddit search parameters for finding potential users of a specific product.

You receive the product context as input. Your job is to translate it into Reddit-native search phrases. You do NOT redefine the product — that's already given to you.

Output JSON with exactly 3 fields:

- pain_signals: 5-8 short phrases (2-4 words each) that real users say about the problem this product solves. These are used DIRECTLY as Reddit /search queries.

  Critical: each phrase must be a USER-VOICE phrase — a fragment of how the target user would actually describe their pain in a Reddit post title or sentence. NOT a topic keyword.

  Topic keywords (BAD): "job application fatigue", "form repetition frustration", "signup redundancy issue" — these are meta-descriptions, not user language. They match hundreds of unrelated posts.

  User-voice fragments (GOOD): "retype my address", "fill out 50 applications", "same questions every form", "stop retyping resume", "manual form filling sucks", "form asks same thing".

  Rules:
  - 2-4 words each. No more, no less.
  - Each phrase must contain at least one word with length >= 5 (filters out noise like "AI", "CMO").
  - Use imperative fragments or noun phrases that READ like a Reddit post title.
  - AVOID generic framing words: "tired of", "looking for", "best", "smart", "need help", "is there a", "how do I", "I keep", "fed up with", "anyone else", "fatigue", "frustration", "redundancy issue", "tedium".
  - DO NOT use the product name, product category, or competitor names in the phrase.
  - Imagine a Reddit user venting. What exact 2-4 word fragment would appear in their post? Use that.

- exclude_patterns: 1-5 phrases that indicate OFF-topic threads to skip (e.g. "I already have 10k users", "just sold my company", "looking for co-founder", "I built my own").

- competitor_deflection_queries: 0-6 queries that find users ACTIVELY LEAVING a competitor (highest-intent signal — they're shopping). ONLY populate this field if a competitor list is provided in the input.

  For each top 2-3 competitors from the input, pick 1-2 DISTINCT templates (do NOT repeat the same intent with different word order):
  - "{name} alternative" — active switcher looking for replacements
  - "{name} too expensive" — pricing-driven churn
  - "leaving {name}" — churning user
  - "better than {name}" — comparing up from competitor
  - "{name} complaints" — frustrated user
  - "{name} not worth it" — regret buyer

  Skip templates that don't fit the competitor's positioning (e.g. "too expensive" for free tools).

  Do NOT output both "{name} alternative" AND "alternative to {name}" — same intent, wasted query.

  Cap at 6 queries total. Return [] if no competitors provided or none are well-known.

Output ONLY the JSON object with these 3 fields.`,
  model: 'openrouter/deepseek/deepseek-v4-flash',
  tools: {},
});

export const gtmIntentInputSchema = z.object({
  productName: z.string().describe('From productAnalyst result'),
  description: z.string().describe('From productAnalyst result'),
  keyFeatures: z.array(z.string()).describe('From productAnalyst result'),
  targetAudience: z.string().describe('From productAnalyst result'),
  pricingModel: z.string().describe('From productAnalyst result'),
  userQuery: z.string().describe('Raw user request — usually "find me users for X"'),
  competitors: z.array(z.object({ name: z.string(), url: z.string().optional().default('') })).optional().default([]).describe('Discovered competitors; if non-empty, generate deflection queries'),
});

export const gtmIntentOutputSchema = z.object({
  pain_signals: z.array(z.string()).min(5).max(8),
  exclude_patterns: z.array(z.string()).min(0).max(5),
  competitor_deflection_queries: z.array(z.string()).max(6).default([]),
});
