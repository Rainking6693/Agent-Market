import { Workflow } from '@agent-market/sdk';

import { getAgentMarketClient } from '@/lib/server-client';

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
          <h3 className="text-xl font-headline text-white">{workflow.name}</h3>
          <p className="text-sm text-slate-400">{workflow.description ?? 'No description'}</p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white">
          Budget {workflow.budget}
        </span>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-wider text-slate-400">Steps</p>
        <pre className="mt-2 overflow-auto whitespace-pre-wrap font-mono text-xs text-slate-400">
          {JSON.stringify(workflow.steps, null, 2)}
        </pre>
      </div>

      <RunWorkflowButton workflowId={workflow.id} />

      <div>
        <h4 className="text-sm font-headline text-white">Recent Runs</h4>
        {runs.length === 0 ? (
          <p className="text-xs text-slate-400">No runs yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {runs.slice(0, 5).map((run) => (
              <li
                key={run.id}
                className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-slate-400"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{run.status}</span>
                  <span>{new Date(run.createdAt).toLocaleString()}</span>
                </div>
                {run.totalCost && <div className="mt-1 text-slate-400">Cost: {run.totalCost}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
