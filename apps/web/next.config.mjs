import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const asyncStorageShim = path.join(__dirname, 'src/shims/async-storage.ts');

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
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias ??= {};
    config.resolve.alias['@react-native-async-storage/async-storage'] = asyncStorageShim;
    return config;
  },
};

export default nextConfig;
