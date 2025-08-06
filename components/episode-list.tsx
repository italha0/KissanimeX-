"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download } from 'lucide-react'
import Link from "next/link"
import { SeriesEpisodeDetail } from "@/lib/api"
import { useState } from "react" // Import useState
import { DownloadModal } from "./download-modal" // Import DownloadModal
import { CustomImage } from "@/components/custom-image"

interface EpisodeListProps {
  sessionId: string
  episodes: SeriesEpisodeDetail[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function EpisodeList({ sessionId, episodes, currentPage, totalPages, onPageChange }: EpisodeListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<{
    sessionId: string;
    episodeNumber: string;
    episodeTitle: string;
  } | null>(null);

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

  const handleDownloadClick = (episode: SeriesEpisodeDetail) => {
    setSelectedEpisode({
      sessionId: sessionId,
      episodeNumber: episode.episode,
      episodeTitle: episode.title || `Episode ${episode.episode}`,
    });
    setIsModalOpen(true);
  };

  if (!episodes || episodes.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No episodes found for this series.</p>
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Episodes</h2>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mb-6">
          <Button onClick={handlePreviousPage} disabled={currentPage === 1} variant="outline">
            Previous
          </Button>
          <span className="text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button onClick={handleNextPage} disabled={currentPage === totalPages} variant="outline">
            Next
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {episodes.map((episode) => {
          const snapshotUrl = episode.snapshot || "/placeholder.svg?height=150&width=250&text=No Image";

          return (
            <Card
              key={episode.id} // Use episode.id as key
              className="w-full overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 bg-card"
            >
              <div className="relative w-full aspect-video bg-muted rounded-t-lg">
                <Image
                  src={snapshotUrl || "/placeholder.svg"}
                  alt={`Episode ${episode.episode} snapshot`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=150&width=250&text=No Image";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3 text-white">
                  <h3 className="text-sm font-semibold truncate">{episode.title || `Episode ${episode.episode}`}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs opacity-80">EP {episode.episode}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={() => handleDownloadClick(episode)} // Open modal on click
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
      {selectedEpisode && (
        <DownloadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sessionId={selectedEpisode.sessionId}
          episodeTitle={selectedEpisode.episodeTitle}
          episodeNumber={selectedEpisode.episodeNumber}
        />
      )}
    </div>
  )
}
