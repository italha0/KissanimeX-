"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ExternalLink } from 'lucide-react'
import type { EpisodeDownloadLink } from "@/lib/api"

interface DownloadModalProps {
  isOpen: boolean
  onClose: () => void
  episodeTitle: string
  episodeNumber: string
  downloadLinks: EpisodeDownloadLink[] | undefined
  isLoading: boolean
  isError: boolean
}

export function DownloadModal({
  isOpen,
  onClose,
  episodeTitle,
  episodeNumber,
  downloadLinks,
  isLoading,
  isError,
}: DownloadModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6 bg-custom-blue-dark-card border-custom-blue-dark-border text-custom-blue-cool-gray-light">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-custom-blue-cool-gray-light">
            {episodeTitle} - Episode {episodeNumber}
          </DialogTitle>
          <DialogDescription className="text-custom-blue-cool-gray-medium">Select your preferred download quality.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading && <p className="text-center text-custom-blue-cool-gray-medium">Loading download links...</p>}
          {isError && <p className="text-red-500 text-center">Failed to load download links.</p>}
          {!isLoading && !isError && (!downloadLinks || downloadLinks.length === 0) && (
            <p className="text-custom-blue-cool-gray-medium text-center">No download links available for this episode.</p>
          )}
          {!isLoading && !isError && downloadLinks && downloadLinks.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              {downloadLinks.map((linkItem, index) => {
                // Corrected regex to parse quality and filesize from the 'name' string
                // Example name: "Kametsu 360p (42MB) "
                // Using escaped dollar sign for literal match
                const nameMatch = linkItem.name.match(/(\d+p)\s*$$([\d.]+\s*MB)$$$/)
                const quality = nameMatch ? nameMatch[1] : "Unknown Quality"
                const filesize = nameMatch ? nameMatch[2] : "Unknown Size"

                return (
                  <Button asChild key={index} className="w-full py-3 text-base bg-custom-blue-royal-blue hover:bg-custom-blue-slate-blue text-custom-blue-cool-gray-light">
                    <Link href={linkItem.link} target="_blank" rel="noopener noreferrer">
                      Download {quality} ({filesize})
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
