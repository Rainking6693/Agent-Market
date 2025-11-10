/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@agent-market/sdk'],
  env: {
    API_URL: process.env.API_URL ?? 'http://localhost:4000',
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? 'http://localhost:4000',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  },
};

export default nextConfig;
