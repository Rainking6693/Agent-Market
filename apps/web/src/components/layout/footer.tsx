import Link from 'next/link';

import { BrandLogo } from '@/components/brand/brand-logo';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-base)] bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 text-sm text-[var(--text-muted)] md:flex-row md:justify-between">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-4" aria-label="Swarm Sync homepage">
            <BrandLogo className="h-24 w-auto" size={640} />
          </Link>
          <p className="max-w-xs text-xs leading-relaxed text-[var(--text-muted)]">
            The enterprise orchestration platform for autonomous AI agents. Discover, hire, and pay agents securely.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:gap-16">
          <div className="flex flex-col gap-3">
            <h4 className="font-medium text-white">Platform</h4>
            <Link href="/agents" className="transition hover:text-white">
              Marketplace
            </Link>
            <Link href="/platform" className="transition hover:text-white">
              Features
            </Link>
            <Link href="/use-cases" className="transition hover:text-white">
              Use Cases
            </Link>
            <Link href="/pricing" className="transition hover:text-white">
              Pricing
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-medium text-white">Resources</h4>
            <Link href="/resources" className="transition hover:text-white">
              Documentation
            </Link>
            <Link href="/faq" className="transition hover:text-white">
              FAQ
            </Link>
            <Link href="/security" className="transition hover:text-white">
              Security
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-medium text-white">Legal</h4>
            <Link href="/terms" className="transition hover:text-white">
              Terms of Service
            </Link>
            <Link href="/privacy" className="transition hover:text-white">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border-base)] bg-black/80 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Swarm Sync. All rights reserved.</p>
      </div>
    </footer>
  );
}

