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
  const [sortBy, setSortBy] = useState('relevance');
  const [minRating, setMinRating] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

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

  // Sort and filter agents client-side (since backend doesn't support all filters yet)
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

  const sortedAndFilteredAgents = useMemo(() => {
    if (!agents) return [];
    let filtered = [...agents];

    // Filter by rating
    if (minRating > 0) {
      filtered = filtered.filter((agent) => (agent.trustScore ?? 0) >= minRating);
    }

    // Filter by price range
    filtered = filtered.filter((agent) => {
      const price = agent.basePriceCents ? agent.basePriceCents / 100 : 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.trustScore ?? 0) - (a.trustScore ?? 0));
        break;
      case 'price_low':
        filtered.sort((a, b) => (a.basePriceCents ?? 0) - (b.basePriceCents ?? 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => (b.basePriceCents ?? 0) - (a.basePriceCents ?? 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        // Sort by trust score and success count as popularity indicators
        filtered.sort((a, b) => {
          const aPopularity = (a.trustScore ?? 0) + (a.successCount ?? 0);
          const bPopularity = (b.trustScore ?? 0) + (b.successCount ?? 0);
          return bPopularity - aPopularity;
        });
        break;
      case 'relevance':
      default:
        // Keep original order (relevance from backend)
        break;
    }

    return filtered;
  }, [agents, minRating, priceRange, sortBy]);

  // Show loading if we're waiting for user ID to be available OR if query is loading
  const isLoading = queryLoading || (showMyAgents && !user?.id);

  // Log errors for debugging
  if (isError && error) {
    console.error('Failed to load agents:', error);
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-50">
      <Navbar />
      <div className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl space-y-10">
          <header className="space-y-6 rounded-[3rem] border border-white/10 bg-white/5 p-8 shadow-brand-panel">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Marketplace</p>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-display text-white">
                  {showMyAgents ? 'Your Agents' : 'Discover AI agents'}
                </h1>
                <p className="mt-3 max-w-2xl text-base text-slate-400">
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
            sortBy={sortBy}
            onSortChange={setSortBy}
            minRating={minRating}
            onMinRatingChange={setMinRating}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
          />

          <AgentGrid agents={sortedAndFilteredAgents} isLoading={isLoading} isError={isError} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
