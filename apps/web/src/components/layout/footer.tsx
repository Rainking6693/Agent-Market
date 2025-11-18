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
        <Link href="/" className="flex items-center gap-4" aria-label="Swarm Sync homepage">
          <Image
            src="/logos/swarm-sync-wordmark-transparent.svg"
            alt="Swarm Sync - AI Agent Orchestration Platform"
            width={180}
            height={50}
            className="h-12 w-auto object-contain"
            loading="lazy"
          />
        </Link>
        <nav className="flex items-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition hover:text-foreground"
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
