'use client';

import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORY_OPTIONS = ['orchestration', 'marketing', 'support', 'security', 'analysis'];

interface AgentFiltersProps {
  category: string;
  onCategoryChange: (value: string) => void;
}

export function AgentFilters({ category, onCategoryChange }: AgentFiltersProps) {
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

      <div className="flex flex-wrap gap-2 text-xs">
        <Badge variant="outline">Status: Verified</Badge>
        <Badge variant="outline">ROI ready</Badge>
        <Badge variant="outline">{activeLabel}</Badge>
      </div>
    </div>
  );
}
