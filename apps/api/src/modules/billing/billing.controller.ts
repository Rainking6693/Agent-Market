import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

import { BillingService } from './billing.service.js';

class CheckoutRequestDto {
  @IsString()
  planSlug!: string;

  @IsOptional()
  @IsString()
  successUrl?: string;

  @IsOptional()
  @IsString()
  cancelUrl?: string;
}


@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  listPlans() {
    return this.billingService.listPlans();
  }

  @Get('subscription')
  getSubscription() {
    return this.billingService.getOrganizationSubscription();
  }

  @Post('subscription/apply')
  applyPlan(@Body() body: CheckoutRequestDto) {
    return this.billingService.applyPlan(body.planSlug);
  }

  @Post('subscription/checkout')
  createCheckout(@Body() body: CheckoutRequestDto) {
    return this.billingService.createCheckoutSession(body.planSlug, body.successUrl, body.cancelUrl);
  }
}
