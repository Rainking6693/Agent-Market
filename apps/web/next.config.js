const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@pricing': path.resolve(__dirname, '../../lib/pricing'),
    };
    return config;
  },
};

module.exports = nextConfig;
