import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AgentEngagementMetric,
  EvaluationResult,
  OutcomeVerification,
  OutcomeVerificationStatus,
  Prisma,
  ServiceAgreement,
  ServiceAgreementStatus,
} from '@prisma/client';

import { PrismaService } from '../database/prisma.service.js';

interface AgentQualitySummary {
  agentId: string;
  certification: {
    status: string | null;
    updatedAt?: Date | null;
    expiresAt?: Date | null;
    total: number;
  };
  evaluations: {
    total: number;
    passed: number;
    passRate: number;
    averageLatencyMs: number | null;
    averageCost: string | null;
  };
  agreements: {
    active: number;
    completed: number;
    disputed: number;
    pending: number;
  };
  verifications: {
    verified: number;
    rejected: number;
    pending: number;
  };
  a2a: {
    engagements: number;
    totalSpend: string;
  };
}

@Injectable()
export class QualityAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAgentSummary(agentId: string): Promise<AgentQualitySummary> {
    await this.ensureAgentExists(agentId);

    const [latestCertification, evaluations, agreements, verifications, engagementMetrics] =
      await Promise.all([
        this.prisma.agentCertification.findFirst({
          where: { agentId },
          orderBy: { updatedAt: 'desc' },
        }),
        this.prisma.evaluationResult.findMany({
          where: { agentId },
        }),
        this.prisma.serviceAgreement.findMany({
          where: { agentId },
        }),
        this.prisma.outcomeVerification.findMany({
          where: {
            serviceAgreement: {
              agentId,
            },
          },
        }),
        this.prisma.agentEngagementMetric.findMany({
          where: { agentId },
        }),
      ]);

    const evaluationStats = this.buildEvaluationStats(evaluations);
    const agreementStats = this.buildAgreementStats(agreements);
    const verificationStats = this.buildVerificationStats(verifications);
    const a2aStats = this.buildA2aStats(engagementMetrics);

    return {
      agentId,
      certification: {
        status: latestCertification?.status ?? null,
        updatedAt: latestCertification?.updatedAt ?? null,
        expiresAt: latestCertification?.expiresAt ?? null,
        total: await this.prisma.agentCertification.count({ where: { agentId } }),
      },
      evaluations: evaluationStats,
      agreements: agreementStats,
      verifications: verificationStats,
      a2a: a2aStats,
    };
  }

  private buildEvaluationStats(evaluations: EvaluationResult[]) {
    const total = evaluations.length;
    if (!total) {
      return {
        total: 0,
        passed: 0,
        passRate: 0,
        averageLatencyMs: null,
        averageCost: null,
      };
    }

    const passed = evaluations.filter((evaluation) => evaluation.status === 'PASSED').length;
    const latencyValues = evaluations.map((evaluation) => evaluation.latencyMs).filter(Boolean);
    const averageLatencyMs = latencyValues.length
      ? Math.round(latencyValues.reduce((sum, value) => sum + (value ?? 0), 0) / latencyValues.length)
      : null;

    const costValues = evaluations
      .map((evaluation) => evaluation.cost)
      .filter((value): value is Prisma.Decimal => Boolean(value));
    const averageCost =
      costValues.length > 0
        ? costValues
            .reduce((sum, value) => sum.plus(value), new Prisma.Decimal(0))
            .div(costValues.length)
            .toFixed(2)
        : null;

    return {
      total,
      passed,
      passRate: Number(((passed / total) * 100).toFixed(1)),
      averageLatencyMs,
      averageCost,
    };
  }

  private buildAgreementStats(agreements: ServiceAgreement[]) {
    const counters = {
      active: 0,
      completed: 0,
      disputed: 0,
      pending: 0,
    };

    agreements.forEach((agreement) => {
      switch (agreement.status) {
        case ServiceAgreementStatus.ACTIVE:
          counters.active += 1;
          break;
        case ServiceAgreementStatus.COMPLETED:
          counters.completed += 1;
          break;
        case ServiceAgreementStatus.DISPUTED:
          counters.disputed += 1;
          break;
        case ServiceAgreementStatus.PENDING:
        default:
          counters.pending += 1;
      }
    });

    return counters;
  }

  private buildVerificationStats(verifications: OutcomeVerification[]) {
    const counters = {
      verified: 0,
      rejected: 0,
      pending: 0,
    };

    verifications.forEach((verification) => {
      switch (verification.status) {
        case OutcomeVerificationStatus.VERIFIED:
          counters.verified += 1;
          break;
        case OutcomeVerificationStatus.REJECTED:
          counters.rejected += 1;
          break;
        default:
          counters.pending += 1;
      }
    });

    return counters;
  }

  private buildA2aStats(metrics: AgentEngagementMetric[]) {
    if (!metrics.length) {
      return {
        engagements: 0,
        totalSpend: '0',
      };
    }

    const totalSpend = metrics
      .map((item) => item.totalSpend)
      .reduce((sum, value) => sum.plus(value), new Prisma.Decimal(0));

    const engagements = metrics.reduce((sum, value) => sum + value.a2aCount, 0);

    return {
      engagements,
      totalSpend: totalSpend.toFixed(2),
    };
  }

  private async ensureAgentExists(agentId: string) {
    const exists = await this.prisma.agent.count({ where: { id: agentId } });
    if (!exists) {
      throw new NotFoundException('Agent not found');
    }
  }
}
