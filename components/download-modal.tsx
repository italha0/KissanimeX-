"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Download, ExternalLink, Copy, CheckCircle } from 'lucide-react'
import { useQuery } from "@tanstack/react-query"
import { getEpisodeDownloadLinks, DownloadLink } from "@/lib/api"
import { toast } from "sonner"

interface DownloadModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
  episodeId: string
  episodeTitle: string
  episodeNumber: string
}

export function DownloadModal({
  isOpen,
  onClose,
  sessionId,
  episodeId,
  episodeTitle,
  episodeNumber,
}: DownloadModalProps) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  const { data: downloadLinks, isLoading, isError, error } = useQuery({
    queryKey: ["downloadLinks", sessionId, episodeId],
    queryFn: () => getEpisodeDownloadLinks(sessionId, episodeId),
    enabled: isOpen && !!sessionId && !!episodeId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const copyToClipboard = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      setCopiedLink(link)
      toast.success("Download link copied to clipboard!")
      setTimeout(() => setCopiedLink(null), 2000)
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const handleDirectDownload = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {episodeTitle} - Episode {episodeNumber}
          </DialogTitle>
          <DialogDescription>
            Select your preferred download quality and format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading download links...</span>
            </div>
          )}

          {isError && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">Failed to load download links</div>
              <p className="text-sm text-muted-foreground">{error?.message}</p>
            </div>
          )}

          {!isLoading && !isError && (!downloadLinks || downloadLinks.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No download links available for this episode</p>
            </div>
          )}

          {!isLoading && !isError && downloadLinks && downloadLinks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Available Downloads</h3>
                <Badge variant="secondary">{downloadLinks.length} options</Badge>
              </div>

              {downloadLinks.map((downloadLink, index) => (
                <Card key={index} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">{downloadLink.quality}</Badge>
                          <Badge variant="secondary">{downloadLink.size}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {downloadLink.name}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(downloadLink.link)}
                          className="flex items-center space-x-1"
                        >
                          {copiedLink === downloadLink.link ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span>{copiedLink === downloadLink.link ? "Copied" : "Copy"}</span>
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => handleDirectDownload(downloadLink.link)}
                          className="flex items-center space-x-1"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Download Instructions:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Click "Download" to open the direct download link</li>
                  <li>• Use "Copy" to get the URL for download managers</li>
                  <li>• Higher quality files are larger in size</li>
                  <li>• Links are temporary and may expire</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}