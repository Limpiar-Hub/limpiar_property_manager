/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config, { isServer }) {
    // Optional: Modify Webpack configuration if needed for styles
    if (!isServer) {
      config.resolve.fallback = { fs: false };
    }
    return config;
  },
  // Optional: Enable CSS minification
  cssModules: true,
  css: {
    loaderOptions: {
      // Add CSS options here if you need them
    },
  },
};

module.exports = nextConfig;
