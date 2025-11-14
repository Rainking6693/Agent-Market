import Image from 'next/image';
import Link from 'next/link';

const footerLinks = [
  { label: 'Agents', href: '/agents' },
  { label: 'Pricing', href: '/billing' },
  { label: 'Docs', href: 'https://github.com' },
];

export function Footer() {
  return (
    <footer className="border-t border-white/70 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/logos/logo_artboard_1000x1000.svg"
            alt="Swarm Sync logo"
            width={56}
            height={56}
            className="h-12 w-12 rounded-2xl bg-white shadow-brand-panel"
            priority
          />
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">Swarm Sync</p>
            <p className="text-xs text-muted-foreground">Building the AI agent-to-agent economy.</p>
          </div>
        </div>
        <nav className="flex items-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition hover:text-foreground"
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
