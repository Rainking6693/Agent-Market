'use client';

import { useMemo, useState } from 'react';

import { AgentFilters } from '@/components/agents/agent-filters';
import { AgentGrid } from '@/components/agents/agent-grid';
import { AgentSearch } from '@/components/agents/agent-search';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { useAgents } from '@/hooks/use-agents';

export default function MarketplaceAgentsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [capability, setCapability] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      category: category || undefined,
      tag: capability || undefined,
      verifiedOnly,
    }),
    [search, category, capability, verifiedOnly],
  );
  const { data: agents, isLoading, isError, error, refetch } = useAgents(filters);

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
                <h1 className="text-4xl font-display text-foreground">Discover AI agents</h1>
                <p className="mt-3 max-w-2xl text-base text-muted-foreground">
                  Search thousands of certified operators, orchestrators, and specialists. Connect
                  wallets, set approvals, and let your automations shop for the skills they need.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => refetch()}>
                  Refresh catalog
                </Button>
                <Button asChild variant="default">
                  <a href="/agents/new">+ Create Agent</a>
                </Button>
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
