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
  limit?: number;
  time?: "d" | "w" | "m" | "y";
};

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

  const settled = await Promise.allSettled(
    opts.queries.map((q) =>
      serperRedditSearch(q, {
        num: limit,
        time,
      }),
    ),
  );

  const acc: GoogleRedditResult[] = [];
  let failures = 0;
  let firstMessage: string | null = null;
  for (let i = 0; i < settled.length; i++) {
    const r = settled[i];
    if (r.status === "fulfilled") {
      acc.push(...r.value);
    } else {
      failures++;
      const q = opts.queries[i];
      console.error(`[serper] query failed: ${q}`, r.reason);
      if (!firstMessage) {
        firstMessage = r.reason instanceof Error ? r.reason.message : String(r.reason);
      }
    }
  }

  if (opts.queries.length > 0 && failures === opts.queries.length) {
    throw new Error(
      `All ${failures} Reddit search queries failed: ${firstMessage ?? "unknown error"}`,
    );
  }

  const seen = new Set<string>();
  const deduped: GoogleRedditResult[] = [];
  for (const r of acc) {
    if (seen.has(r.redditId)) continue;
    seen.add(r.redditId);
    deduped.push(r);
  }

  return deduped.map(googleToThread);
}
