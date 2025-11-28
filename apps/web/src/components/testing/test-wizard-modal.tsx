'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  onStartRun: (agentIds: string[], suiteIds: string[]) => Promise<void>;
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

  if (!isOpen) return null;

  const handleStart = async () => {
    if (selectedAgents.length === 0 || selectedSuites.length === 0) {
      return;
    }

    setIsRunning(true);
    try {
      await onStartRun(selectedAgents, selectedSuites);
      onClose();
      // Reset state
      setStep(1);
      setSelectedAgents([]);
      setSelectedSuites([]);
    } catch (error) {
      console.error('Failed to start test run:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-4xl rounded-2xl border border-outline/40 bg-surface p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-ink-muted transition hover:bg-surfaceAlt"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-headline text-ink">Test & Evaluate Agents</h2>
          <p className="mt-2 text-sm text-ink-muted">Run quality tests on your agents</p>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-4">
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
                <div
                  className={`h-1 w-16 ${
                    step > s ? 'bg-brass' : 'bg-outline/30'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Agents */}
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
              <div className="grid gap-3 md:grid-cols-2">
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
                          : [...prev, agent.id]
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

        {/* Step 2: Select Test Suites */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-ink">Select Test Suites</h3>
            <p className="text-sm text-ink-muted">Choose which test suites to run</p>
            {isLoading ? (
              <div className="py-8 text-center text-sm text-ink-muted">Loading test suites...</div>
            ) : suites.length === 0 ? (
              <div className="py-8 text-center text-sm text-ink-muted">
                No test suites available.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
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
                        : [...prev, suite.id]
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

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-ink">Review & Confirm</h3>
            <div className="space-y-6">
              <div>
                <h4 className="mb-2 text-sm font-semibold text-ink">Selected Agents</h4>
                <div className="space-y-2">
                  {selectedAgents.map((agentId) => {
                    const agent = agents.find((a) => a.id === agentId);
                    return agent ? (
                      <div key={agentId} className="rounded-lg border border-outline/40 bg-surfaceAlt/60 p-3">
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
                      <div key={suiteId} className="rounded-lg border border-outline/40 bg-surfaceAlt/60 p-3">
                        <p className="text-sm font-medium text-ink">{suite.name}</p>
                        <p className="mt-1 text-xs text-ink-muted">
                          ~{Math.round(suite.estimatedDurationSec / 60)} min • ~${suite.approximateCostUsd.toFixed(2)}
                        </p>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
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

