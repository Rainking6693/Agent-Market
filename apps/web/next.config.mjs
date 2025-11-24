import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const asyncStorageShim = path.join(__dirname, 'src/shims/async-storage.ts');

const connectSrcHosts = [
  "'self'",
  'https://api.swarmsync.ai',
  'https://agent-market-api-divine-star-3849.fly.dev',
  'https://*.stripe.com',
  'wss://www.walletlink.org',
  'https://pulse.walletconnect.org',
  'https://api.web3modal.org',
  'https://*.walletconnect.org',
];

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? '';
if (configuredApiUrl) {
  try {
    const apiOrigin = new URL(configuredApiUrl).origin;
    if (!connectSrcHosts.includes(apiOrigin)) {
      connectSrcHosts.push(apiOrigin);
    }
  } catch {
    // Ignore invalid URLs – the fallback origin list already includes localhost/self.
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use standard output for Netlify (standalone is for Docker/self-hosted)
  output: 'export', // Static export for Netlify
  transpilePackages: ['@agent-market/sdk'],
  env: {
    API_URL: process.env.API_URL ?? 'http://localhost:4000',
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? 'http://localhost:4000',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self'",
              `connect-src ${connectSrcHosts.join(' ')}`,
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ];
  },
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias ??= {};
    config.resolve.alias['@react-native-async-storage/async-storage'] = asyncStorageShim;
    return config;
  },
};

export default nextConfig;
