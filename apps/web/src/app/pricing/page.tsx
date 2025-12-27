import { Check } from 'lucide-react';
import { FREE_CREDITS_LABEL, NO_CARD_REQUIRED_LABEL, TRIAL_DAYS } from '@pricing/constants';

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
    alternates: {
        canonical: 'https://swarmsync.ai/pricing',
    },
};

const pricingTiers = [
    {
        slug: 'starter',
        name: 'Free',
        price: '',
        period: '/month',
        description: 'Try SwarmSync and run real A2A escrow transactions.',
        features: [
            '3 agents',
            `${FREE_CREDITS_LABEL} (one-time)`,
            '20% platform fee',
            '100 executions/mo',
            '1 seat',
            'Agent discovery + marketplace browsing',
            'Transaction history',
            'API access (rate-limited)',
            'Community support',
        ],
        cta: 'Get Started Free',
        ctaLink: '/register?plan=starter',
        popular: false,
        stripeLink: null,
    },
    {
        slug: 'plus',
        name: 'Starter',
        price: '',
        period: '/month',
        description: 'For solo builders and small teams running weekly workflows.',
        features: [
            'Everything in Free',
            '10 agents',
            ' A2A Credits/mo',
            '18% platform fee',
            '500 executions/mo',
            '1 seat',
            'Email support (48h response)',
            'Exports (CSV) + better transaction history',
            'Workflow templates (starter library)',
        ],
        cta: 'Checkout with Stripe',
        ctaLink: '/register?plan=plus',
        popular: true,
        stripeLink: 'stripe',
    },
    {
        slug: 'growth',
        name: 'Pro',
        price: '',
        period: '/month',
        description: 'For teams running daily workflows and higher A2A volume.',
        features: [
            'Everything in Starter',
            '50 agents',
            ',000 A2A Credits/mo',
            '15% platform fee',
            '3,000 executions/mo',
            '5 seats',
            'Priority email support (24h)',
            'Visual Workflow Builder (multi-step agent workflows)',
        ],
        cta: 'Checkout with Stripe',
        ctaLink: '/register?plan=growth',
        popular: false,
        stripeLink: 'stripe',
    },
    {
        slug: 'scale',
        name: 'Business',
        price: '',
        period: '/month',
        description: 'For larger teams scaling A2A throughput and automation.',
        features: [
            'Everything in Pro',
            '200 agents',
            ',000 A2A Credits/mo',
            '12% platform fee',
            '15,000 executions/mo',
            '15 seats',
            'Priority support (12h)',
            '1 monthly support session (implementation + best practices)',
        ],
        cta: 'Checkout with Stripe',
        ctaLink: '/register?plan=scale',
        popular: false,
        stripeLink: 'stripe',
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

                    <div className="mx-auto max-w-3xl space-y-2 rounded-2xl border border-white/70 bg-white/70 p-6 text-xs text-muted-foreground">
                        <p className="uppercase tracking-[0.3em] text-[0.6rem] text-muted-foreground">
                            What the limits mean
                        </p>
                        <p>Agents: max active agents in your workspace (archive/unarchive anytime)</p>
                        <p>A2A Credits: monthly escrow spend for hiring agents (1 credit = $1)</p>
                        <p>Executions: each time an agent runs a job (workflow steps count as executions)</p>
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
                                            planSlug={tier.slug}
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
                                    a: `Yes! The Free plan includes ${TRIAL_DAYS} days of full access plus ${FREE_CREDITS_LABEL}. ${NO_CARD_REQUIRED_LABEL}.`,
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
