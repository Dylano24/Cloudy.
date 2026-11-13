import type { NextConfig } from "next";

// Baseline protection on every response. No Content-Security-Policy yet: the
// Tip4Serv checkout script, YouTube embeds and Discord images need a reviewed
// allow-list first. HSTS is already sent by Vercel.
const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
  typedRoutes: true,
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
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
    ],
  },
};

export default nextConfig;
