'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import { TestWizardModal } from '@/components/testing/test-wizard-modal';
import { testingApi, agentsApi, type TestSuite, type Agent } from '@/lib/api';

export function QuickActions() {
  const [isTestWizardOpen, setIsTestWizardOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isTestWizardOpen) {
      setIsLoading(true);
      Promise.all([agentsApi.list(), testingApi.listSuites()])
        .then(([agentsData, suitesData]) => {
          setAgents(agentsData);
          setSuites(suitesData);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Failed to load data for test wizard:', error);
          setIsLoading(false);
        });
    }
  }, [isTestWizardOpen]);

  const actions = [
    { label: 'Deploy a new agent', href: '/agents/new' },
    { label: 'Upload agent config', href: '/agents/new?import=true' },
    { label: 'Launch orchestration studio', href: '/workflows' },
    {
      label: 'Test & evaluate agents',
      onClick: () => setIsTestWizardOpen(true),
    },
    { label: 'Invite collaborator', href: '/agents' },
    { label: 'Review outcomes & quality', href: '/quality' },
  ];

  return (
    <>
      <div className="glass-card space-y-4 p-6 text-sm text-ink">
        <div>
          <h2 className="text-sm font-headline uppercase tracking-wide text-ink-muted">
            Quick actions
          </h2>
          <p className="text-xs text-ink-muted">Keep your marketplace humming.</p>
        </div>
        <div className="space-y-3">
          {actions.map((action) => {
            if (action.onClick) {
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex w-full items-center justify-between rounded-lg border border-outline/60 px-4 py-3 text-left text-ink transition hover:border-brass/40"
                >
                  <span>{action.label}</span>
                  <span className="text-xs text-ink-muted">→</span>
                </button>
              );
            }
            return (
              <Link
                key={action.label}
                href={action.href!}
                className="flex items-center justify-between rounded-lg border border-outline/60 px-4 py-3 text-ink transition hover:border-brass/40"
              >
                <span>{action.label}</span>
                <span className="text-xs text-ink-muted">→</span>
              </Link>
            );
          })}
        </div>
      </div>

      <TestWizardModal
        isOpen={isTestWizardOpen}
        onClose={() => setIsTestWizardOpen(false)}
        agents={agents}
        suites={suites}
        isLoading={isLoading}
        onStartRun={async (agentIds, suiteIds) => {
          await testingApi.startRun({
            agentId: agentIds,
            suiteId: suiteIds,
          });
        }}
      />
    </>
  );
}
