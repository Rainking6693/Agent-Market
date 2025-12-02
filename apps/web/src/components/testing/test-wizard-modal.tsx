'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTestRunProgress } from '@/hooks/use-test-run-progress';
import type { StartTestRunResponse } from '@/lib/api';

interface TestSuite {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  estimatedDurationSec: number;
  approximateCostUsd: number;
  isRecommended: boolean;
}

interface Agent {
  id: string;
  name: string;
  slug: string;
}

interface TestWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  suites: TestSuite[];
  isLoading?: boolean;
  onStartRun: (agentIds: string[], suiteIds: string[]) => Promise<StartTestRunResponse>;
}

export function TestWizardModal({
  isOpen,
  onClose,
  agents,
  suites,
  isLoading,
  onStartRun,
}: TestWizardModalProps) {
  const [step, setStep] = useState(1);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [selectedSuites, setSelectedSuites] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  const { progress } = useTestRunProgress(activeRunId);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedAgents([]);
      setSelectedSuites([]);
      setIsRunning(false);
      setStartError(null);
      setActiveRunId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStart = async () => {
    if (selectedAgents.length === 0 || selectedSuites.length === 0) {
      return;
    }

    setIsRunning(true);
    setStartError(null);
    try {
      const response = await onStartRun(selectedAgents, selectedSuites);
      const firstRun = response?.runs?.[0];
      if (firstRun?.id) {
        setActiveRunId(firstRun.id);
        setStep(3);
      } else {
        setStartError('Test run started, but no run ID was returned.');
      }
    } catch (error) {
      console.error('Failed to start test run:', error);
      let message = 'Failed to start test run. Please try again.';
      const httpError = error as { response?: Response };
      if (httpError?.response) {
        const body = await httpError.response.clone().json().catch(() => null);
        message =
          (body as { message?: string })?.message ??
          httpError.response.statusText ??
          message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setStartError(message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-outline/40 bg-surface p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-ink-muted transition hover:bg-surfaceAlt"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-headline text-ink">Test & Evaluate Agents</h2>
          <p className="mt-2 text-sm text-ink-muted">Run quality tests on your agents</p>
        </div>

        <div className="mb-6 flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  step >= s
                    ? 'border-brass bg-brass text-carrara'
                    : 'border-outline text-ink-muted'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={`h-1 w-16 ${step > s ? 'bg-brass' : 'bg-outline/30'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto pr-1">
          {startError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {startError}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-ink">Select Agents</h3>
              <p className="text-sm text-ink-muted">Choose which agents to test</p>
              {isLoading ? (
                <div className="py-8 text-center text-sm text-ink-muted">Loading agents...</div>
              ) : agents.length === 0 ? (
                <div className="py-8 text-center text-sm text-ink-muted">
                  No agents available. Create an agent first.
                </div>
              ) : (
                <div className="grid max-h-[40vh] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                  {agents.map((agent) => (
                    <Card
                      key={agent.id}
                      className={`cursor-pointer transition ${
                        selectedAgents.includes(agent.id)
                          ? 'border-brass bg-brass/10'
                          : 'border-outline/40 hover:border-brass/40'
                      }`}
                      onClick={() => {
                        setSelectedAgents((prev) =>
                          prev.includes(agent.id)
                            ? prev.filter((id) => id !== agent.id)
                            : [...prev, agent.id],
                        );
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-ink">{agent.name}</h4>
                            <p className="text-xs text-ink-muted">{agent.slug}</p>
                          </div>
                          {selectedAgents.includes(agent.id) && (
                            <div className="h-5 w-5 rounded-full bg-brass" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-ink">Select Test Suites</h3>
              <p className="text-sm text-ink-muted">Choose which test suites to run</p>
              {isLoading ? (
                <div className="py-8 text-center text-sm text-ink-muted">Loading test suites...</div>
              ) : suites.length === 0 ? (
                <div className="py-8 text-center text-sm text-ink-muted">No test suites available.</div>
              ) : (
                <div className="grid max-h-[40vh] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                  {suites.map((suite) => (
                    <Card
                      key={suite.id}
                      className={`cursor-pointer transition ${
                        selectedSuites.includes(suite.id)
                          ? 'border-brass bg-brass/10'
                          : 'border-outline/40 hover:border-brass/40'
                      }`}
                      onClick={() => {
                        setSelectedSuites((prev) =>
                          prev.includes(suite.id)
                            ? prev.filter((id) => id !== suite.id)
                            : [...prev, suite.id],
                        );
                      }}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{suite.name}</CardTitle>
                            {suite.isRecommended && (
                              <span className="mt-1 inline-block rounded-full bg-brass/20 px-2 py-0.5 text-xs text-brass">
                                Recommended
                              </span>
                            )}
                          </div>
                          {selectedSuites.includes(suite.id) && (
                            <div className="h-5 w-5 rounded-full bg-brass" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <CardDescription className="text-xs">{suite.description}</CardDescription>
                        <div className="mt-3 flex items-center gap-4 text-xs text-ink-muted">
                          <span>~{Math.round(suite.estimatedDurationSec / 60)} min</span>
                          <span>~${suite.approximateCostUsd.toFixed(2)}</span>
                          <span className="capitalize">{suite.category}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-ink">Review & Confirm</h3>
              {activeRunId ? (
                <div className="space-y-4 rounded-lg border border-outline/40 bg-surfaceAlt/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase text-ink-muted">Run in progress</p>
                      <p className="text-sm font-semibold text-ink">ID: {activeRunId}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        progress?.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : progress?.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {progress?.status ?? 'queued'}
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-outline/30">
                    <div
                      className="h-full bg-gradient-to-r from-brass to-[#bf8616] transition-all duration-500"
                      style={{
                        width: `${
                          progress?.totalTests
                            ? Math.min(
                                100,
                                Math.round((progress.completedTests / progress.totalTests) * 100),
                              )
                            : progress?.status === 'completed'
                              ? 100
                              : progress?.status === 'running'
                                ? 50
                                : 15
                        }%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <span>
                      {progress?.status === 'completed'
                        ? 'Completed'
                        : progress?.status === 'failed'
                          ? 'Failed'
                          : progress?.status === 'running'
                            ? `Running${progress?.currentTest ? `: ${progress.currentTest}` : ''}`
                            : 'Queued...'}
                    </span>
                    {progress?.score !== undefined && progress.score !== null && (
                      <span className="font-semibold text-ink">Score: {progress.score}</span>
                    )}
                  </div>
                  {progress?.error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                      {progress.error}
                    </div>
                  )}
                </div>
              ) : null}

              <div className="space-y-6">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-ink">Selected Agents</h4>
                  <div className="space-y-2">
                    {selectedAgents.map((agentId) => {
                      const agent = agents.find((a) => a.id === agentId);
                      return agent ? (
                        <div
                          key={agentId}
                          className="rounded-lg border border-outline/40 bg-surfaceAlt/60 p-3"
                        >
                          <p className="text-sm font-medium text-ink">{agent.name}</p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-ink">Selected Test Suites</h4>
                  <div className="space-y-2">
                    {selectedSuites.map((suiteId) => {
                      const suite = suites.find((s) => s.id === suiteId);
                      return suite ? (
                        <div
                          key={suiteId}
                          className="rounded-lg border border-outline/40 bg-surfaceAlt/60 p-3"
                        >
                          <p className="text-sm font-medium text-ink">{suite.name}</p>
                          <p className="mt-1 text-xs text-ink-muted">
                            ~{Math.round(suite.estimatedDurationSec / 60)} min • ~$
                            {suite.approximateCostUsd.toFixed(2)}
                          </p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between border-t border-outline/30 pt-4">
          <Button
            variant="ghost"
            onClick={() => {
              if (step > 1) {
                setStep(step - 1);
              } else {
                onClose();
              }
            }}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <div className="flex gap-3">
            {step < 3 ? (
              <Button
                onClick={() => {
                  if (step === 1 && selectedAgents.length > 0) {
                    setStep(2);
                  } else if (step === 2 && selectedSuites.length > 0) {
                    setStep(3);
                  }
                }}
                disabled={
                  (step === 1 && selectedAgents.length === 0) ||
                  (step === 2 && selectedSuites.length === 0)
                }
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleStart} disabled={isRunning}>
                {isRunning ? 'Starting...' : 'Start Test Run'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
