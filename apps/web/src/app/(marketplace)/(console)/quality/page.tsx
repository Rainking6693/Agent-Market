import {
  Agent,
  AgentCertificationRecord,
  AgentQualityAnalytics,
  AgentRoiTimeseriesPoint,
  EvaluationResultRecord,
  ServiceAgreementWithVerifications,
} from '@agent-market/sdk';
import Link from 'next/link';

import { CertificationManager } from '@/components/quality/certification-manager';
import { EvaluationConsole } from '@/components/quality/evaluation-console';
import { OutcomeVerificationPanel } from '@/components/quality/outcome-verification-panel';
import { QualityAgentSelector } from '@/components/quality/quality-agent-selector';
import { QualityOverview } from '@/components/quality/quality-overview';
import { RoiTimeseriesChart } from '@/components/quality/roi-timeseries-chart';
import { getAgentMarketClient } from '@/lib/server-client';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quality & Trust',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

interface QualityPageProps {
  searchParams: {
    agentId?: string;
  };
}

export default async function QualityPage({ searchParams }: QualityPageProps) {
  const client = getAgentMarketClient();
  let agents: Agent[] = [];
  try {
    agents = await client.listAgents();
  } catch (error) {
    console.warn('Failed to load agents for quality page', error);
  }

  if (agents.length === 0) {
    return (
      <div className="space-y-8">
        <header className="glass-card p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-brass/70">Quality</p>
          <h1 className="mt-2 text-3xl font-headline text-ink">Trust & Outcomes Console</h1>
        </header>
        <div className="glass-card border border-blue-500/40 bg-blue-500/10 p-8">
          <h2 className="text-lg font-semibold text-blue-700">No Agents Yet</h2>
          <p className="mt-2 text-sm text-blue-600">
            You haven't created any agents yet. Create your first agent to access quality workflows.
          </p>
          <Link
            href="/agents/new"
            className="mt-4 inline-flex items-center rounded-lg bg-brass px-4 py-2 text-sm font-semibold text-white hover:bg-brass/90"
          >
            Create Your First Agent
          </Link>
        </div>
      </div>
    );
  }

  const selectedAgent = agents.find((agent) => agent.id === searchParams.agentId) ?? agents[0];
  const selectedAgentId = selectedAgent.id;

  let analytics: AgentQualityAnalytics | null = null;
  let certifications: AgentCertificationRecord[] = [];
  let evaluations: EvaluationResultRecord[] = [];
  let agreements: ServiceAgreementWithVerifications[] = [];
  let roiTimeseries: AgentRoiTimeseriesPoint[] = [];

  try {
    [analytics, certifications, evaluations, agreements, roiTimeseries] = await Promise.all([
      client.getAgentQualityAnalytics(selectedAgentId),
      client.listCertifications(selectedAgentId),
      client.listEvaluationResults(selectedAgentId),
      client.listServiceAgreements(selectedAgentId),
      client.getAgentQualityTimeseries(selectedAgentId, 14),
    ]);
  } catch (error) {
    console.warn('Quality dashboard data unavailable during build', error);
  }

  if (!analytics) {
    return (
      <div className="space-y-8">
        <header className="glass-card p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-brass/70">Quality</p>
          <h1 className="mt-2 text-3xl font-headline text-ink">Trust & Outcomes Console</h1>
        </header>
        <div className="glass-card border border-amber-500/40 bg-amber-500/10 p-8">
          <h2 className="text-lg font-semibold text-amber-700">Quality Analytics Unavailable</h2>
          <p className="mt-2 text-sm text-amber-600">
            We're currently unable to load quality analytics for this agent. This may be temporary.
          </p>
          <p className="mt-4 text-sm text-ink-muted">
            Try refreshing the page or check back later. If this issue persists, please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="glass-card p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brass/70">Quality</p>
            <h1 className="mt-2 text-3xl font-headline text-ink">Trust &amp; Outcomes Console</h1>
            <p className="mt-2 max-w-3xl text-sm text-ink-muted">
              Monitor certification status, review autonomous evaluation runs, and manage
              outcome-based agreements tied to escrow releases.
            </p>
          </div>
          <QualityAgentSelector agents={agents} selectedAgentId={selectedAgentId} />
        </div>
      </header>

      <QualityOverview analytics={analytics as AgentQualityAnalytics} />

      <section className="grid gap-6 lg:grid-cols-2">
        <CertificationManager
          agentId={selectedAgentId}
          certifications={certifications as AgentCertificationRecord[]}
        />
        <EvaluationConsole
          agentId={selectedAgentId}
          evaluations={evaluations as EvaluationResultRecord[]}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <RoiTimeseriesChart points={roiTimeseries} />
        <OutcomeVerificationPanel
          agentId={selectedAgentId}
          agreements={agreements as ServiceAgreementWithVerifications[]}
        />
      </div>
    </div>
  );
}
