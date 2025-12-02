'use client';

import {
  AgentCertificationRecord,
  AgentQualityAnalytics,
  AgentRoiTimeseriesPoint,
  EvaluationResultRecord,
  ServiceAgreementWithVerifications,
} from '@agent-market/sdk';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { CertificationManager } from '@/components/quality/certification-manager';
import { EvaluationConsole } from '@/components/quality/evaluation-console';
import { OutcomeVerificationPanel } from '@/components/quality/outcome-verification-panel';
import { QualityAgentSelector } from '@/components/quality/quality-agent-selector';
import { QualityOverview } from '@/components/quality/quality-overview';
import { RoiTimeseriesChart } from '@/components/quality/roi-timeseries-chart';
import { useAgents } from '@/hooks/use-agents';
import { agentsApi } from '@/lib/api';

export default function QualityPage({ searchParams }: { searchParams: { agentId?: string } }) {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  // Show all agents (no creator filter) so users can always see the list
  const filters = useMemo(
    () => ({
      verifiedOnly: false,
    }),
    [],
  );
  const { data: agents = [], isLoading, isError } = useAgents(filters);

  // Select the agent from query or first available
  useEffect(() => {
    if (agents.length === 0) return;
    const byQuery = searchParams.agentId
      ? agents.find((a) => a.id === searchParams.agentId)
      : null;
    setSelectedAgentId(byQuery?.id ?? agents[0].id);
  }, [agents, searchParams.agentId]);

  const [analytics, setAnalytics] = useState<AgentQualityAnalytics | null>(null);
  const [certifications, setCertifications] = useState<AgentCertificationRecord[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationResultRecord[]>([]);
  const [agreements, setAgreements] = useState<ServiceAgreementWithVerifications[]>([]);
  const [roiTimeseries, setRoiTimeseries] = useState<AgentRoiTimeseriesPoint[]>([]);

  useEffect(() => {
    if (!selectedAgentId) return;
    (async () => {
      try {
        const [
          analyticsRes,
          certs,
          evals,
          agreementsRes,
          roi,
        ] = await Promise.all([
          agentsApi.getQualityAnalytics?.(selectedAgentId) ?? Promise.resolve(null),
          agentsApi.listCertifications?.(selectedAgentId) ?? Promise.resolve([]),
          agentsApi.listEvaluationResults?.(selectedAgentId) ?? Promise.resolve([]),
          agentsApi.listServiceAgreements?.(selectedAgentId) ?? Promise.resolve([]),
          agentsApi.getQualityTimeseries?.(selectedAgentId, 14) ?? Promise.resolve([]),
        ]);
        setAnalytics(analyticsRes ?? null);
        setCertifications(certs ?? []);
        setEvaluations(evals ?? []);
        setAgreements(agreementsRes ?? []);
        setRoiTimeseries(roi ?? []);
      } catch (error) {
        console.warn('Quality dashboard data unavailable', error);
      }
    })();
  }, [selectedAgentId]);

  if (isLoading) {
    return <div className="glass-card p-8">Loading agents…</div>;
  }

  if (isError || agents.length === 0) {
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

  if (!selectedAgentId || !analytics) {
    return (
      <div className="glass-card p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-brass/70">Quality</p>
        <h1 className="mt-2 text-3xl font-headline text-ink">Trust & Outcomes Console</h1>
        <p className="mt-2 text-sm text-ink-muted">Select an agent to view quality metrics.</p>
        <QualityAgentSelector
          agents={agents}
          selectedAgentId={selectedAgentId ?? ''}
        />
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
          <QualityAgentSelector
            agents={agents}
            selectedAgentId={selectedAgentId}
          />
        </div>
      </header>

      <QualityOverview analytics={analytics} />

      <section className="grid gap-6 lg:grid-cols-2">
        <CertificationManager agentId={selectedAgentId} certifications={certifications} />
        <EvaluationConsole agentId={selectedAgentId} evaluations={evaluations} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <RoiTimeseriesChart points={roiTimeseries} />
        <OutcomeVerificationPanel agentId={selectedAgentId} agreements={agreements} />
      </div>
    </div>
  );
}
