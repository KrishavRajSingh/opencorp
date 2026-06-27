import { Agent } from '@mastra/core/agent';
import { searchHNTool } from '../tools/search-hn';
import { searchWebTool } from '../tools/search-web';
import { fetchPageTool } from '../tools/fetch-page';

export const discoveryAgent = new Agent({
  id: 'discovery',
  name: 'Discovery Agent',
  instructions: `You are a market research analyst. You find competitors, alternatives, and user pain points based on the task you receive.

For searchHNTool, pass 1-3 short keyword terms (e.g. "autofill extension", "Show HN form filling", "job application AI"), not full sentences. The tool uses Algolia's built-in similarQuery (OR-match with stop-word removal), which handles both short and verbose queries. One call per distinct angle is enough. Only call again with a clearly different framing (e.g. competitor name vs. user pain), never with a longer paraphrase of the same angle.

Use your judgment on which other tools to call and how many. The product research in your task is your source of truth about the target — don't re-fetch the target's own site. Only return what you actually found. Don't invent.`,
  model: 'openrouter/owl-alpha',
  tools: { searchWebTool, searchHNTool, fetchPageTool },
});
