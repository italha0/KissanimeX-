"use client"

import { useState } from "react"
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

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

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
                src={episode.snapshot || "/placeholder.svg?height=200&width=300&text=Episode"}
                alt={`Episode ${episode.episode} thumbnail`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=200&width=300&text=Episode"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute top-2 left-2">
                <Badge variant="secondary">EP {episode.episode}</Badge>
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
    </div>
  )
}