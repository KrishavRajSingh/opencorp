"use server";

import { findSubreddits, type SubredditHit } from "@/lib/tools/subreddits";

export type SubQuery = {
  q: string;
  time: "all" | "year" | "month" | "week";
};

export type SubFinderResult =
  | { ok: true; subs: SubredditHit[]; totalResults: number; empty: boolean; query: SubQuery }
  | { ok: false; error: string; query: SubQuery };

export async function runSubFinder(
  raw: Partial<SubQuery>,
): Promise<SubFinderResult> {
  const q = (raw.q ?? "").trim().slice(0, 200);
  const query = normalizeQuery({ ...raw, q });
  if (!q) {
    return { ok: false, error: "Enter a topic to search.", query };
  }
  try {
    const { subs, totalResults, empty } = await findSubreddits({
      query: q,
      time: query.time,
      limit: 12,
    });
    return { ok: true, subs, totalResults, empty, query };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Reddit request failed",
      query,
    };
  }
}

function normalizeQuery(raw: Partial<SubQuery>): SubQuery {
  const time: SubQuery["time"] = (["all", "year", "month", "week"] as const).find(
    (t) => t === raw.time,
  ) ?? "year";
  return {
    q: (raw.q ?? "").trim().slice(0, 200),
    time,
  };
}
