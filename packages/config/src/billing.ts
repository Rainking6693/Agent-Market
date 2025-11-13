const starterPlan = {
  slug: 'starter',
  name: 'Starter',
  priceCents: 0,
  seats: 1,
  agentLimit: 3,
  workflowLimit: 1,
  monthlyCredits: 1000,
  takeRateBasisPoints: 800,
  features: ['Community support', 'Basic analytics', 'Shared compute'],
};

const growthPlan = {
  slug: 'growth',
  name: 'Growth',
  priceCents: 9900,
  seats: 5,
  agentLimit: 15,
  workflowLimit: 5,
  monthlyCredits: 15000,
  takeRateBasisPoints: 600,
  features: ['Email support', 'Team dashboards', 'Sandbox escrow'],
  stripeProductId: process.env.GROWTH_SWARM_SYNC_TIER_PRODUCT_ID ?? '',
  stripePriceId: process.env.GROWTH_SWARM_SYNC_TIER_PRICE_ID ?? '',
};

const scalePlan = {
  slug: 'scale',
  name: 'Scale',
  priceCents: 24900,
  seats: 15,
  agentLimit: 40,
  workflowLimit: 15,
  monthlyCredits: 60000,
  takeRateBasisPoints: 400,
  features: ['Priority support', 'Advanced analytics', 'Premium escrow rules', 'Billing API'],
  stripeProductId: process.env.SCALE_SWARM_SYNC_TIER_PRODUCT_ID ?? '',
  stripePriceId: process.env.SCALE_SWARM_SYNC_TIER_PRICE_ID ?? '',
};

const proPlan = {
  slug: 'pro',
  name: 'Pro',
  priceCents: 49900,
  seats: 40,
  agentLimit: 100,
  workflowLimit: 40,
  monthlyCredits: 150000,
  takeRateBasisPoints: 300,
  features: ['Dedicated support', 'SSO-ready', 'Private hosting option', 'Custom evaluation packs'],
  stripeProductId: process.env.PRO_SWARM_SYNC_TIER_PRODUCT_ID ?? '',
  stripePriceId: process.env.PRO_SWARM_SYNC_TIER_PRICE_ID ?? '',
};

const enterprisePlan = {
  slug: 'enterprise',
  name: 'Enterprise',
  priceCents: 0,
  seats: 0,
  agentLimit: 0,
  workflowLimit: 0,
  monthlyCredits: 0,
  takeRateBasisPoints: 200,
  features: ['Dedicated CSM', 'Compliance pack', 'Custom SLAs', 'Private VPC'],
};

export const billingPlanConfigs = [
  starterPlan,
  growthPlan,
  scalePlan,
  proPlan,
  enterprisePlan,
];
