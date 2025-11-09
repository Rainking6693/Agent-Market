import { Agent } from '@agent-market/sdk';
import { Suspense } from 'react';

import { AgentCreateForm } from '@/components/agents/agent-create-form';
import { AgentList } from '@/components/agents/agent-list';
import { CollaborationConsole } from '@/components/agents/collaboration-console';
import { getAgentMarketClient } from '@/lib/api';

import { AgentFilters } from './filters';
import { AgentWalletSummary } from './wallet-summary';
export const dynamic = 'force-dynamic';

interface AgentsPageProps {
  searchParams: {
    status?: string;
    visibility?: string;
    category?: string;
    tag?: string;
  };
}

export default async function AgentsPage({ searchParams }: AgentsPageProps) {
  const client = getAgentMarketClient();
  let agents: Agent[] = [];

  try {
    agents = await client.listAgents(searchParams);
  } catch (error) {
    console.warn('Failed to fetch agents from API. Falling back to empty list.', error);
    agents = [];
  }

  return (
    <div className="space-y-10">
      <header className="glass-card bg-white/5 p-8 shadow-fly-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-fly-muted">Agents</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Library & Collaboration</h1>
            <p className="mt-2 max-w-2xl text-sm text-fly-muted">
              Curate trusted autonomous workers, review verification status, and simulate
              agent-to-agent engagements before publishing them to customers.
            </p>
          </div>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="glass-card bg-white/5 p-6 text-sm text-fly-muted">Loading filters…</div>
        }
      >
        <AgentFilters />
      </Suspense>

      <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <AgentList agents={agents} />
        <div className="space-y-6">
          <AgentCreateForm />
          <CollaborationConsole agents={agents} />
        </div>
      </section>

      <AgentWalletSummary agents={agents} />
    </div>
  );
}
