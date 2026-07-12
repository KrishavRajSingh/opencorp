import type { GtmBrief } from "@/components/ai-elements/gtm-brief";

export type ProductResult = {
  url: string;
  productName: string;
  description: string;
  keyFeatures: string[];
  targetAudience: string;
  pricingModel: string;
};

export type Competitor = {
  name: string;
  url: string;
  description: string;
  mentionSources: string[];
};

export type CompetitorResult = {
  competitors: Competitor[];
  searchQueriesUsed?: string[];
};

export type HNThread = {
  objectID: string;
  title: string;
  url: string | null;
  points: number;
  comments: number;
  author: string;
  date: string;
  whyRelevant: string;
  topCommentSnippet: string | null;
};

export type HNResult = {
  threads: HNThread[];
};

export type RedditScanResult = GtmBrief;

export type ToolCallChunk = {
  toolCallId: string;
  toolName: string;
  args?: { url?: string; query?: string };
  url?: string;
  query?: string;
  title?: string;
  snippet?: string;
  track?: string;
};
