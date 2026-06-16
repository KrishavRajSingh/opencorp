import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const JINA_READER_BASE = 'https://r.jina.ai';

const productAnalysisSchema = z.object({
  productName: z.string(),
  url: z.string(),
  category: z.string(),
  oneLineDescription: z.string(),
  detailedDescription: z.string(),
  targetAudience: z.array(z.string()),
  pricingModel: z.string(),
  pricingDetails: z.string(),
  keyFeatures: z.array(z.string()),
  valueProposition: z.string(),
  techStack: z.array(z.string()),
  competitorsMentioned: z.array(z.string()),
  sentimentConfidence: z.number(),
});

const discoveryResultSchema = z.object({
  competitors: z.array(z.object({
    name: z.string(),
    url: z.string(),
    mentions: z.number(),
    notes: z.string(),
  })),
  painPoints: z.array(z.object({
    description: z.string(),
    source: z.string(),
    frequency: z.string(),
    severity: z.string(),
  })),
  opportunities: z.array(z.object({
    description: z.string(),
    channel: z.string(),
    url: z.string(),
    action: z.string(),
  })),
  discussionThemes: z.array(z.string()),
  searchQueriesUsed: z.array(z.string()),
});

function extractJsonFromText(text: string): Record<string, unknown> | null {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (match?.[1]) {
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  }
  return null;
}

async function fetchPageContent(url: string): Promise<{ title: string; content: string }> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'X-Return-Format': 'markdown',
  };
  if (process.env.JINA_API_KEY) {
    headers['Authorization'] = `Bearer ${process.env.JINA_API_KEY}`;
  }
  const resp = await fetch(`${JINA_READER_BASE}/${url}`, { headers });
  if (!resp.ok) {
    throw new Error(`Failed to fetch ${url}: ${resp.status}`);
  }
  const data = await resp.json() as { data?: { title?: string; content?: string } };
  return {
    title: data.data?.title ?? url,
    content: data.data?.content ?? '',
  };
}

const KNOWN_SUBPAGES = ['/about', '/pricing', '/features', '/docs', '/blog'];

// Step 1: Fetch the homepage and discover subpage links from it
const fetchProductPages = createStep({
  id: 'fetch-product-pages',
  description: 'Fetches the product homepage and discovers relevant subpages',
  inputSchema: z.object({
    url: z.string().url(),
  }),
  outputSchema: z.object({
    url: z.string(),
    pages: z.array(z.object({
      url: z.string(),
      title: z.string(),
      content: z.string(),
      label: z.string(),
    })),
  }),
  execute: async ({ inputData }) => {
    const { url } = inputData;
    const baseUrl = new URL(url).origin;
    const pages: Array<{ url: string; title: string; content: string; label: string }> = [];

    // Fetch homepage first
    const home = await fetchPageContent(url);
    pages.push({ url, title: home.title, content: home.content, label: 'homepage' });

    // Extract links from homepage HTML to find real subpages
    const linkPattern = /href="(\/[^"]+)"/g;
    const foundPaths = new Set<string>();
    let match;
    while ((match = linkPattern.exec(home.content)) !== null) {
      const path = match[1];
      // Match known subpage patterns or any path that looks like a section
      const cleanPath = path.split('?')[0].split('#')[0];
      if (KNOWN_SUBPAGES.some(sp => cleanPath.startsWith(sp)) && !foundPaths.has(cleanPath)) {
        foundPaths.add(cleanPath);
      }
    }

    // Also try known subpage URLs directly
    for (const subpage of KNOWN_SUBPAGES) {
      foundPaths.add(subpage);
    }

    // Fetch all discovered subpages
    for (const path of foundPaths) {
      try {
        const subpageUrl = path.startsWith('http') ? path : `${baseUrl}${path}`;
        const page = await fetchPageContent(subpageUrl);
        pages.push({
          url: subpageUrl,
          title: page.title,
          content: page.content,
          label: path.replace(/^\//, ''),
        });
      } catch {
        // Skip pages that 404 or fail
      }
    }

    return { url, pages };
  },
});

// Step 2: Pass all fetched pages to ProductAnalyst agent for deep analysis
const analyzeProduct = createStep({
  id: 'analyze-product',
  description: 'Passes fetched page content to the Product Analyst agent for structured analysis',
  inputSchema: z.object({
    url: z.string(),
    pages: z.array(z.object({
      url: z.string(),
      title: z.string(),
      content: z.string(),
      label: z.string(),
    })),
  }),
  outputSchema: z.object({
    url: z.string(),
    analysisText: z.string(),
    analysis: productAnalysisSchema.nullable(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { url, pages } = inputData;

    const agent = mastra?.getAgent('productAnalystAgent');
    if (!agent) {
      throw new Error('Product Analyst agent not found');
    }

    // Build a comprehensive prompt with all page content pre-fetched
    const pagesContext = pages.map(p =>
      `--- ${p.label.toUpperCase()} (${p.url}) ---\n${p.content.slice(0, 6000)}`
    ).join('\n\n');

    const prompt = `Analyze this product thoroughly based on the page content below.

Product URL: ${url}

${pagesContext}

Extract a structured analysis with this exact JSON schema:

\`\`\`json
{
  "productName": "string",
  "url": "string",
  "category": "string (e.g. developer-tools, productivity, analytics, AI, fintech)",
  "oneLineDescription": "string (under 200 chars)",
  "detailedDescription": "string",
  "targetAudience": ["string"],
  "pricingModel": "string (e.g. freemium, subscription, usage-based, open-source, enterprise)",
  "pricingDetails": "string",
  "keyFeatures": ["string"],
  "valueProposition": "string",
  "techStack": ["string (inferred from docs, blog, or patterns)"],
  "competitorsMentioned": ["string"],
  "sentimentConfidence": "number (1-10)"
}
\`\`\`

Be thorough and precise. Only output the JSON — no other text.`;

    const response = await agent.generate(prompt);
    const analysisText = response.text;
    const parsed = extractJsonFromText(analysisText);
    const analysis = parsed ? productAnalysisSchema.safeParse(parsed).data ?? null : null;

    return { url, analysisText, analysis };
  },
});

// Step 3: Pass analysis to Discovery agent to search HN for competitors and opportunities
const discoverOpportunities = createStep({
  id: 'discover-opportunities',
  description: 'Passes product analysis to Discovery agent to find competitors, pain points, and leads via HN',
  inputSchema: z.object({
    url: z.string(),
    analysisText: z.string(),
    analysis: productAnalysisSchema.nullable(),
  }),
  outputSchema: z.object({
    url: z.string(),
    productAnalysis: productAnalysisSchema.nullable(),
    discoveryText: z.string(),
    discovery: discoveryResultSchema.nullable(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { url, analysisText, analysis } = inputData;

    const agent = mastra?.getAgent('discoveryAgent');
    if (!agent) {
      throw new Error('Discovery agent not found');
    }

    const productContext = analysis
      ? `Product: ${analysis.productName}
Category: ${analysis.category}
Description: ${analysis.oneLineDescription}
Target Audience: ${analysis.targetAudience.join(', ')}
Pricing: ${analysis.pricingModel} — ${analysis.pricingDetails}
Key Features: ${analysis.keyFeatures.join(', ')}
Value Proposition: ${analysis.valueProposition}
Competitors Mentioned: ${analysis.competitorsMentioned.join(', ') || 'none'}`
      : analysisText;

    const prompt = `Here is a product analysis for ${url}:

${productContext}

Now search Hacker News for competitors, user pain points, and distribution opportunities. Run at least 5 different search queries covering: the product name, competitor names, the problem space, and target audience pain points. Produce this JSON:

\`\`\`json
{
  "competitors": [
    { "name": "string", "url": "string", "mentions": "number", "notes": "string" }
  ],
  "painPoints": [
    { "description": "string", "source": "string (HN thread URL)", "frequency": "string (one-off / common / widespread)", "severity": "string (low / medium / high)" }
  ],
  "opportunities": [
    { "description": "string", "channel": "string (e.g. HN comment, Show HN, GitHub, Reddit)", "url": "string", "action": "string" }
  ],
  "discussionThemes": ["string"],
  "searchQueriesUsed": ["string"]
}
\`\`\`

Only output the JSON — no other text.`;

    const response = await agent.generate(prompt);
    const discoveryText = response.text;
    const parsed = extractJsonFromText(discoveryText);
    const discovery = parsed ? discoveryResultSchema.safeParse(parsed).data ?? null : null;

    return {
      url,
      productAnalysis: analysis,
      discoveryText,
      discovery,
    };
  },
});

const productResearchWorkflow = createWorkflow({
  id: 'product-research',
  inputSchema: z.object({
    url: z.string().url().describe('The URL of the product to research'),
  }),
  outputSchema: z.object({
    url: z.string(),
    productAnalysis: productAnalysisSchema.nullable(),
    discoveryText: z.string(),
    discovery: discoveryResultSchema.nullable(),
  }),
})
  .then(fetchProductPages)
  .then(analyzeProduct)
  .then(discoverOpportunities);

productResearchWorkflow.commit();

export { productResearchWorkflow };
