"use server";

import { searchHN, type HNThread, type HNSort } from "@/lib/tools/hn";

export type HNQuery = {
  q: string;
  sort: HNSort;
  filter: "all" | "show_hn" | "ask_hn";
};

export type HNFinderResult =
  | { ok: true; threads: HNThread[]; empty: boolean; query: HNQuery }
  | { ok: false; error: string; query: HNQuery };

export async function runHNFinder(
  raw: Partial<HNQuery>,
): Promise<HNFinderResult> {
  const q = (raw.q ?? "").trim().slice(0, 200);
  const query = normalizeQuery({ ...raw, q });
  if (!q) {
    return { ok: false, error: "Enter a keyword to search.", query };
  }
  try {
    const tags: ("story" | "show_hn" | "ask_hn")[] =
      query.filter === "show_hn"
        ? ["story", "show_hn"]
        : query.filter === "ask_hn"
          ? ["story", "ask_hn"]
          : ["story"];
    const { threads, empty } = await searchHN({
      query: q,
      sort: query.sort,
      tags,
      limit: 25,
    });
    return { ok: true, threads, empty, query };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "HN request failed",
      query,
    };
  }
}

function normalizeQuery(raw: Partial<HNQuery>): HNQuery {
  const sort: HNSort = (["search", "points", "num_comments", "created_at"] as const).find(
    (s) => s === raw.sort,
  ) ?? "search";
  const filter: HNQuery["filter"] = (["all", "show_hn", "ask_hn"] as const).find(
    (f) => f === raw.filter,
  ) ?? "all";
  return {
    q: (raw.q ?? "").trim().slice(0, 200),
    sort,
    filter,
  };
}
