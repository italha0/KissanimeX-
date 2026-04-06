/** @type {import('next').NextConfig} */
import withBundleAnalyzer from "@next/bundle-analyzer";

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
      // AnimePahe .pw domain (Posters)
      {
        protocol: "https",
        hostname: "i.animepahe.pw",
        port: "",
        pathname: "/posters/**",
      },
      // AnimePahe .pw domain (Snapshots)
      {
        protocol: "https",
        hostname: "i.animepahe.pw",
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

  // 🚀 Modern build config
  experimental: {
    legacyBrowsers: false, // don’t generate IE11/old polyfills
    browsersListForSwc: true, // respect browserslist in package.json
  },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);
