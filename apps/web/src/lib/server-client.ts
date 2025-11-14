import { AgentMarketClient, createAgentMarketClient } from '@agent-market/sdk';

let cachedClient: AgentMarketClient | null = null;

export const getAgentMarketClient = () => {
  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = createAgentMarketClient({
    baseUrl: process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  });

  return cachedClient;
};
