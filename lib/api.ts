const BASE_URL = "https://anime.apex-cloud.workers.dev/"

export interface AnimeSearchResult {
  title: string
  session: string
  poster: string
  type: string
  status: string
  episodes: string // Total episodes as a string, e.g., "12" or "24"
}

export interface SeriesEpisodeDetail {
  id: string // ID for the individual episode
  title: string
  session: string // Session ID of the series this episode belongs to (this is the 'ep' parameter for download links)
  episode: string // Episode number as a string, e.g., "1"
  snapshot: string; // ADDED: Episode snapshot URL
}

export interface SeriesDetail {
  title: string
  session: string // This is the ID for the series
  poster: string
  synopsis: string
  episodes: SeriesEpisodeDetail[] // Array of individual episode details
  pagination: {
    current_page: number
    total_pages: number
  }
  type: string // Added based on search result, assuming it's also in detail
  status: string // Added based on search result, assuming it's also in detail
}

export interface EpisodeDownloadLink {
  link: string
  name: string // e.g., "Kametsu 360p (42MB) "
  title?: string // Optional: might be present in some link items
  episode?: string // Optional: might be present in some link items
}

// --- API Functions ---

/**
 * Search anime by title.
 * GET /?method=search&query={anime_name}
 */
export async function searchAnime(query: string): Promise<AnimeSearchResult[]> {
  if (!query) return []
  const res = await fetch(`${BASE_URL}?method=search&query=${encodeURIComponent(query)}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch search results: ${res.statusText}`)
  }
  const data = await res.json()
  console.log("Raw search API response data (in api.ts):", data) // Debugging: Log raw API response
  // Handle cases where API returns {"status":false} instead of data.data
  return data.data || []
}

/**
 * Fetch details of a specific anime by ID (session ID) and its episodes.
 * GET /?method=series&session={session_id}&page={page}
 */
export async function getAnimeDetails(sessionId: string, page = 1): Promise<SeriesDetail> {
  const res = await fetch(`${BASE_URL}?method=series&session=${encodeURIComponent(sessionId)}&page=${page}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch series details: ${res.statusText}`)
  }
  const data = await res.json()
  console.log("Raw series API response data (in api.ts):", data) // Debugging: Log raw API response
  return data
}

/**
 * Get currently trending anime.
 * Simulates trending by searching for a broad term and taking top results.
 */
export async function getTrendingAnime(): Promise<AnimeSearchResult[]> {
  const res = await fetch(`${BASE_URL}?method=search&query=popular%20anime`)
  if (!res.ok) {
    throw new Error(`Failed to fetch trending anime: ${res.statusText}`)
  }
  const data = await res.json()
  return data.data || []
}

/**
 * Get popular anime.
 * Simulates popular by searching for a broad term and taking top results.
 */
export async function getPopularAnime(): Promise<AnimeSearchResult[]> {
  const res = await fetch(`${BASE_URL}?method=search&query=top%20anime`)
  if (!res.ok) {
    throw new Error(`Failed to fetch popular anime: ${res.statusText}`)
  }
  const data = await res.json()
  return data.data || []
}


/**
 * Get episode download links for a specific episode.
 * GET /?method=episode&session={sessionId}&ep={episodeId}
 */
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
