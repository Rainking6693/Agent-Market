'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { CreditSummaryCard } from '@/components/dashboard/credit-summary-card';
import { OrgOverviewCard } from '@/components/dashboard/org-overview-card';
import { OrgRoiTimeseriesChart } from '@/components/dashboard/org-roi-timeseries-chart';
import { RecentActivityList } from '@/components/dashboard/recent-activity-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { agentsApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

import type { OrganizationRoiTimeseriesPoint } from '@agent-market/sdk';

const statusPills = [
    {
        label: 'API',
        state: 'Operational',
        tone: 'bg-emerald-500/15 text-emerald-300',
    },
    {
        label: 'Payments',
        state: 'Sandbox',
        tone: 'bg-amber-500/20 text-amber-200',
    },
];

export default function OverviewPage() {
    const user = useAuthStore((state) => state.user);


    const orgSlug = process.env.NEXT_PUBLIC_DEFAULT_ORG_SLUG ?? 'genesis';

    // TODO: Fetch organization data once organizationsApi is implemented
    // const { data: orgSummary } = useQuery({
    //     queryKey: ['org-roi', orgSlug],
    //     queryFn: () => organizationsApi.getOrganizationRoi(orgSlug),
    //     retry: false,
    // });

    // const { data: orgTimeseries = [] } = useQuery({
    //     queryKey: ['org-roi-timeseries', orgSlug],
    //     queryFn: () => organizationsApi.getOrganizationRoiTimeseries(orgSlug, 14),
    //     retry: false,
    // });

    // TODO: Implement getSubscription in billingApi
    // const { data: subscription } = useQuery({
    //     queryKey: ['billing-subscription'],
    //     queryFn: () => billingApi.getSubscription(),
    //     retry: false,
    // });
    const subscription = null;
    const orgSummary = null;
    const orgTimeseries: OrganizationRoiTimeseriesPoint[] = [];

    const { data: agents = [] } = useQuery({
        queryKey: ['agents', 'my-agents'],
        queryFn: () => agentsApi.list({ showAll: 'true', creatorId: user?.id }),
        enabled: !!user?.id,
    });

    // Get greeting based on time of day
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const firstName = user?.displayName?.split(' ')[0] || 'there';

    // Determine alerts/next steps
    const alerts = [];
    if (!subscription) {
        alerts.push({ type: 'warning', message: 'No billing plan configured', action: '/billing' });
    }
    if (agents.length === 0) {
        alerts.push({ type: 'info', message: 'Create your first agent to get started', action: '/agents/new' });
    }

    return (
        <div className="space-y-8">
            {/* Slim Header */}
            <header className="space-y-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-ink-muted">Overview</p>
                    <h1 className="mt-1 text-3xl font-headline text-ink">
                        {greeting}, {firstName}
                    </h1>
                    <p className="mt-1 text-sm text-ink-muted">
                        {orgSlug} • {statusPills.map(p => `${p.label}: ${p.state}`).join(' • ')}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/console/agents/new"
                        className="rounded-lg bg-brass px-4 py-2 text-sm font-medium text-white transition hover:bg-brass/90"
                    >
                        + Create Agent
                    </Link>
                    <Link
                        href="/workflows"
                        className="rounded-lg border border-outline/40 bg-surface px-4 py-2 text-sm font-medium text-ink transition hover:bg-surfaceAlt"
                    >
                        Launch Workflow
                    </Link>
                </div>
            </header>

            {/* KPI Row - Max 4 cards */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <CreditSummaryCard subscription={subscription} />
                {orgSummary && <OrgOverviewCard summary={orgSummary} />}
            </section>

            {/* Two-column: Alerts + Activity */}
            <section className="grid gap-6 lg:grid-cols-2">
                {/* Next Steps / Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {alerts.length > 0 ? (
                            <div className="space-y-3">
                                {alerts.map((alert, i) => (
                                    <div
                                        key={i}
                                        className={`rounded-lg border p-3 text-sm ${alert.type === 'warning'
                                            ? 'border-amber-200 bg-amber-50 text-amber-900'
                                            : 'border-sky-200 bg-sky-50 text-sky-900'
                                            }`}
                                    >
                                        <p>{alert.message}</p>
                                        <Link href={alert.action} className="mt-1 inline-block text-xs font-medium underline">
                                            Take action →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-ink-muted">All systems operational. No action needed.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentActivityList />
                    </CardContent>
                </Card>
            </section>

            {/* Single Chart Card with Toggle */}
            <section>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Performance</CardTitle>

                        </div>
                    </CardHeader>
                    <CardContent>
                        <OrgRoiTimeseriesChart points={orgTimeseries} />
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
