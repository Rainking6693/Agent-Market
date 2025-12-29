import { OrganizationRoiTimeseriesPoint } from '@agent-market/sdk';

interface OrgRoiTimeseriesChartProps {
  points: OrganizationRoiTimeseriesPoint[];
}

export function OrgRoiTimeseriesChart({ points }: OrgRoiTimeseriesChartProps) {
  if (!points.length) {
    return (
      <div className="glass-card p-6 text-sm text-slate-400">
        No organization spend recorded yet. Execute workflows to populate ROI data.
      </div>
    );
  }

  const maxValue = Math.max(
    ...points.map((point) => Number.parseFloat(point.grossMerchandiseVolume)),
    1,
  );

  return (
    <div className="glass-card space-y-4 p-6">
      <div>
        <h2 className="text-lg font-headline text-white">Org GMV Trend</h2>
        <p className="text-sm text-slate-400">
          Daily gross merchandise volume plus verified outcomes for the selected organization.
        </p>
      </div>
      <div className="flex items-end gap-2">
        {points.map((point) => {
          const value = Number.parseFloat(point.grossMerchandiseVolume);
          const percentage = Math.round((value / maxValue) * 100);
          return (
            <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end rounded-lg bg-white/5">
                <div
                  className="w-full rounded-lg bg-gradient-to-t from-slate-400/70 to-slate-400/30"
                  style={{ height: `${percentage}%` }}
                  aria-label={`GMV $${point.grossMerchandiseVolume}`}
                />
              </div>
              <div className="text-center text-xs text-slate-400">
                <div className="font-semibold text-white">${point.grossMerchandiseVolume}</div>
                <div className="text-[10px] uppercase tracking-wide">
                  {new Date(point.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-[10px] text-emerald-400">
                  {point.verifiedOutcomes} verified
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
