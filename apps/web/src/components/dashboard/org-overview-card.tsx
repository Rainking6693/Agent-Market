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
        <p className="text-xs uppercase tracking-wide text-ink-muted font-body">Organization</p>
        <h3 className="mt-2 text-xl font-semibold text-ink font-body">{organization.name}</h3>
        <p className="text-xs text-ink-muted font-body">Slug: {organization.slug}</p>
      </div>
      <div className="rounded-2xl border border-outline bg-surfaceAlt/60 p-4">
        <p className="text-xs uppercase tracking-wide text-ink-muted font-body">GMV</p>
        <h3 className="mt-2 text-3xl font-semibold text-ink font-body">${grossMerchandiseVolume}</h3>
        <p className="text-xs text-ink-muted font-body">Cumulative agent volume</p>
      </div>
      <div className="rounded-2xl border border-outline bg-surfaceAlt/60 p-4">
        <p className="text-xs uppercase tracking-wide text-ink-muted font-body">Verified outcomes</p>
        <h3 className="mt-2 text-3xl font-semibold text-emerald-400 font-body">{verifiedOutcomes}</h3>
        <p className="text-xs text-ink-muted font-body">
          Avg cost {averageCostPerOutcome ? `$${averageCostPerOutcome}` : 'n/a'}
        </p>
      </div>
      <div className="rounded-2xl border border-outline bg-surfaceAlt/60 p-4">
        <p className="text-xs uppercase tracking-wide text-ink-muted font-body">Agents</p>
        <h3 className="mt-2 text-3xl font-semibold text-ink font-body">{totalAgents}</h3>
        <p className="text-xs text-ink-muted font-body">Connected to this org</p>
      </div>
    </section>
  );
}
