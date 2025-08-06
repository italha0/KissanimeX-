"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Filter } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { AnimeGrid } from "@/components/anime-grid"
import { motion } from "framer-motion"
import { searchAnime, AnimeSearchResult } from "@/lib/api" // Changed import to searchAnime
import { SearchPreview } from "@/components/search-preview"
import { useQuery } from "@tanstack/react-query"

export default function SearchPage() {
const searchParams = useSearchParams()
const initialQuery = searchParams.get("q") || ""

const [query, setQuery] = useState(initialQuery)

// Debounced query for API calls
const [debouncedQuery, setDebouncedQuery] = useState(query)

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(query)
  }, 300)

  return () => clearTimeout(timer)
}, [query])

// Use React Query for data fetching
const { data: filteredAnime, isLoading, isError, error } = useQuery({
  queryKey: ["searchAnime", debouncedQuery],
  queryFn: () => searchAnime(debouncedQuery),
  enabled: debouncedQuery.trim().length > 0, // Only fetch if query is not empty
  staleTime: 1000 * 60 * 5, // 5 minutes
});

const totalResults = filteredAnime?.length || 0;

return (
  <div className="container py-8">
    <div className="space-y-8">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Search Anime</h1>
        <SearchPreview
          placeholder="Search for anime titles..."
          className="w-full"
          onSearch={(searchQuery) => setQuery(searchQuery)}
        />
      </div>

      {/* Filters - Simplified as new API only supports query search */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters:</span>
        </div>
        <p className="text-sm text-muted-foreground">Only search by query is supported by the current API.</p>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{query ? `Search Results for "${query}"` : "All Anime"}</h2>
          <Badge variant="secondary">
            {totalResults} result{totalResults !== 1 ? "s" : ""}
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted rounded-lg mb-2"></div>
                <div className="h-4 bg-muted rounded mb-1"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12 text-red-500">
            <p>Error fetching search results: {error.message}</p>
          </motion.div>
        ) : filteredAnime && filteredAnime.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <AnimeGrid data={filteredAnime} />
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">No anime found matching your criteria</div>
          </motion.div>
        )}
      </div>
    </div>
  </div>
)
}
