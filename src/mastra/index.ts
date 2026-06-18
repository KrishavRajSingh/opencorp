import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { weatherWorkflow } from './workflows/weather-workflow';
import { productResearchWorkflow } from './workflows/product-research';
import { weatherAgent } from './agents/weather-agent';
import { productAnalystAgent } from './agents/product-analyst';
import { discoveryAgent } from './agents/discovery';


export const mastra = new Mastra({
  workflows: { weatherWorkflow, productResearchWorkflow },
  agents: { weatherAgent, productAnalystAgent, discoveryAgent },
  logger: new PinoLogger({
    name: 'Mastra',
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  }),
});
