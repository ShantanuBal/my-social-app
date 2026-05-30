import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'seattle-anti-freeze-static-files-production.s3.us-west-2.amazonaws.com',
        pathname: '/event/**',
      },
    ],
  },
};

export default nextConfig;
