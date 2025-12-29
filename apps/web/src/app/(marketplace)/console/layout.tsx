import Image from 'next/image';
import Link from 'next/link';

import { Sidebar } from '@/components/layout/Sidebar';
import { requireAuth } from '@/lib/auth-guard';

import type { ReactNode } from 'react';

export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  // Protect all console routes - redirect to login if not authenticated
  await requireAuth('/overview');

  return (
    <div className="flex min-h-screen w-full bg-black text-slate-50">
      <Sidebar />
      <div className="flex-1 relative">
        {/* Logo in top-right corner */}
        <div className="absolute top-6 right-6 z-10">
          <Link href="/">
            <Image src="/swarm-sync-logo.png" alt="Swarm Sync logo" width={80} height={80} className="h-20 w-auto cursor-pointer transition-opacity hover:opacity-80" priority />
          </Link>
        </div>
        <main className="flex-1 px-6 py-10 lg:px-12">
          <div className="mx-auto max-w-7xl space-y-12">{children}</div>
        </main>
      </div>
    </div>
  );
}
