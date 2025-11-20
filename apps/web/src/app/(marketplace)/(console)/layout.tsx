import { Sidebar } from '@/components/layout/Sidebar';
import { requireAuth } from '@/lib/auth-guard';

import type { ReactNode } from 'react';

export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  // Protect all console routes - redirect to login if not authenticated
  await requireAuth('/dashboard');

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 px-6 py-10 lg:px-12">
        <div className="mx-auto max-w-7xl space-y-12">{children}</div>
      </main>
    </div>
  );
}
