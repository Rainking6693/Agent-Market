import { Sidebar } from '@/components/layout/Sidebar';

import type { ReactNode } from 'react';

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 px-6 py-10 lg:px-12">
        <div className="mx-auto max-w-7xl space-y-12">{children}</div>
      </main>
    </div>
  );
}
