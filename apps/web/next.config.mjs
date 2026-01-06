// apps/web/next.config.mjs
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

// Needed for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly expose server-side env vars to API routes/functions
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
  },
  transpilePackages: [
    // Add any monorepo packages here that need transpiling
    // Example: '@agent-market/sdk', '@agent-market/ui', etc.
  ],

  // There is NO experimental.turbopack option — it has never existed
  // Just delete it completely

  // Extend build timeout for static generation
  staticPageGenerationTimeout: 120,

  // Enable compression (handled by hosting, but good to document)
  compress: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Bundle splitting and optimization
  experimental: {
    optimizePackageImports: ['lucide-react', '@tanstack/react-query'],
  },

  // Redirects: HTTP→HTTPS and www/non-www
  async redirects() {
    return [
      // Redirect www to non-www (or vice versa - choose one canonical)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.swarmsync.ai',
          },
        ],
        destination: 'https://swarmsync.ai/:path*',
        permanent: true,
      },
    ];
  },

  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/:path*\\.(jpg|jpeg|gif|png|svg|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*\\.(js|css|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    // Split vendor chunks for better caching
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Separate chunk for common components
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Separate chunk for UI components
            ui: {
              name: 'ui',
              test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
              chunks: 'all',
              priority: 15,
            },
          },
        },
      };
    }
    // Properly resolve @ alias to ./src (works with both Webpack & Turbopack)
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['@'] = path.resolve(__dirname, './src');
    config.resolve.alias['@pricing'] = path.resolve(__dirname, '../../lib/pricing');

    return config;
  },
};

export default nextConfig;
