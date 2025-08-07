"use client"

import { useState } from "react"
<<<<<<< HEAD
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
=======
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from "next/image"
import { SeriesEpisode } from "@/lib/api"
import { DownloadModal } from "./download-modal"

interface EpisodeListProps {
  sessionId: string
  episodes: SeriesEpisode[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function EpisodeList({ 
  sessionId, 
  episodes, 
  currentPage, 
  totalPages, 
  onPageChange 
}: EpisodeListProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<{
    sessionId: string
    episodeId: string
    episodeTitle: string
    episodeNumber: string
  } | null>(null)

  const handleDownloadClick = (episode: SeriesEpisode) => {
    setSelectedEpisode({
      sessionId: sessionId,
      episodeId: episode.session, // Use episode session as episode ID
      episodeTitle: episode.title || `Episode ${episode.episode}`,
      episodeNumber: episode.episode,
    })
  }
>>>>>>> 633778944d1412981778c3b3b615553deafda409

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

<<<<<<< HEAD
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
=======
  if (!episodes || episodes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-4">No episodes found</div>
        <p className="text-sm text-muted-foreground">This series might not have episodes available yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Episodes</h2>
        <Badge variant="secondary">{episodes.length} episodes</Badge>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button 
            onClick={handlePreviousPage} 
            disabled={currentPage === 1} 
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          
          <Button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages} 
            variant="outline"
            size="sm"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Episodes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {episodes.map((episode) => (
          <Card key={episode.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-video bg-muted">
              <Image
                src={episode.snapshot}
                alt={`Episode ${episode.episode} thumbnail`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute top-2 left-2">
                <Badge variant="secondary">EP {episode.episode}</Badge>
>>>>>>> 633778944d1412981778c3b3b615553deafda409
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm line-clamp-2 mb-3">
                {episode.title || `Episode ${episode.episode}`}
              </h3>
              
              <Button
                onClick={() => handleDownloadClick(episode)}
                className="w-full"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Episode
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
<<<<<<< HEAD
=======

      {/* Download Modal */}
      {selectedEpisode && (
        <DownloadModal
          isOpen={!!selectedEpisode}
          onClose={() => setSelectedEpisode(null)}
          sessionId={selectedEpisode.sessionId}
          episodeId={selectedEpisode.episodeId}
          episodeTitle={selectedEpisode.episodeTitle}
          episodeNumber={selectedEpisode.episodeNumber}
        />
      )}
>>>>>>> 633778944d1412981778c3b3b615553deafda409
    </div>
  )
}