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
    ],
    unoptimized: true,
  },
};

export default nextConfig;
