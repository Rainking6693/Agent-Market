'use client';

import { ServiceAgreementWithVerifications, createAgentMarketClient } from '@agent-market/sdk';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

const OUTCOME_TYPES = ['LEAD', 'CONTENT', 'SUPPORT_TICKET', 'WORKFLOW', 'GENERIC'] as const;
const VERIFICATION_STATUSES = [
  'VERIFIED',
  'REJECTED',
  'PENDING',
  'EXPIRED',
] as const;

type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

interface OutcomeVerificationPanelProps {
  agentId: string;
  agreements: ServiceAgreementWithVerifications[];
}

export function OutcomeVerificationPanel({
  agentId,
  agreements,
}: OutcomeVerificationPanelProps) {
  const router = useRouter();
  const [createPayload, setCreatePayload] = useState({
    buyerId: '',
    workflowId: '',
    escrowId: '',
    outcomeType: 'GENERIC',
    targetDescription: 'Deliver drafted response',
  });
  const [selectedAgreementId, setSelectedAgreementId] = useState<string>(
    agreements[0]?.id ?? '',
  );
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('VERIFIED');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCreateAgreement = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        setError(null);
        await createAgentMarketClient().createServiceAgreement({
          agentId,
          buyerId: createPayload.buyerId || undefined,
          workflowId: createPayload.workflowId || undefined,
          escrowId: createPayload.escrowId || undefined,
          outcomeType: createPayload.outcomeType,
          targetDescription: createPayload.targetDescription,
        });
        setCreatePayload({
          buyerId: '',
          workflowId: '',
          escrowId: '',
          outcomeType: createPayload.outcomeType,
          targetDescription: createPayload.targetDescription,
        });
        router.refresh();
      } catch (err) {
        console.error(err);
        setError('Failed to create service agreement.');
      }
    });
  };

  const handleVerify = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedAgreementId) {
      setError('Select an agreement to update.');
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        await createAgentMarketClient().recordOutcomeVerification(selectedAgreementId, {
          status: verificationStatus,
          notes: verificationNotes || undefined,
        });
        setVerificationNotes('');
        router.refresh();
      } catch (err) {
        console.error(err);
        setError('Failed to record verification.');
      }
    });
  };

  return (
    <section className="glass-card space-y-6 p-6">
      <div>
        <h2 className="text-lg font-headline text-ink">Outcome-based Agreements</h2>
        <p className="text-sm text-ink-muted">
          Configure escrow-backed contracts and release funds only when KPIs are verified.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <form
        onSubmit={handleCreateAgreement}
        className="space-y-3 rounded-lg border border-outline p-4"
      >
        <h3 className="text-sm font-semibold text-ink">Create agreement</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            placeholder="Buyer user ID (optional)"
            className="rounded-lg border border-outline bg-surfaceAlt/60 px-3 py-2 text-sm text-ink focus:border-brass/40 focus:outline-none"
            value={createPayload.buyerId}
            onChange={(event) =>
              setCreatePayload((prev) => ({ ...prev, buyerId: event.target.value }))
            }
          />
          <input
            placeholder="Workflow ID (optional)"
            className="rounded-lg border border-outline bg-surfaceAlt/60 px-3 py-2 text-sm text-ink focus:border-brass/40 focus:outline-none"
            value={createPayload.workflowId}
            onChange={(event) =>
              setCreatePayload((prev) => ({ ...prev, workflowId: event.target.value }))
            }
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            placeholder="Escrow ID (optional)"
            className="rounded-lg border border-outline bg-surfaceAlt/60 px-3 py-2 text-sm text-ink focus:border-brass/40 focus:outline-none"
            value={createPayload.escrowId}
            onChange={(event) =>
              setCreatePayload((prev) => ({ ...prev, escrowId: event.target.value }))
            }
          />
          <select
            className="rounded-lg border border-outline bg-surfaceAlt/60 px-3 py-2 text-sm text-ink focus:border-brass/40 focus:outline-none"
            value={createPayload.outcomeType}
            onChange={(event) =>
              setCreatePayload((prev) => ({
                ...prev,
                outcomeType: event.target.value,
              }))
            }
          >
            {OUTCOME_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <textarea
          className="w-full rounded-lg border border-outline bg-surfaceAlt/60 px-3 py-2 text-sm text-ink focus:border-brass/40 focus:outline-none"
          value={createPayload.targetDescription}
          onChange={(event) =>
            setCreatePayload((prev) => ({ ...prev, targetDescription: event.target.value }))
          }
          rows={2}
        />
        <button
          type="submit"
          disabled={isPending}
          className="glass-button bg-accent px-4 py-2 text-xs font-semibold text-carrara disabled:cursor-not-allowed disabled:bg-outline/40"
        >
          {isPending ? 'Saving...' : 'Create agreement'}
        </button>
      </form>

      <form onSubmit={handleVerify} className="space-y-3 rounded-lg border border-outline p-4">
        <h3 className="text-sm font-semibold text-ink">Record verification</h3>
        <select
          className="rounded-lg border border-outline bg-surfaceAlt/60 px-3 py-2 text-sm text-ink focus:border-brass/40 focus:outline-none"
          value={selectedAgreementId}
          onChange={(event) => setSelectedAgreementId(event.target.value)}
        >
          <option value="">Select agreement</option>
          {agreements.map((agreement) => (
            <option key={agreement.id} value={agreement.id}>
              {agreement.status} • {agreement.outcomeType} ({agreement.targetDescription})
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-outline bg-surfaceAlt/60 px-3 py-2 text-sm text-ink focus:border-brass/40 focus:outline-none"
          value={verificationStatus}
          onChange={(event) => setVerificationStatus(event.target.value as VerificationStatus)}
        >
          {VERIFICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Verification notes"
          className="w-full rounded-lg border border-outline bg-surfaceAlt/60 px-3 py-2 text-sm text-ink focus:border-brass/40 focus:outline-none"
          value={verificationNotes}
          onChange={(event) => setVerificationNotes(event.target.value)}
          rows={2}
        />
        <button
          type="submit"
          disabled={isPending}
          className="glass-button bg-surfaceAlt px-4 py-2 text-xs font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Updating...' : 'Record verification'}
        </button>
      </form>

      <div className="rounded-lg border border-outline p-4">
        <h3 className="text-sm font-semibold text-ink">Recent agreements</h3>
        <ul className="mt-3 space-y-2 text-sm text-ink-muted">
          {agreements.length === 0 && (
            <li className="text-xs text-ink-muted">No agreements found.</li>
          )}
          {agreements.slice(0, 5).map((agreement) => {
            const latestVerification = agreement.verifications[0];
            return (
              <li key={agreement.id} className="rounded-lg bg-surfaceAlt/60 p-3">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-ink">{agreement.status}</span>
                  <span>{new Date(agreement.updatedAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-ink-muted">
                  {agreement.outcomeType} • {agreement.targetDescription}
                </p>
                {latestVerification && (
                  <p className="text-xs text-ink-muted">
                    Last verification: {latestVerification.status} (
                    {new Date(latestVerification.createdAt).toLocaleDateString()})
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
