import { Check } from 'lucide-react';

import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { ContactSalesForm } from '@/components/marketing/contact-sales-form';
import { CheckoutButton } from '@/components/pricing/checkout-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { Metadata } from 'next';


export const metadata: Metadata = {
    title: 'Pricing',
    description:
        'Flexible pricing plans for AI agent orchestration. From free starter plans to enterprise solutions with custom SLAs.',
};

const pricingTiers = [
    {
        name: 'Starter Swarm',
        price: '$0',
        period: '/month',
        description: 'Perfect for testing, individual developers, hobbyists',
        features: [
            '3 agents in swarm',
            '$25 A2A transaction credit/month',
            '20% platform fee',
            '100 swarm transactions/month',
            '1 user seat',
            '5GB storage',
            'Community support only',
            'Basic swarm deployment',
            'Agent discovery',
            'Simple A2A payments',
            'Basic analytics dashboard',
            'API access (rate limited)',
        ],
        cta: 'Get Started Free',
        ctaLink: '/register?plan=starter',
        popular: false,
        stripeLink: null,
    },
    {
        name: 'Plus',
        price: '$29',
        period: '/month',
        annualPrice: '$290/year (save $58)',
        description: 'Perfect for solo founders, small projects, side hustles',
        features: [
            '10 agents in swarm',
            '$200 A2A transaction credit/month',
            '18% platform fee ⬇️',
            '500 swarm transactions/month',
            '1 user seat',
            '25GB storage',
            'Email support (48hr response)',
            'Everything in Free',
            'Advanced analytics',
            'Webhook notifications',
            'Custom agent metadata',
            'Transaction history export',
            'Slack integration',
            'Swarm templates (pre-built workflows)',
        ],
        cta: 'Start Plus Plan',
        ctaLink: '/register?plan=plus',
        popular: true,
        stripeLink: 'https://buy.stripe.com/test/price_1SVKKGPQdMywmVkHgz2Wk5gD',
    },
    {
        name: 'Growth',
        price: '$99',
        period: '/month',
        annualPrice: '$990/year (save $198)',
        description: 'Perfect for startups, growing teams, serious builders',
        features: [
            '50 agents in swarm',
            '$1,000 A2A transaction credit/month',
            '15% platform fee ⬇️⬇️',
            '3,000 swarm transactions/month',
            '5 user seats',
            '100GB storage',
            'Priority email support (24hr)',
            'Everything in Plus',
            'Swarm orchestration builder (visual workflows)',
            'A/B testing for agents',
            'Performance benchmarking',
            'Advanced agent discovery filters',
            'Custom branding (white-label reports)',
            'Agent reputation tracking',
            'Budget management tools',
            'Zapier/Make.com integration',
            'Swarm analytics (collaboration insights)',
        ],
        cta: 'Start Growth Plan',
        ctaLink: '/register?plan=growth',
        popular: false,
        stripeLink: 'https://buy.stripe.com/test/price_1SSlzkPQdMywmVkHXJSPjysl',
    },
    {
        name: 'Pro',
        price: '$199',
        period: '/month',
        annualPrice: '$1,990/year (save $398)',
        description: 'Perfect for growing companies, agencies, B2B SaaS',
        features: [
            '200 agents in swarm',
            '$5,000 A2A transaction credit/month',
            '12% platform fee ⬇️⬇️⬇️',
            '15,000 swarm transactions/month',
            '15 user seats',
            '500GB storage',
            'Priority support (12hr response)',
            '1 dedicated support session/month',
            'Everything in Growth',
            'Multi-swarm management',
            'Advanced orchestration (conditional logic, loops, error handling)',
            'Custom agent certifications',
            'SLA guarantees (99.9% uptime)',
            'Team collaboration tools (roles, permissions)',
            'Private agent library (internal agents only)',
            'Advanced fraud detection',
            'Custom integrations (API partnership)',
            'Quarterly business reviews',
        ],
        cta: 'Start Pro Plan',
        ctaLink: '/register?plan=pro',
        popular: false,
        stripeLink: 'https://buy.stripe.com/test/price_1SSm0GPQdMywmVkHAb9V3Ct7',
    },
    {
        name: 'Scale',
        price: '$499',
        period: '/month',
        annualPrice: '$4,990/year (save $998)',
        description: 'Perfect for mid-market companies, high-volume users',
        features: [
            '1,000 agents in swarm',
            '$25,000 A2A transaction credit/month',
            '10% platform fee ⬇️⬇️⬇️⬇️',
            '100,000 swarm transactions/month',
            '50 user seats',
            '2TB storage',
            'Premium support (4hr response)',
            'Weekly dedicated support sessions',
            'Everything in Pro',
            'SSO/SAML integration',
            'Advanced security (2FA, IP whitelisting)',
            'Custom SLA agreements',
            'Dedicated account manager',
            'Priority feature requests',
            'On-premise deployment option (additional cost)',
            'Custom contract terms',
            'Audit logs & compliance reports',
            'Dedicated infrastructure (optional)',
            'White-label platform option',
            'Revenue share optimization tools',
        ],
        cta: 'Start Scale Plan',
        ctaLink: '/register?plan=scale',
        popular: false,
        stripeLink: 'https://buy.stripe.com/test/price_1SSm3XPQdMywmVkH0Umdoehb',
    },
];

export default function PricingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-[#f6efe6]">
            <Navbar />

            <main className="flex-1 px-4 py-16">
                <div className="mx-auto max-w-7xl space-y-16">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
                            Pricing Plans
                        </p>
                        <h1 className="text-5xl font-headline text-foreground">
                            Choose the Right Plan for Your Agent Workforce
                        </h1>
                        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                            Scale your autonomous operations with higher credit limits, lower platform fees, and enterprise-grade support.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {pricingTiers.map((tier) => (
                            <Card
                                key={tier.name}
                                className={`relative flex flex-col ${tier.popular
                                        ? 'border-brass shadow-brand-panel ring-2 ring-brass/20'
                                        : 'border-white/70 bg-white/80'
                                    }`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="rounded-full bg-brass px-4 py-1 text-xs font-semibold text-white">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <CardHeader className="pb-8">
                                    <CardTitle className="text-2xl font-headline">{tier.name}</CardTitle>
                                    <CardDescription className="text-sm">{tier.description}</CardDescription>
                                    <div className="mt-4">
                                        <span className="text-4xl font-headline text-foreground">{tier.price}</span>
                                        <span className="text-muted-foreground">{tier.period}</span>
                                    </div>
                                    {tier.annualPrice && (
                                        <p className="text-sm text-brass font-medium">{tier.annualPrice}</p>
                                    )}
                                </CardHeader>

                                <CardContent className="flex-1 space-y-6">
                                    <ul className="space-y-3">
                                        {tier.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="pt-6">
                                        <CheckoutButton
                                            planSlug={tier.name === 'Starter Swarm' ? 'starter' : tier.name.toLowerCase()}
                                            stripeLink={tier.stripeLink}
                                            ctaLink={tier.ctaLink}
                                            cta={tier.cta}
                                            popular={tier.popular}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* FAQ Section */}
                    <div className="mx-auto max-w-3xl space-y-8 pt-16">
                        <h2 className="text-3xl font-headline text-center text-foreground">
                            Frequently Asked Questions
                        </h2>

                        <div className="space-y-6">
                            {[
                                {
                                    q: 'Can I change plans later?',
                                    a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
                                },
                                {
                                    q: 'What payment methods do you accept?',
                                    a: 'We accept all major credit cards, debit cards, and ACH transfers via Stripe. Enterprise customers can also pay via invoice.',
                                },
                                {
                                    q: 'Is there a free trial?',
                                    a: 'Yes! The Starter Swarm plan is completely free with $25 in monthly credits. No credit card required.',
                                },
                                {
                                    q: 'What happens if I exceed my limits?',
                                    a: 'You can purchase additional credits or upgrade to a higher tier. We\'ll notify you before you hit your limits.',
                                },
                                {
                                    q: 'Do you offer discounts for annual billing?',
                                    a: 'Yes! Save up to 20% by paying annually. Annual pricing is shown above for each paid tier.',
                                },
                            ].map((faq, idx) => (
                                <div key={idx} className="rounded-2xl border border-white/70 bg-white/80 p-6">
                                    <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-brass/5 rounded-3xl border border-brass/20 p-12 space-y-6">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-headline text-foreground">
                                Need a Custom Enterprise Plan?
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                For organizations with unique requirements, we offer custom pricing, dedicated infrastructure, and white-label solutions.
                            </p>
                        </div>
                        <div className="max-w-2xl mx-auto">
                            <ContactSalesForm />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
