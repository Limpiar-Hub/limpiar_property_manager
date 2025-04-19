import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  output: 'standalone',
  webpack(config, { isServer }) {
    // Ensure client-specific code (like localStorage) doesn't break SSR
    if (!isServer) {
      config.resolve.fallback = { fs: false };
    }

    return config;
  },
  typescript: {
    // Ignore TypeScript errors during build (if necessary)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore linting errors during build (if necessary)
    ignoreDuringBuilds: true,
  },
  images: {
    // Allow images from external domains
    domains: ['limpiar-backend.onrender.com'],
  },
};

export default nextConfig;
