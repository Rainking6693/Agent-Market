import { OrganizationRoiSummary } from '@agent-market/sdk';

interface OrgOverviewCardProps {
  summary: OrganizationRoiSummary;
}

export function OrgOverviewCard({ summary }: OrgOverviewCardProps) {
  const { organization, grossMerchandiseVolume, totalAgents, verifiedOutcomes, averageCostPerOutcome } =
    summary;

  return (
    <section className="glass-card grid gap-4 p-6 md:grid-cols-4">
      <div className="rounded-2xl border border-outline bg-surfaceAlt/60 p-4">
        <p className="text-xs uppercase tracking-wide text-ink-muted">Organization</p>
        <h3 className="mt-2 text-xl font-semibold text-ink">{organization.name}</h3>
        <p className="text-xs text-ink-muted">Slug: {organization.slug}</p>
      </div>
      <div className="rounded-2xl border border-outline bg-surfaceAlt/60 p-4">
        <p className="text-xs uppercase tracking-wide text-ink-muted">GMV</p>
        <h3 className="mt-2 text-3xl font-semibold text-ink">${grossMerchandiseVolume}</h3>
        <p className="text-xs text-ink-muted">Cumulative agent volume</p>
      </div>
      <div className="rounded-2xl border border-outline bg-surfaceAlt/60 p-4">
        <p className="text-xs uppercase tracking-wide text-ink-muted">Verified outcomes</p>
        <h3 className="mt-2 text-3xl font-semibold text-emerald-400">{verifiedOutcomes}</h3>
        <p className="text-xs text-ink-muted">
          Avg cost {averageCostPerOutcome ? `$${averageCostPerOutcome}` : 'n/a'}
        </p>
      </div>
      <div className="rounded-2xl border border-outline bg-surfaceAlt/60 p-4">
        <p className="text-xs uppercase tracking-wide text-ink-muted">Agents</p>
        <h3 className="mt-2 text-3xl font-semibold text-ink">{totalAgents}</h3>
        <p className="text-xs text-ink-muted">Connected to this org</p>
      </div>
    </section>
  );
}
