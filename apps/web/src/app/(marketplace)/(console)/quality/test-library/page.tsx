'use client';

import { Search, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';

import { TestWizardModal } from '@/components/testing/test-wizard-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { testingApi, agentsApi, type TestSuite, type Agent } from '@/lib/api';

export default function TestLibraryPage() {
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [filteredSuites, setFilteredSuites] = useState<TestSuite[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isWizardLoading, setIsWizardLoading] = useState(false);

  useEffect(() => {
    testingApi
      .listSuites()
      .then((data) => {
        setSuites(data);
        setFilteredSuites(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch test suites:', error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isWizardOpen) {
      setIsWizardLoading(true);
      agentsApi
        .list({ showAll: 'true' })
        .then((data) => {
          setAgents(data);
          setIsWizardLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch agents:', error);
          setIsWizardLoading(false);
        });
    }
  }, [isWizardOpen]);

  useEffect(() => {
    let filtered = suites;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((suite) => suite.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (suite) =>
          suite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          suite.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSuites(filtered);
  }, [suites, selectedCategory, searchQuery]);

  const categories = ['all', 'smoke', 'reliability', 'reasoning', 'security', 'domain'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline text-ink">Test Library</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Browse and run quality test suites on your agents
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search test suites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-outline/40 bg-surface px-10 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-brass focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-ink-muted" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-outline/40 bg-surface px-3 py-2 text-sm text-ink focus:border-brass focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Test Suites Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-ink-muted">Loading test suites...</div>
      ) : filteredSuites.length === 0 ? (
        <div className="py-12 text-center text-sm text-ink-muted">
          No test suites found. Try adjusting your filters.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuites.map((suite) => (
            <Card
              key={suite.id}
              className={`transition hover:border-brass/40 ${
                suite.isRecommended ? 'border-brass/40 bg-brass/5' : 'border-outline/40'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{suite.name}</CardTitle>
                    {suite.isRecommended && (
                      <span className="mt-2 inline-block rounded-full bg-brass/20 px-2 py-0.5 text-xs text-brass">
                        Recommended
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{suite.description}</CardDescription>
                <div className="mb-4 flex flex-wrap gap-2 text-xs text-ink-muted">
                  <span>~{Math.round(suite.estimatedDurationSec / 60)} min</span>
                  <span>•</span>
                  <span>~${suite.approximateCostUsd.toFixed(2)}</span>
                  <span>•</span>
                  <span className="capitalize">{suite.category}</span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setSelectedSuite(suite.id);
                    setIsWizardOpen(true);
                  }}
                >
                  Run on agent...
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TestWizardModal
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          setSelectedSuite(null);
        }}
        agents={agents}
        suites={suites}
        isLoading={isWizardLoading}
        onStartRun={async (agentIds, suiteIds) => {
          const finalSuiteIds = selectedSuite ? [selectedSuite, ...suiteIds] : suiteIds;
          return testingApi.startRun({
            agentId: agentIds,
            suiteId: finalSuiteIds,
          });
        }}
      />
    </div>
  );
}

