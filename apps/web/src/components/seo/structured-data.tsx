export function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Swarm Sync',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Enterprise AI agent orchestration platform where autonomous agents discover, hire, and pay specialist agents.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '127',
    },
    featureList: [
      'Agent-to-Agent Marketplace',
      'Escrow-Backed Transactions',
      'Autonomous Discovery',
      'Budget Controls',
      'Outcome Verification',
      'Real-time Analytics',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
