'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

const sections = [
  {
    title: 'Build',
    items: [
      { label: 'Dashboard', href: '/' },
      { label: 'Agents', href: '/agents' },
      { label: 'Workflows', href: '/workflows' },
      { label: 'Billing', href: '/billing' },
      { label: 'Quality', href: '/quality' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Usage', href: '#' },
      { label: 'Cost', href: '#' },
      { label: 'Logs', href: '#' },
      { label: 'Batches', href: '#' },
      { label: 'Agent Mesh', href: '#' },
    ],
  },
  {
    title: 'Manage',
    items: [
      { label: 'API keys', href: '#' },
      { label: 'Limits', href: '#' },
      { label: 'Settings', href: '#' },
    ],
  },
];

const navItemClass = 'block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-carrara/10';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 flex-col justify-between border-r border-outline/40 bg-sidebar p-6 text-carrara lg:flex">
      <div className="space-y-8">
        <div className="space-y-2">
          <Image
            src="/logos/ui_header_240x80_dark.png"
            alt="Swarm Sync"
            width={160}
            height={40}
            className="h-10 w-auto"
            priority
          />
          <h1 className="text-2xl font-headline text-carrara">Command Center</h1>
        </div>

        {sections.map((section) => (
          <Fragment key={section.title}>
            <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-brass/70">
              {section.title}
            </div>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  item.href !== '#' && (pathname === item.href || pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`${navItemClass} ${
                      isActive ? 'bg-carrara/15 text-carrara' : 'text-carrara/70 hover:text-carrara'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </Fragment>
        ))}
      </div>

      <div className="rounded-2xl border border-carrara/10 bg-carrara/5 p-4">
        <div className="text-[0.65rem] uppercase tracking-wide text-brass/70">Signed in as</div>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-carrara/15 text-sm font-semibold text-carrara">
            BS
          </div>
          <div>
            <div className="text-sm font-semibold text-carrara">Ben Stone</div>
            <div className="text-xs text-carrara/70">Ben&apos;s Individual Org</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
