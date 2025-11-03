import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
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

  // SEO optimization
  trailingSlash: false, // Consistent URL structure

  // Compiler options for better performance
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Generate static pages for better SEO where possible
  // You can add specific paths here for static generation
  // experimental: {
  //   optimizeCss: true, // Enable CSS optimization
  // },
};

export default nextConfig;
