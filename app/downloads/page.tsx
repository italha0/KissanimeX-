"use client"

import { useState, useEffect } from "react"
import { Download, Pause, Play, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

interface DownloadItem {
  id: string
  animeTitle: string
  episodeNumber: number
  episodeTitle: string
  progress: number
  status: "downloading" | "paused" | "completed" | "error" | "queued"
  speed: string
  size: string
  timeRemaining: string
  downloadType: "direct" | "magnet" | "torrent"
}

// Mock download data - This page is for a download manager, not recent searches
const mockDownloads: DownloadItem[] = [
  {
    id: "1",
    animeTitle: "Jujutsu Kaisen",
    episodeNumber: 1,
    episodeTitle: "Ryomen Sukuna",
    progress: 75,
    status: "downloading",
    speed: "2.5 MB/s",
    size: "350 MB",
    timeRemaining: "2m 30s",
    downloadType: "direct",
  },
  {
    id: "2",
    animeTitle: "Demon Slayer",
    episodeNumber: 12,
    episodeTitle: "Final Selection",
    progress: 100,
    status: "completed",
    speed: "0 MB/s",
    size: "420 MB",
    timeRemaining: "0s",
    downloadType: "direct", // Changed to direct as streaming is removed
  },
  {
    id: "3",
    animeTitle: "Attack on Titan",
    episodeNumber: 5,
    episodeTitle: "The Struggle for Trost",
    progress: 45,
    status: "paused",
    speed: "0 MB/s",
    size: "380 MB",
    timeRemaining: "5m 12s",
    downloadType: "direct", // Changed to direct as streaming is removed
  },
  {
    id: "4",
    animeTitle: "Chainsaw Man",
    episodeNumber: 3,
    episodeTitle: "Meowy's Whereabouts",
    progress: 0,
    status: "queued",
    speed: "0 MB/s",
    size: "290 MB",
    timeRemaining: "Queued",
    downloadType: "direct",
  },
  {
    id: "5",
    animeTitle: "Spy x Family",
    episodeNumber: 8,
    episodeTitle: "The Counter-Secret Police",
    progress: 25,
    status: "error",
    speed: "0 MB/s",
    size: "315 MB",
    timeRemaining: "Error",
    downloadType: "direct", // Changed to direct as streaming is removed
  },
]

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>(mockDownloads)
  const [activeTab, setActiveTab] = useState("all")

  // Simulate download progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads((prev) =>
        prev.map((download) => {
          if (download.status === "downloading" && download.progress < 100) {
            const newProgress = Math.min(download.progress + Math.random() * 5, 100)
            return {
              ...download,
              progress: newProgress,
              status: newProgress >= 100 ? "completed" : "downloading",
            }
          }
          return download
        }),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const handlePauseResume = (id: string) => {
    setDownloads((prev) =>
      prev.map((download) => {
        if (download.id === id) {
          return {
            ...download,
            status: download.status === "downloading" ? "paused" : "downloading",
          }
        }
        return download
      }),
    )
  }

  const handleDelete = (id: string) => {
    setDownloads((prev) => prev.filter((download) => download.id !== id))
  }

  const handleRetry = (id: string) => {
    setDownloads((prev) =>
      prev.map((download) => {
        if (download.id === id) {
          return {
            ...download,
            status: "downloading",
            progress: 0,
          }
        }
        return download
      }),
    )
  }

  const getStatusIcon = (status: DownloadItem["status"]) => {
    switch (status) {
      case "downloading":
        return <Download className="h-4 w-4 text-blue-500" />
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "queued":
        return <Clock className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: DownloadItem["status"]) => {
    switch (status) {
      case "downloading":
        return "bg-blue-500"
      case "paused":
        return "bg-yellow-500"
      case "completed":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      case "queued":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const filteredDownloads = downloads.filter((download) => {
    switch (activeTab) {
      case "active":
        return download.status === "downloading" || download.status === "paused" || download.status === "queued"
      case "completed":
        return download.status === "completed"
      case "failed":
        return download.status === "error"
      default:
        return true
    }
  })

  const stats = {
    total: downloads.length,
    active: downloads.filter((d) => d.status === "downloading" || d.status === "paused" || d.status === "queued")
      .length,
    completed: downloads.filter((d) => d.status === "completed").length,
    failed: downloads.filter((d) => d.status === "error").length,
  }

  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Download Manager</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Download className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Play className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.active}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.completed}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.failed}</p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Downloads List */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Done</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
            {filteredDownloads.length > 0 ? (
              filteredDownloads.map((download, index) => (
                <motion.div
                  key={download.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {getStatusIcon(download.status)}
                              <h3 className="font-semibold">
                                {download.animeTitle} - Episode {download.episodeNumber}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {download.downloadType.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{download.episodeTitle}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {download.status === "downloading" && (
                              <Button variant="outline" size="sm" onClick={() => handlePauseResume(download.id)}>
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            {download.status === "paused" && (
                              <Button variant="outline" size="sm" onClick={() => handlePauseResume(download.id)}>
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {download.status === "error" && (
                              <Button variant="outline" size="sm" onClick={() => handleRetry(download.id)}>
                                Retry
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleDelete(download.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="capitalize">{download.status}</span>
                            <span>{download.progress}%</span>
                          </div>
                          <Progress value={download.progress} className="h-2" />
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <span>Size: {download.size}</span>
                            <span>Speed: {download.speed}</span>
                          </div>
                          <span>
                            {download.status === "completed" ? "Completed" : `ETA: ${download.timeRemaining}`}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No downloads found</h3>
                <p className="text-muted-foreground">
                  {activeTab === "all"
                    ? "Start downloading anime episodes to see them here"
                    : `No ${activeTab} downloads at the moment`}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
