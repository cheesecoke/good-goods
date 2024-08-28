/** @type {import('next').NextConfig} */

import withBundleAnalyzer from "@next/bundle-analyzer";

const isAnalyzeEnabled = process.env.ANALYZE === "true";

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.patagonia.com",
      },
      {
        protocol: "https",
        hostname: "www.madetrade.com",
      },
      {
        protocol: "https",
        hostname: "www.outerknown.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
};

// Export the configuration using ES module syntax
export default isAnalyzeEnabled
  ? withBundleAnalyzer({ enabled: true })(nextConfig)
  : nextConfig;
