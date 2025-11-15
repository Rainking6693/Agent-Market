'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

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

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

  const content = <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

  const effectiveClientId = googleClientId || 'placeholder-client-id';

  return <GoogleOAuthProvider clientId={effectiveClientId}>{content}</GoogleOAuthProvider>;
}
