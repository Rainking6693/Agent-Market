'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

const statuses = ['', 'APPROVED', 'PENDING', 'DRAFT'];

export const AgentFilters = () => {
  const router = useRouter();
  const params = useSearchParams();

  const [status, setStatus] = useState(params.get('status') ?? '');
  const [category, setCategory] = useState(params.get('category') ?? '');
  const [tag, setTag] = useState(params.get('tag') ?? '');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = new URLSearchParams();
    if (status) query.set('status', status);
    if (category) query.set('category', category);
    if (tag) query.set('tag', tag);

    const queryString = query.toString();
    router.push(queryString ? `?${queryString}` : '?');
  };

  const handleReset = () => {
    setStatus('');
    setCategory('');
    setTag('');
    router.push('?');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card flex flex-col gap-4 p-6 text-xs uppercase tracking-wide text-ink-muted md:flex-row md:items-end"
    >
      <label className="flex flex-col gap-2 md:w-48">
        Status
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-outline bg-surfaceAlt/60 px-3 py-2 text-sm text-ink focus:border-brass/40 focus:outline-none"
        >
          {statuses.map((value) => (
            <option key={value || 'all'} value={value}>
              {value ? value.toLowerCase() : 'all'}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 md:w-48">
        Category
        <input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-lg border border-outline bg-surfaceAlt/60 px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-brass/40 focus:outline-none"
          placeholder="research"
        />
      </label>

      <label className="flex flex-col gap-2 md:w-48">
        Tag
        <input
          value={tag}
          onChange={(event) => setTag(event.target.value)}
          className="rounded-lg border border-outline bg-surfaceAlt/60 px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-brass/40 focus:outline-none"
          placeholder="beta"
        />
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          className="glass-button bg-accent px-4 py-2 text-carrara shadow-accent-glow hover:bg-accent-dark"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="glass-button border border-outline bg-transparent px-4 py-2 text-ink"
        >
          Reset
        </button>
      </div>
    </form>
  );
};
