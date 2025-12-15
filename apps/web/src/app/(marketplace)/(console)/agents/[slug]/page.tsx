'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Play, Settings as SettingsIcon, Wallet as WalletIcon } from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';

import { A2AOperationsPanel } from '@/components/dashboard/a2a-operations-panel';
import { A2ARoiSummary } from '@/components/dashboard/a2a-roi-summary';
import { A2ATransactionMonitor } from '@/components/dashboard/a2a-transaction-monitor';
import { AgentNetworkGraph } from '@/components/dashboard/agent-network-graph';
import { AP2Negotiations } from '@/components/dashboard/ap2-negotiations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { agentsApi } from '@/lib/api';

type TabType = 'overview' | 'mesh' | 'spend' | 'negotiations' | 'settings';

export default function AgentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    const { data: agent, isLoading } = useQuery({
        queryKey: ['agent', resolvedParams.slug],
        queryFn: () => agentsApi.getBySlug(resolvedParams.slug),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-sm text-ink-muted">Loading agent...</div>
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="space-y-4">
                <Link href="/agents" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
                    <ArrowLeft className="h-4 w-4" />
                    Back to agents
                </Link>
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-sm text-ink-muted">Agent not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const tabs: { id: TabType; label: string }[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'mesh', label: 'Mesh' },
        { id: 'spend', label: 'Spend & ROI' },
        { id: 'negotiations', label: 'Negotiations' },
        { id: 'settings', label: 'Settings' },
    ];

    return (
        <div className="space-y-6">
            {/* Back Navigation */}
            <Link href="/agents" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" />
                Back to agents
            </Link>

            {/* Agent Header */}
            <header className="space-y-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-headline text-ink">{agent.name}</h1>
                        <div className="mt-2 flex items-center gap-2">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${agent.status === 'APPROVED'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : agent.status === 'PENDING'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-gray-100 text-gray-700'
                                }`}>
                                {agent.status}
                            </span>
                            <span className="text-xs text-ink-muted">
                                Trust: {agent.trustScore}/100
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Play className="mr-2 h-4 w-4" />
                            Run
                        </Button>
                        <Button variant="outline" size="sm">
                            <SettingsIcon className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        <Button variant="outline" size="sm">
                            <WalletIcon className="mr-2 h-4 w-4" />
                            Funding
                        </Button>
                    </div>
                </div>

                <p className="text-sm text-ink-muted max-w-3xl">{agent.description}</p>

                {/* Budget Policy Summary */}
                <div className="rounded-lg border border-outline/40 bg-surfaceAlt/60 p-3 text-xs text-ink-muted">
                    <span className="font-medium">Budget Policy:</span> Monthly limit: $500 • Auto-reload: On • Approval mode: Auto
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="border-b border-outline/40">
                <nav className="flex gap-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`border-b-2 pb-3 text-sm font-medium transition ${activeTab === tab.id
                                    ? 'border-brass text-brass'
                                    : 'border-transparent text-ink-muted hover:text-ink'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Agent Health</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div>
                                        <p className="text-xs text-ink-muted">Success Rate</p>
                                        <p className="mt-1 text-2xl font-semibold text-ink">
                                            {agent.successCount > 0
                                                ? Math.round((agent.successCount / (agent.successCount + agent.failureCount)) * 100)
                                                : 0}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-ink-muted">Total Executions</p>
                                        <p className="mt-1 text-2xl font-semibold text-ink">
                                            {agent.successCount + agent.failureCount}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-ink-muted">Last Executed</p>
                                        <p className="mt-1 text-sm text-ink">
                                            {agent.lastExecutedAt
                                                ? new Date(agent.lastExecutedAt).toLocaleDateString()
                                                : 'Never'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Capabilities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {agent.categories?.map((cat) => (
                                        <span key={cat} className="rounded-full bg-brass/10 px-3 py-1 text-xs text-brass">
                                            {cat}
                                        </span>
                                    ))}
                                    {agent.tags?.map((tag) => (
                                        <span key={tag} className="rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'mesh' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Budget Policy</CardTitle>
                                    <Button variant="outline" size="sm">
                                        Edit Policy
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-ink-muted">Monthly Limit</p>
                                        <p className="mt-1 text-lg font-semibold text-ink">$500.00</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-ink-muted">Auto-reload</p>
                                        <p className="mt-1 text-lg font-semibold text-ink">Enabled</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-ink-muted">Approval Mode</p>
                                        <p className="mt-1 text-lg font-semibold text-ink">Auto</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-ink-muted">Remaining</p>
                                        <p className="mt-1 text-lg font-semibold text-ink">$500.00</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <AgentNetworkGraph agentId={agent.id} />
                        <A2AOperationsPanel agents={[agent]} />
                    </div>
                )}

                {activeTab === 'spend' && (
                    <div className="space-y-6">
                        <A2ARoiSummary agentId={agent.id} />
                        <A2ATransactionMonitor agentId={agent.id} />
                    </div>
                )}

                {activeTab === 'negotiations' && (
                    <div className="space-y-6">
                        <AP2Negotiations agentId={agent.id} />
                    </div>
                )}

                {activeTab === 'settings' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Agent Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-ink">Agent ID</label>
                                    <p className="mt-1 text-sm text-ink-muted font-mono">{agent.id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-ink">Slug</label>
                                    <p className="mt-1 text-sm text-ink-muted font-mono">{agent.slug}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-ink">Pricing Model</label>
                                    <p className="mt-1 text-sm text-ink-muted">{agent.pricingModel}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-ink">Visibility</label>
                                    <p className="mt-1 text-sm text-ink-muted capitalize">{agent.visibility?.toLowerCase()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
