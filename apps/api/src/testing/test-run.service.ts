import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TestRunStatus } from '@prisma/client';
import { Queue } from 'bullmq';

import { RunTestSuiteWorker } from './workers/run-test-suite.worker.js';
import { PrismaService } from '../modules/database/prisma.service.js';


@Injectable()
export class TestRunService {
  private readonly logger = new Logger(TestRunService.name);
  private testQueue: Queue | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly runTestSuiteWorker: RunTestSuiteWorker,
  ) {
    // Initialize BullMQ queue only if Redis is configured
    const redisHost = process.env.REDIS_HOST;
    if (redisHost) {
      try {
        this.testQueue = new Queue('run-test-suite', {
          connection: {
            host: redisHost,
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD,
          },
        });
        this.logger.log('Test run queue initialized with Redis');
      } catch (error) {
        this.logger.warn(`Failed to initialize test run queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
        this.testQueue = null;
      }
    } else {
      this.logger.warn('Redis not configured - test run queue will not be available');
      this.testQueue = null;
    }
  }

  /**
   * Start a test run for one or more agents with one or more suites
   */
  async startRun(params: {
    agentId: string | string[];
    suiteId: string | string[];
    userId: string;
  }): Promise<{ runs: Array<{ id: string; agentId: string; suiteId: string }> }> {
    const agentIds = Array.isArray(params.agentId) ? params.agentId : [params.agentId];
    const suiteIds = Array.isArray(params.suiteId) ? params.suiteId : [params.suiteId];

    const runs = [];

    for (const agentId of agentIds) {
      // Verify agent exists
      const agent = await this.prisma.agent.findUnique({
        where: { id: agentId },
      });

      if (!agent) {
        throw new NotFoundException(`Agent ${agentId} not found`);
      }

      for (const suiteId of suiteIds) {
        // Verify suite exists
        const suite = await this.prisma.testSuite.findUnique({
          where: { id: suiteId },
        });

        if (!suite) {
          // Try by slug
          const suiteBySlug = await this.prisma.testSuite.findUnique({
            where: { slug: suiteId },
          });

          if (!suiteBySlug) {
            this.logger.warn(`Suite ${suiteId} not found, skipping`);
            continue;
          }

          // Create test run
          const run = await this.prisma.testRun.create({
            data: {
              agentId,
              suiteId: suiteBySlug.id,
              userId: params.userId,
              status: TestRunStatus.QUEUED,
            },
          });

          // Enqueue job (if queue is available)
          if (this.testQueue) {
            await this.testQueue.add(
              'run-test-suite',
              {
                runId: run.id,
                agentId,
                suiteId: suiteBySlug.id,
                userId: params.userId,
              },
              {
                jobId: run.id,
              },
            );
          } else {
            // If Redis queue is not available, process test run immediately
            // This allows test runs to work without Redis infrastructure
            this.logger.warn('Test queue not available - processing test run immediately');
            // Process test run asynchronously without blocking
            this.processTestRunImmediately(run.id, agentId, suiteBySlug.id, params.userId).catch(
              (error) => {
                this.logger.error(`Failed to process test run ${run.id}:`, error);
              },
            );
          }

          runs.push({ id: run.id, agentId, suiteId: suiteBySlug.id });
        } else {
          // Create test run
          const run = await this.prisma.testRun.create({
            data: {
              agentId,
              suiteId: suite.id,
              userId: params.userId,
              status: TestRunStatus.QUEUED,
            },
          });

          // Enqueue job (if queue is available)
          if (this.testQueue) {
            await this.testQueue.add(
              'run-test-suite',
              {
                runId: run.id,
                agentId,
                suiteId: suite.id,
                userId: params.userId,
              },
              {
                jobId: run.id,
              },
            );
          } else {
            // If Redis queue is not available, mark as RUNNING and then COMPLETED
            // This allows test runs to work without Redis infrastructure
            this.logger.warn('Test queue not available - processing test run synchronously');
            // Process test run asynchronously without blocking
            this.processTestRunImmediately(run.id, agentId, suite.id, params.userId).catch(
              (error) => {
                this.logger.error(`Failed to process test run ${run.id}:`, error);
              },
            );
          }

          runs.push({ id: run.id, agentId, suiteId: suite.id });
        }
      }
    }

    return { runs };
  }

  /**
   * Get test run by ID
   */
  async getRun(runId: string, userId?: string) {
    const run = await this.prisma.testRun.findUnique({
      where: { id: runId },
      include: {
        suite: true,
        agent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!run) {
      throw new NotFoundException(`Test run ${runId} not found`);
    }

    if (userId && run.userId !== userId) {
      throw new NotFoundException(`Test run ${runId} not found`);
    }

    return run;
  }

  /**
   * List test runs with filters
   */
  async listRuns(params: {
    agentId?: string;
    suiteId?: string;
    userId?: string;
    status?: TestRunStatus;
    limit?: number;
    offset?: number;
  }) {
    const where: Record<string, unknown> = {};

    if (params.agentId) {
      where.agentId = params.agentId;
    }

    if (params.suiteId) {
      where.suiteId = params.suiteId;
    }

    if (params.userId) {
      where.userId = params.userId;
    }

    if (params.status) {
      where.status = params.status;
    }

    const [runs, total] = await Promise.all([
      this.prisma.testRun.findMany({
        where,
        include: {
          suite: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
            },
          },
          agent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: params.limit || 50,
        skip: params.offset || 0,
      }),
      this.prisma.testRun.count({ where }),
    ]);

    return { runs, total };
  }

  /**
   * Cancel a test run
   */
  async cancelRun(runId: string, userId: string) {
    const run = await this.getRun(runId, userId);

    if (run.status === TestRunStatus.COMPLETED || run.status === TestRunStatus.FAILED) {
      throw new Error(`Cannot cancel run in status: ${run.status}`);
    }

    // Remove from queue if still queued
    if (run.status === TestRunStatus.QUEUED && this.testQueue) {
      try {
        const job = await this.testQueue.getJob(runId);
        if (job) {
          await job.remove();
        }
      } catch (error) {
        this.logger.warn(`Failed to remove job from queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return this.prisma.testRun.update({
      where: { id: runId },
      data: {
        status: TestRunStatus.CANCELLED,
      },
    });
  }

  /**
   * Get all test suites
   */
  async listSuites(params?: { category?: string; recommended?: boolean }) {
    const where: Record<string, unknown> = {};

    if (params?.category) {
      where.category = params.category;
    }

    if (params?.recommended !== undefined) {
      where.isRecommended = params.recommended;
    }

    return this.prisma.testSuite.findMany({
      where,
      orderBy: [
        { isRecommended: 'desc' },
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  /**
   * Get recommended suites
   */
  async getRecommendedSuites() {
    return this.listSuites({ recommended: true });
  }

  /**
   * Process test run immediately when Redis queue is not available
   */
  private async processTestRunImmediately(
    runId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _agentId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _suiteId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userId: string,
  ) {
    // Run the real test suite inline (same logic as the worker) when Redis/queue is unavailable
    await this.runTestSuiteWorker.runInline({
      runId,
      agentId: _agentId,
      suiteId: _suiteId,
      userId: _userId,
    });
  }
}

