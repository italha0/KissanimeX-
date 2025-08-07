"use client"

import { useState } from "react"
import Image from "next/image" // Import Image component
import { useQuery } from "@tanstack/react-query"
import { getSeriesEpisodes } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card" // Import Card components
import { ChevronLeft, ChevronRight, Download } from "lucide-react"

interface EpisodeListProps {
  sessionId: string
  initialEpisodesData: Awaited<ReturnType<typeof getSeriesEpisodes>>
  onDownloadClick: (episodeSessionId: string, episodeTitle: string, episodeNumber: string) => void
}

export function EpisodeList({ sessionId, initialEpisodesData, onDownloadClick }: EpisodeListProps) {
  const [currentPage, setCurrentPage] = useState(initialEpisodesData?.pagination?.current_page || 1)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["seriesEpisodes", sessionId, currentPage],
    queryFn: () => getSeriesEpisodes(sessionId, currentPage),
    initialData:
      currentPage === (initialEpisodesData?.pagination?.current_page || 1) && initialEpisodesData
        ? initialEpisodesData
        : undefined,
    placeholderData: (previousData) => previousData,
  })

  const episodesToDisplay = data?.episodes || initialEpisodesData?.episodes
  const currentTotalPages = data?.pagination?.total_pages || initialEpisodesData?.pagination?.total_pages || 1

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

  if (isError) {
    return <p className="text-red-500 text-center mt-4">Error: {error?.message || "Failed to load episodes."}</p>
  }

  if (isLoading && !episodesToDisplay) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Episodes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-full aspect-video bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!episodesToDisplay || episodesToDisplay.length === 0) {
    return <p className="text-gray-600 text-center mt-4">No episodes found for this series.</p>
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Episodes</h2>
      {currentTotalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mb-6">
          <Button onClick={handlePreviousPage} disabled={currentPage === 1 || isLoading} variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          <span className="text-gray-700">
            Page {currentPage} of {currentTotalPages}
          </span>
          <Button onClick={handleNextPage} disabled={currentPage === currentTotalPages || isLoading} variant="outline">
            Next <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {episodesToDisplay.map((episode) => {
          // Use the direct snapshot URL, as i.animepahe.ru is now configured in next.config.mjs
          const snapshotUrl = episode.snapshot || "/placeholder.svg?height=150&width=250"

          return (
            <Card
              key={episode.session}
              className="w-full overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="relative w-full aspect-video bg-gray-200">
                <Image
                  src={snapshotUrl || "/placeholder.svg"}
                  alt={`${episode.title || `Episode ${episode.episode}`}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  style={{ objectFit: "cover" }}
                  className="rounded-t-lg"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3 text-white">
                  <h3 className="text-sm font-semibold truncate">{episode.title || `Episode ${episode.episode}`}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs opacity-80">EP {episode.episode}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={() =>
                        onDownloadClick(episode.session, episode.title || `Episode ${episode.episode}`, episode.episode)
                      }
                    >
                      <Download className="h-3 w-3 mr-1" /> Download
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
