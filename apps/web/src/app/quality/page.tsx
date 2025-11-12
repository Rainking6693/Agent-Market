import {
  AgentCertificationRecord,
  AgentQualityAnalytics,
  EvaluationResultRecord,
  ServiceAgreementWithVerifications,
} from '@agent-market/sdk';

import { CertificationManager } from '@/components/quality/certification-manager';
import { EvaluationConsole } from '@/components/quality/evaluation-console';
import { OutcomeVerificationPanel } from '@/components/quality/outcome-verification-panel';
import { QualityAgentSelector } from '@/components/quality/quality-agent-selector';
import { QualityOverview } from '@/components/quality/quality-overview';
import { getAgentMarketClient } from '@/lib/api';

interface QualityPageProps {
  searchParams: {
    agentId?: string;
  };
}

export default async function QualityPage({ searchParams }: QualityPageProps) {
  const client = getAgentMarketClient();
  const agents = await client.listAgents();

  if (agents.length === 0) {
    return (
      <div className="glass-card p-8 text-ink">
        No agents found. Create an agent to enable quality workflows.
      </div>
    );
  }

  const selectedAgent =
    agents.find((agent) => agent.id === searchParams.agentId) ?? agents[0];
  const selectedAgentId = selectedAgent.id;
  const [analytics, certifications, evaluations, agreements] = await Promise.all([
    client.getAgentQualityAnalytics(selectedAgentId),
    client.listCertifications(selectedAgentId),
    client.listEvaluationResults(selectedAgentId),
    client.listServiceAgreements(selectedAgentId),
  ]);

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

      <OutcomeVerificationPanel
        agentId={selectedAgentId}
        agreements={agreements as ServiceAgreementWithVerifications[]}
      />
    </div>
  );
}
