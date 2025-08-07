"use client"

import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { searchAnime } from "@/lib/api"
import { AnimeCard } from "@/components/anime-card"
import { SearchInput } from "@/components/search-input"

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("query") || ""

  console.log("Search query (in page.tsx):", query) // Debugging: Log the search query

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["searchAnime", query],
    queryFn: () => searchAnime(query),
    enabled: !!query, // Only run query if query is not empty
  })

  console.log("Search data (in page.tsx):", data) // Debugging: Log the fetched data
  console.log("Is loading (in page.tsx):", isLoading) // Debugging: Log loading state
  console.log("Is error (in page.tsx):", isError, error) // Debugging: Log error state and message

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-center">
        <SearchInput />
      </div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {query ? `Search Results for "${query}"` : "Enter a search query"}
      </h2>

      {isLoading && query && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-full aspect-[2/3] bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      )}

      {isError && query && (
        <p className="text-red-500 text-center">Error: {error?.message || "Failed to fetch search results."}</p>
      )}

      {!query && <p className="text-center text-gray-600">Please enter an anime name to search.</p>}

      {data && data.length === 0 && query && (
        <p className="text-center text-gray-600">No results found for "{query}".</p>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {data.map((anime) => (
            <AnimeCard key={anime.session} anime={anime} />
          ))}
        </div>
      )}
    </div>
  )
}
