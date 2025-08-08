"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { AnimeSearchResult } from "@/lib/api"
import { useState } from "react"

interface AnimeCardProps {
  anime: AnimeSearchResult
  className?: string
}

export function AnimeCard({ anime, className }: AnimeCardProps) {
  const proxyBase = "https://anime.apex-cloud.workers.dev/proxy?modify&proxyUrl="
  const posterUrl =
    anime?.poster ? `${proxyBase}${encodeURIComponent(anime.poster)}` : "/placeholder.svg?height=900&width=600"

  const [loaded, setLoaded] = useState(false)

  // Safe fallbacks
  const episodes =
    (anime as any)?.episodes ??
    (anime as any)?.totalEpisodes ??
    (anime as any)?.total_episodes ??
    (anime as any)?.episodeCount

  const episodesText = typeof episodes === "number" ? `${episodes} Episodes` : "Episodes"

  const statusRaw = anime?.status ?? ""
  const status = typeof statusRaw === "string" ? statusRaw : "Finished Airing"

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
    (anime as any)?.score ??
    (anime as any)?.rating ??
    (anime as any)?.averageScore ??
    (anime as any)?.scoreRaw

  return (
    <Link href={`/anime/${anime?.session || ""}`} className="block" prefetch={false}>
      <article
        className={cn(
          // Card shell (styled to mirror the provided reference)
          "m-4 w-72 cursor-pointer border rounded-2xl bg-white text-foreground shadow-md",
          "transition-transform duration-200 hover:border-primary",
          "flex flex-col overflow-hidden",
          className,
        )}
      >
        {/* Header */}
        <div className="flex p-4 pt-2 pb-0 flex-col text-left items-start h-32 overflow-hidden">
          <div className="flex flex-col gap-y-2 my-2">
            <span className="text-gray-500">{episodesText}</span>
            <p className="text-[0.7rem] uppercase font-bold">{status}</p>
          </div>
          <hr className="w-full border-t border-gray-200" role="separator" />
          <h4 className="font-bold text-normal leading-snug line-clamp-2 mt-2">{title}</h4>
        </div>

        {/* Poster + blurred bg */}
        <div className="w-full p-3 flex flex-col items-center justify-center py-4 gap-y-2">
          <div className="relative rounded-2xl shadow-none" style={{ maxWidth: 240 }}>
            {/* Foreground poster */}
            <Image
              src={posterUrl || "/placeholder.svg"}
              alt={title}
              width={240}
              height={350}
              priority
              unoptimized
              onLoadingComplete={() => setLoaded(true)}
              className={cn(
                "relative z-10 object-cover rounded-xl h-[350px] w-[240px]",
                "opacity-0 transition-opacity duration-300",
                loaded && "opacity-100",
              )}
            />
            {/* Blurred background of the same image (behind) */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <Image
                src={posterUrl || "/placeholder.svg"}
                alt=""
                aria-hidden="true"
                fill
                priority
                unoptimized
                sizes="(max-width: 640px) 100vw, 240px"
                className={cn(
                  "absolute inset-0 w-full h-full object-cover rounded-2xl",
                  "blur-lg scale-105 saturate-150 opacity-30 translate-y-1",
                )}
              />
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-x-2 mt-4">
            <span className="inline-flex items-center h-7 rounded-md bg-gradient-to-b from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/40">
              <span className="px-2 text-sm font-normal">{String(type)}</span>
            </span>
            <span className="inline-flex items-center h-7 rounded-md bg-gradient-to-b from-violet-400 to-violet-600 text-white shadow-lg shadow-violet-500/40">
              <span className="px-2 text-sm font-normal">{year ?? "—"}</span>
            </span>
            <span className="inline-flex items-center h-7 rounded-md bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/40">
              <span className="px-2 text-sm font-normal">
                {typeof score === "number" ? `Score ${score}` : score ? `Score ${score}` : "Score —"}
              </span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
