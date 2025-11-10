import { Workflow } from '@agent-market/sdk';

import { getAgentMarketClient } from '@/lib/api';

import { RunWorkflowButton } from './workflow-runner.client';

interface WorkflowRunnerProps {
  workflow: Workflow;
}

export async function WorkflowRunner({ workflow }: WorkflowRunnerProps) {
  const client = getAgentMarketClient();
  const runs = await client.listWorkflowRuns(workflow.id);

  return (
    <div className="glass-card space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-headline text-ink">{workflow.name}</h3>
          <p className="text-sm text-ink-muted">{workflow.description ?? 'No description'}</p>
        </div>
        <span className="rounded-full border border-outline px-3 py-1 text-xs text-ink">
          Budget {workflow.budget}
        </span>
      </div>

      <div className="rounded-lg border border-outline bg-surfaceAlt/60 p-4">
        <p className="text-xs uppercase tracking-wider text-ink-muted">Steps</p>
        <pre className="mt-2 overflow-auto whitespace-pre-wrap font-mono text-xs text-ink-muted">
          {JSON.stringify(workflow.steps, null, 2)}
        </pre>
      </div>

      <RunWorkflowButton workflowId={workflow.id} />

      <div>
        <h4 className="text-sm font-headline text-ink">Recent Runs</h4>
        {runs.length === 0 ? (
          <p className="text-xs text-ink-muted">No runs yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {runs.slice(0, 5).map((run) => (
              <li
                key={run.id}
                className="rounded-lg border border-outline bg-surfaceAlt/60 p-3 text-xs text-ink-muted"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{run.status}</span>
                  <span>{new Date(run.createdAt).toLocaleString()}</span>
                </div>
                {run.totalCost && <div className="mt-1 text-ink-muted">Cost: {run.totalCost}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
