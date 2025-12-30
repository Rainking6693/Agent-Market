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
    <div className="flex min-h-screen flex-col bg-surface text-text">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="glass-card w-full max-w-md rounded-[3rem] border border-border bg-surface p-10 shadow-2xl">
          <div className="text-center">
            <p className="heading-label">Welcome back</p>
            <h1 className="mt-3 text-3xl font-display text-text">Sign in to Swarm Sync</h1>
            <p className="mt-2 text-sm text-text2">
              Access your dashboard, credentials, and organization analytics.
            </p>
          </div>
          <div className="mt-8">
            <LoginForm />
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-accent hover:text-accent-strong">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
