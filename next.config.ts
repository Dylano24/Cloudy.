import type { NextConfig } from "next";

const LEGACY_SITE = 'https://cloudy-store-l5gnmyiqr-cloudystore.vercel.app';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.tip4serv.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.z9y7-tip4serv.com',
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/store.css', destination: `${LEGACY_SITE}/store.css` },
        { source: '/layout.css', destination: '/custom-layout-css' },
        { source: '/games.js', destination: `${LEGACY_SITE}/games.js` },
        { source: '/catalog.js', destination: `${LEGACY_SITE}/catalog.js` },
        { source: '/store.js', destination: `${LEGACY_SITE}/store.js` },
        { source: '/clouds.js', destination: '/cloudy-home-copy-fix' },
        { source: '/assets/:path*', destination: `${LEGACY_SITE}/assets/:path*` },
      ],
    };
  },
};

export default nextConfig;
