import { schedules, wait } from '@trigger.dev/sdk/v3';
import { spawn } from 'node:child_process';
import { z } from 'zod/v4';
import { xComposerAgent, xComposerInputSchema } from '@/mastra/agents/x-composer';

// ponytail: search GraphQL endpoint 404s from Trigger.dev container IPs, but `user-posts <handle>` works.
// We curate a small list of accounts in opencorp's ICP that have actually posted on-topic
// (verified in earlier feed/search runs). Use user-posts as the source of winning tweets to model.

const POSTS_PER_DAY = 3;
const POSTING_WINDOW_UTC = { startHour: 9, endHour: 21 } as const;
const ICP_HANDLES = [
  'brian_millot',
  'jakobgreenfeld',
  'marclou',
  'levelsio',
] as const;
const WINNER_LIKES_THRESHOLD = 30;
const ANGLE_ROTATION = [
  'pain-point',
  'contrarian',
  'observation',
  'lesson',
  'list',
  'question',
] as const;

const postsPayloadSchema = z.object({ skipTiming: z.boolean().optional() });

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

function randomTimestampToday(now: Date): Date {
  const start = new Date(now);
  start.setUTCHours(POSTING_WINDOW_UTC.startHour, 0, 0, 0);
  const end = new Date(now);
  end.setUTCHours(POSTING_WINDOW_UTC.endHour, 0, 0, 0);
  const ms = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(Math.max(ms, now.getTime() + 30_000));
}

function pickAngle(seed: number): (typeof ANGLE_ROTATION)[number] {
  return ANGLE_ROTATION[seed % ANGLE_ROTATION.length];
}

// ponytail: tolerant parser. twitter-cli feed returns the same YAML shape as search.
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

async function findWinningTweet(): Promise<FeedTweet | null> {
  const candidates: FeedTweet[] = [];
  for (const handle of ICP_HANDLES) {
    const r = await runTwitter(['user-posts', handle, '--max', '5', '--yaml']);
    if (r.code !== 0) continue;
    candidates.push(...parseFeedTweets(r.stdout));
  }
  const tweets = candidates
    .filter((t) => !/^RT/.test(t.text))
    .filter((t) => t.likes >= WINNER_LIKES_THRESHOLD)
    .sort((a, b) => b.likes + b.retweets * 2 + b.replies - (a.likes + a.retweets * 2 + a.replies));
  return tweets[0] ?? null;
}

export const dailyPosts = schedules.task({
  id: 'daily-posts',
  // ponytail: cron set to never-fire (Feb 31 doesn't exist). Original '0 8 * * *'
  // commented below — see AGENTS.md note for unpause procedure.
  cron: { pattern: '0 0 31 2 *', timezone: 'UTC' },
  run: async (payload: z.infer<typeof postsPayloadSchema> = {}) => {
    const now = new Date();
    let timestamps: Date[];
    if (payload.skipTiming) {
      timestamps = Array.from({ length: POSTS_PER_DAY }, () => new Date(Date.now() + 10_000));
    } else {
      timestamps = Array.from({ length: POSTS_PER_DAY }, () => randomTimestampToday(now));
      timestamps.sort((a, b) => a.getTime() - b.getTime());
    }

    const recentPosts: string[] = [];
    const results: Array<{ scheduledAt: string; text?: string; reference?: FeedTweet; error?: string }> = [];

    for (let i = 0; i < timestamps.length; i++) {
      const scheduledAt = timestamps[i];
      const msUntil = scheduledAt.getTime() - Date.now();
      if (msUntil > 1000) await wait.until({ date: scheduledAt });

      const angle = pickAngle(i + now.getUTCDate());
      const reference = await findWinningTweet();

      const generate = await xComposerAgent.generate(
        JSON.stringify(
          xComposerInputSchema.parse({
            mode: 'post',
            angle,
            recentPosts,
            reference: reference
              ? {
                  text: reference.text,
                  author: reference.author,
                  metrics: {
                    likes: reference.likes,
                    retweets: reference.retweets,
                    replies: reference.replies,
                  },
                }
              : undefined,
          }),
        ),
      );

      let text = generate.text.trim();
      try {
        const parsed = JSON.parse(text);
        text = String(parsed.text ?? text);
      } catch {}
      text = text.slice(0, 280);

      const post = await runTwitter(['post', text, '--yaml']);
      if (post.code === 0) {
        recentPosts.push(text);
        results.push({ scheduledAt: scheduledAt.toISOString(), text, reference: reference ?? undefined });
      } else {
        results.push({
          scheduledAt: scheduledAt.toISOString(),
          error: `${post.code}: ${post.stderr || post.stdout}`,
          reference: reference ?? undefined,
        });
      }
    }

    return { results, recentPosts };
  },
});
