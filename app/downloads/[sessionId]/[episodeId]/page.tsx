"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getEpisodeDownloadLinks, EpisodeDownloadLink } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, Loader2, ArrowLeft, LinkIcon } from 'lucide-react'
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"

export default function EpisodeDownloadPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const episodeId = params.episodeId as string

  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  // Use React Query for data fetching
  const { data: downloadLinks, isLoading, isError, error } = useQuery({
    queryKey: ["episodeDownloadLinks", sessionId, episodeId],
    queryFn: () => getEpisodeDownloadLinks(sessionId, episodeId),
    enabled: !!sessionId && !!episodeId, // Only fetch if both IDs are available
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      setCopiedLink(link)
      toast.success("Link copied to clipboard!", {
        description: link,
      })
      setTimeout(() => setCopiedLink(null), 2000) // Reset copied state after 2 seconds
    } catch (err) {
      console.error("Failed to copy link:", err)
      toast.error("Failed to copy link.", {
        description: "Please try manually.",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading download links...</p>
        </div>
      </div>
    )
  }

  if (isError || !downloadLinks || downloadLinks.length === 0) {
    return (
      <div className="container py-12">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold">No Download Links Found</h1>
          <p className="text-muted-foreground">
            {error?.message || "We could not find any direct download links for this episode at the moment."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Episode List
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Download Links</CardTitle>
            <p className="text-muted-foreground">
              Episode {downloadLinks[0]?.episode || "N/A"} - {downloadLinks[0]?.title || "Direct Downloads"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {downloadLinks.map((linkItem, index) => {
              // Parse quality and filesize from the 'name' string
              const nameMatch = linkItem.name.match(/(\d+p)\s*$$([\d.]+\s*MB)$$/);
              const quality = nameMatch ? nameMatch[1] : "Unknown Quality";
              const filesize = nameMatch ? nameMatch[2] : "Unknown Size";

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-md bg-card hover:bg-accent transition-colors"
                >
                  <a
                    href={linkItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center flex-1 min-w-0 pr-2 font-medium text-primary hover:underline"
                  >
                    <LinkIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="truncate">{quality} ({filesize})</span>
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 ml-3 flex-shrink-0"
                    onClick={() => handleCopyLink(linkItem.link)}
                    aria-label={`Copy download link for ${linkItem.name}`}
                  >
                    {copiedLink === linkItem.link ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
