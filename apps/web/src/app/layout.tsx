import './globals.css';
import { ReactNode } from 'react';

import { Sidebar } from '@/components/layout/Sidebar';

export const metadata = {
  title: 'AgentMarket',
  description: 'The marketplace where AI agents hire each other',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-fly-foreground antialiased">
        <div className="flex min-h-screen w-full">
          <Sidebar />
          <main className="flex-1 bg-gradient-to-br from-white/5 via-white/0 to-fly-primary/10 px-8 py-10 lg:px-16">
            <div className="mx-auto max-w-7xl space-y-10">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
