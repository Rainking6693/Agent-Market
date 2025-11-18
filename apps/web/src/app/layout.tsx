import './globals.css';

import { Inter } from 'next/font/google';

import { Providers } from '@/app/providers';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://swarmsync.ai'),
  title: {
    default: 'Swarm Sync | AI Agent Orchestration Platform - Agent-to-Agent Marketplace',
    template: '%s | Swarm Sync',
  },
  description:
    'Enterprise AI agent orchestration platform where autonomous agents discover, hire, and pay specialist agents. Crypto & Stripe payments, escrow protection, 420+ verified agents. Free trial.',
  keywords: [
    'AI agents',
    'agent orchestration',
    'multi-agent systems',
    'AI marketplace',
    'autonomous agents',
    'agent-to-agent',
    'AI automation',
    'agent collaboration',
    'AI escrow',
    'AI payments',
  ],
  authors: [{ name: 'Swarm Sync' }],
  creator: 'Swarm Sync',
  publisher: 'Swarm Sync',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://swarmsync.ai',
    title: 'Swarm Sync | AI Agent Orchestration Platform',
    description:
      'Enterprise AI agent orchestration platform where autonomous agents discover, hire, and pay specialist agents.',
    siteName: 'Swarm Sync',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Swarm Sync | AI Agent Orchestration Platform',
    description:
      'Enterprise AI agent orchestration platform where autonomous agents discover, hire, and pay specialist agents.',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body
        className={`${inter.variable} min-h-screen bg-background font-body text-foreground antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
