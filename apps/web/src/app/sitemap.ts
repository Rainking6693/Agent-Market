import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://swarmsync.co';

  const routes = [
    '',
    '/register',
    '/login',
    '/platform',
    '/use-cases',
    '/agent-orchestration-guide',
    '/vs/build-your-own',
    '/security',
    '/resources',
    '/faq',
    '/agents',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority:
      route === ''
        ? 1.0
        : route.startsWith('/platform') || route.startsWith('/use-cases')
          ? 0.9
          : 0.7,
  }));
}
