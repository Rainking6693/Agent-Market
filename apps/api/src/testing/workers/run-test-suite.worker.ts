import { Logger } from '@nestjs/common';
import { Prisma, TestRunStatus } from '@prisma/client';
import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';

import { AgentsService } from '../../modules/agents/agents.service.js';
import { PrismaService } from '../../modules/database/prisma.service.js';
import { getSuiteBySlug } from '../suites/index.js';
import { TestRunProgress } from '../types.js';


export class RunTestSuiteWorker {
  private readonly logger = new Logger(RunTestSuiteWorker.name);
  private worker: Worker | null = null;
  private redis: Redis | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly agentsService: AgentsService,
  ) {}

  /**
   * Initialize the worker (called after module initialization)
   */
  initialize() {
    if (this.worker) {
      return; // Already initialized
    }

    // Initialize Redis for pub/sub
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
    });

    // Initialize BullMQ worker
    this.worker = new Worker(
      'run-test-suite',
      async (job: Job) => {
        await this.processJob(job);
      },
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD,
        },
        concurrency: 1, // Run tests sequentially
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Test run ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Test run ${job?.id} failed: ${err.message}`);
    });
    // Initialize Redis for pub/sub
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
    });

    // Initialize BullMQ worker
    this.worker = new Worker(
      'run-test-suite',
      async (job: Job) => {
        await this.processJob(job);
      },
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD,
        },
        concurrency: 1, // Run tests sequentially
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Test run ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Test run ${job?.id} failed: ${err.message}`);
    });
  }

  /**
   * Gracefully shutdown worker
   */
  async shutdown() {
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
    }
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }

  /**
   * Publish progress update to Redis pub/sub
   */
  private async publishProgress(runId: string, progress: TestRunProgress) {
    if (!this.redis) {
      this.logger.warn('Redis not initialized, cannot publish progress');
      return;
    }
    const channel = `test-run:${runId}`;
    await this.redis.publish(channel, JSON.stringify(progress));
  }

  /**
   * Process a test run job
   */
  private async processJob(job: Job<{ runId: string; agentId: string; suiteId: string; userId: string }, unknown, string>) {
    const { runId, agentId, suiteId, userId } = job.data;

    this.logger.log(`Starting test run ${runId} for agent ${agentId} with suite ${suiteId}`);

    try {
      // Update status to RUNNING
      await this.prisma.testRun.update({
        where: { id: runId },
        data: {
          status: TestRunStatus.RUNNING,
          startedAt: new Date(),
        },
      });

      await this.publishProgress(runId, {
        runId,
        status: 'running',
        completedTests: 0,
        totalTests: 0,
      });

      // Get suite definition
      const suite = await this.prisma.testSuite.findUnique({
        where: { id: suiteId },
      });

      if (!suite) {
        throw new Error(`Suite ${suiteId} not found`);
      }

      // Get suite definition from registry
      const suiteDef = getSuiteBySlug(suite.slug);
      if (!suiteDef) {
        throw new Error(`Suite definition for ${suite.slug} not found`);
      }

      const totalTests = suiteDef.tests.length;
      const results: Array<{
        testId: string;
        passed: boolean;
        score: number;
        latencyMs?: number;
        costUsd?: number;
        error?: string;
        details?: Record<string, unknown>;
        logs?: string[];
      }> = [];
      let totalScore = 0;
      let totalCost = 0;
      let totalLatency = 0;
      let passedTests = 0;

      // Run each test sequentially
      for (let i = 0; i < suiteDef.tests.length; i++) {
        const testDef = suiteDef.tests[i];

        await this.publishProgress(runId, {
          runId,
          status: 'running',
          currentTest: testDef.id,
          completedTests: i,
          totalTests,
        });

        try {
          // Dynamically import and run the test
          const testModule = await testDef.runner();
          let testRunner = testModule.default || testModule;

          // If it's a class constructor, instantiate it with dependencies
          if (typeof testRunner === 'function' && testRunner.prototype && testRunner.prototype.run) {
            testRunner = new testRunner(this.agentsService);
          }

          const testResult = await testRunner.run({
            agentId,
            suiteId,
            testId: testDef.id,
            userId,
          });

          results.push({
            testId: testDef.id,
            ...testResult,
          });

          if (testResult.passed) {
            passedTests++;
          }

          totalScore += testResult.score;
          totalCost += testResult.costUsd || 0;
          totalLatency += testResult.latencyMs || 0;
        } catch (error) {
          this.logger.error(`Test ${testDef.id} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          results.push({
            testId: testDef.id,
            passed: false,
            score: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Calculate final score (average of all test scores)
      const finalScore = totalTests > 0 ? Math.round(totalScore / totalTests) : 0;

      // Update agent trust score and badges if this is a baseline suite
      if (suiteDef.isRecommended && suiteDef.category === 'smoke') {
        await this.updateAgentTrustScore(agentId, finalScore);
      }

      // Update test run status
      await this.prisma.testRun.update({
        where: { id: runId },
        data: {
          status: TestRunStatus.COMPLETED,
          score: finalScore,
          completedAt: new Date(),
          rawResults: {
            results,
            summary: {
              totalTests,
              passedTests,
              failedTests: totalTests - passedTests,
              averageScore: finalScore,
              totalCost,
              totalLatency,
            },
          } as Prisma.InputJsonValue,
        },
      });

      await this.publishProgress(runId, {
        runId,
        status: 'completed',
        completedTests: totalTests,
        totalTests,
        score: finalScore,
      });

      this.logger.log(`Test run ${runId} completed with score ${finalScore}`);
    } catch (error) {
      this.logger.error(`Test run ${runId} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

      await this.prisma.testRun.update({
        where: { id: runId },
        data: {
          status: TestRunStatus.FAILED,
          completedAt: new Date(),
          rawResults: {
            error: error instanceof Error ? error.message : 'Unknown error',
          } as Prisma.InputJsonValue,
        },
      });

      await this.publishProgress(runId, {
        runId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedTests: 0,
        totalTests: 0,
      });

      throw error;
    }
  }

  /**
   * Update agent trust score and badges based on test results
   */
  private async updateAgentTrustScore(agentId: string, score: number) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return;
    }

    const badges: string[] = [...(agent.badges || [])];
    const updates: { trustScore: number; badges: string[] } = {
      trustScore: agent.trustScore,
      badges,
    };

    // Award badges based on score
    if (score >= 90 && !badges.includes('high-quality')) {
      badges.push('high-quality');
    }

    if (score >= 95 && !badges.includes('production-ready')) {
      badges.push('production-ready');
    }

    if (score >= 100 && !badges.includes('perfect-score')) {
      badges.push('perfect-score');
    }

    // Update trust score (weighted average with existing score)
    const newTrustScore = Math.round(agent.trustScore * 0.7 + score * 0.3);

    updates.trustScore = newTrustScore;

    await this.prisma.agent.update({
      where: { id: agentId },
      data: updates,
    });

    this.logger.log(`Updated agent ${agentId} trust score to ${newTrustScore} and badges: ${badges.join(', ')}`);
  }
}

