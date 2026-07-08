export type GoogleRedditResult = {
  url: string;
  redditId: string;
  title: string;
  snippet: string;
  date?: string;
  sub: string;
};

const REDDIT_URL_RE = /reddit\.com\/r\/([^\/]+)\/comments\/([a-z0-9]+)/i;

function extractReddit(url: string): { redditId: string; sub: string } | null {
  const m = url.match(REDDIT_URL_RE);
  if (!m) return null;
  return { redditId: m[2]!, sub: m[1]! };
}

export type SerperRedditOpts = {
  num?: number;
  time?: "d" | "w" | "m" | "y";
};

export async function serperRedditSearch(
  query: string,
  opts: SerperRedditOpts = {},
): Promise<GoogleRedditResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not set");
  }
  const num = opts.num ?? 10;
  const time = opts.time ?? "m";

  const body = {
    q: `site:reddit.com ${query}`,
    num,
    tbs: `qdr:${time}`,
  };

  const r = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`SerperAPI HTTP ${r.status}: ${text.slice(0, 200)}`);
  }

  const j = (await r.json()) as {
    organic?: Array<{
      title: string;
      link: string;
      snippet: string;
      date?: string;
    }>;
  };

  const out: GoogleRedditResult[] = [];
  for (const hit of j.organic ?? []) {
    const ex = extractReddit(hit.link);
    if (!ex) continue;
    out.push({
      url: hit.link,
      redditId: ex.redditId,
      title: hit.title,
      snippet: hit.snippet ?? "",
      date: hit.date,
      sub: ex.sub,
    });
  }
  return out;
}
