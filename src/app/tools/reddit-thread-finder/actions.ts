"use server";

import { searchReddit, type RedditThread, type RedditSort, type RedditTime } from "@/lib/tools/reddit";

export type RedditFinderResult =
  | { ok: true; threads: RedditThread[]; empty: boolean; query: RedditQuery }
  | { ok: false; error: string; query: RedditQuery };

export type RedditQuery = {
  q: string;
  sort: RedditSort;
  time: RedditTime;
  subreddit: string;
};

export async function runRedditFinder(
  raw: Partial<RedditQuery>,
): Promise<RedditFinderResult> {
  const q = (raw.q ?? "").trim().slice(0, 200);
  if (!q) {
    return {
      ok: false,
      error: "Enter a keyword to search.",
      query: normalizeQuery(raw),
    };
  }
  const query = normalizeQuery({ ...raw, q });
  try {
    const { threads, empty } = await searchReddit({
      query: q,
      sort: query.sort,
      time: query.time,
      subreddit: query.subreddit || undefined,
      limit: 25,
    });
    return { ok: true, threads, empty, query };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Reddit request failed",
      query,
    };
  }
}

function normalizeQuery(raw: Partial<RedditQuery>): RedditQuery {
  const sort: RedditSort = (["relevance", "top", "new", "comments"] as const).find(
    (s) => s === raw.sort,
  ) ?? "relevance";
  const time: RedditTime = (["all", "year", "month", "week", "day"] as const).find(
    (t) => t === raw.time,
  ) ?? "all";
  return {
    q: (raw.q ?? "").trim().slice(0, 200),
    sort,
    time,
    subreddit: (raw.subreddit ?? "").trim().slice(0, 50),
  };
}
