'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { AgentFilters } from '@/components/agents/agent-filters';
import { AgentGrid } from '@/components/agents/agent-grid';
import { AgentSearch } from '@/components/agents/agent-search';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { useAgents } from '@/hooks/use-agents';
import { useAuth } from '@/hooks/use-auth';

export default function MarketplaceAgentsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [capability, setCapability] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showMyAgents, setShowMyAgents] = useState(false);

  // When showing "My Agents", also pass showAll to bypass default PUBLIC/APPROVED filter
  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      category: category || undefined,
      tag: capability || undefined,
      verifiedOnly,
      creatorId: showMyAgents && user?.id ? user.id : undefined,
      showAll: showMyAgents && user?.id ? 'true' : undefined,
    }),
    [search, category, capability, verifiedOnly, showMyAgents, user?.id],
  );

  // When showing "My Agents" but user.id isn't available yet, use empty filters to trigger loading state
  const effectiveFilters = useMemo(() => {
    // If showing all agents (not filtering by creator), use the filters as-is
    if (!showMyAgents) {
      return filters;
    }
    // If showing my agents and user.id is available, use the filters
    if (user?.id) {
      return filters;
    }
    // Otherwise, return null to indicate we're waiting for user data
    return null;
  }, [showMyAgents, user?.id, filters]);

  const { data: agents, isLoading: queryLoading, isError, error, refetch } = useAgents(
    effectiveFilters ?? undefined
  );

  // Show loading if we're waiting for user ID to be available OR if query is loading
  const isLoading = queryLoading || (showMyAgents && !user?.id);

  // Log errors for debugging
  if (isError && error) {
    console.error('Failed to load agents:', error);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-[#f7efe4]">
      <Navbar />
      <div className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl space-y-10">
          <header className="space-y-6 rounded-[3rem] border border-white/70 bg-white/80 p-8 shadow-brand-panel">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Marketplace</p>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-display text-foreground">
                  {showMyAgents ? 'Your Agents' : 'Discover AI agents'}
                </h1>
                <p className="mt-3 max-w-2xl text-base text-muted-foreground">
                  {showMyAgents
                    ? 'Manage and monitor your deployed agents'
                    : 'Search thousands of certified operators, orchestrators, and specialists. Connect wallets, set approvals, and let your automations shop for the skills they need.'}
                </p>
              </div>
              <div className="flex gap-3">
                {user && (
                  <Button
                    variant={showMyAgents ? 'default' : 'outline'}
                    onClick={() => setShowMyAgents(!showMyAgents)}
                  >
                    {showMyAgents ? 'Show All Agents' : 'Show My Agents'}
                  </Button>
                )}
                <Button variant="secondary" onClick={() => refetch()}>
                  Refresh
                </Button>
                {user && (
                  <Button asChild variant="default">
                    <Link href="/agents/new">+ Create Agent</Link>
                  </Button>
                )}
              </div>
            </div>
            <AgentSearch value={search} onChange={setSearch} />
          </header>

          <AgentFilters
            category={category}
            capability={capability}
            verifiedOnly={verifiedOnly}
            onCategoryChange={setCategory}
            onCapabilityChange={setCapability}
            onVerifiedToggle={setVerifiedOnly}
          />

          <AgentGrid agents={agents} isLoading={isLoading} isError={isError} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
