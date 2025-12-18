'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { A2ARunner, type A2AAgent } from '@/components/demo/a2a-runner';
import { API_BASE_URL } from '@/lib/api';

interface DemoRunParams {
  agents: A2AAgent[];
  requesterId: string;
  responderId: string;
  service: string;
  budget: number;
  price: number;
  addLog: (message: string) => void;
  setStatus: (status: string) => void;
  setRunId?: (runId: string | null) => void;
  setLogs: (logs: string[]) => void;
}

interface DemoResumeHelpers {
  setLogs: (logs: string[]) => void;
  setStatus: (status: string) => void;
  addLog: (message: string) => void;
}

export default function DemoA2APage() {
  const searchParams = useSearchParams();
  const runId = searchParams.get('runId');

  const fetchDemoAgents = async (): Promise<A2AAgent[]> => {
    const res = await fetch(`${API_BASE_URL}/demo/a2a/agents`);
    if (!res.ok) {
      throw new Error('Failed to load demo agents');
    }
    const data = (await res.json()) as A2AAgent[];
    return data;
  };

  const resumeDemoRun = async (id: string, helpers: DemoResumeHelpers) => {
    try {
      const response = await fetch(`${API_BASE_URL}/demo/a2a/run/${id}/logs`);
      const data = await response.json();

      helpers.setLogs(data.logs || []);
      helpers.setStatus(data.status || 'Unknown');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load run logs:', error);
      helpers.addLog('⚠️ Failed to load run logs');
    }
  };

  const runDemo = async (params: DemoRunParams) => {
    const {
      agents,
      requesterId,
      responderId,
      service,
      budget,
      price,
      addLog,
      setStatus,
      setRunId,
      setLogs,
    } = params;

    addLog('🚀 Starting demo A2A negotiation...');
    addLog(`   Requester: ${agents.find((a) => a.id === requesterId)?.name || requesterId}`);
    addLog(`   Responder: ${agents.find((a) => a.id === responderId)?.name || responderId}`);
    addLog(`   Service: ${service}`);
    addLog(`   Budget: $${budget}`);

    const response = await fetch(`${API_BASE_URL}/demo/a2a/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requesterAgentId: requesterId,
        responderAgentId: responderId,
        service,
        budget,
        price,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message =
        (errorBody && typeof (errorBody as { message?: string }).message === 'string' &&
          (errorBody as { message?: string }).message) ||
        'Failed to run demo';
      throw new Error(message);
    }

    const result = await response.json();
    const nextRunId = String(result.runId);

    if (setRunId) {
      setRunId(nextRunId);
    }

    addLog(`✅ Demo run started: ${nextRunId}`);
    if (result.expiresAt) {
      addLog(`   Expires at: ${new Date(result.expiresAt).toLocaleString()}`);
    }

    // Update URL with runId for sharing
    const url = new URL(window.location.href);
    url.searchParams.set('runId', nextRunId);
    window.history.pushState({}, '', url.toString());

    // Poll for logs
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/demo/a2a/run/${nextRunId}/logs`);
        const data = await response.json();

        setLogs(data.logs || []);
        setStatus(data.status || 'Running');

        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          clearInterval(interval);
          setStatus(
            data.status === 'COMPLETED' ? '✅ Demo completed!' : '⚠️ Demo failed',
          );
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to poll logs:', error);
        clearInterval(interval);
      }
    }, 2000);

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(interval), 5 * 60 * 1000);
  };

  const buildShareLink = (id: string) => `${window.location.origin}/demo/a2a?runId=${id}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Live Agent-to-Agent Demo
          </h1>
          <p className="text-lg text-gray-600">
            Watch two agents negotiate and execute a service request in real time — no
            signup required.
          </p>
        </div>

        <div className="rounded-3xl border border-brass/20 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
          <A2ARunner
            mode="demo"
            initialRunId={runId}
            fetchAgents={fetchDemoAgents}
            onRun={runDemo}
            onResumeRun={resumeDemoRun}
            enableShareLink
            buildShareLink={buildShareLink}
          />
        </div>

        <div className="text-center space-y-2">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 underline">
            ← Back to Home
          </Link>
          <p className="text-xs text-gray-500">
            Demo sessions expire after 1 hour. No signup required.
          </p>
        </div>
      </div>
    </div>
  );
}
