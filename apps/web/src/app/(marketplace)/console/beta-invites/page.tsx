"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';

export default function BetaInvitesPage() {
  const [email, setEmail] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('30');
  const [maxUses, setMaxUses] = useState('1');
  const [notes, setNotes] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateInvite = async () => {
    setLoading(true);
    setError('');
    setGeneratedUrl('');

    try {
      const response = await fetch('/api/beta-invites/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || undefined,
          expiresInDays: expiresInDays ? parseInt(expiresInDays) : undefined,
          maxUses: maxUses ? parseInt(maxUses) : 1,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invite');
      }

      setGeneratedUrl(data.invite.url);

      // Reset form
      setEmail('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Beta Invite Generator</h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Create invite links to grant beta access to users
      </p>

      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Leave blank for generic invite"
              className="w-full px-4 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-base)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Optional: specify the email address this invite is for
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Expires in (days)
              </label>
              <input
                type="number"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                placeholder="30"
                min="1"
                max="365"
                className="w-full px-4 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-base)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Max Uses
              </label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="1"
                min="1"
                max="100"
                className="w-full px-4 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-base)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes about this invite..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-base)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-none"
            />
          </div>

          <button
            onClick={generateInvite}
            disabled={loading}
            className="w-full px-6 py-3 rounded-lg bg-[var(--accent-primary)] text-white font-semibold hover:bg-[var(--accent-primary)]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Invite Link'}
          </button>

          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>
      </Card>

      {generatedUrl && (
        <Card className="p-6 bg-emerald-500/10 border-emerald-500/30">
          <h2 className="text-xl font-bold text-emerald-400 mb-4">Invite Link Generated!</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Invite URL:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={generatedUrl}
                readOnly
                className="flex-1 px-4 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-base)] text-[var(--text-primary)] font-mono text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white font-semibold hover:bg-[var(--accent-primary)]/90 transition"
              >
                Copy
              </button>
            </div>
          </div>

          <p className="text-sm text-[var(--text-secondary)]">
            Share this link with the user to grant them beta access. They'll be prompted to sign in, then their account will be upgraded.
          </p>
        </Card>
      )}
    </div>
  );
}
