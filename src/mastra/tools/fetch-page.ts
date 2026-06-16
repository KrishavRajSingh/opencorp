import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const JINA_READER_BASE = 'https://r.jina.ai';

export const fetchPageTool = createTool({
  id: 'fetch-page',
  description: 'Fetch and extract clean markdown content from any URL. Use this to read product pages, about pages, pricing pages, docs, etc.',
  inputSchema: z.object({
    url: z.string().url().describe('The full URL of the page to fetch'),
  }),
  outputSchema: z.object({
    url: z.string(),
    title: z.string(),
    content: z.string(),
    contentLength: z.number(),
  }),
  execute: async (inputData) => {
    const { url } = inputData;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'X-Return-Format': 'markdown',
    };

    if (process.env.JINA_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.JINA_API_KEY}`;
    }

    const response = await fetch(`${JINA_READER_BASE}/${url}`, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as {
      data?: {
        title?: string;
        content?: string;
        url?: string;
      };
    };

    const content = data.data?.content ?? '';
    const title = data.data?.title ?? url;

    return {
      url: data.data?.url ?? url,
      title,
      content,
      contentLength: content.length,
    };
  },
});
