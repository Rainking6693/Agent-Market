"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { Footer } from '@/components/layout/footer';

function BetaGateContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const from = searchParams?.get('from') || '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('submitting');
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      xHandle: formData.get('xHandle'),
      agentName: formData.get('agentName'),
      agentDescription: formData.get('agentDescription'),
      endpointType: formData.get('endpointType'),
      docsLink: formData.get('docsLink'),
      notes: formData.get('notes'),
    };

    try {
      const response = await fetch('/api/provider-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit application');
      }

      setFormState('success');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Application submission error:', error);
      setFormState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--border-base)] bg-[var(--surface-base)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-4 group flex-shrink-0" aria-label="Swarm Sync homepage">
            <Image
              src="/logos/swarm-sync-purple.png"
              alt="Swarm Sync logo"
              width={180}
              height={60}
              priority
              className="h-10 w-auto md:h-11 transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 bg-black text-slate-50">
        {/* Hero Section */}
        <section className="relative px-6 md:px-12 pt-24 md:pt-32 pb-16">
          <div className="max-w-3xl mx-auto text-center">
            {/* Lock Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 mb-8">
              <svg className="w-10 h-10 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              <span className="block">Private Beta</span>
            </h1>

            {session ? (
              <>
                <p className="text-xl text-[#B7BED3] max-w-2xl mx-auto mb-8 leading-relaxed">
                  Hi {session.user?.name || 'there'}! Your account doesn't have beta access yet.
                </p>
                <p className="text-lg text-[#B7BED3] max-w-2xl mx-auto mb-12 leading-relaxed">
                  Apply below to join as an agent provider, or use an invite link if you have one.
                </p>
              </>
            ) : (
              <p className="text-xl text-[#B7BED3] max-w-2xl mx-auto mb-12 leading-relaxed">
                SwarmSync is currently in private beta. Apply to list your agent or use an invite link to get started.
              </p>
            )}

            {from && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-base)] text-sm text-[var(--text-muted)] mb-8">
                <span>Trying to access:</span>
                <code className="font-mono text-[var(--text-primary)]">{from}</code>
              </div>
            )}
          </div>
        </section>

        {/* Application Form Section */}
        <section className="relative px-6 md:px-12 py-16 border-t border-[var(--border-base)]">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Apply to List Your Agent
              </h2>
              <p className="text-[var(--text-secondary)]">
                Join the private beta as an agent provider. If approved, you'll receive an invite link to get started.
              </p>
            </div>

            {formState === 'success' ? (
              <div className="p-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-emerald-400 mb-2">Application Submitted!</h3>
                <p className="text-[var(--text-secondary)] mb-6">
                  If approved, you'll receive an invite link at the email you provided.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setFormState('idle')}
                    className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Submit another application
                  </button>
                  <Link
                    href="/"
                    className="text-sm font-semibold text-[var(--accent-primary)] hover:text-[var(--accent-primary)]/80 transition"
                  >
                    Back to home
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form fields - same as coming-soon page */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Your Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      defaultValue={session?.user?.name || ''}
                      className="w-full px-4 py-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-base)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      defaultValue={session?.user?.email || ''}
                      className="w-full px-4 py-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-base)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="xHandle" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    X Handle <span className="text-[var(--text-muted)] text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="xHandle"
                    name="xHandle"
                    className="w-full px-4 py-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-base)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                    placeholder="@janedoe"
                  />
                </div>

                <div className="pt-4 border-t border-[var(--border-base)]">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="agentName" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Agent Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="agentName"
                        name="agentName"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-base)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                        placeholder="e.g., Content Generator Agent"
                      />
                    </div>
                    <div>
                      <label htmlFor="endpointType" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Endpoint Type <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="endpointType"
                        name="endpointType"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-base)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                      >
                        <option value="">Select type</option>
                        <option value="public">Public API</option>
                        <option value="private">Private/Authenticated</option>
                        <option value="config">Config Upload</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="agentDescription" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      What does your agent do? <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="agentDescription"
                      name="agentDescription"
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-base)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent resize-none"
                      placeholder="Describe the capabilities and services your agent provides..."
                    />
                  </div>

                  <div>
                    <label htmlFor="docsLink" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Documentation Link <span className="text-[var(--text-muted)] text-xs">(optional)</span>
                    </label>
                    <input
                      type="url"
                      id="docsLink"
                      name="docsLink"
                      className="w-full px-4 py-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-base)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                      placeholder="https://docs.example.com/agent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Additional Notes <span className="text-[var(--text-muted)] text-xs">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-base)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent resize-none"
                    placeholder="Any additional information you'd like to share..."
                  />
                </div>

                {formState === 'error' && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-sm text-red-400">{errorMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formState === 'submitting'}
                  className="w-full px-6 py-4 rounded-lg bg-[var(--accent-primary)] text-white font-semibold hover:bg-[var(--accent-primary)]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formState === 'submitting' ? 'Submitting...' : 'Apply for Beta Access'}
                </button>

                <p className="text-xs text-center text-[var(--text-muted)]">
                  By submitting, you agree to our{' '}
                  <Link href="/terms" className="text-[var(--accent-primary)] hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-[var(--accent-primary)] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>
        </section>

        {/* Invite Link Instructions */}
        <section className="relative px-6 md:px-12 py-12 border-t border-[var(--border-base)] bg-[var(--surface-base)]">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Have an Invite Link?</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                If you received an invite link, it looks like this:
              </p>
              <code className="inline-block px-4 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-base)] font-mono text-sm text-[var(--accent-primary)]">
                https://swarmsync.ai/invite/your-token-here
              </code>
              <p className="text-sm text-[var(--text-muted)] mt-4">
                Simply paste it into your browser and follow the instructions to activate your beta access.
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-transparent border border-[var(--border-base)] text-[var(--text-primary)] font-semibold hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function BetaGatePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    }>
      <BetaGateContent />
    </Suspense>
  );
}
