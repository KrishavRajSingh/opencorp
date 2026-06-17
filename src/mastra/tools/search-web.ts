import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const EXA_API_BASE = 'https://api.exa.ai/search';

export const searchWebTool = createTool({
  id: 'search-web',
  description:
    'Search the web using Exa neural search. Returns relevant pages with content highlights and full text. Use for finding competitors, reviews, discussions, blog posts, and market intelligence. Supports category filtering (company, news, research paper) for targeted results.',
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        'Search query. Write naturally — Exa uses neural search, not keywords. E.g. "companies competing with Notion for project management" or "user complaints about slow database queries" or "best alternative to Salesforce for small business".',
      ),
    numResults: z
      .number()
      .min(1)
      .max(25)
      .optional()
      .default(10)
      .describe('Number of results to return (1-25)'),
    category: z
      .enum(['company', 'research paper', 'news', 'personal site', 'financial report'])
      .optional()
      .describe(
        'Filter by content type. Use "company" to find competitor pages, "news" for recent coverage, "research paper" for academic analysis.',
      ),
    maxTextCharacters: z
      .number()
      .min(100)
      .max(5000)
      .optional()
      .default(2000)
      .describe('Max characters of page text to return per result. Higher = more context, more tokens.'),
  }),
  outputSchema: z.object({
    query: z.string(),
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        publishedDate: z.string().nullable(),
        author: z.string().nullable(),
        highlights: z.array(z.string()).nullable(),
        highlightsScores: z.array(z.number()).nullable(),
        text: z.string(),
      }),
    ),
    resultCount: z.number(),
    costDollars: z.number().nullable(),
  }),
  execute: async (inputData) => {
    const { query, numResults, category, maxTextCharacters } = inputData;
    const apiKey = process.env.EXA_API_KEY;
    if (!apiKey) throw new Error('EXA_API_KEY environment variable is not set');

    const body: Record<string, unknown> = {
      query,
      type: 'auto',
      numResults,
      contents: {
        text: { maxCharacters: maxTextCharacters },
        highlights: { numSentences: 3 },
      },
    };

    if (category) {
      body.category = category;
    }

    const response = await fetch(EXA_API_BASE, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Exa search failed: ${response.status} — ${errorText}`);
    }

    const data = (await response.json()) as {
      results?: Array<{
        title?: string;
        url?: string;
        publishedDate?: string;
        author?: string;
        highlights?: string[];
        highlightScores?: number[];
        text?: string;
      }>;
      costDollars?: { total: number };
    };

    const items = data.results ?? [];

    return {
      query,
      results: items.map((item) => ({
        title: item.title ?? 'Untitled',
        url: item.url ?? '',
        publishedDate: item.publishedDate ?? null,
        author: item.author ?? null,
        highlights: item.highlights ?? null,
        highlightsScores: item.highlightScores ?? null,
        text: item.text ?? '',
      })),
      resultCount: items.length,
      costDollars: data.costDollars?.total ?? null,
    };
  },
});
