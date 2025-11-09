'use client';

import { createAgentMarketClient } from '@agent-market/sdk';
import { useState, useTransition } from 'react';

const clientCache: { instance?: ReturnType<typeof createAgentMarketClient> } = {};

const getClient = () => {
  if (!clientCache.instance) {
    clientCache.instance = createAgentMarketClient({
      baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
    });
  }
  return clientCache.instance;
};

const defaultSteps = JSON.stringify(
  [
    { agentId: 'AGENT_ID_1', jobReference: 'research', budget: 5 },
    { agentId: 'AGENT_ID_2', jobReference: 'analysis', budget: 5 },
  ],
  null,
  2,
);

export const WorkflowBuilder = () => {
  const [name, setName] = useState('Sample orchestration');
  const [description, setDescription] = useState('Two-stage research and analysis flow.');
  const [creatorId, setCreatorId] = useState('00000000-0000-0000-0000-000000000000');
  const [budget, setBudget] = useState(10);
  const [steps, setSteps] = useState(defaultSteps);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    let parsedSteps: unknown;
    try {
      parsedSteps = JSON.parse(steps);
      if (!Array.isArray(parsedSteps)) {
        throw new Error('Steps must be an array');
      }
    } catch (err) {
      setError('Steps must be valid JSON array.');
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const workflow = await getClient().createWorkflow({
          name,
          description,
          creatorId,
          budget,
          steps: parsedSteps,
        });
        setMessage(`Workflow ${workflow.name} created.`);
      } catch (err) {
        console.error(err);
        setError('Failed to create workflow.');
      }
    });
  };

  return (
    <section className="glass-card space-y-4 bg-white/5 p-6 text-xs uppercase tracking-wide text-fly-muted">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Create Workflow</h2>
        <p className="text-xs normal-case text-fly-muted">
          Provide a friendly name, total budget, and JSON array of steps. Each step references an
          agent identifier and optional per-step budget.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-fly-primary focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2">
          Budget (credits)
          <input
            type="number"
            value={budget}
            onChange={(event) => setBudget(Number(event.target.value))}
            min={1}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-fly-primary focus:outline-none"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-fly-primary focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-2">
        Creator ID (demo)
        <input
          value={creatorId}
          onChange={(event) => setCreatorId(event.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-white focus:border-fly-primary focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-2">
        Steps (JSON)
        <textarea
          value={steps}
          onChange={(event) => setSteps(event.target.value)}
          rows={6}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white focus:border-fly-primary focus:outline-none"
        />
      </label>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {message}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="glass-button bg-fly-primary px-4 py-2 text-sm font-semibold text-white shadow-fly-primary/40 hover:bg-fly-primaryDark disabled:cursor-not-allowed disabled:bg-white/10"
      >
        {isPending ? 'Creating...' : 'Create Workflow'}
      </button>
    </section>
  );
};
