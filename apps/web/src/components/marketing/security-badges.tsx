export function SecurityBadges() {
  const badges = [
    {
      icon: '🔒',
      title: 'SOC 2 Type II',
      subtitle: 'Certified',
    },
    {
      icon: '🛡️',
      title: '256-bit',
      subtitle: 'Encryption',
    },
    {
      icon: '✓',
      title: 'GDPR',
      subtitle: 'Compliant',
    },
    {
      icon: '🏆',
      title: '99.9%',
      subtitle: 'Uptime SLA',
    },
  ];

  return (
    <div className="border-t border-brass/20 bg-brass/5 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="flex flex-col items-center space-y-2 text-center"
            >
              <div className="text-3xl">{badge.icon}</div>
              <div>
                <p className="font-headline text-sm text-ink">{badge.title}</p>
                <p className="font-body text-xs text-muted-foreground">
                  {badge.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
