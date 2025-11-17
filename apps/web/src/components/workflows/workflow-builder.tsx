'use client';

import { createAgentMarketClient } from '@agent-market/sdk';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useCallback, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const [budget, setBudget] = useState(10);
  const [steps, setSteps] = useState(defaultSteps);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [creatorId, setCreatorId] = useState('');
  const [parsedSteps, setParsedSteps] = useState<Array<{ agentId: string; jobReference: string; budget: number }>>([]);

  const handleAddStep = useCallback(() => {
    const newSteps = [...parsedSteps, { agentId: '', jobReference: '', budget: 5 }];
    setParsedSteps(newSteps);
    setSteps(JSON.stringify(newSteps, null, 2));
  }, [parsedSteps]);

  const handleRemoveStep = useCallback((index: number) => {
    const newSteps = parsedSteps.filter((_, i) => i !== index);
    setParsedSteps(newSteps);
    setSteps(JSON.stringify(newSteps, null, 2));
  }, [parsedSteps]);

  const handleUpdateStep = useCallback(
    (index: number, field: 'agentId' | 'jobReference' | 'budget', value: string | number) => {
      const newSteps = [...parsedSteps];
      if (field === 'budget') {
        newSteps[index] = { ...newSteps[index], [field]: Number(value) };
      } else {
        newSteps[index] = { ...newSteps[index], [field]: value };
      }
      setParsedSteps(newSteps);
      setSteps(JSON.stringify(newSteps, null, 2));
    },
    [parsedSteps],
  );

  const handleSubmit = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(steps);
      if (!Array.isArray(parsed)) {
        throw new Error('Steps must be an array');
      }
      setParsedSteps(parsed);
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
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <h2 className="text-4xl font-headline text-ink">Create Workflow</h2>
        <p className="text-sm text-ink-muted">
          Build multi-agent workflows by connecting agents in sequence or parallel. Set budgets,
          define handoffs, and test execution.
        </p>
      </header>

      {/* Main Configuration */}
      <Card className="border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle className="font-headline">Workflow Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink-muted mb-2">
              Creator ID
            </label>
            <input
              value={creatorId}
              onChange={(event) => setCreatorId(event.target.value)}
              placeholder="UUID of the workflow owner"
              className="w-full rounded-lg border border-outline/40 bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:border-brass/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink-muted mb-2">
              Workflow Name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g., Research → Analysis → Archive"
              className="w-full rounded-lg border border-outline/40 bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:border-brass/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink-muted mb-2">
              Total Budget (credits)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(event) => setBudget(Number(event.target.value))}
              min={1}
              className="w-full rounded-lg border border-outline/40 bg-surface px-3 py-2 text-sm text-ink focus:border-brass/40 focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-wide text-ink-muted mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="What is this workflow designed to do?"
              className="w-full rounded-lg border border-outline/40 bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:border-brass/40 focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps Builder */}
      <Card className="border-white/70 bg-white/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline">Workflow Steps</CardTitle>
          <Button size="sm" onClick={handleAddStep} variant="secondary">
            <Plus className="h-4 w-4" />
            Add Step
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {parsedSteps.length === 0 ? (
            <p className="text-sm text-ink-muted italic">No steps yet. Click &quot;Add Step&quot; to start building.</p>
          ) : (
            <div className="space-y-3">
              {parsedSteps.map((step, index) => (
                <div key={index} className="flex items-end gap-3 rounded-lg border border-outline/40 bg-surface/60 p-4">
                  <div className="flex-1">
                    <label className="block text-xs uppercase tracking-wide text-ink-muted mb-1">
                      Agent ID
                    </label>
                    <input
                      value={step.agentId}
                      onChange={(e) => handleUpdateStep(index, 'agentId', e.target.value)}
                      placeholder="e.g., agent_research_001"
                      className="w-full rounded border border-outline/40 bg-white px-2 py-1 text-xs text-ink placeholder:text-ink-muted/50"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs uppercase tracking-wide text-ink-muted mb-1">
                      Job Reference
                    </label>
                    <input
                      value={step.jobReference}
                      onChange={(e) => handleUpdateStep(index, 'jobReference', e.target.value)}
                      placeholder="e.g., research"
                      className="w-full rounded border border-outline/40 bg-white px-2 py-1 text-xs text-ink placeholder:text-ink-muted/50"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs uppercase tracking-wide text-ink-muted mb-1">
                      Budget
                    </label>
                    <input
                      type="number"
                      value={step.budget}
                      onChange={(e) => handleUpdateStep(index, 'budget', e.target.value)}
                      min={0}
                      className="w-full rounded border border-outline/40 bg-white px-2 py-1 text-xs text-ink"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveStep(index)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* JSON Editor (Advanced) */}
      <Card className="border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle className="font-headline">Advanced: Raw JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="block text-xs uppercase tracking-wide text-ink-muted mb-2">
            Steps (JSON Array)
          </label>
          <textarea
            value={steps}
            onChange={(event) => setSteps(event.target.value)}
            rows={6}
            className="w-full rounded-lg border border-outline/40 bg-surface px-3 py-2 font-mono text-xs text-ink focus:border-brass/40 focus:outline-none"
          />
        </CardContent>
      </Card>

      {/* Messages */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 rounded-full"
        >
          <Save className="h-4 w-4" />
          {isPending ? 'Creating...' : 'Create Workflow'}
        </Button>
      </div>
    </div>
  );
};

