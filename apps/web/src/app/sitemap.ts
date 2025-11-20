import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://swarmsync.ai';

  // Public marketing pages only - exclude auth and console routes
  const routes = [
    '',
    '/pricing',
    '/agents',
    '/platform',
    '/use-cases',
    '/agent-orchestration-guide',
    '/vs/build-your-own',
    '/security',
    '/resources',
    '/faq',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' as const : 'monthly' as const,
    priority:
      route === ''
        ? 1.0
        : route === '/pricing' || route === '/agents'
          ? 0.9
          : route.startsWith('/platform') || route.startsWith('/use-cases')
            ? 0.8
            : 0.7,
  }));
}
