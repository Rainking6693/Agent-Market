import { AgentsService } from '../../../modules/agents/agents.service.js';
import { TestRunner, TestRunParams, TestResult } from '../../types.js';

/**
 * Basic Alive Test
 * Verifies the agent responds to a simple ping/health check
 */
export class BasicAliveTest implements TestRunner {
  constructor(private agentsService: AgentsService) {}

  async run(params: TestRunParams): Promise<TestResult> {
    const startTime = Date.now();
    const logs: string[] = [];

    try {
      logs.push(`Testing agent ${params.agentId} basic responsiveness...`);

      // Execute a simple test input
      const execution = await this.agentsService.executeAgent(params.agentId, {
        initiatorId: params.userId,
        input: JSON.stringify({ test: 'ping', message: 'Are you alive?' }),
        jobReference: `test-${params.testId}`,
        budget: 0.01,
      });

      const latencyMs = Date.now() - startTime;
      logs.push(`Execution completed in ${latencyMs}ms`);

      // Check if execution succeeded
      if (execution.execution.status === 'SUCCEEDED' && execution.execution.output) {
        const output = execution.execution.output as Record<string, unknown>;
        const hasResponse = output && typeof output === 'object';

        return {
          passed: hasResponse,
          score: hasResponse ? 100 : 0,
          latencyMs,
          costUsd: execution.execution.cost ? Number(execution.execution.cost) : undefined,
          details: {
            executionId: execution.execution.id,
            status: execution.execution.status,
          },
          logs,
        };
      }

      return {
        passed: false,
        score: 0,
        latencyMs,
        error: `Execution failed with status: ${execution.execution.status}`,
        details: {
          executionId: execution.execution.id,
          status: execution.execution.status,
          error: execution.execution.error,
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
export default new BasicAliveTest(null as any); // Will be injected by service

