import crypto from "node:crypto"

const json = (res, status, data) => {
  res.statusCode = status
  res.headers = {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization",
  }
  res.body = JSON.stringify(data)
  return res
}

const readEnv = (...names) => {
  const fallback = names.at(-1)
  const hasLiteralFallback =
    typeof fallback === "string" && !/^[A-Z][A-Z0-9_]*$/.test(fallback)

  for (const name of names) {
    const value = process.env[name]
    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }
  }

  return hasLiteralFallback ? fallback : ""
}

const config = {
  endpoint: readEnv("APPWRITE_FUNCTION_ENDPOINT", "APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1"),
  projectId: readEnv("APPWRITE_FUNCTION_PROJECT_ID", "APPWRITE_PROJECT_ID", "6a251baf00130dde2cdf"),
  apiKey: readEnv("APPWRITE_FUNCTION_API_KEY", "APPWRITE_API_KEY"),
  databaseId: readEnv("APPWRITE_DATABASE_ID", "APPWRITE_DB_ID", "animepahdb"),
  animeCollectionId: readEnv("APPWRITE_ANIME_COLLECTION_ID", "anime"),
  seriesCollectionId: readEnv("APPWRITE_SERIES_COLLECTION_ID", "series"),
  episodeCollectionId: readEnv("APPWRITE_EPISODE_COLLECTION_ID", "episodes"),
  sourceSearchUrl: readEnv("ANIME_SOURCE_SEARCH_URL", "FRESH_SEARCH_FUNCTION_URL"),
  sourceSearchQueryParam: readEnv("ANIME_SOURCE_SEARCH_QUERY_PARAM", "query"),
  sourceApiKey: readEnv("ANIME_SOURCE_API_KEY"),
}

const appwriteBase = config.endpoint.replace(/\/$/, "")
let currentApiKey = config.apiKey

const buildHeaders = () => {
  const headers = {
    "content-type": "application/json",
    "X-Appwrite-Project": config.projectId,
  }

  if (currentApiKey) {
    headers["X-Appwrite-Key"] = currentApiKey
  }

  return headers
}

async function appwriteRequest(path, options = {}) {
  const response = await fetch(`${appwriteBase}${path}`, {
    method: options.method || "GET",
    headers: buildHeaders(),
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const text = await response.text()
  let payload = null

  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = { message: text }
    }
  }

  if (!response.ok) {
    const error = new Error(payload?.message || response.statusText)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

async function parseSourcePayload(response) {
  const text = await response.text()
  let payload = null

  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = { message: text }
    }
  }

  if (!response.ok) {
    const error = new Error(payload?.message || response.statusText)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

async function runAppwriteSourceFunction(sourceUrl) {
  const raw = sourceUrl.slice("appwrite:function:".length)
  const [functionId, queryString = ""] = raw.split("?")
  const execution = await appwriteRequest(`/functions/${encodeURIComponent(functionId)}/executions`, {
    method: "POST",
    body: {
      body: "",
      async: false,
      path: queryString ? `/?${queryString}` : "/",
      method: "GET",
      headers: {},
    },
  })

  const responseBody = execution?.responseBody || execution?.response || ""
  if (!responseBody) return {}

  try {
    return JSON.parse(responseBody)
  } catch {
    return { message: responseBody }
  }
}

async function sourceRequest(url) {
  if (url.startsWith("appwrite:function:")) {
    return runAppwriteSourceFunction(url)
  }

  const headers = {
    "content-type": "application/json",
  }

  if (config.sourceApiKey) {
    headers.Authorization = `Bearer ${config.sourceApiKey}`
  }

  return parseSourcePayload(await fetch(url, { headers }))
}

function stableId(prefix, value) {
  return `${prefix}_${crypto.createHash("sha1").update(String(value)).digest("hex").slice(0, 32)}`
}

function parseBody(req) {
  if (req?.body == null) return {}
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return req.body
}

function getRequestUrl(req) {
  if (typeof req?.url === "string" && req.url.trim()) {
    return req.url
  }

  const path = typeof req?.path === "string" && req.path.trim() ? req.path.trim() : "/"
  const query = req?.query && typeof req.query === "object" ? req.query : null

  if (!query) {
    return path
  }

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue
    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(key, String(entry))
      }
      continue
    }
    params.set(key, String(value))
  }

  const queryString = params.toString()
  return queryString ? `${path}?${queryString}` : path
}

async function listAllDocuments(collectionId) {
  const documents = []
  const limit = 100

  for (let offset = 0; offset < 5000; offset += limit) {
    const page = await appwriteRequest(
      `/databases/${encodeURIComponent(config.databaseId)}/collections/${encodeURIComponent(collectionId)}/documents?limit=${limit}&offset=${offset}`,
    )

    const items = page?.documents || []
    documents.push(...items)

    if (items.length < limit) {
      break
    }
  }

  return documents
}

async function getDocument(collectionId, documentId) {
  try {
    return await appwriteRequest(
      `/databases/${encodeURIComponent(config.databaseId)}/collections/${encodeURIComponent(collectionId)}/documents/${encodeURIComponent(documentId)}`,
    )
  } catch (error) {
    if (error?.status === 404) {
      return null
    }
    throw error
  }
}

async function upsertDocument(collectionId, documentId, data) {
  const existing = await getDocument(collectionId, documentId)

  if (existing) {
    return appwriteRequest(
      `/databases/${encodeURIComponent(config.databaseId)}/collections/${encodeURIComponent(collectionId)}/documents/${encodeURIComponent(documentId)}`,
      {
        method: "PATCH",
        body: { data },
      },
    )
  }

  try {
    return await appwriteRequest(
      `/databases/${encodeURIComponent(config.databaseId)}/collections/${encodeURIComponent(collectionId)}/documents`,
      {
        method: "POST",
        body: {
          documentId,
          data,
        },
      },
    )
  } catch (error) {
    if (error?.status !== 409) {
      throw error
    }

    return appwriteRequest(
      `/databases/${encodeURIComponent(config.databaseId)}/collections/${encodeURIComponent(collectionId)}/documents/${encodeURIComponent(documentId)}`,
      {
        method: "PATCH",
        body: { data },
      },
    )
  }
}

function normalizeAnimeDocument(doc) {
  return {
    $id: doc.$id,
    title: doc.title || "Untitled",
    session: doc.$id,
    poster: doc.posterUrl || "",
    type: doc.type || doc.status || "TV",
    status: doc.status || "",
    episodes: typeof doc.episodeCount === "number" ? String(doc.episodeCount) : doc.episodes || "",
    synopsis: doc.description || "",
    score: doc.score,
    year: doc.year,
    genres: doc.genres || [],
    sourceId: doc.sourceId || "",
    banner: doc.bannerUrl || "",
  }
}

function firstValue(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim()) {
      return value
    }
  }

  return ""
}

function nullableInteger(value) {
  if (value === undefined || value === null || value === "") return null
  const number = Number(value)
  return Number.isFinite(number) ? Math.round(number) : null
}

function getFreshItems(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.results)) return payload.data.results
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.anime)) return payload.anime
  return []
}

function normalizeFreshAnimeItem(item) {
  const sourceId = String(
    firstValue(
      item?.sourceId,
      item?.session,
      item?.id,
      item?.animeId,
      item?.slug,
      item?.title,
    ),
  ).trim()

  return {
    title: firstValue(item?.title, item?.name, item?.animeTitle, "Untitled"),
    session: sourceId,
    sourceId,
    slug: firstValue(item?.slug, item?.id, sourceId),
    poster: firstValue(item?.poster, item?.posterUrl, item?.image, item?.cover, item?.thumbnail),
    banner: firstValue(item?.banner, item?.bannerUrl),
    synopsis: firstValue(item?.synopsis, item?.description, item?.summary),
    genres: Array.isArray(item?.genres) ? item.genres : [],
    type: firstValue(item?.type, item?.format),
    status: firstValue(item?.status, item?.type, item?.format),
    score: item?.score ?? item?.rating ?? null,
    year: item?.year ?? null,
    episodes: firstValue(item?.episodes, item?.totalEpisodes, item?.episodeCount),
    episodeCount: item?.episodeCount ?? item?.totalEpisodes ?? null,
  }
}

function buildFreshSearchUrl(query) {
  if (!config.sourceSearchUrl) return ""

  if (config.sourceSearchUrl.startsWith("appwrite:function:")) {
    const separator = config.sourceSearchUrl.includes("?") ? "&" : "?"
    return `${config.sourceSearchUrl}${separator}${encodeURIComponent(config.sourceSearchQueryParam)}=${encodeURIComponent(query)}`
  }

  if (config.sourceSearchUrl.includes("{query}")) {
    return config.sourceSearchUrl.replaceAll("{query}", encodeURIComponent(query))
  }

  const url = new URL(config.sourceSearchUrl)
  url.searchParams.set(config.sourceSearchQueryParam, query)
  return url.toString()
}

async function fetchFreshAnime(query) {
  const freshUrl = buildFreshSearchUrl(query)
  if (!freshUrl) return []

  const payload = await sourceRequest(freshUrl)
  return getFreshItems(payload).map(normalizeFreshAnimeItem).filter((item) => item.sourceId)
}

function normalizeSeriesDocument(doc, animeDoc) {
  return {
    $id: doc.$id,
    title: doc.title || animeDoc?.title || "Untitled",
    session: doc.$id,
    poster: doc.posterUrl || animeDoc?.posterUrl || "",
    synopsis: doc.synopsis || animeDoc?.description || "",
    episodeCount: doc.episodeCount ?? animeDoc?.episodeCount ?? 0,
    subOrDub: doc.subOrDub || "sub",
    sourceId: doc.sourceId || "",
    animeId: doc.animeId || animeDoc?.$id || "",
  }
}

function normalizeEpisodeDocument(doc) {
  return {
    $id: doc.$id,
    id: doc.$id,
    title: doc.title || `Episode ${doc.episodeNumber || ""}`,
    session: doc.$id,
    episode: String(doc.episodeNumber || ""),
    poster: doc.snapshotUrl || "",
    snapshot: doc.snapshotUrl || "",
    downloadUrl: doc.downloadUrl || "",
    quality: doc.quality || "",
    subOrDub: doc.subOrDub || "",
    sourceId: doc.sourceId || "",
  }
}

async function findAnime(searchTerm) {
  const query = String(searchTerm || "").trim().toLowerCase()
  if (!query) return []

  const documents = await listAllDocuments(config.animeCollectionId)
  return documents.filter((doc) => {
    const haystack = [doc.title, doc.slug, doc.sourceId, doc.description, doc.status]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    return haystack.includes(query)
  })
}

async function resolveAnimeBySession(sessionId) {
  if (!sessionId) return null

  const direct = await getDocument(config.animeCollectionId, sessionId)
  if (direct) return direct

  const documents = await listAllDocuments(config.animeCollectionId)
  return documents.find((doc) => doc.sourceId === sessionId || doc.slug === sessionId) || null
}

async function resolveSeriesBySession(sessionId, animeDoc) {
  if (!sessionId) return null

  const direct = await getDocument(config.seriesCollectionId, sessionId)
  if (direct) return direct

  const documents = await listAllDocuments(config.seriesCollectionId)
  return (
    documents.find((doc) => doc.sourceId === sessionId || doc.animeId === animeDoc?.$id || doc.animeId === sessionId) ||
    null
  )
}

async function getEpisodesForSeries(seriesDoc, animeDoc, page = 1) {
  const documents = await listAllDocuments(config.episodeCollectionId)
  const filtered = documents.filter((doc) => doc.seriesId === seriesDoc?.$id || doc.animeId === animeDoc?.$id)
  filtered.sort((left, right) => Number(left.episodeNumber || 0) - Number(right.episodeNumber || 0))

  const pageSize = 24
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(Math.max(Number(page) || 1, 1), totalPages)
  const start = (currentPage - 1) * pageSize
  const pageItems = filtered.slice(start, start + pageSize)

  return {
    episodes: pageItems.map(normalizeEpisodeDocument),
    pagination: {
      current_page: currentPage,
      total_pages: totalPages,
    },
  }
}

async function handleSearchGet(url) {
  const query = url.searchParams.get("query") || ""
  const matches = await findAnime(query)

  if (matches.length) {
    return {
      status: true,
      data: matches.map(normalizeAnimeDocument),
      source: "appwrite",
      message: "Search results loaded from Appwrite database",
    }
  }

  const freshItems = await fetchFreshAnime(query)
  if (!freshItems.length) {
    return {
      status: true,
      data: [],
      source: config.sourceSearchUrl ? "fresh" : "appwrite",
      message: config.sourceSearchUrl
        ? "No fresh results found"
        : "No cached results found and ANIME_SOURCE_SEARCH_URL is not set",
    }
  }

  await handleSearchPost({ items: freshItems })
  const savedMatches = await findAnime(query)

  return {
    status: true,
    data: savedMatches.length ? savedMatches.map(normalizeAnimeDocument) : freshItems,
    source: "fresh",
    message: "Search results fetched fresh and stored in Appwrite database",
  }
}

async function handleSearchPost(body) {
  const items = Array.isArray(body?.items) ? body.items : Array.isArray(body?.data) ? body.data : []
  const upserts = []

  for (const item of items) {
    const sourceId = String(item?.sourceId || item?.session || item?.title || "").trim()
    if (!sourceId) continue

    const documentId = stableId("a", sourceId)
    const data = {
      title: item.title || "Untitled",
      slug: item.slug || sourceId,
      posterUrl: item.poster || item.posterUrl || "",
      bannerUrl: item.banner || item.bannerUrl || "",
      description: item.synopsis || item.description || "",
      genres: item.genres || [],
      status: item.status || item.type || "",
      score: nullableInteger(item.score),
      year: nullableInteger(item.year),
      episodeCount: item.episodes ? nullableInteger(item.episodes) : nullableInteger(item.episodeCount),
      sourceId,
      lastSyncedAt: new Date().toISOString(),
    }

    upserts.push(upsertDocument(config.animeCollectionId, documentId, data))
  }

  const saved = await Promise.all(upserts)
  return {
    status: true,
    saved: saved.length,
    message: "Anime records synced to Appwrite",
  }
}

async function handleSeriesGet(url) {
  const sessionId = url.searchParams.get("session") || ""
  const page = Number(url.searchParams.get("page") || 1)

  const animeDoc = await resolveAnimeBySession(sessionId)
  const seriesDoc = (await resolveSeriesBySession(sessionId, animeDoc)) || animeDoc

  if (!animeDoc && !seriesDoc) {
    return {
      status: false,
      message: "Series not found in Appwrite database",
      title: "",
      session: sessionId,
      poster: "",
      synopsis: "",
      episodes: [],
      pagination: {
        current_page: 1,
        total_pages: 1,
      },
    }
  }

  const episodeData = await getEpisodesForSeries(seriesDoc, animeDoc, page)
  const source = seriesDoc || animeDoc || {}

  return {
    status: true,
    title: source.title || animeDoc?.title || "Untitled",
    session: source.$id || sessionId,
    episode: "",
    poster: source.posterUrl || animeDoc?.posterUrl || "",
    synopsis: source.synopsis || animeDoc?.description || "",
    episodes: episodeData.episodes,
    pagination: episodeData.pagination,
    message: "Series data loaded from Appwrite database",
  }
}

async function handleSeriesPost(body) {
  const anime = body?.anime || {}
  const series = body?.series || {}
  const episodes = Array.isArray(body?.episodes) ? body.episodes : []

  const sourceId = String(anime.sourceId || series.sourceId || anime.session || series.session || anime.title || "").trim()
  if (!sourceId) {
    return {
      status: false,
      message: "Missing sourceId for sync",
    }
  }

  const animeId = stableId("a", sourceId)
  const animeData = {
    title: anime.title || series.title || "Untitled",
    slug: anime.slug || sourceId,
    posterUrl: anime.poster || anime.posterUrl || series.poster || series.posterUrl || "",
    bannerUrl: anime.banner || anime.bannerUrl || "",
    description: anime.synopsis || anime.description || series.synopsis || series.description || "",
    genres: anime.genres || [],
    status: anime.status || anime.type || series.status || series.subOrDub || "",
    score: nullableInteger(anime.score),
    year: nullableInteger(anime.year),
    episodeCount: nullableInteger(anime.episodeCount ?? series.episodeCount ?? episodes.length),
    sourceId,
    lastSyncedAt: new Date().toISOString(),
  }

  await upsertDocument(config.animeCollectionId, animeId, animeData)

  const seriesId = stableId("s", series.sourceId || sourceId)
  const seriesData = {
    animeId,
    sourceId: series.sourceId || sourceId,
    subOrDub: series.subOrDub || anime.subOrDub || "sub",
    title: series.title || animeData.title,
    posterUrl: series.poster || series.posterUrl || animeData.posterUrl || "",
    synopsis: series.synopsis || series.description || animeData.description || "",
    episodeCount: nullableInteger(series.episodeCount ?? episodes.length),
    currentPage: nullableInteger(series.currentPage) ?? 1,
    totalPages: nullableInteger(series.totalPages) ?? 1,
    lastSyncedAt: new Date().toISOString(),
  }

  await upsertDocument(config.seriesCollectionId, seriesId, seriesData)

  const savedEpisodes = []
  for (const episode of episodes) {
    const episodeSourceId = String(episode.sourceId || episode.session || episode.id || episode.episode || "").trim()
    if (!episodeSourceId) continue

    const episodeId = stableId("e", `${seriesId}:${episodeSourceId}`)
    const episodeData = {
      animeId,
      seriesId,
      sourceId: episodeSourceId,
      episodeNumber: String(episode.episode || episode.number || ""),
      title: episode.title || `Episode ${episode.episode || episode.number || ""}`,
      snapshotUrl: episode.snapshot || episode.poster || "",
      downloadUrl: episode.downloadUrl || "",
      downloadUrlExpiresAt: episode.downloadUrlExpiresAt || null,
      quality: episode.quality || "",
      subOrDub: episode.subOrDub || seriesData.subOrDub || "",
      lastSyncedAt: new Date().toISOString(),
    }

    savedEpisodes.push(upsertDocument(config.episodeCollectionId, episodeId, episodeData))
  }

  await Promise.all(savedEpisodes)

  return {
    status: true,
    message: "Series and episode records synced to Appwrite",
    animeId,
    seriesId,
    episodesSaved: savedEpisodes.length,
  }
}

async function handleEpisodeGet(url) {
  const sessionId = url.searchParams.get("session") || ""
  const episodeId = url.searchParams.get("ep") || ""

  const documents = await listAllDocuments(config.episodeCollectionId)
  const matches = documents.filter((doc) => {
    const sameSeries = doc.seriesId === sessionId || doc.animeId === sessionId
    const sameEpisode = doc.$id === episodeId || doc.sourceId === episodeId || doc.episodeNumber === episodeId
    return sameSeries && sameEpisode
  })

  return matches
    .filter((doc) => doc.downloadUrl)
    .map((doc) => ({
      link: doc.downloadUrl,
      name: doc.quality ? `${doc.quality}` : `Episode ${doc.episodeNumber || episodeId}`,
      title: doc.title,
      episode: doc.episodeNumber,
    }))
}

async function handleEpisodePost(body) {
  const items = Array.isArray(body?.items) ? body.items : Array.isArray(body?.data) ? body.data : []
  const saved = []

  for (const item of items) {
    const seriesId = String(item.seriesId || item.session || item.animeId || "").trim()
    const episodeSourceId = String(item.sourceId || item.id || item.episodeId || item.episode || "").trim()
    if (!seriesId || !episodeSourceId) continue

    const documentId = stableId("e", `${seriesId}:${episodeSourceId}`)
    const data = {
      animeId: String(item.animeId || "").trim(),
      seriesId,
      sourceId: episodeSourceId,
      episodeNumber: String(item.episode || item.number || ""),
      title: item.title || `Episode ${item.episode || item.number || ""}`,
      snapshotUrl: item.snapshot || item.poster || "",
      downloadUrl: item.downloadUrl || "",
      downloadUrlExpiresAt: item.downloadUrlExpiresAt || null,
      quality: item.quality || "",
      subOrDub: item.subOrDub || "",
      lastSyncedAt: new Date().toISOString(),
    }

    saved.push(upsertDocument(config.episodeCollectionId, documentId, data))
  }

  await Promise.all(saved)

  return {
    status: true,
    message: "Episode records synced to Appwrite",
    saved: saved.length,
  }
}

export default async function handler({ req, res }) {
  currentApiKey = req?.headers?.["x-appwrite-key"] || config.apiKey

  if (req.method === "OPTIONS") {
    return json(res, 204, {})
  }

  const url = new URL(getRequestUrl(req), "http://localhost")
  const method = url.searchParams.get("method")
  const body = parseBody(req)

  if (!method) {
    return json(res, 400, {
      status: false,
      message: "Missing method query param",
    })
  }

  try {
    if (method === "search") {
      if (req.method === "POST") {
        return json(res, 200, await handleSearchPost(body))
      }
      return json(res, 200, await handleSearchGet(url))
    }

    if (method === "series") {
      if (req.method === "POST") {
        return json(res, 200, await handleSeriesPost(body))
      }
      return json(res, 200, await handleSeriesGet(url))
    }

    if (method === "episode") {
      if (req.method === "POST") {
        return json(res, 200, await handleEpisodePost(body))
      }
      return json(res, 200, await handleEpisodeGet(url))
    }

    return json(res, 404, {
      status: false,
      message: `Unknown method: ${method}`,
    })
  } catch (error) {
    return json(res, error?.status || 500, {
      status: false,
      message: error?.message || "Appwrite function failed",
      details: error?.payload || undefined,
    })
  }
}
