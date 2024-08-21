/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "www.patagonia.com",
      "www.madetrade.com",
      "www.outerknown.com",
      "cdn.shopify.com",
    ],
  },
};

export default nextConfig;
