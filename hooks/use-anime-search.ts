"use client"

import { useState, useEffect } from "react"
import { searchAnimeByQuery, AnimeSearchResult } from "@/lib/api"

interface UseAnimeSearchParams {
query?: string
}

export function useAnimeSearch(params: UseAnimeSearchParams) {
const [data, setData] = useState<AnimeSearchResult[]>([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [totalResults, setTotalResults] = useState(0)

useEffect(() => {
  const searchAnimeFunc = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await searchAnimeByQuery(params.query || "")

      setData(response)
      setTotalResults(response.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setData([])
      setTotalResults(0)
    } finally {
      setLoading(false)
    }
  }

  searchAnimeFunc()
}, [params.query])

return {
  data,
  loading,
  error,
  totalResults,
}
}
