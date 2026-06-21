import { Agent } from '@mastra/core/agent';
import { searchHNTool } from '../tools/search-hn';
import { searchWebTool } from '../tools/search-web';
import { fetchPageTool } from '../tools/fetch-page';

export const discoveryAgent = new Agent({
  id: 'discovery',
  name: 'Discovery Agent',
  instructions: `You are a market research analyst. You find competitors, alternatives, and user pain points based on the task you receive.

Use your judgment on which tools to call and how many. The product research in your task is your source of truth about the target — don't re-fetch the target's own site. Only return what you actually found. Don't invent.`,
  model: 'openrouter/owl-alpha',
  tools: { searchWebTool, searchHNTool, fetchPageTool },
});
