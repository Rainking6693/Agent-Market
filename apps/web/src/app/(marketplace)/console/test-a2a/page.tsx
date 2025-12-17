'use client';

import { useEffect, useState, useTransition } from 'react';

import { agentsApi, ap2Api, walletsApi } from '@/lib/api';
import type { Agent, Ap2NegotiationPayload } from '@/lib/api';

interface NegotiationResponse {
  id: string;
  status: string;
  requesterAgent?: { id: string; name: string };
  responderAgent?: { id: string; name: string };
  escrow?: { id: string; amount: string; status: string };
  serviceAgreement?: { id: string; status: string };
}

export default function TestA2APage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [requesterId, setRequesterId] = useState('');
  const [responderId, setResponderId] = useState('');
  const [service, setService] = useState('Generate a summary of the top 3 AI trends in 2024');
  const [budget, setBudget] = useState(25);
  const [price, setPrice] = useState(20);
  const [status, setStatus] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    agentsApi
      .list({ showAll: 'true' })
      .then((data) => {
        setAgents(data);
        if (data.length >= 2) {
          setRequesterId(data[0].id);
          setResponderId(data[1].id);
        }
      })
      .catch((error) => {
        console.error('Failed to load agents:', error);
        addLog('❌ Failed to load agents: ' + error.message);
      });
  }, []);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const runFullTest = () => {
    if (!requesterId || !responderId || requesterId === responderId) {
      addLog('❌ Please select two different agents');
      return;
    }

    setLogs([]);
    setStatus('Running...');

    startTransition(async () => {
      try {
        // Step 0: Ensure wallets are funded
        addLog('💰 Step 0: Checking and funding agent wallets...');
        
        try {
          const requesterWallet = await walletsApi.getAgentWallet(requesterId);
          const currentBalance = parseFloat(requesterWallet.balance || '0');
          addLog(`   Requester wallet balance: $${currentBalance.toFixed(2)}`);
          
          if (currentBalance < budget + 5) {
            const fundAmount = budget + 20; // Add extra buffer
            addLog(`   Funding requester wallet with $${fundAmount}...`);
            await walletsApi.fundWallet(requesterWallet.id, fundAmount, 'Test funding for A2A negotiation');
            addLog(`   ✅ Requester wallet funded to $${fundAmount}`);
          } else {
            addLog(`   ✅ Requester wallet has sufficient funds`);
          }
          
          const responderWallet = await walletsApi.getAgentWallet(responderId);
          const responderBalance = parseFloat(responderWallet.balance || '0');
          addLog(`   Responder wallet balance: $${responderBalance.toFixed(2)}`);
          
          if (responderBalance < 5) {
            addLog(`   Funding responder wallet with $10...`);
            await walletsApi.fundWallet(responderWallet.id, 10, 'Test funding for A2A negotiation');
            addLog(`   ✅ Responder wallet funded to $10`);
          } else {
            addLog(`   ✅ Responder wallet has sufficient funds`);
          }
        } catch (walletError) {
          addLog(`   ⚠️  Wallet check/funding failed: ${walletError instanceof Error ? walletError.message : 'Unknown error'}`);
          addLog(`   Continuing anyway - negotiation may fail if funds are insufficient`);
        }

        // Step 1: Initiate negotiation
        addLog('\n🤝 Step 1: Initiating negotiation...');
        addLog(`   Requester: ${agents.find((a) => a.id === requesterId)?.name || requesterId}`);
        addLog(`   Responder: ${agents.find((a) => a.id === responderId)?.name || responderId}`);
        addLog(`   Service: ${service}`);
        addLog(`   Budget: $${budget}`);

        const payload: Ap2NegotiationPayload = {
          requesterAgentId: requesterId,
          responderAgentId: responderId,
          requestedService: service,
          budget,
          requirements: {
            quality: 'high',
            deadline: '1 hour',
          },
          notes: 'Automated test negotiation',
        };

        const negotiation = (await ap2Api.requestService(payload)) as NegotiationResponse;

        addLog(`✅ Negotiation created: ${negotiation.id}`);
        addLog(`   Status: ${negotiation.status}`);

        // Step 2: Accept negotiation
        await new Promise((resolve) => setTimeout(resolve, 1000));
        addLog('\n✅ Step 2: Accepting negotiation...');
        addLog(`   Price: $${price}`);

        const accepted = await fetch('/api/v1/ap2/respond', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            negotiationId: negotiation.id,
            responderAgentId: responderId,
            status: 'ACCEPTED',
            price,
            estimatedDelivery: '30 minutes',
            notes: 'Accepted - will complete the task',
          }),
        }).then((r) => r.json());

        addLog(`✅ Negotiation accepted!`);
        if (accepted.escrow) {
          addLog(`   Escrow ID: ${accepted.escrow.id}`);
          addLog(`   Escrow Amount: $${accepted.escrow.amount}`);
          addLog(`   Escrow Status: ${accepted.escrow.status}`);
        }
        if (accepted.serviceAgreement) {
          addLog(`   Service Agreement: ${accepted.serviceAgreement.id}`);
        }

        // Step 3: Deliver service
        await new Promise((resolve) => setTimeout(resolve, 1000));
        addLog('\n📦 Step 3: Delivering service...');

        await fetch('/api/v1/ap2/deliver', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            negotiationId: negotiation.id,
            outcome:
              'Top 3 AI Trends in 2024:\n1. Agent-to-Agent Commerce\n2. Autonomous Workflows\n3. Outcome-Based Payments',
            evidence: {
              completed: true,
              result: 'Task completed successfully',
            },
          }),
        }).then((r) => r.json());

        addLog(`✅ Service delivered!`);

        // Step 4: Check final status
        await new Promise((resolve) => setTimeout(resolve, 1000));
        addLog('\n📊 Step 4: Checking final status...');

        const final = await fetch(`/api/v1/ap2/negotiations/${negotiation.id}`, {
          credentials: 'include',
        }).then((r) => r.json());

        addLog(`\n📊 Final Status:`);
        addLog(`   Negotiation ID: ${final.id}`);
        addLog(`   Status: ${final.status}`);
        if (final.escrow) {
          addLog(`   Escrow: $${final.escrow.amount} (${final.escrow.status})`);
        }
        if (final.serviceAgreement) {
          addLog(`   Service Agreement: ${final.serviceAgreement.status}`);
        }

        setStatus('✅ Test completed successfully!');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addLog(`\n❌ Test failed: ${errorMessage}`);
        if (error instanceof Error && 'response' in error) {
          try {
            const response = error.response as { json: () => Promise<unknown> };
            const body = await response.json().catch(() => ({}));
            addLog(`   Error details: ${JSON.stringify(body)}`);
          } catch {
            // Ignore JSON parse errors
          }
        }
        setStatus('❌ Test failed');
      }
    });
  };

  return (
    <div className="space-y-6">
      <header className="glass-card p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-brass/70">Testing</p>
        <h1 className="mt-2 text-3xl font-headline text-ink">Agent-to-Agent Negotiation Test</h1>
        <p className="mt-2 max-w-3xl text-sm text-ink-muted">
          Automatically test the full A2A flow: negotiation → acceptance → escrow → service delivery
        </p>
      </header>

      <div className="glass-card space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-ink">Requester Agent</span>
            <select
              value={requesterId}
              onChange={(e) => setRequesterId(e.target.value)}
              className="rounded-lg border border-outline bg-surfaceAlt/60 px-3 py-2 text-sm text-ink focus:border-brass/40 focus:outline-none"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-ink">Responder Agent</span>
            <select
              value={responderId}
              onChange={(e) => setResponderId(e.target.value)}
              className="rounded-lg border border-outline bg-surfaceAlt/60 px-3 py-2 text-sm text-ink focus:border-brass/40 focus:outline-none"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-ink">Service Request</span>
          <textarea
            value={service}
            onChange={(e) => setService(e.target.value)}
            rows={3}
            className="rounded-lg border border-outline bg-surfaceAlt/60 px-3 py-2 text-sm text-ink focus:border-brass/40 focus:outline-none"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-ink">Budget ($)</span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
              className="rounded-lg border border-outline bg-surfaceAlt/60 px-3 py-2 text-sm text-ink focus:border-brass/40 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-ink">Acceptance Price ($)</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              className="rounded-lg border border-outline bg-surfaceAlt/60 px-3 py-2 text-sm text-ink focus:border-brass/40 focus:outline-none"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={runFullTest}
          disabled={isPending || agents.length < 2}
          className="glass-button bg-accent px-6 py-3 text-carrara shadow-accent-glow hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-outline/40"
        >
          {isPending ? 'Running Test...' : '🚀 Run Full A2A Test'}
        </button>

        {status && (
          <div
            className={`rounded-lg border p-4 ${
              status.startsWith('✅')
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-red-500/40 bg-red-500/10 text-red-300'
            }`}
          >
            {status}
          </div>
        )}

        {logs.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-ink">Test Logs:</h3>
            <div className="max-h-96 overflow-y-auto rounded-lg border border-outline bg-surfaceAlt/60 p-4 font-mono text-xs text-ink">
              {logs.map((log, i) => (
                <div key={i} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

