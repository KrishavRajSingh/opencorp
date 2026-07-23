import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const HN_ALGOLIA_BASE = 'https://hn.algolia.com/api/v1';

interface HNResult {
  title?: string;
  url?: string;
  points?: number;
  num_comments?: number;
  author?: string;
  created_at?: string;
  objectID: string;
  story_text?: string;
  comment_text?: string;
  _tags?: string[];
}

interface HNComment {
  author?: string;
  comment_text?: string;
  created_at?: string;
  points?: number;
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'do', 'for', 'from',
  'has', 'have', 'how', 'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that',
  'the', 'this', 'to', 'was', 'were', 'what', 'when', 'where', 'which',
  'who', 'why', 'will', 'with', 'you', 'your', 'about', 'can', 'into',
  'than', 'them', 'these', 'they', 'use', 'used', 'using',
]);

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) =>
      String.fromCharCode(parseInt(h, 16)),
    )
    .replace(/<p>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchCommentsForStory(
  storyId: string,
  limit: number,
): Promise<HNComment[]> {
  const searchParams = new URLSearchParams();
  searchParams.set('tags', `comment,story_${storyId}`);
  searchParams.set('hitsPerPage', String(limit));

  const response = await fetch(
    `${HN_ALGOLIA_BASE}/search?${searchParams.toString()}`,
  );

  if (!response.ok) return [];

  const data = (await response.json()) as {
    hits: HNComment[];
  };

  return data.hits;
}

async function algoliaSearch(params: URLSearchParams): Promise<HNResult[]> {
  try {
    const response = await fetch(`${HN_ALGOLIA_BASE}/search?${params.toString()}`);
    if (!response.ok) return [];
    const data = (await response.json()) as { hits?: HNResult[] };
    return data.hits ?? [];
  } catch {
    return [];
  }
}

function extractQueryWords(query: string): string[] {
  return [...new Set(
    query
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
  )];
}

function buildWhyRelevant(hit: HNResult, query: string): string | null {
  const queryWords = extractQueryWords(query);
  const haystack = `${hit.title ?? ''} ${hit.story_text ?? ''} ${hit.comment_text ?? ''}`.toLowerCase();
  const matched = queryWords.filter((w) => haystack.includes(w));

  if (matched.length === 0) return null;
  return `matched: ${matched.join(', ')}`;
}

export const searchHNTool = createTool({
  id: 'search-hn',
  description:
    "Search Hacker News for relevant discussions and product launches. Pass 1-3 short keyword terms (e.g. 'autofill extension', 'job application AI'). The tool uses Algolia's built-in 'similarQuery' under the hood, which OR-matches all words from your query (with stop words removed) and ranks by word-match count — so it handles both short keyword queries and verbose natural-language ones. Use tags='all' (default) to catch both stories and comments, 'story' for stories only, 'comment' for comments only. Set semantic=false to use a strict AND keyword match instead. Set excludeShowHN=true to drop Show HN launch stories (other founders' product launches) while keeping comments — useful when you only want ICP discussion threads, not pitchable launch surfaces. Hacker News has a small, narrow index — vary the angle (e.g. problem framing vs. user pain) between calls, never with a longer paraphrase of the same angle. Pass daysBack to restrict to recent threads; omit for all-time.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "1-3 short keyword terms. HN's index is keyword-based — verbose natural-language queries return zero hits with semantic=false, but similarQuery (default) handles them well. Examples: 'autofill extension', 'job application AI', 'form filling Show HN'.",
      ),
    tags: z
      .enum(['story', 'comment', 'all'])
      .optional()
      .default('all')
      .describe('Filter by type. Default all.'),
    limit: z
      .number()
      .min(1)
      .max(50)
      .optional()
      .default(20)
      .describe('Max results to return (1-50).'),
    includeComments: z
      .number()
      .min(0)
      .max(20)
      .optional()
      .default(10)
      .describe(
        'Number of top comments to fetch per story thread (0 = skip). Useful for reading actual user sentiment, complaints, and recommendations from discussions.',
      ),
    semantic: z
      .boolean()
      .optional()
      .default(true)
      .describe(
        'When true (default), use Algolia similarQuery (broad OR-match — handles verbose queries). When false, use a strict keyword AND-match (precise but misses verbose queries).',
      ),
    daysBack: z
      .number()
      .int()
      .min(1)
      .max(3650)
      .optional()
      .describe(
        'Restrict to threads from the last N days. Omit for all-time. Useful for finding live, recent discussions rather than stale canonical threads.',
      ),
    excludeShowHN: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "When true, drop Show HN launch stories (Algolia tag 'show_hn') from results. Comments are never tagged show_hn so they are unaffected. Use when you want ICP discussion threads only, not other founders' launch surfaces.",
      ),
  }),
  outputSchema: z.object({
    query: z.string(),
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string().nullable(),
        points: z.number(),
        comments: z.number(),
        author: z.string(),
        date: z.string(),
        objectID: z.string(),
        snippet: z.string().nullable(),
        topComments: z
          .array(
            z.object({
              author: z.string(),
              text: z.string(),
              date: z.string(),
              points: z.number(),
            }),
          )
          .nullable(),
        whyRelevant: z.string().nullable(),
      }),
    ),
    totalHits: z.number(),
  }),
  execute: async (inputData) => {
    const { query, tags, limit, includeComments, semantic, daysBack, excludeShowHN } = inputData;
    const limitNum = limit ?? 20;

    // single Algolia call:
    //   semantic=true  → similarQuery (OR-match, handles verbose queries)
    //   semantic=false → query       (AND-match, strict keyword)
    const params = new URLSearchParams();
    params.set(semantic === false ? 'query' : 'similarQuery', query);
    if (excludeShowHN) {
      const overFetch = Math.min(50, limitNum * 3);
      params.set('hitsPerPage', String(overFetch));
    } else {
      params.set('hitsPerPage', String(limitNum));
    }
    if (tags && tags !== 'all') params.set('tags', tags);
    if (daysBack !== undefined) {
      const since = Math.floor(Date.now() / 1000) - daysBack * 86400;
      params.set('numericFilters', `created_at_i>${since}`);
    }

    const hits = await algoliaSearch(params);
    const filteredHits = excludeShowHN
      ? hits.filter((h) => !h._tags?.includes('show_hn'))
      : hits;
    const finalHits = filteredHits.slice(0, limitNum);

    const results = await Promise.all(
      finalHits.map(async (hit) => {
        const isStory = hit.url || hit.story_text;

        let topComments: Array<{
          author: string;
          text: string;
          date: string;
          points: number;
        }> | null = null;

        const commentLimit = includeComments ?? 10;
        if (isStory && commentLimit > 0 && (hit.num_comments ?? 0) > 0) {
          const comments = await fetchCommentsForStory(hit.objectID, commentLimit);
          topComments = comments.map((c) => ({
            author: c.author ?? 'unknown',
            text: stripHtml(c.comment_text ?? ''),
            date: c.created_at ?? '',
            points: c.points ?? 0,
          }));
        }

        return {
          title: hit.title ?? 'Untitled',
          url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
          points: hit.points ?? 0,
          comments: hit.num_comments ?? 0,
          author: hit.author ?? 'unknown',
          date: hit.created_at ?? '',
          objectID: hit.objectID,
          snippet: hit.story_text ?? hit.comment_text ?? null,
          topComments,
          whyRelevant: buildWhyRelevant(hit, query),
        };
      }),
    );

    return {
      query,
      results,
      totalHits: results.length,
    };
  },
});
