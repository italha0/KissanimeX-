import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { AnimeSearchResult } from "@/lib/api"

interface AnimeCardProps {
  anime: AnimeSearchResult
}

export function AnimeCard({ anime }: AnimeCardProps) {
  // Use the direct poster URL, as i.animepahe.ru is now configured in next.config.mjs
  const posterUrl = anime.poster || "/placeholder.svg?height=300&width=200"

  return (
    <Link href={`/anime/${anime.session}`} className="block">
      <Card className="w-full h-full flex flex-col overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
        <div className="relative w-full aspect-[2/3] bg-gray-200">
          <Image
            src={posterUrl || "/placeholder.svg"}
            alt={anime.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{ objectFit: "cover" }}
            className="rounded-t-lg"
            priority
          />
        </div>
        <CardContent className="p-3 flex-grow">
          <h3 className="text-sm font-semibold line-clamp-2 text-gray-800">{anime.title}</h3>
        </CardContent>
        <CardFooter className="p-3 pt-0 text-xs text-gray-600">
          <p className="truncate">
            {anime.type} • {anime.status}
          </p>
        </CardFooter>
      </Card>
    </Link>
  )
}
