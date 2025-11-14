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
        <div className="flex items-center gap-3">
          <Image
            src="/logos/logo.svg"
            alt="Swarm Sync logo"
            width={130}
            height={36}
            className="h-8 w-auto"
          />
          <div>
            <p className="font-semibold text-foreground">Swarm Sync</p>
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
