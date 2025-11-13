import { AgentQualityAnalytics } from '@agent-market/sdk';

interface QualityOverviewProps {
  analytics: AgentQualityAnalytics;
}

export function QualityOverview({ analytics }: QualityOverviewProps) {
  const { certification, evaluations, agreements, verifications, a2a, roi } = analytics;

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <div className="glass-card rounded-2xl p-6">
        <p className="text-xs uppercase tracking-wide text-ink-muted">Certification</p>
        <h3 className="mt-2 text-2xl font-semibold text-ink">
          {certification.status ?? 'Not started'}
        </h3>
        <p className="text-xs text-ink-muted">
          Updated{' '}
          {certification.updatedAt
            ? new Date(certification.updatedAt).toLocaleString()
            : 'never'}
        </p>
        <p className="text-xs text-ink-muted">Total reviews: {certification.total}</p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <p className="text-xs uppercase tracking-wide text-ink-muted">Evaluations</p>
        <h3 className="mt-2 text-2xl font-semibold text-ink">
          {evaluations.passRate}% pass rate
        </h3>
        <p className="text-xs text-ink-muted">
          {evaluations.passed}/{evaluations.total} scenarios passing
        </p>
        <p className="text-xs text-ink-muted">
          Avg latency:{' '}
          {evaluations.averageLatencyMs ? `${evaluations.averageLatencyMs} ms` : 'n/a'}
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <p className="text-xs uppercase tracking-wide text-ink-muted">Agreements</p>
        <h3 className="mt-2 text-2xl font-semibold text-ink">
          {agreements.active} active
        </h3>
        <p className="text-xs text-ink-muted">
          Completed {agreements.completed} • Disputed {agreements.disputed}
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <p className="text-xs uppercase tracking-wide text-ink-muted">A2A Spend</p>
        <h3 className="mt-2 text-2xl font-semibold text-ink">${a2a.totalSpend}</h3>
        <p className="text-xs text-ink-muted">{a2a.engagements} engagements logged</p>
        <p className="text-xs text-ink-muted">
          Verified outcomes {verifications.verified}/{verifications.verified + verifications.pending}
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <p className="text-xs uppercase tracking-wide text-ink-muted">ROI Insight</p>
        <h3 className="mt-2 text-2xl font-semibold text-ink">${roi.grossMerchandiseVolume} GMV</h3>
        <p className="text-xs text-ink-muted">
          Avg outcome cost:{' '}
          {roi.averageCostPerOutcome ? `$${roi.averageCostPerOutcome}` : 'n/a'}
        </p>
        <p className="text-xs text-ink-muted">
          Avg engagement cost:{' '}
          {roi.averageCostPerEngagement ? `$${roi.averageCostPerEngagement}` : 'n/a'}
        </p>
        <p className="text-xs text-ink-muted">
          Verified outcome rate: {roi.verifiedOutcomeRate}%
        </p>
      </div>
    </section>
  );
}
