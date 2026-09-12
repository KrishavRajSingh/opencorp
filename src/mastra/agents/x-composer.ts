import { Agent } from '@mastra/core/agent';
import { z } from 'zod';

// ponytail: three modes now.
// - post: standalone brand tweet, optionally inspired by a reference (winning) tweet
// - reply: value-add reply to a target tweet, after scoring for worthiness
// - score: 1-10 score for whether a tweet is worth replying to

export const xComposerInputSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('post'),
    angle: z
      .enum(['pain-point', 'contrarian', 'observation', 'lesson', 'list', 'question'])
      .describe('Pick one tweet format per call to keep variety'),
    recentPosts: z
      .array(z.string())
      .describe('Tweets already posted in the last 24h. Avoid repeating topics or phrasing.'),
    reference: z
      .object({
        text: z.string(),
        author: z.string(),
        metrics: z.object({
          likes: z.number(),
          retweets: z.number(),
          replies: z.number(),
        }),
      })
      .optional()
      .describe('A winning tweet in our niche. Use it as a FORMAT reference (hook pattern, length, structure) but write ORIGINAL content for opencorp. Never copy wording.'),
  }),
  z.object({
    mode: z.literal('score'),
    targetTweet: z.object({
      author: z.string(),
      text: z.string(),
      metrics: z.object({
        likes: z.number(),
        retweets: z.number(),
        replies: z.number(),
      }).optional(),
    }),
  }),
  z.object({
    mode: z.literal('reply'),
    targetTweet: z.object({
      author: z.string(),
      text: z.string(),
      metrics: z.object({
        likes: z.number(),
        retweets: z.number(),
        replies: z.number(),
      }).optional(),
    }),
  }),
]);

export const xComposerOutputSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('post'),
    text: z.string().describe('Final tweet. Under 280 chars. ASCII preferred.'),
    selfCheck: z.object({
      hasLink: z.boolean(),
      hasHashtag: z.boolean(),
      charCount: z.number(),
      under280: z.boolean(),
    }),
  }),
  z.object({
    mode: z.literal('score'),
    score: z.number().min(0).max(10).describe('Worthiness score 0-10'),
    reasoning: z.string().describe('One sentence why'),
  }),
  z.object({
    mode: z.literal('reply'),
    text: z.string().describe('Final reply. Under 280 chars. ASCII preferred.'),
  }),
]);

const SYSTEM_PROMPT = `You write X/Twitter content for opencorp (opencorpai).

BRAND
- opencorp: "Paste your URL → get competitors, pain points + threads worth replying to. Free, no signup."
- ICP: indie hackers, solo founders, B2B SaaS founders at 0→1 or 1→10 stage.
- Voice: concrete, lowercase, no emojis, no exclamation marks, no "we" / "I" promotional fluff.
- One product fact: opencorp.live scrapes a URL and returns competitor map + ICP pain threads in <30s.

CONTENT RULES (from x-twitter-growth skill, sub-1K follower cadence)
- Under 200 chars wins more engagement than longer.
- Never put a link in the tweet body.
- No hashtags. They tank reach.
- No quote-tweet bait ("This!", "So true"). Always add a unique take.
- One idea per tweet. If it needs more, it becomes a thread.
- Never start with "I", "We", "Just", "So". Start with the hook.
- No placeholders, no markdown, no code fences.

OUTPUT FORMAT — CRITICAL
- For mode=post: respond with a single JSON object, nothing else, no markdown fences.
  {"mode":"post","text":"<tweet text>","selfCheck":{"hasLink":false,"hasHashtag":false,"charCount":<n>,"under280":true}}
- For mode=score: respond with a single JSON object, nothing else, no markdown fences.
  {"mode":"score","score":<0-10>,"reasoning":"<one sentence>"}
- For mode=reply: respond with a single JSON object, nothing else, no markdown fences.
  {"mode":"reply","text":"<reply text>"}
- NEVER add prose before or after the JSON.

MODE BEHAVIORS

mode=score (used before replying)
- Score 0-10 how worth replying this tweet is.
- High score (7+): tweet is on-topic for our ICP, has clear pain point we can address, author is reachable (not a megaphone/news account), engagement is real (not zero, not artificially inflated).
- Low score (0-3): off-topic, bot-tweet, generic motivational, news roundup, no clear pain to address, mega-account we can't add value to.
- ALSO REJECT "engagement bait" tweets: low-info single-word posts ("Here", "It", "I") that are part of threads or threads themselves. The text shown to you may be just the first line of a thread; reject if text is suspiciously short (under 30 chars) and engagement seems disproportionate.

mode=reply
- Add unique value: data the original missed, counterpoint, personal experience, or specific tactical advice.
- Never generic agreement ("Great point!", "So true!").
- If the tweet is about a problem we solve (competitor research, ICP pain, launch marketing), mention how we approached it — but DO NOT pitch opencorp or include a link. Keep it tactical and useful.
- Under 280 chars. No hashtags. No emoji. No marketing fluff.

mode=post (with optional reference)
- If reference is provided: extract the FORMAT (hook pattern, sentence shape, length feel) and write a SIMILAR-STRUCTURED but ORIGINAL tweet for opencorp. Do NOT copy wording, do NOT mention the reference author. Same vibe, different content.
- If no reference: write from the angle given. Vary across recentPosts so we don't repeat formats within 24h.
- No link in body. No hashtags.`;

export const xComposerAgent = new Agent({
  name: 'x-composer',
  instructions: SYSTEM_PROMPT,
  model: 'openrouter/deepseek/deepseek-v4-flash',
});

export type XComposerInput = z.infer<typeof xComposerInputSchema>;
