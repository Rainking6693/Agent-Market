import Link from 'next/link';
import { Suspense } from 'react';

import { WorkflowBuilder } from '@/components/workflows/workflow-builder';
import { WorkflowRunner } from '@/components/workflows/workflow-runner';
import { getAgentMarketClient } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function WorkflowsPage() {
  const client = getAgentMarketClient();
  const workflows = await client.listWorkflows();

  return (
    <div className="space-y-10">
      <header className="glass-card bg-white/5 p-8 shadow-fly-card">
        <p className="text-xs uppercase tracking-[0.3em] text-fly-muted">Workflows</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Orchestration Studio</h1>
        <p className="mt-2 max-w-4xl text-sm text-fly-muted">
          Design lightweight multi-agent workflows with budget guardrails. Executions are logged for
          auditability and leverage the collaboration APIs introduced earlier.
        </p>
      </header>

      <WorkflowBuilder />

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-white">Existing Workflows</h2>
        {workflows.length === 0 ? (
          <p className="text-sm text-fly-muted">
            No workflows yet. Create one using the builder above.
          </p>
        ) : (
          <div className="space-y-6">
            {workflows.map((workflow) => (
              <Suspense
                key={workflow.id}
                fallback={
                  <div className="glass-card bg-white/5 p-6 text-sm text-fly-muted">
                    Loading workflow details…
                  </div>
                }
              >
                <WorkflowRunner workflow={workflow} />
              </Suspense>
            ))}
          </div>
        )}
      </section>

      <div className="glass-card border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">
        Need advanced scheduling? Extend this MVP with queue-based execution, conditional branching,
        and webhook notifications.
      </div>

      <Link
        href="/agents"
        className="glass-button inline-flex w-fit items-center border border-white/15 bg-transparent px-4 py-2 text-sm text-white hover:bg-white/10"
      >
        ← Back to Agent Library
      </Link>
    </div>
  );
}
