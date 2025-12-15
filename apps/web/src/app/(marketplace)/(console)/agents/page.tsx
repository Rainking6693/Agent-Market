'use client';

import { useQuery } from '@tanstack/react-query';
import { Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { FeaturedAgents } from '@/components/dashboard/featured-agents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { agentsApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

export default function AgentsPage() {
    const user = useAuthStore((state) => state.user);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMarketplace, setShowMarketplace] = useState(false);

    const { data: myAgents = [], isLoading } = useQuery({
        queryKey: ['agents', 'my-agents', user?.id],
        queryFn: () => agentsApi.list({ showAll: 'true', creatorId: user?.id }),
        enabled: !!user?.id,
    });

    const { data: marketplaceAgents = [] } = useQuery({
        queryKey: ['agents', 'marketplace'],
        queryFn: () => agentsApi.list({ status: 'APPROVED', visibility: 'PUBLIC' }),
        enabled: showMarketplace,
    });

    const filteredAgents = myAgents.filter((agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-ink-muted">Build</p>
                    <h1 className="mt-1 text-3xl font-headline text-ink">Agents</h1>
                    <p className="mt-1 text-sm text-ink-muted">
                        Manage your agents and discover new ones from the marketplace
                    </p>
                </div>
                <Link
                    href="/agents/new"
                    className="rounded-lg bg-brass px-4 py-2 text-sm font-medium text-white transition hover:bg-brass/90"
                >
                    + Create Agent
                </Link>
            </header>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <input
                        type="text"
                        placeholder="Search agents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-outline/40 bg-surface px-10 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-brass focus:outline-none"
                    />
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-outline/40 bg-surface px-4 py-2 text-sm text-ink transition hover:bg-surfaceAlt">
                    <Filter className="h-4 w-4" />
                    Filters
                </button>
            </div>

            {/* My Agents List */}
            <section>
                <h2 className="mb-4 text-lg font-semibold text-ink">My Agents</h2>
                {isLoading ? (
                    <div className="text-center py-12 text-sm text-ink-muted">Loading agents...</div>
                ) : filteredAgents.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-sm text-ink-muted">
                                {searchQuery ? 'No agents match your search.' : 'You haven\'t created any agents yet.'}
                            </p>
                            {!searchQuery && (
                                <Link
                                    href="/agents/new"
                                    className="mt-4 inline-block rounded-lg bg-brass px-4 py-2 text-sm font-medium text-white transition hover:bg-brass/90"
                                >
                                    Create your first agent
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredAgents.map((agent) => (
                            <Link
                                key={agent.id}
                                href={`/agents/${agent.id}`}
                                className="group"
                            >
                                <Card className="transition hover:border-brass/40">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-base group-hover:text-brass transition">
                                                    {agent.name}
                                                </CardTitle>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${agent.status === 'APPROVED'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : agent.status === 'PENDING'
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {agent.status}
                                                    </span>
                                                    {agent.verificationStatus === 'VERIFIED' && (
                                                        <span className="inline-block rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700">
                                                            Verified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-ink-muted line-clamp-2">{agent.description}</p>
                                        <div className="mt-3 flex items-center gap-4 text-xs text-ink-muted">
                                            <span>Trust: {agent.trustScore}/100</span>
                                            <span>•</span>
                                            <span className="capitalize">{agent.visibility?.toLowerCase()}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Marketplace Section (Collapsed) */}
            <section>
                <button
                    onClick={() => setShowMarketplace(!showMarketplace)}
                    className="flex w-full items-center justify-between rounded-lg border border-outline/40 bg-surface p-4 text-left transition hover:bg-surfaceAlt"
                >
                    <div>
                        <h2 className="text-lg font-semibold text-ink">Marketplace</h2>
                        <p className="text-xs text-ink-muted">Discover verified agents from the community</p>
                    </div>
                    <span className="text-ink-muted">{showMarketplace ? '−' : '+'}</span>
                </button>

                {showMarketplace && (
                    <div className="mt-4">
                        <FeaturedAgents agents={marketplaceAgents} />
                    </div>
                )}
            </section>
        </div>
    );
}
