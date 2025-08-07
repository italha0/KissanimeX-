"use client"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { AnimeSearchResult } from "@/lib/api"

interface AnimeCardProps {
anime: AnimeSearchResult
index?: number
}

export function AnimeCard({ anime, index = 0 }: AnimeCardProps) {
return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    whileHover={{ scale: 1.05 }}
    className="group"
  >
    <Link href={`/anime/${anime.session}`}>
      <Card className="overflow-hidden border-0 bg-card/50 backdrop-blur transition-all duration-300 hover:bg-card/80">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={anime.poster || "/placeholder.svg"}
            alt={anime.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            priority={index < 6}
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-2 right-2">
            <Badge variant={anime.status === "Ongoing" ? "default" : "secondary"}>{anime.status}</Badge>
          </div>
          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex items-center justify-between text-white text-xs">
              <span>Type: {anime.type}</span>
            </div>
          </div>
          {/* Removed Play icon overlay as streaming is removed */}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 mb-2">{anime.title}</h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{anime.episodes} Episodes</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  </motion.div>
)
}
