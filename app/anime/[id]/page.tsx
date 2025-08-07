"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { BookOpen, ArrowLeft, ImageIcon, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { getAnimeDetails } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { EpisodeList } from "@/components/episode-list"

export default function AnimeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const animeSessionId = params.id as string
  const [activeTab, setActiveTab] = useState("episodes")
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch anime details with React Query
  const { data: anime, isLoading, isError, error } = useQuery({
    queryKey: ["animeDetails", animeSessionId, currentPage],
    queryFn: () => getAnimeDetails(animeSessionId, currentPage),
    enabled: !!animeSessionId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/placeholder.svg"
  }

  const handleBackdropError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/placeholder.svg"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        {/* Loading Hero Section */}
        <section className="relative h-[60vh] bg-muted animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="relative container h-full flex items-end pb-12">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-6 md:space-y-0 md:space-x-8">
              <div className="w-[300px] h-[450px] bg-muted/50 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="h-12 bg-muted/50 rounded w-2/3"></div>
                <div className="h-6 bg-muted/50 rounded w-1/2"></div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-muted/50 rounded w-20"></div>
                  <div className="h-4 bg-muted/50 rounded w-16"></div>
                  <div className="h-4 bg-muted/50 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading anime details...</p>
          </div>
        </section>
      </div>
    )
  }

  if (isError || !anime) {
    return (
      <div className="container py-12">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold">Anime Not Found</h1>
          <p className="text-muted-foreground">
            {error?.message || `The anime with ID "${animeSessionId}" could not be found.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => router.push("/")}>Search Anime</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={anime.poster}
            alt={`${anime.title} backdrop`}
            fill
            className="object-cover"
            priority
            quality={90}
            onError={handleBackdropError}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>

        <div className="relative container h-full flex items-end pb-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row items-start md:items-end space-y-6 md:space-y-0 md:space-x-8 text-white"
          >
            <div className="flex-shrink-0 relative">
              <div className="relative w-[300px] h-[450px] rounded-lg overflow-hidden shadow-2xl bg-muted">
                <Image
                  src={anime.poster}
                  alt={`${anime.title} poster`}
                  fill
                  className="object-cover"
                  quality={90}
                  onError={handleImageError}
                  sizes="300px"
                />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{anime.title}</h1>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span>Episodes: {anime.episode}</span>
                <Badge variant={anime.status === "Ongoing" ? "default" : "secondary"}>
                  {anime.status}
                </Badge>
                <Badge variant="outline">{anime.type}</Badge>
              </div>

              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Download className="h-3 w-3" />
                  <span>Download Available</span>
                </Badge>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="episodes" className="space-y-6 mt-8">
            {anime.episodes ? (
              <EpisodeList
                sessionId={anime.session}
                episodes={anime.episodes}
                currentPage={anime.pagination?.current_page ?? 1}
                totalPages={anime.pagination?.total_pages ?? 1}
                onPageChange={setCurrentPage}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No episodes available for download.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-8 mt-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Synopsis</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {anime.synopsis || "No synopsis available for this anime."}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <dt className="font-semibold text-sm text-muted-foreground">Type</dt>
                      <dd>{anime.type}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-sm text-muted-foreground">Status</dt>
                      <dd>{anime.status}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-sm text-muted-foreground">Total Episodes</dt>
                      <dd>{anime.episode}</dd>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Download className="h-5 w-5" />
                      <span>Download Info</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>• Direct download links available</p>
                    <p>• Multiple quality options</p>
                    <p>• Copyable URLs for download managers</p>
                    <p>• No streaming - download only</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}