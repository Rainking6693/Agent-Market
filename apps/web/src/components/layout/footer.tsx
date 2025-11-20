import Link from 'next/link';

import { BrandLogo } from '@/components/brand/brand-logo';

export function Footer() {
  return (
    <footer className="border-t border-white/70 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-4" aria-label="Swarm Sync homepage">
          <BrandLogo className="h-14 w-auto" size={384} />
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/agents" className="transition hover:text-foreground">
            Agents
          </Link>
          <Link href="/pricing" className="transition hover:text-foreground">
            Pricing
          </Link>
        </nav>
      </div>
    </footer>
  );
}
