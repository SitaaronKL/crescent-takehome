import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Seeded demo images come from Unsplash. Add any host you use yourself.
  images: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }] },
};

export default nextConfig;
