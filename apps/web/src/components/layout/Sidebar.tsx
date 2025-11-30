'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

import { BrandLogo } from '@/components/brand/brand-logo';
import { useAuth } from '@/hooks/use-auth';

const sections = [
  {
    title: 'Build',
    items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Agents', href: '/agents' },
      { label: 'Workflows', href: '/workflows' },
      { label: 'Billing', href: '/billing' },
      { label: 'Quality', href: '/quality' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Usage', href: '/analytics/usage' },
      { label: 'Cost', href: '/analytics/cost' },
      { label: 'Logs', href: '/analytics/logs' },
      { label: 'Batches', href: '/analytics/batches' },
      { label: 'Agent Mesh', href: '/analytics/agent-mesh' },
    ],
  },
  {
    title: 'Manage',
    items: [
      { label: 'API keys', href: '/settings/api-keys' },
      { label: 'Limits', href: '/settings/limits' },
      { label: 'Settings', href: '/settings/profile' },
    ],
  },
];

const navItemClass = 'block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-carrara/10';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden min-h-screen w-64 flex-col justify-between border-r border-outline/40 bg-sidebar p-6 text-carrara lg:flex">
      <div className="space-y-8">
        <div className="space-y-2">
          <Link href="/dashboard" className="block">
            <BrandLogo className="h-28 w-auto cursor-pointer transition-opacity hover:opacity-80" size={896} priority />
          </Link>
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
                    className={`${navItemClass} ${isActive ? 'bg-carrara/15 text-carrara' : 'text-carrara/70 hover:text-carrara'
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

      {user && (
        <Link
          href="/settings/profile"
          className="block rounded-2xl border border-carrara/10 bg-carrara/5 p-4 transition-colors hover:bg-carrara/10 cursor-pointer"
        >
          <div className="text-[0.65rem] uppercase tracking-wide text-brass/70">Signed in as</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-carrara/15 text-sm font-semibold text-carrara">
              {user.displayName?.charAt(0) || user.email.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-semibold text-carrara">{user.displayName || 'User'}</div>
              <div className="text-xs text-carrara/70">{user.email}</div>
            </div>
          </div>
        </Link>
      )}
    </aside>
  );
}
