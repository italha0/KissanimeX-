import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/lib/query-provider"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Fast Anime Downloads: Your Ultimate Anime Downloader Guide",
  description:
    "Download anime fast and free from sources like AnimePahe, Zoro, and Kissanime. Stream and save your favorite episodes in HD without ads.",
  keywords: [
    "anime download",
    "anime downloader",
    "animepahe download",
    "kissanime replacement",
    "zoro anime",
    "anime hd download",
    "free anime episodes",
    "download anime episodes",
    "anime torrent",
    "anime direct download",
  ],
  openGraph: {
    title: "Anime Downloader",
    description:
      "Fast anime download site with support for AnimePahe, Zoro, Kissanime and more. Stream or save episodes in HD.",
    url: "https://your-site-url.com",
    siteName: "Anime Downloader",
    images: [
      {
        url: "https://your-site-url.com/preview.jpg",
        width: 1200,
        height: 630,
        alt: "Anime Downloader Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anime Downloader",
    description:
      "Stream or download anime from AnimePahe, Zoro, and more with ease.",
    images: ["https://your-site-url.com/preview.jpg"],
    creator: "@yourTwitterHandle",
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
        <Analytics />
        <SpeedInsights />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2892825507816139"
          crossorigin="anonymous"></script>
      </body>
    </html>
  )
}
