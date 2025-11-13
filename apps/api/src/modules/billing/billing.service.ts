import { billingPlanConfigs } from '@agent-market/config';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';

import { PrismaService } from '../database/prisma.service.js';

const DEFAULT_ORG_SLUG = process.env.DEFAULT_ORG_SLUG ?? 'genesis';
const STRIPE_WEB_URL = process.env.STRIPE_WEB_URL ?? process.env.WEB_URL ?? 'http://localhost:3000';

@Injectable()
export class BillingService {
  private readonly stripe: Stripe | null;
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {
    const secret = process.env.STRIPE_SECRET_KEY;
    this.stripe = secret ? new Stripe(secret, { apiVersion: '2024-09-30.acacia' }) : null;
  }

  async listPlans() {
    await this.ensurePlansSeeded();
    return this.prisma.billingPlan.findMany({
      orderBy: { priceCents: 'asc' },
    });
  }

  async getOrganizationSubscription() {
    const organization = await this.getDefaultOrganization();
    const subscription = await this.prisma.organizationSubscription.findUnique({
      where: { organizationId: organization.id },
      include: { plan: true },
    });

    if (!subscription) {
      return null;
    }

    return subscription;
  }

  async applyPlan(planSlug: string) {
    await this.ensurePlansSeeded();
    const plan = await this.prisma.billingPlan.findUnique({ where: { slug: planSlug } });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const organization = await this.getDefaultOrganization();
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return this.prisma.organizationSubscription.upsert({
      where: { organizationId: organization.id },
      update: {
        planSlug: plan.slug,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
        creditAllowance: plan.monthlyCredits,
        creditUsed: 0,
      },
      create: {
        organizationId: organization.id,
        planSlug: plan.slug,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
        creditAllowance: plan.monthlyCredits,
      },
      include: { plan: true },
    });
  }

  async createCheckoutSession(planSlug: string, successUrl?: string, cancelUrl?: string) {
    await this.ensurePlansSeeded();
    const plan = await this.prisma.billingPlan.findUnique({ where: { slug: planSlug } });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (plan.priceCents === 0) {
      const subscription = await this.applyPlan(planSlug);
      return {
        checkoutUrl: null,
        subscription,
      };
    }

    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    const organization = await this.getDefaultOrganization();
    const stripeCustomerId = await this.ensureStripeCustomer(organization.id);

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      success_url: successUrl ?? `${STRIPE_WEB_URL}/billing?status=success`,
      cancel_url: cancelUrl ?? `${STRIPE_WEB_URL}/billing?status=cancel`,
      line_items: [
        {
          price: plan.stripePriceId ?? undefined,
          quantity: 1,
        },
      ],
      metadata: {
        organizationId: organization.id,
        planSlug: plan.slug,
      },
    });

  return { checkoutUrl: session.url };
  }

  private async ensureStripeCustomer(orgId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (organization.stripeCustomerId) {
      return organization.stripeCustomerId;
    }

    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const customer = await this.stripe.customers.create({
      name: organization.name,
      metadata: {
        organizationId: organization.id,
      },
    });

    await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        stripeCustomerId: customer.id,
      },
    });

    return customer.id;
  }

  private async getDefaultOrganization() {
    const organization =
      (await this.prisma.organization.findUnique({
        where: { slug: DEFAULT_ORG_SLUG },
      })) ??
      (await this.prisma.organization.findFirst({
        orderBy: { createdAt: 'asc' },
      }));

    if (!organization) {
      throw new NotFoundException('No organization configured');
    }

    return organization;
  }

  private async ensurePlansSeeded() {
    await Promise.all(
      billingPlanConfigs.map((plan) =>
        this.prisma.billingPlan.upsert({
          where: { slug: plan.slug },
          update: {
            name: plan.name,
            priceCents: plan.priceCents,
            seats: plan.seats,
            agentLimit: plan.agentLimit,
            workflowLimit: plan.workflowLimit,
            monthlyCredits: plan.monthlyCredits,
            takeRateBasisPoints: plan.takeRateBasisPoints,
            features: plan.features,
          },
          create: {
            id: plan.slug.toUpperCase(),
            slug: plan.slug,
            name: plan.name,
            priceCents: plan.priceCents,
            seats: plan.seats,
            agentLimit: plan.agentLimit,
            workflowLimit: plan.workflowLimit,
            monthlyCredits: plan.monthlyCredits,
            takeRateBasisPoints: plan.takeRateBasisPoints,
            features: plan.features,
          },
        }),
      ),
    );
  }
}
