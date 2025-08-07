const BASE_URL = "https://anime.apex-cloud.workers.dev/"

export interface AnimeSearchResult {
  title: string
  session: string
  poster: string
  type: string
  status: string
  episodes: string
}

export interface SeriesEpisode {
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
  pagination: {
    current_page: number
    total_pages: number
  }
}

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
export async function searchAnime(query: string): Promise<AnimeSearchResult[]> {
  if (!query.trim()) return []
  
  try {
    const response = await fetch(`${BASE_URL}?method=search&query=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Search API error:', error)
    throw new Error('Failed to search anime')
  }
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
    return data
  } catch (error) {
    console.error('Series API error:', error)
    throw new Error('Failed to fetch anime details')
  }
}

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