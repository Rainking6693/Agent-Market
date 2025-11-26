/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    // Add any internal packages if needed (e.g., '@agent-market/sdk'), but for local aliases, this ensures src/ is transpiled
    // Your badge/utils are local, so this covers them via monorepo hoisting
  ],
  experimental: {
    // Optional: If using Turbopack, enable it—but skip if not
    turbopack: false,
  },
  webpack: (config) => {
    // Explicitly add alias fallback for webpack (reinforces tsconfig)
    config.resolve.alias['@'] = config.resolve.alias['@'] || './src';
    return config;
  },
};

export default nextConfig;