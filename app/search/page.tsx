"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { searchAnime, type AnimeSearchResult } from "@/lib/api"
import { AnimeCard } from "@/components/anime-card"
import { SearchInput } from "@/components/search-input"

function Results() {
  const searchParams = useSearchParams()
  const query = searchParams.get("query") || ""
  const { data, isLoading, isError, error } = useQuery<AnimeSearchResult[]>({
    queryKey: ["searchAnime", query],
    queryFn: () => searchAnime(query),
    enabled: !!query,
  })

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4">
      {/* Search bar */}
      <div className="mb-4 sm:mb-6 flex justify-center">
        <SearchInput />
      </div>

      {/* Back home */}
      <div className="flex items-center justify-center mb-2">
        <Link href="/" className="text-sm text-gray-200 hover:underline">
          {"\u2190"} Home
        </Link>
      </div>

      <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-200 text-center sm:text-left">
        {query ? `Search Results for "${query}"` : "Enter a search query"}
      </h2>

      {/* Loading skeleton */}
      {isLoading && query && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-full aspect-[2/3] bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && query && (
        <p className="text-red-500 text-center">
          Error: {(error as Error)?.message || "Failed to fetch search results."}
        </p>
      )}

      {/* Empty query */}
      {!query && <p className="text-center text-gray-200">Please enter an anime name to search.</p>}

      {/* No results */}
      {data && data.length === 0 && query && (
        <p className="text-center text-gray-200">No results found for "{query}".</p>
      )}

      {/* Results grid */}
      {data && data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4  xl:grid-cols-5 gap-3 sm:gap-4 ">
          {data.map((anime) => (
            <AnimeCard key={anime.session} anime={anime} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchResultsPage() {
  const queryClient = useMemo(() => new QueryClient(), [])
  return (
    <QueryClientProvider client={queryClient}>
      <Results />
    </QueryClientProvider>
  )
}
