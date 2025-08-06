"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { searchAnime, AnimeSearchResult } from "@/lib/api"

interface SearchPreviewProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
  initialQuery?: string // Added initialQuery prop
}

export function SearchPreview({ onSearch, placeholder = "Search anime...", className, initialQuery = "" }: SearchPreviewProps) {
  const [query, setQuery] = useState(initialQuery) // Initialize with initialQuery
  const [suggestions, setSuggestions] = useState<AnimeSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const router = useRouter()

  // Update internal query state if initialQuery changes (e.g., from URL)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Debounced search for suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        try {
          setLoading(true)
          const results = await searchAnime(query)
          setSuggestions(results)
          setShowSuggestions(true)
        } catch (error) {
          console.error("Search suggestions failed:", error)
          setSuggestions([])
        } finally {
          setLoading(false)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      setShowSuggestions(false)
      if (onSearch) {
        onSearch(searchQuery) // Use the provided onSearch callback
      } else {
        // Fallback if no onSearch is provided (e.g., direct navigation)
        router.push(`/?q=${encodeURIComponent(searchQuery)}`)
      }
    } else if (onSearch) {
      onSearch(""); // Allow clearing search
    } else {
      router.push("/"); // Go to homepage if query is empty
    }
  }

  const handleAnimeClick = (animeSessionId: string) => {
    setShowSuggestions(false)
    setQuery("") // Clear query after selection
    router.push(`/anime/${animeSessionId}`)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          type="search"
          placeholder={placeholder}
          className="pl-10 pr-4"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(query)
            }
            if (e.key === "Escape") {
              setShowSuggestions(false)
            }
          }}
          onFocus={() => {
            if (suggestions.length > 0 || query.trim().length >= 2) { // Show suggestions if already typed or if there are suggestions
              setShowSuggestions(true)
            }
          }}
          onBlur={() => {
            // Delay hiding to allow click on suggestion
            setTimeout(() => setShowSuggestions(false), 100);
          }}
        />
      </div>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 mt-2"
          >
            <Card className="border shadow-lg bg-background/95 backdrop-blur-sm">
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {suggestions.map((anime, index) => (
                      <motion.div
                        key={anime.session}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="flex items-center space-x-3 p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 transition-colors"
                        onClick={() => handleAnimeClick(anime.session)}
                      >
                        <div className="relative w-16 h-20 flex-shrink-0 rounded overflow-hidden">
                          <Image
                            src={anime.poster || "/placeholder.svg"}
                            alt={anime.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm line-clamp-1 mb-1">{anime.title}</h4>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-1">
                            <span>Episodes: {anime.episodes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Badge variant={anime.status === "Ongoing" ? "default" : "secondary"} className="text-xs">
                              {anime.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {anime.type}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div className="p-3 border-t bg-muted/50">
                      <button
                        onClick={() => handleSearch(query)}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        View all results for "{query}"
                      </button>
                    </div>
                  </div>
                ) : query.trim().length >= 2 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>No anime found for "{query}"</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close suggestions when clicking outside - removed as onBlur handles it */}
      {/* {showSuggestions && <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />} */}
    </div>
  )
}
