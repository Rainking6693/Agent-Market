import Link from 'next/link';
import { Suspense } from 'react';

import { WorkflowBuilder } from '@/components/workflows/workflow-builder';
import { WorkflowRunner } from '@/components/workflows/workflow-runner';
import { getAgentMarketClient } from '@/lib/server-client';

export const dynamic = 'force-dynamic';

export default async function WorkflowsPage() {
  const client = getAgentMarketClient();
  const workflows = await client.listWorkflows();

  return (
    <div className="space-y-10">
      <header className="glass-card p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-brass/70">Workflows</p>
        <h1 className="mt-2 text-3xl font-headline text-ink">Orchestration Studio</h1>
        <p className="mt-2 max-w-4xl text-sm text-ink-muted">
          Design lightweight multi-agent workflows with budget guardrails. Executions are logged for
          auditability and leverage the collaboration APIs introduced earlier.
        </p>
      </header>

      <WorkflowBuilder />

      <section className="space-y-6">
        <h2 className="text-lg font-headline text-ink">Existing Workflows</h2>
        {workflows.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No workflows yet. Create one using the builder above.
          </p>
        ) : (
          <div className="space-y-6">
            {workflows.map((workflow) => (
              <Suspense
                key={workflow.id}
                fallback={
                  <div className="glass-card p-6 text-sm text-ink-muted">
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

      <div className="glass-card border border-brass/40 bg-brass/10 p-6 text-sm text-brass">
        Need advanced scheduling? Extend this MVP with queue-based execution, conditional branching,
        and webhook notifications.
      </div>

      <Link
        href="/agents"
        className="glass-button inline-flex w-fit items-center border border-outline bg-transparent px-4 py-2 text-sm text-ink"
      >
        ← Back to Agent Library
      </Link>
    </div>
  );
}
