import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { gtmRedditScanWorkflow } from './workflows/gtm-redditscan';
import { competitorDiscoveryWorkflow } from './workflows/competitor-discovery';
import { productAnalystAgent } from './agents/product-analyst';
import { discoveryAgent } from './agents/discovery';
import { competitorAnalystAgent } from './agents/competitor-analyst';
import { gtmIntentClassifier } from './agents/gtm-intent-classifier';
import { showHNDrafterAgent } from './agents/show-hn-drafter';

export const mastra = new Mastra({
  workflows: { gtmRedditScanWorkflow, competitorDiscoveryWorkflow },
  agents: { productAnalystAgent, discoveryAgent, competitorAnalystAgent, gtmIntentClassifier, showHNDrafterAgent },
  logger: new PinoLogger({
    name: 'Mastra',
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  }),
});
