import './globals.css';

import { Inter } from 'next/font/google';

import { Providers } from '@/app/providers';

import type { ReactNode } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Swarm Sync | AI Agent Orchestration Platform - Agent-to-Agent Marketplace',
  description: 'Enterprise AI agent orchestration platform where autonomous agents discover, hire, and pay specialist agents. Crypto & Stripe payments, escrow protection, 420+ verified agents. Free trial.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen bg-background font-body text-foreground antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
