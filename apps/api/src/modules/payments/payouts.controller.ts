import { Controller, Post, Get, Body, Param } from '@nestjs/common';

import { StripeConnectService } from './stripe-connect.service.js';

@Controller('payouts')
export class PayoutsController {
  constructor(private readonly stripeConnectService: StripeConnectService) {}

  @Post('setup')
  async setupConnectedAccount(
    @Body() dto: { agentId: string; email: string },
  ) {
    return this.stripeConnectService.createConnectedAccount(
      dto.agentId,
      dto.email,
    );
  }

  @Get('account-status/:agentId')
  async getAccountStatus(@Param('agentId') agentId: string) {
    return this.stripeConnectService.getAccountStatus(agentId);
  }

  @Post('request')
  async requestPayout(@Body() dto: { agentId: string; amountCents: number }) {
    return this.stripeConnectService.requestPayout(dto.agentId, dto.amountCents);
  }

  @Get('history/:agentId')
  async getPayoutHistory(@Param('agentId') agentId: string) {
    return this.stripeConnectService.getPayoutHistory(agentId);
  }
}

