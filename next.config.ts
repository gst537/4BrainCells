import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow all local dev origins for HMR
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000'],
    },
  },
};

export default nextConfig;
