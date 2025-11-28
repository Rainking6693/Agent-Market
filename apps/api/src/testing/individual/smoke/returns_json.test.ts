import { AgentsService } from '../../../modules/agents/agents.service.js';
import { TestRunner, TestRunParams, TestResult } from '../../types.js';

export class ReturnsJsonTest implements TestRunner {
  constructor(private agentsService: AgentsService) {}

  async run(params: TestRunParams): Promise<TestResult> {
    const startTime = Date.now();
    const logs: string[] = [];

    try {
      logs.push(`Testing agent ${params.agentId} returns valid JSON...`);

      const execution = await this.agentsService.executeAgent(params.agentId, {
        initiatorId: params.userId,
        input: JSON.stringify({ test: 'json' }),
        jobReference: `test-${params.testId}`,
        budget: 0.01,
      });

      const latencyMs = Date.now() - startTime;
      const output = execution.execution.output;
      const hasValidJson = output && typeof output === 'object';

      return {
        passed: hasValidJson,
        score: hasValidJson ? 100 : 0,
        latencyMs,
        costUsd: execution.execution.cost ? Number(execution.execution.cost) : undefined,
        details: {
          executionId: execution.execution.id,
          hasValidJson,
        },
        logs,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      return {
        passed: false,
        score: 0,
        latencyMs,
        error: error instanceof Error ? error.message : 'Unknown error',
        logs,
      };
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default new ReturnsJsonTest(null as any);

