export function PlatformStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Enterprise AI Agent Orchestration Platform',
    description:
      'Comprehensive AI agent orchestration platform with autonomous discovery, escrow-backed payments, and enterprise governance.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://swarmsync.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Platform',
          item: 'https://swarmsync.com/platform',
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
