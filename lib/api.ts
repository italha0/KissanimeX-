const BASE_URL = "https://anime.apex-cloud.workers.dev/"

/**
 * Helper function to ensure image URLs are properly formatted
 */
function processImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg"
  
  // If it's already a full URL, return as is
  if (url.startsWith('http')) {
    return url
  }
  
  // If it's a relative path, assume it needs the proxy
  if (url.startsWith('/')) {
    return `${BASE_URL.slice(0, -1)}${url}`
  }
  
  return url
}

export interface AnimeSearchResult {
  title: string
  session: string
  poster: string
  type: string
  status: string
  episodes: string
}

export interface SeriesEpisode {
<<<<<<< HEAD
  title: string
  session: string
  episode: string
  poster: string
  synopsis: string
  episodes: {
    id: string
    title: string
    session: string
    episode: string
  }[]
=======
  id: string
  title: string
  session: string
  episode: string
  snapshot: string
}

export interface SeriesDetail {
  title: string
  session: string
  poster: string
  synopsis: string
  type: string
  status: string
  episode: string
  episodes: SeriesEpisode[]
>>>>>>> 633778944d1412981778c3b3b615553deafda409
  pagination: {
    current_page: number
    total_pages: number
  }
}

<<<<<<< HEAD
// Updated interface to match the actual API response for episode download links
export interface EpisodeDownloadLink {
  link: string
  name: string // e.g., "Kametsu 360p (42MB) "
  title?: string // Added based on previous console output, though not always present in array items
  episode?: string // Added based on previous console output, though not always present in array items
}

=======
export interface DownloadLink {
  link: string
  name: string
  quality?: string
  size?: string
}

/**
 * Search anime by title
 * GET /?method=search&query={anime_name}
 */
>>>>>>> 633778944d1412981778c3b3b615553deafda409
export async function searchAnime(query: string): Promise<AnimeSearchResult[]> {
  if (!query.trim()) return []
  
  try {
    const response = await fetch(`${BASE_URL}?method=search&query=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Process the data to ensure image URLs are properly formatted
    const results = data.data || []
    return results.map((anime: any) => ({
      ...anime,
      poster: processImageUrl(anime.poster)
    }))
  } catch (error) {
    console.error('Search API error:', error)
    throw new Error('Failed to search anime')
  }
<<<<<<< HEAD
  const data = await res.json()
  console.log("Raw search API response data (in api.ts):", data) // Debugging: Log raw API response
  return data.data || []
}

export async function getSeriesEpisodes(sessionId: string, page = 1): Promise<SeriesEpisode> {
  const res = await fetch(`${BASE_URL}?method=series&session=${encodeURIComponent(sessionId)}&page=${page}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch series episodes: ${res.statusText}`)
=======
}

/**
 * Get anime series details and episodes
 * GET /?method=series&session={session_id}&page={page}
 */
export async function getAnimeDetails(sessionId: string, page = 1): Promise<SeriesDetail> {
  try {
    const response = await fetch(`${BASE_URL}?method=series&session=${encodeURIComponent(sessionId)}&page=${page}`)
    if (!response.ok) {
      throw new Error(`Series fetch failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Process the data to ensure image URLs are properly formatted
    return {
      ...data,
      poster: processImageUrl(data.poster),
      episodes: (data.episodes || []).map((episode: any) => ({
        ...episode,
        snapshot: processImageUrl(episode.snapshot)
      }))
    }
  } catch (error) {
    console.error('Series API error:', error)
    throw new Error('Failed to fetch anime details')
>>>>>>> 633778944d1412981778c3b3b615553deafda409
  }
}

<<<<<<< HEAD
// Updated function to return an array of EpisodeDownloadLink
export async function getEpisodeDownloadLinks(sessionId: string, episodeId: string): Promise<EpisodeDownloadLink[]> {
  const res = await fetch(
    `${BASE_URL}?method=episode&session=${encodeURIComponent(sessionId)}&ep=${encodeURIComponent(episodeId)}`,
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch episode download links: ${res.statusText}`)
  }
  const data = await res.json()
  console.log("Raw episode API response data (in api.ts):", data) // Debugging: Log raw API response
  // The API returns an array directly for episode download links
  return data || []
}
=======
/**
 * Get download links for a specific episode
 * GET /?method=episode&session={session_id}&ep={episode_id}
 */
export async function getEpisodeDownloadLinks(sessionId: string, episodeId: string): Promise<DownloadLink[]> {
  try {
    const response = await fetch(`${BASE_URL}?method=episode&session=${encodeURIComponent(sessionId)}&ep=${encodeURIComponent(episodeId)}`)
    if (!response.ok) {
      throw new Error(`Episode fetch failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Transform the response to extract quality and size from name
    return (data || []).map((item: any) => {
      const qualityMatch = item.name.match(/(\d+p)/i)
      const sizeMatch = item.name.match(/\(([^)]+)\)/)
      
      return {
        link: item.link,
        name: item.name,
        quality: qualityMatch ? qualityMatch[1] : 'Unknown',
        size: sizeMatch ? sizeMatch[1] : 'Unknown'
      }
    })
  } catch (error) {
    console.error('Episode API error:', error)
    throw new Error('Failed to fetch download links')
  }
}

/**
 * Get trending anime (simulated with popular search)
 */
export async function getTrendingAnime(): Promise<AnimeSearchResult[]> {
  return searchAnime('popular anime')
}

/**
 * Get popular anime (simulated with top search)
 */
export async function getPopularAnime(): Promise<AnimeSearchResult[]> {
  return searchAnime('top anime')
}
>>>>>>> 633778944d1412981778c3b3b615553deafda409
