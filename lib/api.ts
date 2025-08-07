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
  pagination: {
    current_page: number
    total_pages: number
  }
}

// Updated interface to match the actual API response for episode download links
export interface EpisodeDownloadLink {
  link: string
  name: string // e.g., "Kametsu 360p (42MB) "
  title?: string // Added based on previous console output, though not always present in array items
  episode?: string // Added based on previous console output, though not always present in array items
}

export async function searchAnime(query: string): Promise<AnimeSearchResult[]> {
  if (!query) return []
  const res = await fetch(`${BASE_URL}?method=search&query=${encodeURIComponent(query)}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch search results: ${res.statusText}`)
  }
  const data = await res.json()
  console.log("Raw search API response data (in api.ts):", data) // Debugging: Log raw API response
  return data.data || []
}

export async function getSeriesEpisodes(sessionId: string, page = 1): Promise<SeriesEpisode> {
  const res = await fetch(`${BASE_URL}?method=series&session=${encodeURIComponent(sessionId)}&page=${page}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch series episodes: ${res.statusText}`)
  }
  const data = await res.json()
  console.log("Raw series API response data (in api.ts):", data) // Debugging: Log raw API response
  return data
}

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
