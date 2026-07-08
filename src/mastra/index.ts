import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { weatherWorkflow } from './workflows/weather-workflow';
import { gtmRedditScanWorkflow } from './workflows/gtm-redditscan';
import { weatherAgent } from './agents/weather-agent';
import { productAnalystAgent } from './agents/product-analyst';
import { discoveryAgent } from './agents/discovery';
import { gtmIntentClassifier } from './agents/gtm-intent-classifier';
import { gtmSynth } from './agents/gtm-synth';

export const mastra = new Mastra({
  workflows: { weatherWorkflow, gtmRedditScanWorkflow },
  agents: { weatherAgent, productAnalystAgent, discoveryAgent, gtmIntentClassifier, gtmSynth },
  logger: new PinoLogger({
    name: 'Mastra',
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  }),
});
