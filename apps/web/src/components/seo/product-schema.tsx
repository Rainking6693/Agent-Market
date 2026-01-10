interface ProductSchemaProps {
  name: string;
  price: number;
  description: string;
  slug: string;
}

export function ProductSchema({ name, price, description, slug }: ProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    url: `https://swarmsync.ai/pricing#${slug}`,
    offers: {
      '@type': 'Offer',
      price: price.toString(),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `https://swarmsync.ai/register?plan=${slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
