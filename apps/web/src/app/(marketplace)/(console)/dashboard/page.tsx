import {
  Agent,
  BillingSubscription,
  OrganizationRoiSummary,
  OrganizationRoiTimeseriesPoint,
} from '@agent-market/sdk';
import Link from 'next/link';

import { BrandLogo } from '@/components/brand/brand-logo';
import { A2AOperationsPanel } from '@/components/dashboard/a2a-operations-panel';
import { CreditSummaryCard } from '@/components/dashboard/credit-summary-card';
import { FeaturedAgents } from '@/components/dashboard/featured-agents';
import { OrgOverviewCard } from '@/components/dashboard/org-overview-card';
import { OrgRoiTimeseriesChart } from '@/components/dashboard/org-roi-timeseries-chart';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { getCurrentUser } from '@/lib/auth-guard';
import { getAgentMarketClient } from '@/lib/server-client';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

const statusPills = [
  {
    label: 'API',
    state: 'Operational',
    tone: 'bg-emerald-500/15 text-emerald-300',
    tooltip: 'API services are running normally',
  },
  {
    label: 'Payments',
    state: 'Sandbox',
    tone: 'bg-amber-500/20 text-amber-200',
    tooltip: 'Payment processing is in sandbox mode (test environment)',
  },
  {
    label: 'Agent Mesh',
    state: 'In progress',
    tone: 'bg-sky-500/20 text-sky-200',
    tooltip: 'Agent-to-agent networking features are being developed',
  },
];

export default async function HomePage() {
  const client = getAgentMarketClient();
  const orgSlug = process.env.NEXT_PUBLIC_DEFAULT_ORG_SLUG ?? 'genesis';
  const currentUser = await getCurrentUser();

  let orgSummary: OrganizationRoiSummary | null = null;
  let orgTimeseries: OrganizationRoiTimeseriesPoint[] = [];
  let subscription: BillingSubscription | null = null;
  let agents: Agent[] = [];

  try {
    // Show all agents on the dashboard by setting showAll=true
    // This bypasses the default PUBLIC/APPROVED filter
    [orgSummary, orgTimeseries, subscription, agents] = await Promise.all([
      client.getOrganizationRoi(orgSlug),
      client.getOrganizationRoiTimeseries(orgSlug, 14),
      client.getBillingSubscription(),
      client.listAgents({ showAll: 'true' } as { showAll?: string }),
    ]);
    // Debug logging
    console.log('Dashboard loaded agents:', agents.length);
  } catch (error) {
    console.warn('Dashboard data unavailable during build', error);
    // Log the specific error for agents
    if (error instanceof Error) {
      console.error('Agent fetch error:', error.message, error.stack);
    }
  }

  // Get greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  // Extract first name from displayName
  const firstName = currentUser?.displayName?.split(' ')[0] || 'there';

  return (
    <div className="space-y-12">
      <header className="glass-card flex flex-col gap-8 p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-brass/70 font-body">Dashboard</p>
            <h1 className="mt-2 text-4xl font-headline">
              <span className="bg-gradient-to-b from-[#000000] to-[#bf8616] bg-clip-text text-transparent">
                {greeting}, {firstName}
              </span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-muted font-body">
              Track your marketplace usage, discover verified agents, and keep credits under control
              from a single console.
            </p>
            <div className="mt-4 flex items-center">
              <BrandLogo className="h-32 w-auto" size={960} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/agents/new" className="glass-button bg-accent text-carrara shadow-accent-glow hover:bg-accent-dark">
              + Create Agent
            </Link>
            <Link href="/workflows" className="glass-button text-ink">Launch workflow</Link>
            <Link href="/settings/team" className="glass-button text-ink">✺ Invite teammate</Link>
            <Link href="/billing" className="glass-button text-ink">
              Billing
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {statusPills.map((pill) => (
            <span
              key={pill.label}
              className={`pill ${pill.tone} cursor-help`}
              title={pill.tooltip}
            >
              {pill.label}: {pill.state}
            </span>
          ))}
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <CreditSummaryCard subscription={subscription} />
        <QuickActions />
      </section>

      {orgSummary ? (
        <OrgOverviewCard summary={orgSummary} />
      ) : (
        <div className="glass-card p-6 text-sm text-ink-muted">
          Unable to load organization analytics. Please ensure your organization is fully configured.
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[3fr,2fr]">
        <OrgRoiTimeseriesChart points={orgTimeseries} />
        <FeaturedAgents agents={agents} />
      </section>

      {agents.length > 0 ? (
        <A2AOperationsPanel agents={agents} />
      ) : (
        <section className="glass-card p-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-xl font-headline text-ink">Get Started with Your First Agent</h2>
            <p className="max-w-md text-sm text-ink-muted font-body">
              Create an agent to unlock the live agent-to-agent activity view, network graph, and
              budget controls.
            </p>
            <Link
              href="/agents/new"
              className="glass-button bg-accent text-carrara shadow-accent-glow hover:bg-accent-dark mt-2"
            >
              + Create Your First Agent
            </Link>
          </div>
        </section>
      )}

      <section className="glass-card">
        <div className="px-6 py-5 text-sm text-ink-muted">
          Great agents are front and center above. No recent workspace clutter here.
        </div>
      </section>
    </div>
  );
}
