"use client"

import Image from "next/image"
import { useState } from "react"
import { ImageIcon } from "lucide-react"

interface CustomImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
  quality?: number
  fallback?: string
}

export function CustomImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  sizes,
  priority = false,
  quality = 90,
  fallback = "/placeholder.svg"
}: CustomImageProps) {
  const [error, setError] = useState(false)
  const [imgSrc, setImgSrc] = useState(src)

  const handleError = () => {
    setError(true)
    setImgSrc(fallback)
  }

  const handleRetry = () => {
    setError(false)
    setImgSrc(src)
  }

  // Handle proxy URL issues by adding proper headers
  const getImageUrl = (url: string) => {
    if (!url || url === "undefined" || url === "null") {
      return fallback
    }
    
    // If it's already a proxy URL, return as-is
    if (url.includes("workers.dev/proxy")) {
      return url
    }
    
    // If it's a direct animepahe URL, use proxy
    if (url.includes("animepahe.ru")) {
      return `https://anime.apex-cloud.workers.dev/proxy?modify&proxyUrl=${encodeURIComponent(url)}`
    }
    
    return url
  }

  const finalSrc = getImageUrl(imgSrc)

  if (error && finalSrc === fallback) {
    return (
      <div className={`relative ${fill ? 'w-full h-full' : ''} ${className} bg-muted flex items-center justify-center`}>
        <div className="text-center p-4">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{alt}</p>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      quality={quality}
      onError={handleError}
      onClick={handleRetry}
      style={{ cursor: error ? 'pointer' : 'default' }}
    />
  )
}
