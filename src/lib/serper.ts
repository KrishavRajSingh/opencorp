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

/** Serper returns human-relative strings ("2 days ago"); convert to ISO or omit. */
function normalizeSerperDate(raw?: string): string | undefined {
  if (!raw) return undefined;
  const s = raw.trim();
  if (!s) return undefined;

  const rel = s.match(
    /^(?:(\d+)|an?)\s+(second|minute|hour|day|week|month|year)s?\s+ago$/i,
  );
  if (rel) {
    const n = rel[1] ? Number(rel[1]) : 1;
    const unit = rel[2]!.toLowerCase();
    const ms =
      unit === "second"
        ? n * 1000
        : unit === "minute"
          ? n * 60_000
          : unit === "hour"
            ? n * 3_600_000
            : unit === "day"
              ? n * 86_400_000
              : unit === "week"
                ? n * 7 * 86_400_000
                : unit === "month"
                  ? n * 30 * 86_400_000
                  : n * 365 * 86_400_000;
    return new Date(Date.now() - ms).toISOString();
  }

  const abs = new Date(s);
  if (!Number.isNaN(abs.getTime())) return abs.toISOString();
  return undefined;
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let r: Response;
  try {
    r = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

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
    const date = normalizeSerperDate(hit.date);
    out.push({
      url: hit.link,
      redditId: ex.redditId,
      title: hit.title,
      snippet: hit.snippet ?? "",
      ...(date ? { date } : {}),
      sub: ex.sub,
    });
  }
  return out;
}
