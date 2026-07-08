import { serperRedditSearch, type GoogleRedditResult } from "@/lib/serper";

export type GoogleRedditThread = {
  id: string;
  sub: string;
  title: string;
  link: string;
  author?: string;
  updated?: string;
  content?: string;
  score?: number;
  num_comments?: number;
  upvote_ratio?: number;
  fullname?: string;
};

export type FetchGoogleRedditOpts = {
  queries: string[];
  subs?: string[];
  limit?: number;
  time?: "d" | "w" | "m" | "y";
};

function buildSearchQuery(q: string, subs?: string[]): string {
  if (!subs || subs.length === 0) return q;
  const subScope = subs
    .map((s) => `"r/${s}"`)
    .join(" OR ");
  return `${q} (${subScope})`;
}

function googleToThread(g: GoogleRedditResult): GoogleRedditThread {
  return {
    id: g.redditId,
    sub: g.sub,
    title: g.title,
    link: g.url,
    updated: g.date,
    content: g.snippet,
  };
}

export async function fetchGoogleRedditThreads(
  opts: FetchGoogleRedditOpts,
): Promise<GoogleRedditThread[]> {
  const limit = opts.limit ?? 10;
  const time = opts.time ?? "m";

  const results = await Promise.all(
    opts.queries.map((q) =>
      serperRedditSearch(buildSearchQuery(q, opts.subs), {
        num: limit,
        time,
      }).catch((err) => {
        console.error(`[serper] query failed: ${q}`, err);
        return [] as GoogleRedditResult[];
      }),
    ),
  );

  const acc: GoogleRedditResult[] = [];
  for (const r of results) acc.push(...r);

  const seen = new Set<string>();
  const deduped: GoogleRedditResult[] = [];
  for (const r of acc) {
    if (seen.has(r.redditId)) continue;
    seen.add(r.redditId);
    deduped.push(r);
  }

  return deduped.map(googleToThread);
}
