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
];

const navLinkClass =
  'relative inline-flex items-center text-sm font-medium tracking-wider text-[var(--text-secondary)] transition-colors';
const navActiveStyles =
  'text-[var(--accent-primary)] before:absolute before:-bottom-1 before:left-0 before:h-[2px] before:w-full before:bg-[var(--accent-primary)] before:rounded-full';

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-base)] bg-[var(--surface-base)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-4 group" aria-label="Swarm Sync homepage">
          <Image
            src="/logos/swarm-sync-tactical-black.png"
            alt="Swarm Sync logo"
            width={180}
            height={60}
            priority
            className="h-12 w-auto transition-transform duration-300 group-hover:scale-105 mix-blend-screen"
          />
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex" font-ui>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              className={cn(
                navLinkClass,
                pathname.startsWith(link.href)
                  ? navActiveStyles
                  : 'hover:text-[var(--text-primary)]',
              )}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated ? (
            <>
              <button
                onClick={logout}
                className="text-sm font-medium uppercase tracking-wide text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                font-ui
              >
                Sign out
              </button>
              <Button className="px-4 py-2 text-sm font-semibold" asChild>
                <Link href="/dashboard">Console</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]" font-ui>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button className="px-4 py-2 text-sm font-semibold" asChild>
                <Link href="/register">Console</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex rounded-full border border-border p-2 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div >

      {open && (
        <div
          id="mobile-navigation"
          className="border-t border-[var(--border-base)] bg-[var(--surface-base)]/90 px-4 py-4 md:hidden"
        >
          <nav className="flex flex-col gap-4 text-sm" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-medium text-[var(--text-secondary)]',
                  pathname.startsWith(link.href) && 'text-[var(--accent-primary)]',
                )}
                font-ui
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
                  <Button variant="ghost" asChild>
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Console</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header >
  );
}
