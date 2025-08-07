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
<<<<<<< HEAD
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
=======
        hostname: 'anime.apex-cloud.workers.dev',
        pathname: '/**',
      },
      {
        protocol: 'https', 
        hostname: 'i.animepahe.ru',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
>>>>>>> 633778944d1412981778c3b3b615553deafda409
    ],
  \},
\};

export default nextConfig;
