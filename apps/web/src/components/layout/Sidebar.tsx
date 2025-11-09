'use client';

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

const navItemClass =
  'block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10 hover:text-white';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 flex-col justify-between border-r border-fly-border/60 bg-fly-sidebar p-6 text-fly-foreground lg:flex">
      <div className="space-y-8">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-fly-muted">AgentMarket</div>
          <h1 className="mt-2 text-2xl font-semibold text-white">Command Center</h1>
        </div>

        {sections.map((section) => (
          <Fragment key={section.title}>
            <div className="text-xs font-semibold uppercase tracking-wide text-fly-muted">
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
                      isActive ? 'bg-white/15 text-white' : 'text-fly-foreground/80'
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

      <div className="rounded-xl border border-white/10 bg-white/10 p-4">
        <div className="text-xs uppercase tracking-wide text-fly-muted">Signed in as</div>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
            BS
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Ben Stone</div>
            <div className="text-xs text-fly-muted">Ben&apos;s Individual Org</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
