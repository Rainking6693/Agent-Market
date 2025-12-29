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
    <div className="flex min-h-screen flex-col bg-black text-slate-50">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-[3rem] border border-white/10 bg-white/5 p-10 shadow-lg">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Welcome back</p>
            <h1 className="mt-3 text-3xl font-display text-white">Sign in to Swarm Sync</h1>
            <p className="mt-2 text-sm text-slate-400">
              Access your dashboard, credentials, and organization analytics.
            </p>
          </div>
          <div className="mt-8">
            <LoginForm />
          </div>
          <p className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-yellow-400 hover:text-yellow-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
