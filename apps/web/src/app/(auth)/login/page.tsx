import Link from 'next/link';

import { LoginForm } from '@/components/auth/login-form';
import { Navbar } from '@/components/layout/navbar';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-[#f6efe6]">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-[3rem] border border-white/60 bg-white/90 p-10 shadow-brand-panel">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Welcome back</p>
            <h1 className="mt-3 text-3xl font-display text-foreground">Sign in to Swarm Sync</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Access your dashboard, credentials, and organization analytics.
            </p>
          </div>
          <div className="mt-8">
            <LoginForm />
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-primary">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
