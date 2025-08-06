"use client"

import { useEffect, useState, Suspense } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimeGrid } from "@/components/anime-grid"
import Image from "next/image"
import { getTrendingAnime, getPopularAnime, searchAnime, AnimeSearchResult } from "@/lib/api" // Added searchAnime
import { SearchPreview } from "@/components/search-preview"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams, useRouter } from "next/navigation" // Import useSearchParams and useRouter

// Hero Section Component
function HeroSectionContent({ featuredAnime }: { featuredAnime: AnimeSearchResult | null }) {
const heroImageUrl = featuredAnime?.poster || "/placeholder.svg?height=700&width=1200&text=Featured Anime";

return (
  <section className="relative h-[70vh] overflow-hidden">
    <div className="absolute inset-0">
      <Image
        src={heroImageUrl || "/placeholder.svg"}
        alt={featuredAnime?.title || "Featured Anime"}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
    </div>

    <div className="relative container h-full flex items-center">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl text-white"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Badge variant="secondary" className="bg-primary text-primary-foreground">
            Featured
          </Badge>
          <Badge variant="outline" className="border-white/20 text-white">
            {featuredAnime?.status}
          </Badge>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-4">{featuredAnime?.title || "Loading..."}</h1>

        <div className="flex items-center space-x-4 mb-6 text-sm">
          <span>Type: {featuredAnime?.type || "N/A"}</span>
          <span>Status: {featuredAnime?.status || "N/A"}</span>
          <span>Episodes: {featuredAnime?.episodes || "N/A"}</span>
        </div>

        <p className="text-lg mb-8 text-white/90 leading-relaxed">No description available from this API for search results.</p>

        <div className="flex items-center space-x-4">
          {featuredAnime && (
            <Link href={`/anime/${featuredAnime.session}`}>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                More Info
              </Button>
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  </section>
);
}

// Featured Anime Section Component (Client Component for suspense)
function FeaturedAnimeSection({ type }: { type: "trending" | "popular" }) {
const { data: animeData, isLoading, isError, error } = useQuery({
  queryKey: [type === "trending" ? "trendingAnime" : "popularAnime"],
  queryFn: () => (type === "trending" ? getTrendingAnime() : getPopularAnime()),
  staleTime: 1000 * 60 * 5, // 5 minutes
});

if (isLoading) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-full aspect-[2/3] bg-muted animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

if (isError) {
  return <p className="text-center text-red-500">Error loading {type} anime: {error.message}</p>;
}

return (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
    <h2 className="text-2xl font-bold mb-6">{type === "trending" ? "Trending This Week" : "All Time Popular"}</h2>
    {animeData && animeData.length > 0 ? (
      <AnimeGrid data={animeData} type={type} />
    ) : (
      <p className="text-center text-muted-foreground">No {type} anime found at the moment.</p>
    )}
  </motion.div>
);
}


export default function HomePage() {
const searchParams = useSearchParams();
const router = useRouter();
const query = searchParams.get("q") || "";

const [activeTab, setActiveTab] = useState("trending")

// Fetch trending anime for the hero section and initial tab
const { data: trendingAnime, isLoading: isLoadingTrending } = useQuery({
  queryKey: ["trendingAnime"],
  queryFn: () => getTrendingAnime(),
  staleTime: 1000 * 60 * 5, // 5 minutes
});

// Fetch search results if a query is present
const { data: searchResults, isLoading: isLoadingSearch, isError: isSearchError, error: searchError } = useQuery({
  queryKey: ["searchResults", query],
  queryFn: () => searchAnime(query),
  enabled: !!query, // Only fetch if query is not empty
  staleTime: 1000 * 60 * 5, // 5 minutes
});

const featuredAnime = trendingAnime?.[0] || null;

const handleSearch = (searchQuery: string) => {
  if (searchQuery.trim()) {
    router.push(`/?q=${encodeURIComponent(searchQuery)}`);
  } else {
    router.push(`/`); // Clear search if query is empty
  }
};

if (isLoadingTrending && !query) { // Only show full loading if no search query
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading anime data...</p>
      </div>
    </div>
  )
}

return (
  <div className="min-h-screen">
    {/* Hero Section (only if no search query) */}
    {!query && <HeroSectionContent featuredAnime={featuredAnime} />}

    {/* Central Search Bar */}

    {/* Conditional Content: Search Results or Trending/Popular */}
    <section className="container py-12">
      {query ? (
        // Display Search Results
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Search Results for "{query}"</h2>
            <Badge variant="secondary">
              {searchResults?.length || 0} result{(searchResults?.length || 0) !== 1 ? "s" : ""}
            </Badge>
          </div>

          {isLoadingSearch ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-muted rounded-lg mb-2"></div>
                  <div className="h-4 bg-muted rounded mb-1"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : isSearchError ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12 text-red-500">
              <p>Error fetching search results: {searchError.message}</p>
            </motion.div>
          ) : searchResults && searchResults.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <AnimeGrid data={searchResults} />
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
              <div className="text-muted-foreground text-lg mb-4">No anime found matching your criteria</div>
            </motion.div>
          )}
        </div>
      ) : (
        // Display Trending/Popular Tabs
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="trending" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Trending</span>
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Popular</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="trending" className="space-y-8">
            <Suspense fallback={
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-full aspect-[2/3] bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            }>
              <FeaturedAnimeSection type="trending" />
            </Suspense>
          </TabsContent>

          <TabsContent value="popular" className="space-y-8">
            <Suspense fallback={
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-full aspect-[2/3] bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            }>
              <FeaturedAnimeSection type="popular" />
            </Suspense>
          </TabsContent>
        </Tabs>
      )}
    </section>
  </div>
)
}
