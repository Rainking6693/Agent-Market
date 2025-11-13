import Image from 'next/image';
import Link from 'next/link';

import { CreditSummaryCard } from '@/components/dashboard/credit-summary-card';
import { FeaturedAgents } from '@/components/dashboard/featured-agents';
import { OrgOverviewCard } from '@/components/dashboard/org-overview-card';
import { OrgRoiTimeseriesChart } from '@/components/dashboard/org-roi-timeseries-chart';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivityList } from '@/components/dashboard/recent-activity-list';
import { getAgentMarketClient } from '@/lib/api';

const recentPrompts = [
  { name: 'Go-to-market briefing', updated: 'Sep 21, 2025' },
  { name: 'Agent orchestration outline', updated: 'Aug 27, 2025' },
  { name: 'Payments readiness QA', updated: 'Aug 25, 2025' },
];

const statusPills = [
  { label: 'API', state: 'Operational', tone: 'bg-emerald-500/15 text-emerald-300' },
  { label: 'Payments', state: 'Sandbox', tone: 'bg-amber-500/20 text-amber-200' },
  { label: 'Agent Mesh', state: 'In progress', tone: 'bg-sky-500/20 text-sky-200' },
];

export default async function HomePage() {
  const client = getAgentMarketClient();
  const orgSlug = process.env.NEXT_PUBLIC_DEFAULT_ORG_SLUG ?? 'genesis';

  const [orgSummary, orgTimeseries, subscription] = await Promise.all([
    client.getOrganizationRoi(orgSlug),
    client.getOrganizationRoiTimeseries(orgSlug, 14),
    client.getBillingSubscription(),
  ]);

  return (
    <div className="space-y-12">
      <header className="glass-card flex flex-col gap-8 p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-brass/70">Dashboard</p>
            <h1 className="mt-2 text-4xl font-headline text-ink">Good morning, Ben</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-muted">
              Track your marketplace usage, discover verified agents, and keep credits under control
              from a single console.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <Image
                src="/logos/logo.svg"
                alt="SwarmSync mark"
                width={48}
                height={48}
                className="h-12 w-12"
                priority
              />
              <Image
                src="/logos/logo-inverted.svg"
                alt="SwarmSync negative mark"
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg border border-outline/40 bg-sidebar/80 p-2"
                priority
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="glass-button bg-accent text-carrara shadow-accent-glow hover:bg-accent-dark">
              + Start a run
            </button>
            <button className="glass-button text-ink">✺ Invite teammate</button>
            <Link href="/billing" className="glass-button">
              Billing
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {statusPills.map((pill) => (
            <span key={pill.label} className={`pill ${pill.tone}`}>
              {pill.label}: {pill.state}
            </span>
          ))}
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <CreditSummaryCard subscription={subscription} />
        <QuickActions />
        <RecentActivityList />
      </section>

      {orgSummary ? (
        <OrgOverviewCard summary={orgSummary} />
      ) : (
        <div className="glass-card p-6 text-sm text-ink-muted">
          Unable to load organization analytics. Configure `NEXT_PUBLIC_DEFAULT_ORG_SLUG` to enable
          ROI insights.
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[3fr,2fr]">
        <OrgRoiTimeseriesChart points={orgTimeseries} />
        <FeaturedAgents />
      </section>

      <section className="glass-card">
        <div className="border-b border-outline px-6 py-5">
          <h2 className="text-sm font-headline uppercase tracking-wide text-ink-muted">
            Recent workspaces
          </h2>
        </div>
        <ul className="divide-y divide-outline/60">
          {recentPrompts.map((prompt) => (
            <li key={prompt.name} className="px-6 py-5 transition hover:bg-surfaceAlt/60">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{prompt.name}</div>
                  <div className="text-xs text-ink-muted">Updated {prompt.updated}</div>
                </div>
                <button className="rounded-full border border-outline px-3 py-1 text-xs text-ink-muted transition hover:border-brass/40 hover:text-ink">
                  Open
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
