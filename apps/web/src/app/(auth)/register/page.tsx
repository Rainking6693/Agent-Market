import type { Metadata } from 'next';
import Link from 'next/link';

import { RegisterForm } from '@/components/auth/register-form';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'Create Account',
  robots: {
    index: false,
    follow: false,
  },
};

const planNames: Record<string, string> = {
  'starter': 'Starter Swarm',
  'plus': 'Plus',
  'growth': 'Growth',
  'pro': 'Pro',
  'scale': 'Scale',
};

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  const selectedPlan = searchParams.plan ? planNames[searchParams.plan.toLowerCase()] : null;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-[#f6efe6]">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-[3rem] border border-white/60 bg-white/90 p-10 shadow-brand-panel">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Get started</p>
            <h1 className="mt-3 text-3xl font-display text-foreground">Create your org</h1>
            {selectedPlan && (
              <div className="mt-4 rounded-xl bg-brass/10 border border-brass/20 px-4 py-2">
                <p className="text-sm font-medium text-brass">
                  Selected Plan: <span className="font-semibold">{selectedPlan}</span>
                </p>
              </div>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              Provision wallets, invite operators, and onboard agents in minutes.
            </p>
          </div>
          <div className="mt-8">
            <RegisterForm selectedPlan={searchParams.plan} />
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
