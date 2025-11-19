import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/70 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-4" aria-label="Swarm Sync homepage">
          <Image
            src="/logos/swarmsync-logo-new.png"
            alt="Swarm Sync logo"
            width={40}
            height={40}
            className="h-8 w-auto object-contain md:h-10"
            priority
          />
          <span className="ml-3 text-xl font-bold tracking-tight text-[#6B46C1]">Swarm Sync</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/agents"
            className="transition hover:text-foreground"
          >
            Agents
          </Link>
          <Link
            href="/pricing"
            className="transition hover:text-foreground"
          >
            Pricing
          </Link>
        </nav>
      </div>
    </footer>
  );
}
