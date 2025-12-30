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

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface2/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Swarm Sync homepage">
          <Image src="/swarm-sync-logo.png" alt="Swarm Sync logo" width={40} height={40} priority className="h-10 w-auto" />
          <span className="text-xs font-semibold tracking-[0.3em] text-text2 uppercase hidden sm:inline">AGENT-TO-AGENT HUB</span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-2xl font-medium text-text2 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              className={cn(
                'transition hover:text-text',
                pathname.startsWith(link.href) && 'text-text',
              )}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-8 md:flex">
          {isAuthenticated ? (
            <>
              <button
                onClick={logout}
                className="text-2xl font-medium text-text2 transition hover:text-text"
              >
                Sign out
              </button>
              <Button
                size="lg"
                asChild
              >
                <Link href="/dashboard">Console</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-text2 hover:text-text">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
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
          className="border-t border-border bg-surface2/90 px-4 py-4 md:hidden"
        >
          <nav className="flex flex-col gap-4 text-sm" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-medium text-text2',
                  pathname.startsWith(link.href) && 'text-text',
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
