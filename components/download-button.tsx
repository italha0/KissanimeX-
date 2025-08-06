"use client"

import { Download, LinkIcon, Copy, Check, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { EpisodeDownloadLink, getEpisodeDownloadLinks } from "@/lib/api"
import { useState, useEffect } from "react"
import { toast } from "sonner" // Assuming sonner is available for toasts

interface DownloadButtonProps {
sessionId: string // Session ID for the anime series
episodeId: string // ID for the specific episode
episodeNumber: string // Episode number as a string
}

export function DownloadButton({ sessionId, episodeId, episodeNumber }: DownloadButtonProps) {
const [downloadLinks, setDownloadLinks] = useState<EpisodeDownloadLink[]>([])
const [loadingLinks, setLoadingLinks] = useState(false)
const [dropdownOpen, setDropdownOpen] = useState(false)
const [copiedLink, setCopiedLink] = useState<string | null>(null)

useEffect(() => {
  if (dropdownOpen && !loadingLinks && downloadLinks.length === 0) {
    const fetchLinks = async () => {
      setLoadingLinks(true)
      try {
        const links = await getEpisodeDownloadLinks(sessionId, episodeId)
        setDownloadLinks(links)
      } catch (error) {
        console.error("Failed to fetch download links:", error)
        toast.error("Failed to load download links.", {
          description: "Please try again later.",
        })
        setDownloadLinks([])
      } finally {
        setLoadingLinks(false)
      }
    }
    fetchLinks()
  }
}, [dropdownOpen, sessionId, episodeId, loadingLinks, downloadLinks.length])

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

return (
  <DropdownMenu onOpenChange={setDropdownOpen}>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" className="w-full bg-transparent">
        <Download className="h-4 w-4 mr-2" />
        Download Ep {episodeNumber}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      {loadingLinks ? (
        <DropdownMenuItem disabled className="flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading links...
        </DropdownMenuItem>
      ) : downloadLinks.length > 0 ? (
        downloadLinks.map((linkItem, index) => (
          <DropdownMenuItem
            key={index}
            className="flex items-center justify-between group"
            onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing on item click
          >
            <a
              href={linkItem.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center flex-1 min-w-0 pr-2"
            >
              <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{linkItem.name}</span>
            </a>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleCopyLink(linkItem.link)}
              aria-label={`Copy download link for ${linkItem.name}`}
            >
              {copiedLink === linkItem.link ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </DropdownMenuItem>
        ))
      ) : (
        <DropdownMenuItem disabled>No download links available</DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
)
}
