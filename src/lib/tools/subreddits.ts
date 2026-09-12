// Ponytail: Reddit JSON search across "all", group by subreddit, rank by count+recency.

export type SubredditHit = {
  name: string;
  url: string;
  postCount: number;
  totalScore: number;
  totalComments: number;
  topPost: {
    title: string;
    url: string;
    score: number;
    numComments: number;
    createdUtc: number;
    permalink: string;
  } | null;
};

const REDDIT_ENDPOINT = "https://www.reddit.com/search.json";

export async function findSubreddits(params: {
  query: string;
  time?: "all" | "year" | "month" | "week";
  limit?: number;
  signal?: AbortSignal;
}): Promise<{ subs: SubredditHit[]; totalResults: number; empty: boolean }> {
  const q = params.query.trim();
  if (!q) return { subs: [], totalResults: 0, empty: true };

  const url = new URL(REDDIT_ENDPOINT);
  url.searchParams.set("q", q);
  url.searchParams.set("sort", "top");
  url.searchParams.set("t", params.time ?? "year");
  url.searchParams.set("limit", "100");
  url.searchParams.set("type", "link");
  url.searchParams.set("restrict_sr", "off");
  url.searchParams.set("raw_json", "1");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "opencorp:niche-subreddit-finder:v1 (by /u/opencorpai)",
      Accept: "application/json",
    },
    signal: params.signal,
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(`Reddit returned ${res.status}`);
  }

  const json = (await res.json()) as {
    data?: {
      children?: Array<{ data?: Record<string, unknown> }>;
      dist?: number;
    };
  };
  const children = json.data?.children ?? [];
  const totalResults = json.data?.dist ?? children.length;

  const groups = new Map<string, SubredditHit>();
  for (const c of children) {
    const d = c.data;
    if (!d) continue;
    const name = typeof d.subreddit === "string" ? d.subreddit : null;
    if (!name) continue;
    const score = typeof d.score === "number" ? d.score : 0;
    const numComments = typeof d.num_comments === "number" ? d.num_comments : 0;
    const permalink =
      typeof d.permalink === "string"
        ? `https://www.reddit.com${d.permalink}`
        : "";
    const title = typeof d.title === "string" ? d.title : "";
    const postUrl =
      typeof d.url_overridden_by_dest === "string"
        ? d.url_overridden_by_dest
        : permalink;
    const createdUtc = typeof d.created_utc === "number" ? d.created_utc : 0;

    const existing = groups.get(name);
    if (!existing) {
      groups.set(name, {
        name,
        url: `https://www.reddit.com/r/${name}`,
        postCount: 1,
        totalScore: score,
        totalComments: numComments,
        topPost: title
          ? { title, url: postUrl, score, numComments, createdUtc, permalink }
          : null,
      });
    } else {
      existing.postCount += 1;
      existing.totalScore += score;
      existing.totalComments += numComments;
      if (
        existing.topPost &&
        title &&
        score + numComments >
          existing.topPost.score + existing.topPost.numComments
      ) {
        existing.topPost = {
          title,
          url: postUrl,
          score,
          numComments,
          createdUtc,
          permalink,
        };
      }
    }
  }

  const subs = Array.from(groups.values())
    .sort((a, b) => {
      const signal =
        b.postCount * 100 + b.totalScore + b.totalComments -
        (a.postCount * 100 + a.totalScore + a.totalComments);
      return signal;
    })
    .slice(0, params.limit ?? 12);

  return { subs, totalResults, empty: subs.length === 0 };
}

export function formatSubAge(createdUtc: number): string {
  if (!createdUtc) return "";
  const diffSec = Math.max(0, Math.floor(Date.now() / 1000 - createdUtc));
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86400 * 30)
    return `${Math.floor(diffSec / 86400)}d ago`;
  if (diffSec < 86400 * 365)
    return `${Math.floor(diffSec / (86400 * 30))}mo ago`;
  return `${Math.floor(diffSec / (86400 * 365))}y ago`;
}
