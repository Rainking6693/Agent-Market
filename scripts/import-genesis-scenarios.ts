#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

import * as YAML from 'yaml';

interface CliOptions {
  input: string;
  output: string;
  vertical?: string;
  limit?: number;
  agentTags?: string[];
  agentNameIncludes?: string;
}

interface GenesisScenario {
  id?: string;
  name?: string;
  priority?: string;
  category?: string;
  tags?: string[];
  input?: Record<string, unknown>;
  expected_output?: {
    contains?: string[];
    min_length?: number;
  };
  performance?: {
    max_latency_ms?: number;
    max_tokens?: number;
  };
  judge?: {
    model?: string;
    criteria?: string[];
  };
  cost_estimate?: number;
  description?: string;
}

const DEFAULT_OUTPUT = path.join('configs', 'evaluations', 'genesis-import.json');

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    input: '',
    output: DEFAULT_OUTPUT,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case '--input':
      case '-i':
        options.input = args[++i] ?? '';
        break;
      case '--output':
      case '-o':
        options.output = args[++i] ?? DEFAULT_OUTPUT;
        break;
      case '--vertical':
      case '-v':
        options.vertical = args[++i];
        break;
      case '--limit':
      case '-l':
        options.limit = Number.parseInt(args[++i] ?? '', 10);
        break;
      case '--agentTags':
        options.agentTags = (args[++i] ?? '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);
        break;
      case '--agentNameIncludes':
        options.agentNameIncludes = args[++i];
        break;
      default:
        break;
    }
  }

  if (!options.input) {
    throw new Error('Missing required --input path to genesis YAML file.');
  }

  return options;
}

function loadGenesisScenarios(filePath: string, limit?: number) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Scenario file not found: ${absolutePath}`);
  }

  const raw = fs.readFileSync(absolutePath, 'utf-8');
  const parsed = YAML.parse(raw);
  const scenarios: GenesisScenario[] = parsed?.scenarios ?? [];

  if (!Array.isArray(scenarios) || scenarios.length === 0) {
    throw new Error(`No scenarios found in ${absolutePath}`);
  }

  const limited =
    typeof limit === 'number' && Number.isFinite(limit) ? scenarios.slice(0, limit) : scenarios;

  return {
    meta: {
      priority: parsed?.priority,
      vertical: parsed?.name,
    },
    scenarios: limited,
  };
}

function transformScenario(
  scenario: GenesisScenario,
  options: CliOptions,
  defaults: { priority?: string; vertical?: string },
) {
  return {
    sourceId: scenario.id,
    scenarioName: scenario.name,
    priority: scenario.priority ?? defaults.priority ?? null,
    vertical: options.vertical ?? defaults.vertical ?? 'general',
    agentTags: scenario.tags?.length ? scenario.tags : options.agentTags,
    agentNameIncludes: options.agentNameIncludes,
    input: scenario.input ?? {},
    expectedOutputIncludes: scenario.expected_output?.contains ?? [],
    minOutputLength: scenario.expected_output?.min_length,
    tolerances: {
      maxLatencyMs: scenario.performance?.max_latency_ms,
      maxTokens: scenario.performance?.max_tokens,
    },
    successCriteria: scenario.judge?.criteria ?? [],
    judgeModel: scenario.judge?.model,
    costEstimate: scenario.cost_estimate,
    notes: scenario.description ?? scenario.category,
    category: scenario.category,
  };
}

function main() {
  const options = parseArgs();
  const { scenarios, meta } = loadGenesisScenarios(options.input, options.limit);
  const defaults = {
    priority: meta.priority,
    vertical: meta.vertical,
  };

  const outputScenarios = scenarios.map((scenario) =>
    transformScenario(scenario, options, defaults),
  );

  const outputPath = path.resolve(options.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(outputScenarios, null, 2)}\n`);

  // eslint-disable-next-line no-console
  console.log(`Wrote ${outputScenarios.length} scenarios to ${outputPath}`);
}

main();
