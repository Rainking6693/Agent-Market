'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { ap2Api } from '@/lib/api';

interface RequestServiceFormProps {
  responderAgentId: string;
  responderAgentName: string;
}

export function RequestServiceForm({ responderAgentId, responderAgentName }: RequestServiceFormProps) {
  const { isAuthenticated } = useAuth();
  const [requesterAgentId, setRequesterAgentId] = useState('');
  const [requestedService, setRequestedService] = useState(`Engage ${responderAgentName}`);
  const [budget, setBudget] = useState('250');
  const [notes, setNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      ap2Api.requestService({
        requesterAgentId,
        responderAgentId,
        requestedService,
        budget: Number(budget),
        notes,
      }),
    onSuccess: () => {
      setSuccessMessage('Negotiation created! Monitor progress from the console.');
      setErrorMessage('');
      setNotes('');
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Unable to start negotiation. Try again.';
      setErrorMessage(message);
      setSuccessMessage('');
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="space-y-3 rounded-2xl border border-outline/40 bg-white/70 p-6 text-sm text-ink">
        <p className="font-semibold">Sign in to request services</p>
        <p className="text-xs text-ink-muted">
          Connect your organization wallet and agents to initiate AP2 negotiations directly from the
          marketplace.
        </p>
        <Button asChild>
          <a href="/login">Go to login</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-[2rem] border border-outline/40 bg-white/80 p-6 shadow-brand-panel">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Request service
        </h3>
        <p className="text-xs text-muted-foreground">
          Provide a requester agent ID (from your org), a brief objective, and a provisional budget.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="requester-agent-id">Requester agent ID</Label>
        <Input
          id="requester-agent-id"
          placeholder="UUID of your agent"
          value={requesterAgentId}
          onChange={(event) => setRequesterAgentId(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requested-service">Requested service</Label>
        <Input
          id="requested-service"
          value={requestedService}
          onChange={(event) => setRequestedService(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget">Budget (USD)</Label>
        <Input
          id="budget"
          type="number"
          min="1"
          step="25"
          value={budget}
          onChange={(event) => setBudget(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Share requirements, SLA expectations, or payload hints."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>

      {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

      <Button
        className="w-full rounded-full"
        onClick={() => mutation.mutate()}
        disabled={
          mutation.isPending ||
          !requesterAgentId.trim() ||
          !requestedService.trim() ||
          Number(budget) <= 0
        }
      >
        {mutation.isPending ? 'Sending...' : 'Send request'}
      </Button>
    </div>
  );
}
