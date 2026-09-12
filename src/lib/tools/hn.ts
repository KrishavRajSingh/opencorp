// Ponytail: direct HN Algolia search, no auth, no SDK. Same shape as
// lib/tools/reddit.ts so the page components stay symmetric.

export type HNSort = "search" | "points" | "num_comments" | "created_at";

export type HNThread = {
  id: string;
  title: string;
  url: string | null;
  author: string;
  points: number;
  numComments: number;
  createdAt: number;
  objectID: string;
  tags: string[];
  storyText: string;
};

const HN_ENDPOINT = "https://hn.algolia.com/api/v1/search";

export async function searchHN(params: {
  query: string;
  sort?: HNSort;
  tags?: ("story" | "show_hn" | "ask_hn")[];
  numericFilters?: string[];
  limit?: number;
  signal?: AbortSignal;
}): Promise<{ threads: HNThread[]; empty: boolean }> {
  const q = params.query.trim();
  if (!q) return { threads: [], empty: true };

  const url = new URL(HN_ENDPOINT);
  url.searchParams.set("query", q);
  url.searchParams.set("hitsPerPage", String(Math.min(params.limit ?? 25, 50)));

  if (params.tags && params.tags.length > 0) {
    url.searchParams.set("tags", params.tags.join(","));
  }
  if (params.numericFilters && params.numericFilters.length > 0) {
    for (const f of params.numericFilters) {
      url.searchParams.append("numericFilters", f);
    }
  }
  if (params.sort && params.sort !== "search") {
    const map: Record<Exclude<HNSort, "search">, string> = {
      points: "search?points",
      num_comments: "search?num_comments",
      created_at: "search?created_at",
    };
    url.pathname = map[params.sort];
  }

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "opencorp:hn-thread-finder:v1" },
    signal: params.signal,
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`HN Algolia returned ${res.status}`);
  }

  const json = (await res.json()) as {
    hits?: Array<Record<string, unknown>>;
  };
  const hits = json.hits ?? [];
  const threads: HNThread[] = hits
    .map((h) => normalize(h))
    .filter((t): t is HNThread => t !== null);

  return { threads, empty: threads.length === 0 };
}

function normalize(data: Record<string, unknown>): HNThread | null {
  const id = typeof data.objectID === "string" ? data.objectID : null;
  const title = typeof data.title === "string" ? data.title : null;
  const author = typeof data.author === "string" ? data.author : null;
  if (!id || !title || !author) return null;

  const url =
    typeof data.url === "string" && data.url.startsWith("http")
      ? data.url
      : null;
  const storyId = typeof data.story_id === "number" ? data.story_id : null;
  const points = typeof data.points === "number" ? data.points : 0;
  const numComments =
    typeof data.num_comments === "number" ? data.num_comments : 0;
  const createdAt =
    typeof data.created_at_i === "number"
      ? data.created_at_i
      : typeof data.created_at === "string"
        ? Math.floor(new Date(data.created_at).getTime() / 1000)
        : 0;
  const tags = Array.isArray(data._tags)
    ? data._tags.filter((t): t is string => typeof t === "string")
    : [];
  const storyText =
    typeof data.story_text === "string" ? stripHtml(data.story_text) : "";

  return {
    id: storyId ? String(storyId) : id,
    objectID: id,
    title,
    url,
    author,
    points,
    numComments,
    createdAt,
    tags,
    storyText,
  };
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

export function formatHNAge(createdAt: number): string {
  if (!createdAt) return "";
  const diffSec = Math.max(0, Math.floor(Date.now() / 1000 - createdAt));
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86400 * 30)
    return `${Math.floor(diffSec / 86400)}d ago`;
  if (diffSec < 86400 * 365)
    return `${Math.floor(diffSec / (86400 * 30))}mo ago`;
  return `${Math.floor(diffSec / (86400 * 365))}y ago`;
}
