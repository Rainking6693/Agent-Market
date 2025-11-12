import { Injectable, NotFoundException } from '@nestjs/common';
import {
  OutcomeVerificationStatus,
  Prisma,
  ServiceAgreementStatus,
} from '@prisma/client';

import { PrismaService } from '../database/prisma.service.js';
import { CreateServiceAgreementDto } from './dto/create-service-agreement.dto.js';
import { RecordOutcomeVerificationDto } from './dto/record-verification.dto.js';
import { Ap2Service } from '../payments/ap2.service.js';
import { Ap2CompletionStatus, CompleteAp2PaymentDto } from '../payments/dto/complete-ap2.dto.js';

@Injectable()
export class OutcomesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ap2Service: Ap2Service,
  ) {}

  async createAgreement(dto: CreateServiceAgreementDto) {
    await this.ensureAgentExists(dto.agentId);

    return this.prisma.serviceAgreement.create({
      data: {
        agentId: dto.agentId,
        buyerId: dto.buyerId ?? null,
        workflowId: dto.workflowId ?? null,
        escrowId: dto.escrowId ?? null,
        outcomeType: dto.outcomeType,
        targetDescription: dto.targetDescription,
        status: ServiceAgreementStatus.ACTIVE,
      },
    });
  }

  async recordVerification(id: string, dto: RecordOutcomeVerificationDto) {
    const agreement = await this.prisma.serviceAgreement.findUnique({
      where: { id },
    });

    if (!agreement) {
      throw new NotFoundException('Service agreement not found');
    }

    const verification = await this.prisma.outcomeVerification.create({
      data: {
        serviceAgreementId: agreement.id,
        escrowId: dto.escrowId ?? agreement.escrowId,
        status: dto.status,
        evidence: (dto.evidence ?? {}) as Prisma.InputJsonValue,
        notes: dto.notes,
        verifiedBy: dto.reviewerId ?? null,
        verifiedAt: dto.status === OutcomeVerificationStatus.VERIFIED ? new Date() : null,
      },
    });

    if (verification.escrowId) {
      if (dto.status === OutcomeVerificationStatus.VERIFIED) {
        await this.ap2Service.release(verification.escrowId, dto.notes);
      } else if (dto.status === OutcomeVerificationStatus.REJECTED) {
        const payload: CompleteAp2PaymentDto = {
          escrowId: verification.escrowId,
          status: Ap2CompletionStatus.FAILED,
          failureReason: dto.notes ?? 'Verification rejected',
        };
        await this.ap2Service.complete(payload);
      }
    }

    const nextStatus =
      dto.status === OutcomeVerificationStatus.VERIFIED
        ? ServiceAgreementStatus.COMPLETED
        : dto.status === OutcomeVerificationStatus.REJECTED
          ? ServiceAgreementStatus.DISPUTED
          : agreement.status;

    if (nextStatus !== agreement.status) {
      await this.prisma.serviceAgreement.update({
        where: { id: agreement.id },
        data: { status: nextStatus },
      });
    }

    return verification;
  }

  async listAgreements(agentId: string) {
    await this.ensureAgentExists(agentId);

    return this.prisma.serviceAgreement.findMany({
      where: { agentId },
      include: {
        verifications: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  private async ensureAgentExists(agentId: string) {
    const exists = await this.prisma.agent.count({ where: { id: agentId } });
    if (!exists) {
      throw new NotFoundException('Agent not found');
    }
  }
}
