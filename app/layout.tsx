import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/lib/query-provider"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Fast Anime Downloads: Your Ultimate Anime Downloader",
  description:
    "Download anime fast and free from sources like AnimePahe, Zoro, and Kissanime. Stream and save your favorite episodes in HD without ads. Trending now: Solo Leveling Season 2, The Apothecary Diaries Season 2, Frieren: Beyond Journey’s End, Sakamoto Days, Re:ZERO Season 3, Demon Slayer Infinity Castle Arc, Lazarus, Bocchi the Rock Movie, Blue Lock Season 2, Dandadan.",
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
    "solo leveling season 2",
    "Kaiju No. 8 Season 2",
    "the apothecary diaries season 2",
    "frieren beyond journey's end",
    "sakamoto days",
    "rezero season 3",
    "demon slayer infinity castle",
    "lazarus anime",
    "bocchi the rock movie",
    "blue lock season 2",
    "dandadan anime",
  ]
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="bg-[url('/bg-main.svg')] bg-no-repeat bg-center bg-cover">
          <QueryProvider>{children}</QueryProvider></div>
        
        <Analytics />
        <SpeedInsights/>
      </body>
    </html>
  )
}
