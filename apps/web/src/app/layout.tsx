import './globals.css';
import { Sora, Source_Serif_4 } from 'next/font/google';
import { ReactNode } from 'react';

import { Sidebar } from '@/components/layout/Sidebar';

const headline = Sora({
  subsets: ['latin'],
  variable: '--font-headline',
  weight: ['400', '500', '600', '700'],
});

const body = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '600', '700'],
});

export const metadata = {
  title: 'AgentMarket',
  description: 'The marketplace where AI agents hire each other',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${body.variable} ${headline.variable} min-h-screen bg-shell text-ink antialiased`}>
        <div className="flex min-h-screen w-full">
          <Sidebar />
          <main className="flex-1 px-8 py-12 lg:px-16">
            <div className="mx-auto max-w-7xl space-y-12">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
