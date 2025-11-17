'use client';

import { Activity, BarChart3, Target, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

import { SimpleLineChart } from '@/components/charts/simple-line-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentAnalytics, useAgentAnalyticsTimeseries } from '@/hooks/use-analytics';

interface CreatorAnalyticsDashboardProps {
  agentId: string;
  agentName: string;
}

export function CreatorAnalyticsDashboard({ agentId, agentName }: CreatorAnalyticsDashboardProps) {
  const { data: summary, isLoading: summaryLoading } = useAgentAnalytics(agentId);
  const { data: timeseries } = useAgentAnalyticsTimeseries(agentId, 30);

  const chartData = useMemo(() => {
    if (!timeseries) return [];
    return timeseries.map((point) => ({
      date: new Date(point.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      roi: point.dailyRoi,
      engagements: point.engagementCount,
      successRate: point.successRate,
    }));
  }, [timeseries]);

  if (summaryLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-48 animate-pulse rounded-lg bg-outline/20" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-outline/20" />
          ))}
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-2xl border border-outline/40 bg-surface/60 p-8 text-center">
        <p className="text-sm text-ink-muted">No analytics data available yet.</p>
      </div>
    );
  }

  const successRate = summary.successCount + summary.failureCount > 0 
    ? ((summary.successCount / (summary.successCount + summary.failureCount)) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-4xl font-headline text-ink">{agentName} Analytics</h1>
        <p className="text-sm text-ink-muted">30-day performance overview and revenue tracking</p>
      </header>

      {/* Key Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={TrendingUp}
          label="ROI"
          value={`${summary.roiPercentage.toFixed(1)}%`}
          hint="Return on investment"
          trend={summary.roiPercentage > 0 ? 'positive' : 'negative'}
        />
        <MetricCard
          icon={Target}
          label="Success Rate"
          value={`${successRate}%`}
          hint={`${summary.successCount} of ${summary.successCount + summary.failureCount} runs`}
          trend={parseFloat(successRate) > 90 ? 'positive' : 'neutral'}
        />
        <MetricCard
          icon={Activity}
          label="A2A Engagements"
          value={summary.a2aEngagements.toLocaleString()}
          hint="Agent-to-agent interactions"
          trend="neutral"
        />
        <MetricCard
          icon={BarChart3}
          label="Uptime"
          value={`${summary.uptime.toFixed(1)}%`}
          hint="Service availability"
          trend={summary.uptime > 95 ? 'positive' : 'warning'}
        />
      </div>

      {/* Revenue Section */}
      <Card className="border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle className="text-lg font-headline">Revenue & Earnings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Total Earned</p>
            <p className="text-3xl font-headline text-ink">
              ${(summary.totalEarned / 100).toFixed(2)}
            </p>
            <p className="text-xs text-ink-muted">From agent services</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Total Spent</p>
            <p className="text-3xl font-headline text-ink">
              ${(summary.totalSpent / 100).toFixed(2)}
            </p>
            <p className="text-xs text-ink-muted">On purchased services</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Net Position</p>
            <p className={`text-3xl font-headline ${
              summary.totalEarned - summary.totalSpent > 0 
                ? 'text-emerald-600' 
                : 'text-amber-600'
            }`}>
              ${((summary.totalEarned - summary.totalSpent) / 100).toFixed(2)}
            </p>
            <p className="text-xs text-ink-muted">Revenue minus costs</p>
          </div>
        </CardContent>
      </Card>

      {/* Trust & Certification */}
      <Card className="border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle className="text-lg font-headline">Trust & Certification</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Trust Score</p>
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-full border-4 border-brass/30 bg-gradient-to-br from-brass/10 to-transparent flex items-center justify-center">
                <span className="text-2xl font-headline text-ink">{(summary.trustScore / 20).toFixed(1)}</span>
              </div>
              <p className="text-sm text-ink-muted">Calculated from quality metrics,<br />success rates, and performance history.</p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Certification Status</p>
            <div className="space-y-2">
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                {summary.certificationStatus || 'Not Certified'}
              </div>
              <p className="text-xs text-ink-muted">Average response: {summary.averageResponseTime.toFixed(0)}ms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Series Chart */}
      {chartData.length > 0 && (
        <Card className="border-white/70 bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg font-headline">30-Day ROI Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart data={chartData} metric="roi" height={250} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  trend?: 'positive' | 'negative' | 'neutral' | 'warning';
}

function MetricCard({ icon: Icon, label, value, hint, trend }: MetricCardProps) {
  const trendColor = {
    positive: 'text-emerald-600',
    negative: 'text-red-600',
    neutral: 'text-brass/70',
    warning: 'text-amber-600',
  };

  return (
    <Card className="border-white/70 bg-white/80">
      <CardContent className="flex items-start justify-between p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">{label}</p>
          <p className="text-2xl font-headline text-ink">{value}</p>
          {hint && <p className="text-xs text-ink-muted">{hint}</p>}
        </div>
        <Icon className={`h-6 w-6 ${trendColor[trend || 'neutral']}`} />
      </CardContent>
    </Card>
  );
}
