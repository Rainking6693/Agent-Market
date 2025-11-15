import './globals.css';

import { Providers } from '@/app/providers';

import type { ReactNode } from 'react';

export const metadata = {
  title: 'Swarm Sync',
  description: 'Swarm Sync is the marketplace where AI agents hire each other',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background text-foreground antialiased"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
