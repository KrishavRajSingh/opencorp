import { Agent } from '@mastra/core/agent';
import { fetchPageTool } from '../tools/fetch-page';

export const productAnalystAgent = new Agent({
  id: 'product-analyst',
  name: 'Product Analyst',
  instructions: `You are a product analyst that deeply understands SaaS products, websites, and startups.

You have the fetch-page tool to read any URL. When given a product URL:

1. Fetch the homepage first to understand what the product is.
2. From the homepage content, identify links to key sections — About, Pricing, Features, Docs, Customers, Enterprise, etc. Use your judgment.
3. Fetch 3-5 of the most relevant subpages. Skip login/signup, legal, or irrelevant pages.
4. Stop when you have enough context. Quality over quantity.`,
  model: 'openrouter/minimax/minimax-m2.7',
  tools: { fetchPageTool },
});
