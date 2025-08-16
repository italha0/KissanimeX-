"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import type { AnimeSearchResult } from "@/lib/api"
import { useState } from "react"

// Update the props to include an onClick handler
interface AnimeCardProps {
  anime: AnimeSearchResult
  className?: string
  onClick: () => void;
}

export function AnimeCard({ anime, className, onClick }: AnimeCardProps) {
  // Keep your proxy so remote images work without next.config remotePatterns.
  const proxyBase = "https://anime.apex-cloud.workers.dev/proxy?modify&proxyUrl="
  const posterUrl = anime?.poster
    ? `${proxyBase}${encodeURIComponent(anime.poster)}`
    : "/placeholder.svg?height=900&width=600"

  const [loaded, setLoaded] = useState(false)

  // Safe fallbacks for anime data
  const episodes =
    (anime as any)?.episodes ??
    (anime as any)?.totalEpisodes ??
    (anime as any)?.total_episodes ??
    (anime as any)?.episodeCount
  const episodesText = typeof episodes === "number" ? `${episodes} Episodes` : "Episodes"
  const statusRaw = (anime as any)?.status ?? ""
  const status = typeof statusRaw === "string" && statusRaw.trim().length ? statusRaw : "Finished Airing"
  const title = anime?.title ?? "Untitled"

  const year =
    (anime as any)?.year ??
    (() => {
      const candidates = [
        (anime as any)?.releaseDate,
        (anime as any)?.released,
        (anime as any)?.startDate,
        (anime as any)?.aired,
      ]
      for (const c of candidates) {
        if (!c) continue
        const match = String(c).match(/(19|20)\d{2}/)
        if (match) return match[0]
      }
      return undefined
    })()

  const type = (anime as any)?.type ?? "TV"
  const score =
    (anime as any)?.score ?? (anime as any)?.rating ?? (anime as any)?.averageScore ?? (anime as any)?.scoreRaw

  // The Link component is replaced with an article that has an onClick handler
  return (
    <article
      onClick={onClick} // Use the onClick handler here
      aria-label={`Open ${title}`}
      className={cn(
        // Make the card fluid and stack-friendly on mobile
        "w-full h-full rounded-2xl border bg-white text-foreground shadow-sm hover:shadow-md transition cursor-pointer", // Added cursor-pointer
        "flex flex-col overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        className,
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-2 p-3 sm:p-4 text-left items-start">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
          <span>{episodesText}</span>
          <span className="uppercase font-semibold tracking-wide text-[0.65rem] sm:text-[0.7rem] text-foreground/80">
            {status}
          </span>
        </div>
        <hr className="w-full border-t border-gray-200" role="separator" />
        <h4 className="font-bold leading-snug text-sm sm:text-base break-words line-clamp-2 mt-1">{title}</h4>
      </div>

      {/* Poster with blurred background */}
      <div className="w-full px-3 pb-3 sm:px-4 sm:pb-4">
        {/* Make image responsive with aspect ratio and sizes for proper device sizing */}
        <div className="relative w-full aspect-[2/3] overflow-hidden rounded-xl">
          {/* Blurred background */}
          <Image
            src={posterUrl || "/placeholder.svg?height=900&width=600&query=anime%20poster%20blur"}
            alt=""
            aria-hidden="true"
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 240px"
            className={cn("absolute inset-0 object-cover", "blur-lg scale-105 saturate-150 opacity-30")}
            priority
          />
          {/* Foreground poster */}
          <Image
            src={posterUrl || "/placeholder.svg?height=900&width=600&query=anime%20poster"}
            alt={title}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 240px"
            onLoad={() => setLoaded(true)}
            className={cn(
              "relative z-10 object-cover rounded-xl",
              "opacity-0 transition-opacity duration-300",
              loaded && "opacity-100",
            )}
            priority
          />
        </div>
        {/* Badges */}
        <div className="flex flex-row gap-1 mt-3">
          <span className="inline-flex items-center h-7 rounded-md bg-gradient-to-b from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/40">
            <span className="px-2 text-xs sm:text-sm font-normal">{String(type)}</span>
          </span>
          <span className="inline-flex items-center h-7 rounded-md bg-gradient-to-b from-violet-400 to-violet-600 text-white shadow-lg shadow-violet-500/40">
            <span className="px-2 text-xs sm:text-sm font-normal">{year ?? "—"}</span>
          </span>
          <span className="inline-flex items-center h-7 rounded-md bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/40">
            <span className="px-2 text-xs sm:text-sm font-normal">
              {typeof score === "number" ? `Score ${score}` : score ? `Score ${score}` : "Score —"}
            </span>
          </span>
        </div>
      </div>
    </article>
  )
}