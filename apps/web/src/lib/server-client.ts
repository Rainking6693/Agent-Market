import { AgentMarketClient, createAgentMarketClient } from '@agent-market/sdk';

const DEFAULT_PRODUCTION_API_ORIGIN = 'https://swarmsync-api.up.railway.app';

let cachedClient: AgentMarketClient | null = null;

export const getAgentMarketClient = () => {
  if (cachedClient) {
    return cachedClient;
  }

  // In production, use the Railway API URL if environment variables aren't set
  const baseUrl =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    (process.env.NODE_ENV === 'production' ? DEFAULT_PRODUCTION_API_ORIGIN : 'http://localhost:4000');

  cachedClient = createAgentMarketClient({ baseUrl });

  return cachedClient;
};
