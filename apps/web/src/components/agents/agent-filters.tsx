'use client';

import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORY_OPTIONS = ['orchestration', 'marketing', 'support', 'security', 'analysis'];

const CAPABILITY_OPTIONS = [
  'lead_generation',
  'workflow_orchestration',
  'research',
  'support',
  'qa',
  'security',
];

interface AgentFiltersProps {
  category: string;
  capability: string;
  verifiedOnly: boolean;
  onCategoryChange: (value: string) => void;
  onCapabilityChange: (value: string) => void;
  onVerifiedToggle: (value: boolean) => void;
}

export function AgentFilters({
  category,
  capability,
  verifiedOnly,
  onCategoryChange,
  onCapabilityChange,
  onVerifiedToggle,
}: AgentFiltersProps) {
  const activeLabel = useMemo(() => {
    if (!category) return 'All categories';
    return category.charAt(0).toUpperCase() + category.slice(1);
  }, [category]);

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-[2.5rem] border border-white/80 bg-white/80 p-4 shadow-brand-panel">
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[220px] rounded-full bg-white">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All</SelectItem>
          {CATEGORY_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[0.7rem] uppercase tracking-wide">
            Capabilities
          </span>
          <div className="flex flex-wrap gap-2">
            {CAPABILITY_OPTIONS.map((option) => {
              const isActive = capability === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onCapabilityChange(isActive ? '' : option)}
                  className={`rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide transition ${
                    isActive
                      ? 'bg-foreground text-background'
                      : 'border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {option.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onVerifiedToggle(!verifiedOnly)}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide transition ${
            verifiedOnly
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-current" />
          Verified agents only
        </button>
        <Badge variant="outline">{activeLabel}</Badge>
        {capability && <Badge variant="outline">{capability.replace(/_/g, ' ')}</Badge>}
      </div>
    </div>
  );
}
