#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

import { Agent, AgentExecutionResponse, createAgentMarketClient } from '@agent-market/sdk';

interface ScenarioDefinition {
  agentId?: string;
  agentSlug?: string;
  scenarioName: string;
  vertical?: string;
  input?: Record<string, unknown>;
  expectedOutputIncludes?: string;
  budget?: number;
  notes?: string;
}

const SCENARIO_FILE =
  process.env.EVALUATION_SCENARIOS_FILE ?? path.join('configs', 'evaluations', 'sample.json');
const API_URL = process.env.API_URL ?? 'http://localhost:4000';
const API_TOKEN = process.env.API_TOKEN;
const INITIATOR_ID = process.env.EVALUATION_INITIATOR_ID;

if (!INITIATOR_ID) {
  console.error('EVALUATION_INITIATOR_ID environment variable is required.');
  process.exit(1);
}

async function main() {
  const scenarios = loadScenarios();
  if (scenarios.length === 0) {
    console.warn('No evaluation scenarios found.');
    return;
  }

  const client = createAgentMarketClient({
    baseUrl: API_URL,
    apiKey: API_TOKEN,
  });

  const agents = await client.listAgents();

  for (const scenario of scenarios) {
    const agent = resolveAgent(agents, scenario);
    if (!agent) {
      console.warn(`Skipping scenario "${scenario.scenarioName}" because agent was not found.`);
      continue;
    }

    const execution = await executeScenario(client, agent, scenario);
    const passed = evaluateOutput(execution, scenario);
    const latencyMs = execution.execution.completedAt
      ? new Date(execution.execution.completedAt).getTime() -
        new Date(execution.execution.createdAt).getTime()
      : 0;

    await client.runEvaluation({
      agentId: agent.id,
      scenarioName: scenario.scenarioName,
      vertical: scenario.vertical,
      input: scenario.input,
      expected: scenario.expectedOutputIncludes
        ? { includes: scenario.expectedOutputIncludes }
        : undefined,
      logs: {
        executionId: execution.execution.id,
        notes: scenario.notes,
      },
      latencyMs,
      cost: Number(execution.paymentTransaction.amount),
      passed,
    });

    console.log(
      `Recorded evaluation for ${agent.name} • ${scenario.scenarioName} • status:${passed ? 'PASSED' : 'FAILED'}`,
    );
  }
}

function loadScenarios(): ScenarioDefinition[] {
  const filePath = path.resolve(SCENARIO_FILE);
  if (!fs.existsSync(filePath)) {
    console.warn(`Scenario file not found: ${filePath}`);
    return [];
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as ScenarioDefinition[];
}

function resolveAgent(agents: Agent[], scenario: ScenarioDefinition) {
  if (scenario.agentId) {
    return agents.find((agent) => agent.id === scenario.agentId);
  }

  if (scenario.agentSlug) {
    return agents.find((agent) => agent.slug === scenario.agentSlug);
  }

  return undefined;
}

async function executeScenario(
  client: ReturnType<typeof createAgentMarketClient>,
  agent: Agent,
  scenario: ScenarioDefinition,
): Promise<AgentExecutionResponse> {
  return client.executeAgent(agent.id, INITIATOR_ID, scenario.input ?? {}, {
    budget: scenario.budget ?? 5,
    jobReference: `eval-${Date.now()}`,
  });
}

function evaluateOutput(execution: AgentExecutionResponse, scenario: ScenarioDefinition) {
  if (!scenario.expectedOutputIncludes) {
    return execution.execution.status === 'SUCCEEDED';
  }

  const outputContent = JSON.stringify(execution.execution.output ?? {});
  return (
    execution.execution.status === 'SUCCEEDED' &&
    outputContent.toLowerCase().includes(scenario.expectedOutputIncludes.toLowerCase())
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
