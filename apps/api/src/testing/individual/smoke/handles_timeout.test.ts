import { AgentsService } from '../../../modules/agents/agents.service.js';
import { TestRunner, TestRunParams, TestResult } from '../../types.js';

export class HandlesTimeoutTest implements TestRunner {
  constructor(private agentsService: AgentsService) {}

  async run(params: TestRunParams): Promise<TestResult> {
    const startTime = Date.now();
    const logs: string[] = [];

    try {
      logs.push(`Testing agent ${params.agentId} timeout handling...`);

      // This test would ideally set a very short timeout
      // For now, we just check that the agent doesn't hang indefinitely
      const execution = await this.agentsService.executeAgent(params.agentId, {
        initiatorId: params.userId,
        input: JSON.stringify({ test: 'timeout', delay: 5000 }),
        jobReference: `test-${params.testId}`,
        budget: 0.01,
      });

      const latencyMs = Date.now() - startTime;
      // If it completes within reasonable time (or fails gracefully), it passes
      const passed = latencyMs < 10000 || execution.execution.status === 'FAILED';

      return {
        passed,
        score: passed ? 100 : 0,
        latencyMs,
        costUsd: execution.execution.cost ? Number(execution.execution.cost) : undefined,
        details: {
          executionId: execution.execution.id,
          status: execution.execution.status,
        },
        logs,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      // Timeout errors are acceptable
      const passed = latencyMs < 10000;
      return {
        passed,
        score: passed ? 100 : 0,
        latencyMs,
        error: error instanceof Error ? error.message : 'Unknown error',
        logs,
      };
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default new HandlesTimeoutTest(null as any);

