const getBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_APPWRITE_BACKEND_URL?.trim() || "/api/anime"

  return baseUrl.replace(/\/$/, "")
}

const getHeaders = () => {
  const headers: Record<string, string> = {}
  if (typeof window !== "undefined") {
    const cfClearance = localStorage.getItem("cf_clearance")
    if (cfClearance) {
      headers["x-cf-clearance"] = cfClearance
    }
    // Send the full cookie string if available (needed for AnimePahe: cf_clearance + session tokens)
    const fullCookies = localStorage.getItem("animepahe_cookies")
    if (fullCookies) {
      headers["x-animepahe-cookies"] = fullCookies
    }
    const ua = navigator.userAgent
    if (ua) {
      headers["x-user-agent"] = ua
    }
  }
  return headers
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
  const res = await fetch(`${getBaseUrl()}?method=search&query=${encodeURIComponent(query)}`, {
    headers: getHeaders(),
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch search results: ${res.statusText}`)
  }
  const data = await res.json()
  return data.data || []
}

export async function getSeriesEpisodes(sessionId: string, page = 1, subOrDub = "sub"): Promise<SeriesEpisode> {
  const res = await fetch(
    `${getBaseUrl()}?method=series&session=${encodeURIComponent(sessionId)}&page=${page}&subOrDub=${encodeURIComponent(
      subOrDub
    )}`,
    {
      headers: getHeaders(),
    }
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch series episodes: ${res.statusText}`)
  }
  const data = await res.json()
  return data
}

// Updated function to return an array of EpisodeDownloadLink
export async function getEpisodeDownloadLinks(sessionId: string, episodeId: string): Promise<EpisodeDownloadLink[]> {
  const res = await fetch(
    `${getBaseUrl()}?method=episode&session=${encodeURIComponent(sessionId)}&ep=${encodeURIComponent(episodeId)}`,
    {
      headers: getHeaders(),
    }
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch episode download links: ${res.statusText}`)
  }
  const data = await res.json()
  return data || []
}

// ----------------- Anime Discovery Helpers -----------------

export interface DiscoveryAnime {
  anilistId: string;
  malId: number | null;
  titleEnglish: string;
  titleRomaji: string;
  poster: string;
  rating: number | null;
  episodeCount: number | null;
  status: string;
  genres: string[];
  synopsis: string;
}

export interface DiscoveryEpisode {
  malId: number;
  episodeNumber: number;
  title: string;
  airdate: string;
  filler: boolean;
}

export async function searchAnimeDiscovery(query: string): Promise<DiscoveryAnime[]> {
  if (!query) return [];
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error(`Failed to search anime: ${res.statusText}`);
  }
  const payload = await res.json();
  return payload.data || [];
}

export async function getAnimeDiscoveryMeta(anilistId: string): Promise<DiscoveryAnime> {
  const res = await fetch(`/api/anime/${anilistId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch metadata: ${res.statusText}`);
  }
  const payload = await res.json();
  return payload.data;
}

export async function getAnimeDiscoveryEpisodes(anilistId: string, malId: number): Promise<DiscoveryEpisode[]> {
  const res = await fetch(`/api/anime/${anilistId}/episodes?malId=${malId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch episodes: ${res.statusText}`);
  }
  const payload = await res.json();
  return payload.data || [];
}

