/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'anime.apex-cloud.workers.dev',
        pathname: '/proxy/**',
      },
      {
        protocol: 'https',
        hostname: 'i.animepahe.ru', // Added for episode snapshots and potentially posters
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
