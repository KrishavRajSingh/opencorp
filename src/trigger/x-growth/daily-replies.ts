import { schedules, wait } from '@trigger.dev/sdk/v3';
import { spawn } from 'node:child_process';
import { z } from 'zod/v4';
import { xComposerAgent, xComposerInputSchema } from '@/mastra/agents/x-composer';

// ponytail: search GraphQL 404s from Trigger.dev cloud IPs, but `user-posts <handle>` works.
// We curate a small list of accounts in opencorp's ICP that have actually posted on-topic
// (verified in earlier feed/search runs). Cron every 2h with intra-window jitter.

const ICP_HANDLES = [
  'brian_millot',
  'jakobgreenfeld',
  'marclou',
  'levelsio',
] as const;

const WORTH_SCORE_THRESHOLD = 7;
const WINNER_LIKES_THRESHOLD = 20;
const RANDOM_JITTER_SECONDS_MAX = 1800;

const replyPayloadSchema = z.object({ skipJitter: z.boolean().optional() });

type TwitterResult = { code: number | null; stdout: string; stderr: string };
type FeedTweet = {
  id: string;
  text: string;
  author: string;
  likes: number;
  retweets: number;
  replies: number;
};

function runTwitter(args: string[]): Promise<TwitterResult> {
  return new Promise((resolve) => {
    const p = spawn('twitter', args, { env: process.env });
    let stdout = '';
    let stderr = '';
    p.stdout.on('data', (d) => (stdout += d.toString()));
    p.stderr.on('data', (d) => (stderr += d.toString()));
    p.on('close', (code) => resolve({ code, stdout, stderr }));
    p.on('error', (err) => resolve({ code: -1, stdout, stderr: stderr + err.message }));
  });
}

function parseFeedTweets(yaml: string): FeedTweet[] {
  const tweets: FeedTweet[] = [];
  const re =
    /id:\s*['"]?(\d+)['"]?[\s\S]*?text:\s*'([\s\S]+?)'\s*\n\s*author:[\s\S]*?screenName:\s*['"]?([A-Za-z0-9_]+)['"]?[\s\S]*?metrics:[\s\S]*?likes:\s*(\d+)[\s\S]*?retweets:\s*(\d+)[\s\S]*?replies:\s*(\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(yaml)) !== null) {
    tweets.push({
      id: m[1],
      text: m[2].replace(/\s+/g, ' ').trim(),
      author: m[3],
      likes: Number(m[4]),
      retweets: Number(m[5]),
      replies: Number(m[6]),
    });
  }
  return tweets;
}

export const dailyReplies = schedules.task({
  id: 'daily-replies',
  cron: { pattern: '0 */2 * * *', timezone: 'UTC' },
  run: async (payload: z.infer<typeof replyPayloadSchema> = {}) => {
    if (!payload.skipJitter) {
      await wait.for({ seconds: Math.floor(Math.random() * RANDOM_JITTER_SECONDS_MAX) });
    }

    const candidates: FeedTweet[] = [];
    for (const handle of ICP_HANDLES) {
      const r = await runTwitter(['user-posts', handle, '--max', '5', '--yaml']);
      if (r.code !== 0) continue;
      candidates.push(...parseFeedTweets(r.stdout));
    }

    const filtered = candidates
      .filter((t) => !/^RT/.test(t.text))
      .filter((t) => t.likes >= WINNER_LIKES_THRESHOLD)
      .sort((a, b) => b.likes + b.retweets * 2 + b.replies - (a.likes + a.retweets * 2 + a.replies))
      .slice(0, 5);

    if (filtered.length === 0) {
      return { error: 'no candidates passed engagement threshold', scanned: ICP_HANDLES };
    }

    const scored: Array<{ target: FeedTweet; score: number; reasoning: string }> = [];
    for (const target of filtered) {
      const scoreResult = await xComposerAgent.generate(
        JSON.stringify(
          xComposerInputSchema.parse({
            mode: 'score',
            targetTweet: {
              author: target.author,
              text: target.text,
              metrics: { likes: target.likes, retweets: target.retweets, replies: target.replies },
            },
          }),
        ),
      );

      let score = 0;
      let reasoning = 'parse-failed';
      try {
        const parsed = JSON.parse(scoreResult.text);
        score = Number(parsed.score ?? 0);
        reasoning = String(parsed.reasoning ?? '');
      } catch {
        const m = /score["']?\s*:\s*(\d+)/i.exec(scoreResult.text);
        if (m) score = Number(m[1]);
      }

      scored.push({ target, score, reasoning });
      if (score < WORTH_SCORE_THRESHOLD) continue;

      const replyResult = await xComposerAgent.generate(
        JSON.stringify(
          xComposerInputSchema.parse({
            mode: 'reply',
            targetTweet: {
              author: target.author,
              text: target.text,
              metrics: { likes: target.likes, retweets: target.retweets, replies: target.replies },
            },
          }),
        ),
      );
      let replyText = replyResult.text.trim();
      try {
        const parsed = JSON.parse(replyText);
        replyText = String(parsed.text ?? replyText);
      } catch {}
      replyText = replyText.slice(0, 280);

      const post = await runTwitter(['post', replyText, '--reply-to', target.id, '--yaml']);
      if (post.code === 0) {
        return { score, reasoning, target, replyText, status: 'replied' };
      }
      return { score, reasoning, target, error: `reply failed: ${post.code}: ${post.stderr || post.stdout}` };
    }

    return {
      error: `no candidate scored >= ${WORTH_SCORE_THRESHOLD}`,
      candidates: scored,
    };
  },
});
