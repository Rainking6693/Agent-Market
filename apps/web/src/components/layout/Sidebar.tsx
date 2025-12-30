'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

import { BrandLogo } from '@/components/brand/brand-logo';
import { useAuth } from '@/hooks/use-auth';

const sections = [
  {
    title: 'Home',
    items: [
      { label: 'Overview', href: '/console/overview' },
    ],
  },
  {
    title: 'Build',
    items: [
      { label: 'Agents', href: '/agents' },
      { label: 'Workflows', href: '/workflows' },
    ],
  },
  {
    title: 'Spend',
    items: [
      { label: 'Wallet', href: '/wallet' },
      { label: 'Billing', href: '/billing' },
    ],
  },
  {
    title: 'Quality',
    items: [
      { label: 'Test Library', href: '/console/quality/test-library' },
      { label: 'Outcomes', href: '/console/quality/outcomes' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Logs', href: '/console/analytics/logs' },
      { label: 'API Keys', href: '/console/settings/api-keys' },
      { label: 'Limits', href: '/console/settings/limits' },
      { label: 'Settings', href: '/console/settings/profile' },
      { label: 'Test A2A', href: '/console/test-a2a' },
    ],
  },
];

const navItemClass =
  'block rounded-lg px-3 py-2 text-sm transition-colors duration-200 sidebar-link';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden min-h-screen w-64 flex-col justify-between border-r border-border bg-surface p-6 text-text lg:flex">
      <div className="space-y-6">

        {sections.map((section) => (
          <Fragment key={section.title}>
            <div className="sidebar-label">
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
                    className={`${navItemClass} ${isActive ? 'sidebar-link-active' : 'hover:text-text'}`}
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
          href="/console/settings/profile"
          className="block rounded-2xl border border-border bg-surface2/70 p-4 transition-colors hover:border-white/20 cursor-pointer"
        >
          <div className="text-[0.65rem] uppercase tracking-wide text-muted">Signed in as</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface2 text-sm font-semibold text-text">
              {user.displayName?.charAt(0) || user.email.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-semibold text-text">{user.displayName || 'User'}</div>
              <div className="text-xs text-text2">{user.email}</div>
            </div>
          </div>
        </Link>
      )}
    </aside>
  );
}
