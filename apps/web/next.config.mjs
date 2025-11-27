// apps/web/next.config.mjs
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

// Needed for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    // Add any monorepo packages here that need transpiling
    // Example: '@agent-market/sdk', '@agent-market/ui', etc.
  ],

  // There is NO experimental.turbopack option — it has never existed
  // Just delete it completely

  webpack: (config) => {
    // Properly resolve @ alias to ./src (works with both Webpack & Turbopack)
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['@'] = path.resolve(__dirname, './src');

    return config;
  },
};

export default nextConfig;