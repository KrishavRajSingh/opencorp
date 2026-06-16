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

export const searchHNTool = createTool({
  id: 'search-hn',
  description: 'Search Hacker News for discussions, product mentions, competitor mentions, and pain points. Returns stories and comments matching the query.',
  inputSchema: z.object({
    query: z.string().describe('Search query. Use keywords related to the product, problem space, or competitor names.'),
    tags: z.enum(['story', 'comment', 'all']).optional().default('all').describe('Filter by type: story, comment, or all'),
    limit: z.number().min(1).max(50).optional().default(20).describe('Max results to return'),
  }),
  outputSchema: z.object({
    query: z.string(),
    results: z.array(z.object({
      title: z.string(),
      url: z.string().nullable(),
      points: z.number(),
      comments: z.number(),
      author: z.string(),
      date: z.string(),
      objectID: z.string(),
      snippet: z.string().nullable(),
    })),
    totalHits: z.number(),
  }),
  execute: async (inputData) => {
    const { query, tags, limit } = inputData;

    const searchParams = new URLSearchParams({
      query,
      tags: tags === 'all' ? 'story,comment' : tags,
      hitsPerPage: String(limit),
    });

    const response = await fetch(`${HN_ALGOLIA_BASE}/search?${searchParams.toString()}`);

    if (!response.ok) {
      throw new Error(`HN search failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as {
      hits: HNResult[];
      nbHits: number;
    };

    return {
      query,
      results: data.hits.map((hit) => ({
        title: hit.title ?? 'Untitled',
        url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
        points: hit.points ?? 0,
        comments: hit.num_comments ?? 0,
        author: hit.author ?? 'unknown',
        date: hit.created_at ?? '',
        objectID: hit.objectID,
        snippet: hit.story_text ?? hit.comment_text ?? null,
      })),
      totalHits: data.nbHits,
    };
  },
});
