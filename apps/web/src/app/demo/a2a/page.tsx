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
    // Primary: demo-specific allowlisted endpoint
    const res = await fetch(`${API_BASE_URL}/demo/a2a/agents`);
    if (res.ok) {
      return (await res.json()) as A2AAgent[];
    }

    // Fallback: public agents endpoint, limited and filtered
    // This keeps the demo usable even if the demo module is misconfigured.
    // Backend will still enforce DEMO_AGENT_IDS on run, if configured.
    // eslint-disable-next-line no-console
    console.warn(
      'Falling back to /agents for demo A2A because /demo/a2a/agents returned',
      res.status,
    );

    const fallback = await fetch(
      `${API_BASE_URL}/agents?status=APPROVED&visibility=PUBLIC&limit=8`,
    );
    if (!fallback.ok) {
      throw new Error(
        `Failed to load demo agents (demo endpoint ${res.status}, fallback ${fallback.status})`,
      );
    }

    const data = (await fallback.json()) as A2AAgent[];
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
    } = params;

    // Step 1: Initialize demo run
    addLog('🚦 Step 1: Initializing demo run...');
    addLog(`   Requester: ${agents.find((a) => a.id === requesterId)?.name || requesterId}`);
    addLog(`   Responder: ${agents.find((a) => a.id === responderId)?.name || responderId}`);
    addLog(`   Service: ${service}`);
    addLog(`   Budget: $${budget}`);

    // Step 2: Create demo negotiation (session + synthetic A2A)
    addLog('\n🤝 Step 2: Creating demo negotiation...');
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

    addLog(`   ✅ Demo negotiation created: ${nextRunId}`);
    if (result.expiresAt) {
      addLog(`   Session expires at: ${new Date(result.expiresAt).toLocaleString()}`);
    }

    // Update URL with runId for sharing
    const url = new URL(window.location.href);
    url.searchParams.set('runId', nextRunId);
    window.history.pushState({}, '', url.toString());

    // Step 3: Fetch final status and logs from API
    addLog('\n📊 Step 3: Checking demo status...');
    try {
      const logsResponse = await fetch(`${API_BASE_URL}/demo/a2a/run/${nextRunId}/logs`);
      if (logsResponse.ok) {
        const data = await logsResponse.json();
        const statusText = data.status || 'UNKNOWN';

        if (Array.isArray(data.logs) && data.logs.length > 0) {
          addLog('\n🧾 Demo engine logs:');
          for (const line of data.logs as string[]) {
            addLog(`   ${line}`);
          }
        }

        addLog('\n📌 Final status:');
        addLog(`   ${statusText}`);

        setStatus(
          statusText === 'ACCEPTED' || statusText === 'COMPLETED'
            ? '✅ Demo completed successfully!'
            : `⚠️ Demo completed with status: ${statusText}`,
        );
      } else {
        addLog('⚠️ Unable to fetch demo status from API.');
        setStatus('✅ Demo completed (status fetch unavailable)');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch demo status:', error);
      addLog('⚠️ Error fetching demo status');
      setStatus('✅ Demo completed (status fetch error)');
    }
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
