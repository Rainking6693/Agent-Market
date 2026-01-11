"use client";

import { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import ChromeNetworkBackground from '@/components/swarm/ChromeNetworkBackground';
import { TacticalButton } from '@/components/swarm/TacticalButton';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        framework: '',
        message: '',
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', framework: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
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
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                                required
                                value={formData.framework}
                                onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
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
                                rows={6}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20"
                                placeholder="Tell us about your use case, framework version, or any specific requirements..."
                            />
                        </div>

                        {status === 'success' && (
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400">
                                ✓ Thank you! We've received your request and will be in touch soon.
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
                                ✗ Something went wrong. Please try again or email us directly at rainking6693@gmail.com
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="flex-1 rounded-lg bg-[var(--accent-primary)] px-6 py-3 font-semibold text-white transition-colors hover:bg-[var(--accent-primary)]/90 disabled:opacity-50"
                            >
                                {status === 'sending' ? 'Sending...' : 'Submit Request'}
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
