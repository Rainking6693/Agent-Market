'use client';

import '@rainbow-me/rainbowkit/styles.css';

import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useMemo, useState } from 'react';
import { WagmiProvider, http } from 'wagmi';
import { base } from 'wagmi/chains';

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-agent-market';
const baseRpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';

// Create wagmi config as a singleton to prevent double initialization
let wagmiConfigSingleton: ReturnType<typeof getDefaultConfig> | null = null;

function getWagmiConfig() {
  if (!wagmiConfigSingleton) {
    wagmiConfigSingleton = getDefaultConfig({
      appName: 'AgentMarket',
      projectId: walletConnectProjectId,
      chains: [base],
      transports: {
        [base.id]: http(baseRpcUrl),
      },
    });
  }
  return wagmiConfigSingleton;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  // Use useMemo to ensure config is only created once per component instance
  const wagmiConfig = useMemo(() => getWagmiConfig(), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
