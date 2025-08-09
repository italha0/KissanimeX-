"use client" // This page needs to be a client component to manage modal state

import Image from "next/image"
import { getSeriesEpisodes, getEpisodeDownloadLinks } from "@/lib/api"
import { EpisodeList } from "@/components/episode-list"
import { DownloadModal } from "@/components/download-modal" // Import the new modal component
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Head from "next/head"

interface AnimeDetailsPageProps {
  params: {
    sessionId: string
  }
}

export default function AnimeDetailsPage({ params }: AnimeDetailsPageProps) {
  const { sessionId } = params

  // State for the download modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEpisodeSessionId, setSelectedEpisodeSessionId] = useState<string | null>(null)
  const [selectedEpisodeTitle, setSelectedEpisodeTitle] = useState<string>("")
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState<string>("")

  // Fetch series details (server-side initial fetch, then client-side re-fetch if needed)
  const {
    data: seriesData,
    isLoading: isSeriesLoading,
    isError: isSeriesError,
    error: seriesError,
  } = useQuery({
    queryKey: ["seriesEpisodes", sessionId, 1], // Always fetch page 1 initially for details
    queryFn: () => getSeriesEpisodes(sessionId, 1),
  })

  // Fetch episode download links when an episode is selected
  const {
    data: modalDownloadLinks,
    isLoading: isModalLoading,
    isError: isModalError,
  } = useQuery({
    queryKey: ["episodeDownloadLinks", selectedEpisodeSessionId],
    queryFn: () => getEpisodeDownloadLinks(sessionId, selectedEpisodeSessionId!),
    enabled: !!selectedEpisodeSessionId, // Only fetch when an episode is selected
  })

  const handleDownloadClick = (episodeSessionId: string, episodeTitle: string, episodeNumber: string) => {
    setSelectedEpisodeSessionId(episodeSessionId)
    setSelectedEpisodeTitle(episodeTitle)
    setSelectedEpisodeNumber(episodeNumber)
    setIsModalOpen(true) // Open the modal
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEpisodeSessionId(null) // Reset selected episode when closing
    setSelectedEpisodeTitle("")
    setSelectedEpisodeNumber("")
  }

  if (isSeriesLoading) {
    return <div className="container mx-auto p-4 text-gray-600 text-center mt-8">Loading anime details...</div>
  }

  if (isSeriesError) {
    return (
      <div className="container mx-auto p-4 text-red-500 text-center mt-8">
        Error: {seriesError?.message || "Failed to load anime details."}
      </div>
    )
  }

  if (!seriesData) {
    return <div className="container mx-auto p-4 text-gray-600 text-center mt-8">No anime data found.</div>
  }

  const proxyBase = "https://anime.apex-cloud.workers.dev/proxy?modify&proxyUrl="

  const posterUrl = seriesData.poster
    ? `${proxyBase}${encodeURIComponent(seriesData.poster)}`
    : "/placeholder.svg?height=450&width=300"

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* <div className="relative w-full md:w-1/3 lg:w-1/4 aspect-[2/3] rounded-lg overflow-hidden shadow-lg bg-gray-200">
          <Image
            src={posterUrl || "/placeholder.svg"} // Use the direct URL here
            alt={seriesData.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: "cover" }}
            className="rounded-lg"
            priority
          />
        </div> */}
        <div className="items-center justify-center mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{seriesData.title}</h1>
          {seriesData.synopsis && <p className="text-gray-700 leading-relaxed mb-4">{seriesData.synopsis}</p>}
          <p className="text-sm text-gray-600 flex justify-center">Total Episodes: {seriesData.episodes?.length || 0}</p>
        </div>
      </div>

      {/* Pass the handleDownloadClick function to EpisodeList */}
      <EpisodeList sessionId={sessionId} initialEpisodesData={seriesData} onDownloadClick={handleDownloadClick} />

      {/* Render the DownloadModal */}
      <DownloadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        episodeTitle={selectedEpisodeTitle}
        episodeNumber={selectedEpisodeNumber}
        downloadLinks={modalDownloadLinks}
        isLoading={isModalLoading}
        isError={isModalError}
      />
    </div>
  )
}
