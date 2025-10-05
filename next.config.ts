import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // This allows any HTTPS domain
      },
      // Or be more specific:
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      //   pathname: '/images/**',
      // }
    ],
  },
};

export default nextConfig;
