import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const HN_ALGOLIA_BASE = 'https://hn.algolia.com/api/v1';

interface HNResult {
  title: string;
  url: string;
  points: number;
  num_comments: number;
  author: string;
  created_at: string;
  objectID: string;
  story_text?: string;
  comment_text?: string;
}

interface HNComment {
  author: string;
  comment_text: string;
  created_at: string;
  points: number;
}

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
    hits: Array<{
      author?: string;
      comment_text?: string;
      created_at?: string;
      points?: number;
    }>;
  };

  return data.hits.map((hit) => ({
    author: hit.author ?? 'unknown',
    comment_text: hit.comment_text ?? '',
    created_at: hit.created_at ?? '',
    points: hit.points ?? 0,
  }));
}

export const searchHNTool = createTool({
  id: 'search-hn',
  description:
    'Search Hacker News for discussions, product mentions, and user sentiment. Optionally fetches the actual comment text from top threads so you can read what people are saying — their complaints, praise, and alternative recommendations. Hacker News has a small, narrow index — one call per angle is usually enough; only search again with a clearly different framing.',
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        'Search query. Use keywords, product names, competitor names, or problem descriptions.',
      ),
    tags: z
      .enum(['story', 'comment', 'all'])
      .optional()
      .default('all')
      .describe('Filter by type'),
    limit: z
      .number()
      .min(1)
      .max(50)
      .optional()
      .default(20)
      .describe('Max search results'),
    includeComments: z
      .number()
      .min(0)
      .max(20)
      .optional()
      .default(10)
      .describe(
        'Number of top comments to fetch per story thread (0 = skip). Useful for reading actual user sentiment, complaints, and recommendations from discussions.',
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
      }),
    ),
    totalHits: z.number(),
  }),
  execute: async (inputData) => {
    const { query, tags, limit, includeComments } = inputData;

    const searchParams = new URLSearchParams();
    searchParams.set('query', query);
    if (tags && tags !== 'all') {
      searchParams.set('tags', tags);
    }
    searchParams.set('hitsPerPage', String(limit));

    const response = await fetch(
      `${HN_ALGOLIA_BASE}/search?${searchParams.toString()}`,
    );

    if (!response.ok) {
      throw new Error(
        `HN search failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as {
      hits: HNResult[];
      nbHits: number;
    };

    const results = await Promise.all(
      data.hits.map(async (hit) => {
        const isStory = hit.url || hit.story_text;
        const storyId = hit.objectID;

        let topComments: Array<{
          author: string;
          text: string;
          date: string;
          points: number;
        }> | null = null;

        const commentLimit = includeComments ?? 10;
        if (isStory && commentLimit > 0 && hit.num_comments > 0) {
          const comments = await fetchCommentsForStory(storyId, commentLimit);
          topComments = comments.map((c) => ({
            author: c.author,
            text: stripHtml(c.comment_text),
            date: c.created_at,
            points: c.points,
          }));
        }

        return {
          title: hit.title ?? 'Untitled',
          url:
            hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
          points: hit.points ?? 0,
          comments: hit.num_comments ?? 0,
          author: hit.author ?? 'unknown',
          date: hit.created_at ?? '',
          objectID: hit.objectID,
          snippet: hit.story_text ?? hit.comment_text ?? null,
          topComments,
        };
      }),
    );

    return {
      query,
      results,
      totalHits: data.nbHits,
    };
  },
});
