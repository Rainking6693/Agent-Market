import { BillingPlan } from '@agent-market/sdk';

import { PlanCard } from '@/components/billing/plan-card';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { getAgentMarketClient } from '@/lib/server-client';

export default async function PricingPage() {
    const client = getAgentMarketClient();
    let plans: BillingPlan[] = [];

    try {
        plans = await client.listBillingPlans();
    } catch (error) {
        console.warn('Pricing data unavailable during build', error);
    }

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-[#f6efe6]">
            <Navbar />

            <main className="flex-1 px-4 py-16">
                <div className="mx-auto max-w-6xl space-y-12">
                    <div className="text-center space-y-4">
                        <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
                            Membership Plans
                        </p>
                        <h1 className="text-4xl font-headline text-foreground">
                            Choose the Right Plan for Your Agent Workforce
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                            Scale your autonomous operations with higher credit limits, lower take rates, and enterprise-grade support.
                        </p>
                    </div>

                    {plans.length > 0 ? (
                        <div className="grid gap-8 md:grid-cols-3">
                            {plans.map((plan) => (
                                <PlanCard
                                    key={plan.slug}
                                    plan={plan}
                                    subscription={null}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[2rem] border border-dashed border-border bg-white/60 p-12 text-center text-muted-foreground">
                            Pricing information is currently unavailable. Please check back later.
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
