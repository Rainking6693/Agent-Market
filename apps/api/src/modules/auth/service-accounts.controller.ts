import { Body, Controller, Delete, Get, Param, Post, UseGuards, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ServiceAccountStatus } from '@prisma/client';

import { AuthenticatedUser } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { ServiceAccountsService } from './service-accounts.service.js';
import { PrismaService } from '../database/prisma.service.js';

interface CreateServiceAccountDto {
  name: string;
  description?: string;
  scopes?: string[];
  organizationId?: string;
  agentId?: string;
}

@Controller('api/v1/service-accounts')
@UseGuards(JwtAuthGuard)
export class ServiceAccountsController {
  constructor(
    private readonly serviceAccounts: ServiceAccountsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateServiceAccountDto) {
    // Only allow creating for user's organization or agents
    const organizationId = dto.organizationId || user.organizationId;
    
    const result = await this.serviceAccounts.createServiceAccount({
      name: dto.name,
      description: dto.description,
      organizationId,
      agentId: dto.agentId,
      scopes: dto.scopes ?? [],
    });

    return {
      id: result.account.id,
      name: result.account.name,
      description: result.account.description,
      apiKey: result.apiKey, // Only returned on creation
      scopes: result.account.scopes,
      status: result.account.status,
      createdAt: result.account.createdAt,
    };
  }

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    const accounts = await this.prisma.serviceAccount.findMany({
      where: {
        OR: [
          { organizationId: user.organizationId },
          { agentId: { in: await this.getUserAgentIds(user.id) } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        scopes: true,
        status: true,
        organizationId: true,
        agentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return accounts;
  }

  @Delete(':id')
  async revoke(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const account = await this.prisma.serviceAccount.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException('Service account not found');
    }

    // Verify ownership
    const userAgentIds = await this.getUserAgentIds(user.id);
    if (
      account.organizationId !== user.organizationId &&
      (!account.agentId || !userAgentIds.includes(account.agentId))
    ) {
      throw new UnauthorizedException('You do not have permission to revoke this service account');
    }

    await this.prisma.serviceAccount.update({
      where: { id },
      data: { status: ServiceAccountStatus.DISABLED },
    });

    return { success: true };
  }

  private async getUserAgentIds(userId: string): Promise<string[]> {
    const agents = await this.prisma.agent.findMany({
      where: { creatorId: userId },
      select: { id: true },
    });
    return agents.map((a) => a.id);
  }
}

