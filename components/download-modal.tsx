"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Download, Zap, X } from 'lucide-react'
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
      <DialogContent
        className="sm:max-w-[560px] p-0 overflow-hidden rounded-2xl"
      >
        <div className="relative">
          {/* Close button (top-right "x") */}
          <DialogClose
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </DialogClose>

          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-center text-[20px] md:text-[22px] font-bold text-foreground">
              {episodeTitle} : EP {episodeNumber}
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Select your preferred download quality.
            </DialogDescription>
          </DialogHeader>

          <div className="px-4 pb-5 pt-3">
            {isLoading && (
              <p className="text-center text-muted-foreground">
                Loading download links...
              </p>
            )}

            {isError && (
              <p className="text-center text-red-500">
                Failed to load download links.
              </p>
            )}

            {!isLoading && !isError && (!downloadLinks || downloadLinks.length === 0) && (
              <p className="text-center text-muted-foreground">
                No download links available for this episode.
              </p>
            )}

            {!isLoading && !isError && downloadLinks && downloadLinks.length > 0 && (
              <div className="grid grid-cols-1 gap-3">
                {downloadLinks.map((linkItem, index) => {
                  // Keep functionality the same (open link in new tab).
                  // For the left label, show the provided name (as the screenshot shows the full label like "SCY 360p (58MB)").
                  const leftLabel = linkItem.name?.trim() || "Unknown"

                  return (
                    <Button
                      asChild
                      key={index}
                      variant="ghost"
                      className="w-full p-0 h-auto bg-transparent hover:bg-transparent"
                    >
                      <Link
                        href={linkItem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block w-full"
                      >
                        <div className="flex items-center justify-between rounded-xl border border-black/5 bg-muted/40 px-4 py-3 shadow-sm transition-colors group-hover:bg-muted/60">
                          <span className="text-[15px] md:text-[16px] font-medium text-foreground">
                            {leftLabel}
                          </span>

                          {/* Right segmented pill (KwiK | download | lightning) */}
                          <div className="flex items-stretch ms-5 rounded-sm shadow-sm overflow-hidden">
                            <div className="px-3 md:px-3.5 py-1.5 bg-[#1ec973] text-white text-[14px] font-semibold grid place-items-center">
                              KwiK
                            </div>
                            <div className="px-3 md:px-3.5 py-1.5 bg-[#1ec973] text-white grid place-items-center border-l border-white/25">
                              <Download className="h-4 w-4" />
                            </div>
                            <div className="px-3 md:px-3.5 py-1.5 bg-[#ffa116] text-white grid place-items-center">
                              <Zap className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
