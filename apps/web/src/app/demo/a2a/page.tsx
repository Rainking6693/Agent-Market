'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';

// Force dynamic rendering - this page requires client-side data fetching
export const dynamic = 'force-dynamic';

interface DemoAgent {
  id: string;
  name: string;
  description: string;
}

export default function DemoA2APage() {
  const searchParams = useSearchParams();
  const runId = searchParams.get('runId');
  
  const [agents, setAgents] = useState<DemoAgent[]>([]);
  const [requesterId, setRequesterId] = useState('');
  const [responderId, setResponderId] = useState('');
  const [service, setService] = useState('Generate a summary of the top 3 AI trends in 2024');
  const [budget, setBudget] = useState(25);
  const [price, setPrice] = useState(20);
  const [status, setStatus] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [currentRunId, setCurrentRunId] = useState<string | null>(runId);

  useEffect(() => {
    // Load demo agents from API
    fetch('/api/v1/demo/a2a/agents')
      .then((res) => res.json())
      .then((data: DemoAgent[]) => {
        setAgents(data);
        if (data.length >= 2) {
          setRequesterId(data[0].id);
          setResponderId(data[1].id);
        }
      })
      .catch((error) => {
        console.error('Failed to load demo agents:', error);
        addLog('⚠️ Failed to load demo agents');
      });

    // If runId is provided, load logs
    if (runId) {
      loadRunLogs(runId);
    }
  }, [runId]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const loadRunLogs = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/demo/a2a/run/${id}/logs`);
      const data = await response.json();
      
      setLogs(data.logs || []);
      setStatus(data.status || 'Unknown');
    } catch (error) {
      console.error('Failed to load run logs:', error);
    }
  };

  const runFullTest = () => {
    if (!requesterId || !responderId || requesterId === responderId) {
      addLog('❌ Please select two different agents');
      return;
    }

    setLogs([]);
    setStatus('Running...');
    setCurrentRunId(null);

    startTransition(async () => {
      try {
        addLog('🚀 Starting demo A2A negotiation...');
        addLog(`   Requester: ${agents.find((a) => a.id === requesterId)?.name || requesterId}`);
        addLog(`   Responder: ${agents.find((a) => a.id === responderId)?.name || responderId}`);
        addLog(`   Service: ${service}`);
        addLog(`   Budget: $${budget}`);

        // Call demo API
        const response = await fetch('/api/v1/demo/a2a/run', {
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
          const error = await response.json();
          throw new Error(error.message || 'Failed to run demo');
        }

        const result = await response.json();
        setCurrentRunId(result.runId);

        addLog(`✅ Demo run started: ${result.runId}`);
        addLog(`   Expires at: ${new Date(result.expiresAt).toLocaleString()}`);

        // Update URL with runId for sharing
        const url = new URL(window.location.href);
        url.searchParams.set('runId', result.runId);
        window.history.pushState({}, '', url.toString());

        // Poll for logs
        pollRunLogs(result.runId);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addLog(`\n❌ Demo failed: ${errorMessage}`);
        setStatus('❌ Demo failed');
      }
    });
  };

  const pollRunLogs = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/v1/demo/a2a/run/${id}/logs`);
        const data = await response.json();
        
        setLogs(data.logs || []);
        setStatus(data.status || 'Running');

        // Stop polling if completed
        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          clearInterval(interval);
          setStatus(data.status === 'COMPLETED' ? '✅ Demo completed!' : '❌ Demo failed');
        }
      } catch (error) {
        console.error('Failed to poll logs:', error);
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(interval), 5 * 60 * 1000);
  };

  const shareLink = currentRunId 
    ? `${window.location.origin}/demo/a2a?runId=${currentRunId}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">🚀 Live A2A Transaction Demo</h1>
          <p className="text-lg text-gray-600">
            Watch two AI agents negotiate, create escrow, and complete a transaction — no signup required
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-lg p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-700">Requester Agent</span>
              <select
                value={requesterId}
                onChange={(e) => setRequesterId(e.target.value)}
                disabled={agents.length === 0}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brass focus:outline-none disabled:bg-gray-100"
              >
                {agents.length === 0 ? (
                  <option>Loading agents...</option>
                ) : (
                  agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-700">Responder Agent</span>
              <select
                value={responderId}
                onChange={(e) => setResponderId(e.target.value)}
                disabled={agents.length === 0}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brass focus:outline-none disabled:bg-gray-100"
              >
                {agents.length === 0 ? (
                  <option>Loading agents...</option>
                ) : (
                  agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))
                )}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-700">Service Request</span>
            <textarea
              value={service}
              onChange={(e) => setService(e.target.value)}
              rows={3}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brass focus:outline-none"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-700">Budget ($)</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brass focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-700">Acceptance Price ($)</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brass focus:outline-none"
              />
            </label>
          </div>

          <Button
            type="button"
            onClick={runFullTest}
            disabled={isPending || agents.length < 2}
            className="w-full bg-brass text-white hover:bg-brass/90 text-lg py-6"
            size="lg"
          >
            {isPending ? 'Running Demo...' : '🚀 Run Live Demo'}
          </Button>

          {shareLink && (
            <div className="rounded-lg border border-brass/20 bg-brass/5 p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">Share this demo:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    alert('Link copied to clipboard!');
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}

          {status && (
            <div
              className={`rounded-lg border p-4 ${
                status.includes('✅')
                  ? 'border-emerald-500/40 bg-emerald-50 text-emerald-800'
                  : 'border-red-500/40 bg-red-50 text-red-800'
              }`}
            >
              {status}
            </div>
          )}

          {logs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Demo Logs:</h3>
              <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-xs text-gray-800">
                {logs.map((log, i) => (
                  <div key={i} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
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

