import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false, 
  output: "standalone", 
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
