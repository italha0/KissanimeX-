import type React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

// --- SEO ENHANCEMENTS START HERE ---

// Let's define the site's base URL. Replace with your actual domain.
const siteUrl = "https://animepahi.vercel.app";

const trendingAnime = [
  // --- Current Trending 2025 ---
  "Solo Leveling Season 2",
  "The Apothecary Diaries Season 2",
  "Frieren: Beyond Journey’s End",
  "Sakamoto Days",
  "Re:ZERO Season 3",
  "Demon Slayer Infinity Castle Arc",
  "Lazarus",
  "Bocchi the Rock Movie",
  "Blue Lock Season 2",
  "Dandadan",
  "Kaiju No. 8 Season 2",
  "Naruto / Naruto: Shippuden",
  "Dragon Ball Z",
  "One Piece",
  "Fullmetal Alchemist: Brotherhood",
  "Attack on Titan",
  "Neon Genesis Evangelion",
  "Death Note",
  "My Hero Academia",
  "Cowboy Bebop",
  "Spirited Away",
  "Dragon Ball Daima",
  "Jujutsu Kaisen Season 3",
  "Spy × Family Season 3",
  "Chainsaw Man: The Movie – Reze Arc",
  "Demon Slayer: Infinity Castle (Movie Trilogy)",
  "Jujutsu Kaisen: Hidden Inventory / Premature Death (Movie)",
  "Hunter × Hunter: Dark Continent Arc",
  "Sword Art Online: Unital Ring",
  "Black Butler: Emerald Witch Arc (Season 5)",
  "Fire Force Season 3",
  "Mobile Suit Gundam GQuuuuuuX",
  "YAIBA",
  "Digimon Beatbreak",
  "Steins;Gate",
  "Monster",
  "Code Geass: Lelouch of the Rebellion",
  "Legend of the Galactic Heroes",
  "Your Name (Kimi no Na wa)",
  "Clannad: After Story",
  "Made in Abyss",
  "Paranoia Agent",
  "The Tatami Galaxy",
  "Akira",
  "Perfect Blue"
];

export const metadata: Metadata = {
  // Use a metadataBase for creating absolute URLs, which is better for SEO.
  metadataBase: new URL(siteUrl),

  title: "Animepahe Downloader",
  description: `Download anime fast and free from sources like AnimePahe, Zoro, and Kissanime. Stream and save your favorite episodes in HD. Trending now: ${trendingAnime.join(
    ", "
  )}.`,

  // The keywords meta tag is less important for Google now, but can be useful for other engines.
  keywords: [
    "anime download",
    "anime downloader",
    "animepahe download",
    "kissanime replacement",
    "zoro anime",
    "anime hd download",
    "free anime episodes",
    "download anime episodes",
    ...trendingAnime, // Dynamically add trending anime to keywords
  ],

  // --- NEW: Add Canonical URL and Robots Meta Tag ---
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  // --- NEW: Open Graph (for Facebook, Discord, etc.) & Twitter Cards ---
  openGraph: {
    title: "Fast Anime Downloads: Your Ultimate Anime Downloader",
    description: "The best place to download your favorite anime episodes in HD, fast and for free.",
    url: siteUrl,
    siteName: "AnimePahi", // Or your site's name
    // Add an image URL for social media previews.
    // This image should be at least 1200x630 pixels.
    images: [
      {
        url: `${siteUrl}/og-image.png`, // Create an image and place it in your /public folder
        width: 1200,
        height: 630,
        alt: "AnimePahi - Fast Anime Downloads",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fast Anime Downloads: Your Ultimate Anime Downloader",
    description: "The best place to download your favorite anime episodes in HD, fast and for free.",
    // Add your Twitter handle if you have one.
    // creator: "@yourTwitterHandle", 
    images: [`${siteUrl}/og-image.png`], // Must be an absolute URL
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // --- NEW: JSON-LD Structured Data ---
  // This helps Google understand your site and can enable rich search results,
  // like a search box directly in the Google search results for your site.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AnimePahi', // Your site's name
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en">
      <head>
        {/* Google Analytics & Site Verification (your existing code is great) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TYXH040FTH"
          strategy="afterInteractive"
        />
        <meta
          name="google-site-verification"
          content="F_PXwJQGHuXbPkZyAULxGnkQDHsRLabg6BuBJHzhNMM"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TYXH040FTH');
          `}
        </Script>

        {/* Add JSON-LD Structured Data to the head */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <div className="bg-black text-white min-h-screen">
          <QueryProvider>{children}</QueryProvider>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}