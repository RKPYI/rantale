import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    loader: process.env.NODE_ENV === "development" ? "custom" : "default",
    loaderFile:
      process.env.NODE_ENV === "development"
        ? "./src/lib/image-loader.ts"
        : undefined,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // This allows any HTTPS domain
      },
      {
        protocol: "http",
        hostname: "localhost", // Allow localhost for development
      },
      {
        protocol: "http",
        hostname: "127.0.0.1", // Allow 127.0.0.1 for development
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
