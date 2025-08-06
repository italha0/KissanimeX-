"use client"

import { AnimeCard } from "./anime-card"
import { AnimeSearchResult } from "@/lib/api"

interface AnimeGridProps {
data: AnimeSearchResult[]
type?: string
onItemClick?: (id: string) => void
}

export function AnimeGrid({ data, type, onItemClick }: AnimeGridProps) {
return (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {data.map((anime, index) => (
      <AnimeCard key={anime.session} anime={anime} index={index} />
    ))}
  </div>
)
}
