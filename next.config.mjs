/** @type \{import('next').NextConfig\} */
const nextConfig = \{
  eslint: \{
    ignoreDuringBuilds: true,
  \},
  typescript: \{
    ignoreBuildErrors: true,
  \},
  images: \{
    remotePatterns: [
      \{
        protocol: 'https',
        hostname: 'i.animepahe.ru',
        port: '',
        pathname: '/posters/**', // For anime posters
      \},
      \{
        protocol: 'https',
        hostname: 'i.animepahe.ru',
        port: '',
        pathname: '/snapshots/**', // For episode snapshots/thumbnails
      \},
      // Removed the proxy domain as it's not needed for direct i.animepahe.ru images
    ],
  \},
\};

export default nextConfig;
