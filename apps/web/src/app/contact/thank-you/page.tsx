import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import ChromeNetworkBackground from '@/components/swarm/ChromeNetworkBackground';
import { TacticalButton } from '@/components/swarm/TacticalButton';
import { CheckCircle } from 'lucide-react';

export default function ThankYouPage() {
    return (
        <div className="flex min-h-screen flex-col bg-black text-slate-50">
            <Navbar />

            <main className="relative flex-1">
                <ChromeNetworkBackground />

                <div className="relative z-10 mx-auto max-w-2xl px-6 py-24 md:px-12">
                    <div className="text-center">
                        <div className="mb-8 flex justify-center">
                            <div className="rounded-full bg-emerald-500/10 p-6">
                                <CheckCircle className="h-16 w-16 text-emerald-400" />
                            </div>
                        </div>

                        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
                            Thank You for Your <span className="text-[var(--accent-primary)]">Inquiry</span>
                        </h1>

                        <p className="mb-8 text-lg text-slate-400">
                            We've received your framework integration request and will review it shortly.
                        </p>

                        <div className="mb-12 rounded-lg border border-white/10 bg-white/5 p-6">
                            <h2 className="mb-4 text-xl font-semibold text-white">What happens next?</h2>
                            <ul className="space-y-3 text-left text-slate-400">
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 text-emerald-400">✓</span>
                                    <span>Your email client should have opened with a pre-filled message to <strong className="text-white">rainking6693@gmail.com</strong></span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 text-emerald-400">✓</span>
                                    <span>Please send that email to complete your request</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 text-emerald-400">✓</span>
                                    <span>We'll review your framework and get back to you within 2-3 business days</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 text-emerald-400">✓</span>
                                    <span>If your email client didn't open, you can email us directly at <a href="mailto:rainking6693@gmail.com" className="text-[var(--accent-primary)] hover:underline">rainking6693@gmail.com</a></span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <TacticalButton href="/frameworks">
                                View All Frameworks
                            </TacticalButton>
                            <TacticalButton variant="secondary" href="/docs/integration">
                                Integration Docs
                            </TacticalButton>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
