'use client'

import { useState } from "react"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { getSeriesEpisodes } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface EpisodeListProps {
  sessionId: string
  onDownloadClick: (episodeSessionId: string, episodeTitle: string, episodeNumber: string) => void
}

export function EpisodeList({ sessionId, onDownloadClick }: EpisodeListProps) {
  const [currentPage, setCurrentPage] = useState(1)

  // This hook will fetch the episode data when the component is rendered.
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["seriesEpisodes", sessionId, currentPage],
    queryFn: () => getSeriesEpisodes(sessionId, currentPage),
    placeholderData: (previousData) => previousData,
  })

  const episodesToDisplay = data?.episodes
  const currentTotalPages = data?.pagination?.total_pages || 1

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < currentTotalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  if (isLoading && !episodesToDisplay) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-black">Episodes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-full aspect-video bg-gray-800 animate-pulse rounded-2xl shadow-sm" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return <p className="text-red-500 text-center mt-4">Error: {error?.message || "Failed to load episodes."}</p>
  }

  if (!episodesToDisplay || episodesToDisplay.length === 0) {
    return <p className="text-black text-center mt-4">No episodes found for this series.</p>
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-black">Episodes</h2>

      {currentTotalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mb-6">
          <Button
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || isLoading}
            variant="outline"
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <span className="text-black px-3 py-1 rounded-full bg-gray-700">
            Page {currentPage} of {currentTotalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === currentTotalPages || isLoading}
            variant="outline"
            className="rounded-full"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {episodesToDisplay.map((episode) => {
          const snapshotUrl = episode.snapshot || "/placeholder.svg?height=150&width=250"
          const epNumber = String(episode.episode || "").padStart(2, "0")
          const epTitle = episode.title || `Episode ${episode.episode}`
          return (
            <Card
              key={episode.session}
              className="group w-full py-0 overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 border-0"
            >
              <div className="relative w-full aspect-[16/9] bg-gray-800">
                <Image
                  src={snapshotUrl}
                  alt={epTitle}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                  className="rounded-2xl"
                  priority
                  quality={70}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-90" />
                <div className="absolute left-3 right-3 bottom-3">
                  <div className="flex items-center justify-between gap-3 rounded-full border border-white/10 bg-neutral-900/55 backdrop-blur-md px-4 py-2">
                    <p
                      className="text-white text-sm font-medium truncate"
                      title={epTitle}
                    >
                      {epTitle}
                    </p>
                    <Button
                      type="button"
                      onClick={() => onDownloadClick(episode.session, epTitle, String(episode.episode))}
                      className="h-8 px-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs"
                    >
                      {"EP "}{epNumber}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
