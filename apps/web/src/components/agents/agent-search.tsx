'use client';

import { Search } from 'lucide-react';
import { ChangeEvent } from 'react';

import { Input } from '@/components/ui/input';

interface AgentSearchProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}

export function AgentSearch({ value, onChange, placeholder = 'Search agents, workflows, or tags' }: AgentSearchProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-11 pr-5 focus:ring-2 focus:ring-brass focus:ring-offset-2"
        type="search"
        aria-label="Search agents, workflows, or tags"
      />
    </div>
  );
}
