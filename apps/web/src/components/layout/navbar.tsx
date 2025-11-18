'use client';

import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/agents', label: 'Agents' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/billing', label: 'Billing' },
];

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:py-5">
        <Link href="/" className="flex items-center">
          <Image
            src="/logos/swarm-sync-wordmark-transparent.svg"
            alt="Swarm Sync logo"
            width={160}
            height={48}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              className={cn(
                'transition hover:text-foreground',
                pathname.startsWith(link.href) && 'text-foreground',
              )}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" onClick={logout}>
                Sign out
              </Button>
              <Button asChild>
                <Link href="/dashboard">Console</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex rounded-full border border-border p-2 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="border-t border-white/60 bg-white/90 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-medium text-muted-foreground',
                  pathname.startsWith(link.href) && 'text-foreground',
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" onClick={logout}>
                    Sign out
                  </Button>
                  <Button asChild>
                    <Link href="/dashboard">Console</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Get started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
