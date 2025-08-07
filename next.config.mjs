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
      // AnimePahe Posters
      {
        protocol: "https",
        hostname: "i.animepahe.ru",
        port: "",
        pathname: "/posters/**",
      },
      // AnimePahe Snapshots
      {
        protocol: "https",
        hostname: "i.animepahe.ru",
        port: "",
        pathname: "/snapshots/**",
      },
      // Anime API Proxy (if needed)
      {
        protocol: "https",
        hostname: "anime.apex-cloud.workers.dev",
        port: "",
        pathname: "/**",
      },
      // Placeholder images
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
