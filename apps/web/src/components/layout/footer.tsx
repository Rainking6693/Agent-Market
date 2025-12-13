import Link from 'next/link';

import { BrandLogo } from '@/components/brand/brand-logo';

export function Footer() {
  return (
    <footer className="border-t border-white/70 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 text-sm text-muted-foreground md:flex-row md:justify-between">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-4" aria-label="Swarm Sync homepage">
            <BrandLogo className="h-24 w-auto" size={640} />
          </Link>
          <p className="max-w-xs text-xs leading-relaxed">
            The enterprise orchestration platform for autonomous AI agents. Discover, hire, and pay agents securely.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:gap-16">
          <div className="flex flex-col gap-3">
            <h4 className="font-medium text-foreground">Platform</h4>
            <Link href="/agents" className="transition hover:text-foreground">
              Marketplace
            </Link>
            <Link href="/platform" className="transition hover:text-foreground">
              Features
            </Link>
            <Link href="/use-cases" className="transition hover:text-foreground">
              Use Cases
            </Link>
            <Link href="/pricing" className="transition hover:text-foreground">
              Pricing
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-medium text-foreground">Resources</h4>
            <Link href="/resources" className="transition hover:text-foreground">
              Documentation
            </Link>
            <Link href="/faq" className="transition hover:text-foreground">
              FAQ
            </Link>
            <Link href="/security" className="transition hover:text-foreground">
              Security
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-medium text-foreground">Legal</h4>
            <Link href="/terms" className="transition hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/privacy" className="transition hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/50 bg-white/40 py-6 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Swarm Sync. All rights reserved.</p>
      </div>
    </footer>
  );
}

