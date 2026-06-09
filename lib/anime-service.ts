export interface AnimeMetadata {
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
  cachedAt?: string;
}

export interface EpisodeInfo {
  malId: number;
  episodeNumber: number;
  title: string;
  airdate: string;
  filler: boolean;
}

// ----------------- Appwrite client functions -----------------

async function appwriteRequest(path: string, options: RequestInit = {}) {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint) {
    throw new Error("Missing NEXT_PUBLIC_APPWRITE_ENDPOINT in environment variables");
  }
  if (!projectId) {
    throw new Error("Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID in environment variables");
  }

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  headers.set("X-Appwrite-Project", projectId);
  if (apiKey) {
    headers.set("X-Appwrite-Key", apiKey);
  }

  const res = await fetch(`${endpoint.replace(/\/$/, "")}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    let payload: any = null;
    try {
      payload = JSON.parse(text);
    } catch (e) {}
    const err: any = new Error(payload?.message || res.statusText);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return res.json();
}

// Get cached anime details from Appwrite DB by anilistId
export async function getCachedAnime(anilistId: string): Promise<AnimeMetadata | null> {
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const collectionId = process.env.ANIME_COLLECTION_ID;

  if (!collectionId) {
    throw new Error("Missing ANIME_COLLECTION_ID in environment variables");
  }
  if (!databaseId) return null;

  try {
    const doc = await appwriteRequest(`/databases/${databaseId}/collections/${collectionId}/documents/${anilistId}`);
    return {
      anilistId: doc.anilistId,
      malId: doc.malId,
      titleEnglish: doc.titleEnglish || "",
      titleRomaji: doc.titleRomaji || "",
      poster: doc.poster || "",
      rating: doc.rating,
      episodeCount: doc.episodeCount,
      status: doc.status || "",
      genres: Array.isArray(doc.genres) ? doc.genres : [],
      synopsis: doc.synopsis || "",
      cachedAt: doc.cachedAt,
    };
  } catch (err: any) {
    if (err.status !== 404) {
      console.error(`[Appwrite] Error loading cached anime ${anilistId}:`, err.message);
    }
    return null;
  }
}

// Write/Update cached anime details in Appwrite DB
export async function cacheAnime(anime: AnimeMetadata): Promise<void> {
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const collectionId = process.env.ANIME_COLLECTION_ID;

  if (!collectionId) {
    throw new Error("Missing ANIME_COLLECTION_ID in environment variables");
  }
  if (!databaseId) return;

  const data = {
    anilistId: anime.anilistId,
    malId: anime.malId,
    titleEnglish: anime.titleEnglish,
    titleRomaji: anime.titleRomaji,
    poster: anime.poster,
    rating: anime.rating,
    episodeCount: anime.episodeCount,
    status: anime.status,
    genres: anime.genres,
    synopsis: anime.synopsis,
    cachedAt: new Date().toISOString(),
  };

  try {
    // Attempt to create document
    await appwriteRequest(`/databases/${databaseId}/collections/${collectionId}/documents`, {
      method: "POST",
      body: JSON.stringify({
        documentId: anime.anilistId,
        data,
      }),
    });
  } catch (err: any) {
    if (err.status === 409) {
      // Document already exists, patch it
      try {
        await appwriteRequest(`/databases/${databaseId}/collections/${collectionId}/documents/${anime.anilistId}`, {
          method: "PATCH",
          body: JSON.stringify({
            data,
          }),
        });
      } catch (patchErr: any) {
        console.error(`[Appwrite] Error patching cached anime ${anime.anilistId}:`, patchErr.message);
      }
    } else {
      console.error(`[Appwrite] Error saving cached anime ${anime.anilistId}:`, err.message);
    }
  }
}

// Get cached episodes from Appwrite DB by malId
export async function getCachedEpisodes(malId: number): Promise<EpisodeInfo[] | null> {
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const collectionId = process.env.EPISODES_COLLECTION_ID;

  if (!collectionId) {
    throw new Error("Missing EPISODES_COLLECTION_ID in environment variables");
  }
  if (!databaseId) return null;

  try {
    const documents: any[] = [];
    const limit = 100;
    let offset = 0;

    while (true) {
      const queries = [
        `equal("malId", ${malId})`,
        `limit(${limit})`,
        `offset(${offset})`,
      ];
      const params = new URLSearchParams();
      for (const q of queries) {
        params.append("queries[]", q);
      }

      const url = `/databases/${databaseId}/collections/${collectionId}/documents?${params.toString()}`;
      const res = await appwriteRequest(url);
      const items = res.documents || [];
      documents.push(...items);

      if (items.length < limit || documents.length >= res.total) {
        break;
      }
      offset += limit;
    }

    if (documents.length === 0) return null;

    // Sort ascending by episode number
    documents.sort((a, b) => Number(a.episodeNumber || 0) - Number(b.episodeNumber || 0));

    return documents.map((doc) => ({
      malId: doc.malId,
      episodeNumber: doc.episodeNumber,
      title: doc.title || "",
      airdate: doc.airdate || "",
      filler: !!doc.filler,
    }));
  } catch (err: any) {
    console.error(`[Appwrite] Error querying cached episodes for malId ${malId}:`, err.message);
    return null;
  }
}

// Write cached episodes to Appwrite DB
export async function cacheEpisodes(malId: number, episodes: EpisodeInfo[]): Promise<void> {
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const collectionId = process.env.EPISODES_COLLECTION_ID;

  if (!collectionId) {
    throw new Error("Missing EPISODES_COLLECTION_ID in environment variables");
  }
  if (!databaseId) return;

  const promises = episodes.map((ep) => {
    const docId = `${malId}_${ep.episodeNumber}`;
    const data = {
      malId: Number(malId),
      episodeNumber: Number(ep.episodeNumber),
      title: ep.title,
      airdate: ep.airdate,
      filler: ep.filler,
    };

    return (async () => {
      try {
        await appwriteRequest(`/databases/${databaseId}/collections/${collectionId}/documents`, {
          method: "POST",
          body: JSON.stringify({
            documentId: docId,
            data,
          }),
        });
      } catch (err: any) {
        if (err.status === 409) {
          // Document already exists, patch it
          try {
            await appwriteRequest(`/databases/${databaseId}/collections/${collectionId}/documents/${docId}`, {
              method: "PATCH",
              body: JSON.stringify({
                data,
              }),
            });
          } catch (patchErr: any) {
            console.error(`[Appwrite] Error patching episode ${docId}:`, patchErr.message);
          }
        } else {
          console.error(`[Appwrite] Error saving episode ${docId}:`, err.message);
        }
      }
    })();
  });

  await Promise.all(promises);
}

// ----------------- AniList GraphQL functions -----------------

const ANILIST_GRAPHQL_URL = "https://graphql.anilist.co";

export async function fetchAniListSearch(query: string): Promise<AnimeMetadata[]> {
  const graphqlQuery = `
    query ($search: String) {
      Page(page: 1, perPage: 25) {
        media(search: $search, type: ANIME) {
          id
          idMal
          title {
            english
            romaji
          }
          coverImage {
            large
          }
          averageScore
          episodes
          status
          genres
          description
          season
          seasonYear
        }
      }
    }
  `;

  try {
    const res = await fetch(ANILIST_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: { search: query },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AniList HTTP ${res.status}: ${text}`);
    }

    const payload = await res.json();
    const mediaList = payload?.data?.Page?.media || [];

    return mediaList.map((item: any) => ({
      anilistId: String(item.id),
      malId: item.idMal ? Number(item.idMal) : null,
      titleEnglish: item.title?.english || item.title?.romaji || "Untitled",
      titleRomaji: item.title?.romaji || item.title?.english || "Untitled",
      poster: item.coverImage?.large || "",
      rating: item.averageScore ? Number(item.averageScore) / 10.0 : null,
      episodeCount: item.episodes ? Number(item.episodes) : null,
      status: item.status || "",
      genres: Array.isArray(item.genres) ? item.genres : [],
      synopsis: item.description || "",
    }));
  } catch (err: any) {
    console.error("[AniList] Search error:", err.message);
    throw err;
  }
}

export async function fetchAniListDetail(anilistId: string): Promise<AnimeMetadata> {
  const idInt = parseInt(anilistId, 10);
  if (isNaN(idInt)) {
    throw new Error(`Invalid AniList ID: ${anilistId}`);
  }

  const graphqlQuery = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        idMal
        title {
          english
          romaji
        }
        coverImage {
          large
        }
        averageScore
        episodes
        status
        genres
        description
        season
        seasonYear
      }
    }
  `;

  try {
    const res = await fetch(ANILIST_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: { id: idInt },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AniList HTTP ${res.status}: ${text}`);
    }

    const payload = await res.json();
    const item = payload?.data?.Media;

    if (!item) {
      throw new Error(`Anime details not found in AniList for ID: ${anilistId}`);
    }

    return {
      anilistId: String(item.id),
      malId: item.idMal ? Number(item.idMal) : null,
      titleEnglish: item.title?.english || item.title?.romaji || "Untitled",
      titleRomaji: item.title?.romaji || item.title?.english || "Untitled",
      poster: item.coverImage?.large || "",
      rating: item.averageScore ? Number(item.averageScore) / 10.0 : null,
      episodeCount: item.episodes ? Number(item.episodes) : null,
      status: item.status || "",
      genres: Array.isArray(item.genres) ? item.genres : [],
      synopsis: item.description || "",
    };
  } catch (err: any) {
    console.error(`[AniList] Detail fetch error for ${anilistId}:`, err.message);
    throw err;
  }
}

// ----------------- Jikan API functions -----------------

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchJikanEpisodes(malId: number): Promise<EpisodeInfo[]> {
  let episodes: EpisodeInfo[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const url = `https://api.jikan.moe/v4/anime/${malId}/episodes?page=${page}`;
    console.log(`[Jikan] Fetching page ${page} for malId ${malId}...`);

    let res: Response;
    try {
      res = await fetch(url);
    } catch (err: any) {
      console.error(`[Jikan] Network error fetching episodes (page ${page}, malId ${malId}):`, err.message);
      await delay(2000);
      continue;
    }

    if (res.status === 429) {
      console.warn("[Jikan] 429 Rate Limit. Retrying in 2 seconds...");
      await delay(2000);
      continue;
    }

    if (!res.ok) {
      console.error(`[Jikan] API error (status ${res.status}): ${res.statusText}`);
      throw new Error(`Jikan API failed with status ${res.status}`);
    }

    const body = await res.json();
    const pageData = body.data || [];

    for (const ep of pageData) {
      episodes.push({
        malId,
        episodeNumber: ep.mal_id ? Number(ep.mal_id) : Number(ep.episode_id) || 0,
        title: ep.title || `Episode ${ep.mal_id || ep.episode_id || ""}`,
        airdate: ep.aired ? new Date(ep.aired).toLocaleDateString() : "",
        filler: !!ep.filler,
      });
    }

    hasNextPage = body.pagination?.has_next_page || false;
    if (hasNextPage) {
      page++;
      // Wait 400ms between calls to avoid rate limits
      await delay(400);
    }
  }

  return episodes;
}
