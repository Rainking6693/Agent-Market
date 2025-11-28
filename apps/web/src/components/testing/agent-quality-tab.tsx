'use client';

import { Play, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { testingApi, type TestRun } from '@/lib/api';

import { TestWizardModal } from './test-wizard-modal';

interface AgentQualityTabProps {
  agentId: string;
  agentName: string;
  trustScore: number;
  badges: string[];
}

export function AgentQualityTab({ agentId, agentName, trustScore, badges }: AgentQualityTabProps) {
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([]);
  const [suites, setSuites] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  useEffect(() => {
    testingApi
      .listRuns({ agentId })
      .then((data) => {
        setRuns(data.runs || []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch test runs:', error);
        setIsLoading(false);
      });
  }, [agentId]);

  useEffect(() => {
    if (isWizardOpen) {
      Promise.all([testingApi.listSuites()]).then(([suitesData]) => {
        setSuites(suitesData);
        setAgents([{ id: agentId, name: agentName }]);
      });
    }
  }, [isWizardOpen, agentId, agentName]);

  const getStatusIcon = (status: TestRun['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'RUNNING':
        return <Clock className="h-5 w-5 text-blue-400 animate-spin" />;
      case 'QUEUED':
        return <Clock className="h-5 w-5 text-amber-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-ink-muted" />;
    }
  };

  const getStatusColor = (status: TestRun['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-emerald-400';
      case 'FAILED':
        return 'text-red-400';
      case 'RUNNING':
        return 'text-blue-400';
      case 'QUEUED':
        return 'text-amber-400';
      default:
        return 'text-ink-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Trust Score Hero */}
      <Card className="border-brass/40 bg-gradient-to-br from-brass/10 to-brass/5">
        <CardHeader>
          <CardTitle className="text-2xl">Trust Score</CardTitle>
          <CardDescription>Overall quality rating for {agentName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-brass bg-surface text-3xl font-bold text-brass">
              {trustScore}
            </div>
            <div className="flex-1">
              <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-outline/30">
                <div
                  className="h-full bg-brass transition-all"
                  style={{ width: `${trustScore}%` }}
                />
              </div>
              {badges.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full bg-brass/20 px-3 py-1 text-xs font-medium text-brass capitalize"
                    >
                      {badge.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Run Test Card */}
      <Card>
        <CardHeader>
          <CardTitle>Run Test Suite</CardTitle>
          <CardDescription>Execute quality tests on this agent</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" size="lg" onClick={() => setIsWizardOpen(true)}>
            <Play className="mr-2 h-4 w-4" />
            Start Test Run
          </Button>
        </CardContent>
      </Card>

      <TestWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        agents={agents}
        suites={suites}
        onStartRun={async (agentIds, suiteIds) => {
          await testingApi.startRun({
            agentId: agentIds,
            suiteId: suiteIds,
          });
          // Refresh runs
          const data = await testingApi.listRuns({ agentId });
          setRuns(data.runs || []);
        }}
      />

      {/* Test History */}
      <Card>
        <CardHeader>
          <CardTitle>Test History</CardTitle>
          <CardDescription>Previous test runs and results</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-sm text-ink-muted">Loading test runs...</div>
          ) : runs.length === 0 ? (
            <div className="py-8 text-center text-sm text-ink-muted">
              No test runs yet. Start a test run to see results here.
            </div>
          ) : (
            <div className="space-y-3">
              {runs.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between rounded-lg border border-outline/40 bg-surfaceAlt/60 p-4"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(run.status)}
                    <div>
                      <h4 className="font-semibold text-ink">{run.suite.name}</h4>
                      <p className="text-xs text-ink-muted capitalize">{run.suite.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {run.score !== null && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink">Score: {run.score}</p>
                      </div>
                    )}
                    <span className={`text-sm font-medium ${getStatusColor(run.status)}`}>
                      {run.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

