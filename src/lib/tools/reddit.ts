// Ponytail: direct Reddit JSON endpoint, no auth, no SDK. Reddit rate-limits
// unauthenticated requests — keep limits small and cache results at the edge.

export type RedditSort = "relevance" | "top" | "new" | "comments";
export type RedditTime = "all" | "year" | "month" | "week" | "day";

export type RedditThread = {
  id: string;
  title: string;
  subreddit: string;
  url: string;
  permalink: string;
  score: number;
  numComments: number;
  createdUtc: number;
  author: string;
  selftext: string;
  thumbnail: string | null;
};

const REDDIT_ENDPOINT = "https://www.reddit.com/search.json";

export async function searchReddit(params: {
  query: string;
  sort?: RedditSort;
  time?: RedditTime;
  subreddit?: string;
  limit?: number;
  signal?: AbortSignal;
}): Promise<{ threads: RedditThread[]; empty: boolean }> {
  const q = params.query.trim();
  if (!q) return { threads: [], empty: true };

  const search =
    params.subreddit && params.subreddit.trim()
      ? `${q} subreddit:${params.subreddit.trim().replace(/^r\//, "")}`
      : q;

  const url = new URL(REDDIT_ENDPOINT);
  url.searchParams.set("q", search);
  url.searchParams.set("sort", params.sort ?? "relevance");
  url.searchParams.set("t", params.time ?? "all");
  url.searchParams.set("limit", String(Math.min(params.limit ?? 25, 25)));
  url.searchParams.set("restrict_sr", params.subreddit ? "on" : "off");
  url.searchParams.set("raw_json", "1");

  const res = await fetch(url.toString(), {
    headers: {
      // Reddit requires a descriptive User-Agent for unauthenticated JSON.
      "User-Agent": "opencorp:reddit-thread-finder:v1 (by /u/opencorpai)",
      Accept: "application/json",
    },
    signal: params.signal,
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Reddit returned ${res.status}`);
  }

  const json = (await res.json()) as {
    data?: { children?: Array<{ data?: Record<string, unknown> }> };
  };
  const children = json.data?.children ?? [];
  const threads: RedditThread[] = children
    .map((c) => normalize(c.data))
    .filter((t): t is RedditThread => t !== null);

  return { threads, empty: threads.length === 0 };
}

function normalize(data: Record<string, unknown> | undefined): RedditThread | null {
  if (!data) return null;
  const id = typeof data.id === "string" ? data.id : null;
  const title = typeof data.title === "string" ? data.title : null;
  const subreddit =
    typeof data.subreddit === "string" ? data.subreddit : null;
  const permalink =
    typeof data.permalink === "string" ? data.permalink : null;
  if (!id || !title || !subreddit || !permalink) return null;

  return {
    id,
    title,
    subreddit,
    url: `https://www.reddit.com${permalink}`,
    permalink: `https://www.reddit.com${permalink}`,
    score: typeof data.score === "number" ? data.score : 0,
    numComments: typeof data.num_comments === "number" ? data.num_comments : 0,
    createdUtc: typeof data.created_utc === "number" ? data.created_utc : 0,
    author: typeof data.author === "string" ? data.author : "[deleted]",
    selftext: typeof data.selftext === "string" ? data.selftext : "",
    thumbnail:
      typeof data.thumbnail === "string" && data.thumbnail.startsWith("http")
        ? data.thumbnail
        : null,
  };
}

export function formatRedditAge(createdUtc: number): string {
  if (!createdUtc) return "";
  const diffSec = Math.max(0, Math.floor(Date.now() / 1000 - createdUtc));
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86400 * 30)
    return `${Math.floor(diffSec / 86400)}d ago`;
  if (diffSec < 86400 * 365)
    return `${Math.floor(diffSec / (86400 * 30))}mo ago`;
  return `${Math.floor(diffSec / (86400 * 365))}y ago`;
}
