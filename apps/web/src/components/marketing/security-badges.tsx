import Link from 'next/link';

export function SecurityBadges() {
  const badges = [
    {
      icon: '🔒',
      title: 'SOC 2',
      subtitle: 'Ready',
      link: '/security#compliance',
    },
    {
      icon: '🛡️',
      title: '256-bit',
      subtitle: 'Encryption',
      link: '/security#encryption',
    },
    {
      icon: '✓',
      title: 'GDPR',
      subtitle: 'Aligned',
      link: '/security#privacy',
    },
    {
      icon: '🏆',
      title: '99.9%',
      subtitle: 'Uptime Target',
      link: '/security#reliability',
    },
  ];

  return (
    <div className="border-t border-brass/20 bg-brass/5 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {badges.map((badge) => (
            <Link
              key={badge.title}
              href={badge.link}
              className="flex flex-col items-center space-y-2 text-center transition hover:opacity-80"
            >
              <div className="text-3xl">{badge.icon}</div>
              <div>
                <p className="font-headline text-sm text-ink">{badge.title}</p>
                <p className="font-body text-xs text-muted-foreground">
                  {badge.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
