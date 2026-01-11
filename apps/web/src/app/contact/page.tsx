"use client";

import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import ChromeNetworkBackground from '@/components/swarm/ChromeNetworkBackground';
import { TacticalButton } from '@/components/swarm/TacticalButton';

export default function ContactPage() {
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        // Create mailto link with form data
        const name = formData.get('name');
        const email = formData.get('email');
        const framework = formData.get('framework');
        const message = formData.get('message');

        const subject = `Framework Integration Request: ${framework}`;
        const body = `
Name: ${name}
Email: ${email}
Framework: ${framework}

Message:
${message || 'No additional details provided.'}
    `.trim();

        // Open default email client
        window.location.href = `mailto:rainking6693@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Redirect to thank you page after a short delay
        setTimeout(() => {
            router.push('/contact/thank-you');
        }, 500);
    };

    return (
        <div className="flex min-h-screen flex-col bg-black text-slate-50">
            <Navbar />

            <main className="relative flex-1">
                <ChromeNetworkBackground />

                <div className="relative z-10 mx-auto max-w-2xl px-6 py-24 md:px-12">
                    <div className="mb-12 text-center">
                        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
                            Request Framework <span className="text-[var(--accent-primary)]">Integration</span>
                        </h1>
                        <p className="text-lg text-slate-400">
                            Don't see your framework listed? Let us know and we'll prioritize adding support.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-300">
                                Your Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="framework" className="mb-2 block text-sm font-medium text-slate-300">
                                Framework Name
                            </label>
                            <input
                                type="text"
                                id="framework"
                                name="framework"
                                required
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20"
                                placeholder="e.g., Semantic Kernel, AutoGen, etc."
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-300">
                                Additional Details
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={6}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20"
                                placeholder="Tell us about your use case, framework version, or any specific requirements..."
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                type="submit"
                                className="flex-1 rounded-lg bg-[var(--accent-primary)] px-6 py-3 font-semibold text-white transition-colors hover:bg-[var(--accent-primary)]/90"
                            >
                                Submit Request
                            </button>
                            <TacticalButton variant="secondary" href="/frameworks" className="flex-1">
                                Back to Frameworks
                            </TacticalButton>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
