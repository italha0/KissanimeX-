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
  endpoint: readEnv("APPWRITE_FUNCTION_ENDPOINT", "APPWRITE_ENDPOINT"),
  projectId: readEnv("APPWRITE_FUNCTION_PROJECT_ID", "APPWRITE_PROJECT_ID"),
  apiKey: readEnv("APPWRITE_FUNCTION_API_KEY", "APPWRITE_API_KEY"),
  databaseId: readEnv("APPWRITE_DATABASE_ID", "APPWRITE_DB_ID"),
  animeCollectionId: readEnv("APPWRITE_ANIME_COLLECTION_ID"),
  seriesCollectionId: readEnv("APPWRITE_SERIES_COLLECTION_ID"),
  episodeCollectionId: readEnv("APPWRITE_EPISODE_COLLECTION_ID"),
  sourceSearchUrl: readEnv("ANIME_SOURCE_SEARCH_URL"),
  sourceSearchQueryParam: readEnv("ANIME_SOURCE_SEARCH_QUERY_PARAM"),
  sourceSeriesUrl: readEnv("ANIME_SOURCE_SERIES_URL"),
  sourceEpisodeUrl: readEnv("ANIME_SOURCE_EPISODE_URL"),
  sourceApiKey: readEnv("ANIME_SOURCE_API_KEY"),
  gogoApiUrl: readEnv("GOGO_API_URL", "NEXT_PUBLIC_GOGO_API_URL"),
}

const appwriteBase = config.endpoint.replace(/\/$/, "")
let currentApiKey = config.apiKey

const requestContext = {
  cfClearance: "",
  fullCookies: "",
  userAgent: "",
}

function getAnimePaheHeaders(referer = "https://animepahe.pw/") {
  const ua = requestContext.userAgent ||
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0"

  const headers = {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "en-GB,en;q=0.9",
    "referer": referer,
    "user-agent": ua,
    "x-requested-with": "XMLHttpRequest",
  }

  // Prefer full cookie string (includes XSRF-TOKEN + animepahe_session + cf_clearance)
  if (requestContext.fullCookies) {
    headers["cookie"] = requestContext.fullCookies
  } else if (requestContext.cfClearance) {
    headers["cookie"] = `cf_clearance=${requestContext.cfClearance}; SERVERID=pong`
  }

  return headers
}

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
  const isPlaceholder = freshUrl.includes("your-search-function-url") || freshUrl.includes("your-fresh-search-function")

  if (freshUrl && !isPlaceholder) {
    try {
      const payload = await sourceRequest(freshUrl)
      return getFreshItems(payload).map(normalizeFreshAnimeItem).filter((item) => item.sourceId)
    } catch (err) {
      console.warn("Fresh search URL fetch failed, falling back to direct scraping:", err.message)
    }
  }

  try {
    return await searchAnimePaheDirect(query)
  } catch (err) {
    console.warn("Direct AnimePahe search failed, falling back to Jikan:", err.message)
    try {
      return await searchJikanDirect(query)
    } catch (jikanErr) {
      console.error("Direct search fallback failed completely:", jikanErr.message)
      return []
    }
  }
}

async function searchAnimePaheDirect(query) {
  const url = `https://animepahe.pw/api?m=search&q=${encodeURIComponent(query)}`
  const response = await fetch(url, {
    headers: getAnimePaheHeaders(),
  })

  const text = await response.text()
  let payload = null

  try {
    payload = JSON.parse(text)
  } catch {
    payload = { message: text }
  }

  if (!response.ok) {
    throw new Error(payload?.message || `AnimePahe search failed with ${response.status}`)
  }

  return Array.isArray(payload?.data)
    ? payload.data.map(normalizeAnimePaheItemDirect).filter((item) => item.sourceId)
    : []
}

async function searchJikanDirect(query) {
  const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=12`
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "KissanimeX-Appwrite-Function/1.0",
    },
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload?.message || `Jikan search failed with ${response.status}`)
  }

  return Array.isArray(payload?.data)
    ? payload.data.map(normalizeJikanItemDirect).filter((item) => item.sourceId)
    : []
}

function normalizeAnimePaheItemDirect(item) {
  const sourceId = String(item?.session || item?.id || item?.anime_id || item?.title || "").trim()

  return {
    title: item?.title || "Untitled",
    session: sourceId,
    sourceId,
    slug: item?.slug || sourceId,
    poster: item?.poster || item?.image || item?.cover || "",
    type: item?.type || "TV",
    status: item?.status || item?.type || "",
    episodes: item?.episodes ? String(item.episodes) : "",
    episodeCount: item?.episodes ? Number(item.episodes) || null : null,
    score: item?.score ?? null,
    year: item?.year ?? null,
    synopsis: item?.synopsis || "",
    genres: [],
  }
}

function normalizeJikanItemDirect(item) {
  const sourceId = item?.mal_id ? `mal_${item.mal_id}` : String(item?.url || item?.title || "").trim()

  return {
    title: item?.title_english || item?.title || item?.title_japanese || "Untitled",
    session: sourceId,
    sourceId,
    slug: sourceId,
    poster: item?.images?.webp?.large_image_url || item?.images?.jpg?.large_image_url || item?.images?.jpg?.image_url || "",
    type: item?.type || "TV",
    status: item?.status || "",
    episodes: item?.episodes ? String(item.episodes) : "",
    episodeCount: item?.episodes ?? null,
    score: item?.score ?? null,
    year: item?.year ?? null,
    synopsis: item?.synopsis || "",
    genres: Array.isArray(item?.genres) ? item.genres.map((genre) => genre.name).filter(Boolean) : [],
  }
}

function buildFreshSeriesUrl(sourceId, page) {
  if (!config.sourceSeriesUrl) return ""

  let urlString = config.sourceSeriesUrl
  if (urlString.includes("{session}")) {
    urlString = urlString.replaceAll("{session}", encodeURIComponent(sourceId))
  } else if (urlString.includes("{id}")) {
    urlString = urlString.replaceAll("{id}", encodeURIComponent(sourceId))
  }

  if (urlString.includes("{page}")) {
    urlString = urlString.replaceAll("{page}", String(page))
  }

  const url = new URL(urlString.startsWith("appwrite:function:") ? "http://localhost" : urlString)
  if (!urlString.includes("{session}") && !urlString.includes("{id}")) {
    url.searchParams.set("session", sourceId)
  }
  if (!urlString.includes("{page}")) {
    url.searchParams.set("page", String(page))
  }

  if (config.sourceSeriesUrl.startsWith("appwrite:function:")) {
    const raw = config.sourceSeriesUrl.slice("appwrite:function:".length)
    const [functionId] = raw.split("?")
    const separator = url.search.includes("?") ? "&" : "?"
    return `appwrite:function:${functionId}${url.search}`
  }

  return url.toString()
}

function buildFreshEpisodeUrl(animeSourceId, episodeSourceId) {
  if (!config.sourceEpisodeUrl) return ""

  let urlString = config.sourceEpisodeUrl
  if (urlString.includes("{session}")) {
    urlString = urlString.replaceAll("{session}", encodeURIComponent(animeSourceId))
  } else if (urlString.includes("{animeId}")) {
    urlString = urlString.replaceAll("{animeId}", encodeURIComponent(animeSourceId))
  }

  if (urlString.includes("{episode}")) {
    urlString = urlString.replaceAll("{episode}", encodeURIComponent(episodeSourceId))
  } else if (urlString.includes("{ep}")) {
    urlString = urlString.replaceAll("{ep}", encodeURIComponent(episodeSourceId))
  }

  const url = new URL(urlString.startsWith("appwrite:function:") ? "http://localhost" : urlString)
  if (!urlString.includes("{session}") && !urlString.includes("{animeId}")) {
    url.searchParams.set("session", animeSourceId)
  }
  if (!urlString.includes("{episode}") && !urlString.includes("{ep}")) {
    url.searchParams.set("ep", episodeSourceId)
  }

  if (config.sourceEpisodeUrl.startsWith("appwrite:function:")) {
    const raw = config.sourceEpisodeUrl.slice("appwrite:function:".length)
    const [functionId] = raw.split("?")
    const separator = url.search.includes("?") ? "&" : "?"
    return `appwrite:function:${functionId}${url.search}`
  }

  return url.toString()
}

async function fetchFreshEpisodesFromAnimePahe(sourceId, page = 1) {
  const url = `https://animepahe.pw/api?m=release&id=${encodeURIComponent(sourceId)}&sort=asc&page=${page}`
  const response = await fetch(url, {
    headers: getAnimePaheHeaders(),
  })

  const text = await response.text()
  let payload = null

  try {
    payload = JSON.parse(text)
  } catch {
    payload = { message: text }
  }

  if (!response.ok) {
    const error = new Error(payload?.message || `AnimePahe fetch episodes failed with ${response.status}`)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

async function fetchFreshEpisodeLinksFromAnimePahe(animeSourceId, episodeSourceId) {
  const url = `https://animepahe.pw/api?m=embed&id=${encodeURIComponent(animeSourceId)}&session=${encodeURIComponent(episodeSourceId)}&p=kwik`
  const response = await fetch(url, {
    headers: getAnimePaheHeaders(),
  })

  const text = await response.text()
  let payload = null

  try {
    payload = JSON.parse(text)
  } catch {
    payload = { message: text }
  }

  if (!response.ok) {
    const error = new Error(payload?.message || `AnimePahe fetch links failed with ${response.status}`)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

function extractKwikLink(val) {
  if (typeof val === "string") return val
  if (val && typeof val === "object") {
    return val.kwik || val.link || val.url || ""
  }
  return ""
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

  // 1. Try stable ID lookup
  const animeId = stableId("a", sessionId)
  let doc = await getDocument(config.animeCollectionId, animeId)
  if (doc) return doc

  // 2. Try direct lookup using sessionId as document ID
  doc = await getDocument(config.animeCollectionId, sessionId)
  if (doc) return doc

  // 3. Fallback scan
  const documents = await listAllDocuments(config.animeCollectionId)
  return documents.find((doc) => doc.sourceId === sessionId || doc.slug === sessionId) || null
}

async function resolveSeriesBySession(sessionId, animeDoc) {
  if (!sessionId) return null

  // 1. Try stable ID lookup
  const seriesId = stableId("s", sessionId)
  let doc = await getDocument(config.seriesCollectionId, seriesId)
  if (doc) return doc

  // 2. Try direct lookup using sessionId as document ID
  doc = await getDocument(config.seriesCollectionId, sessionId)
  if (doc) return doc

  // 3. Fallback scan
  const documents = await listAllDocuments(config.seriesCollectionId)
  return (
    documents.find((doc) => doc.sourceId === sessionId || doc.animeId === animeDoc?.$id || doc.animeId === sessionId) ||
    null
  )
}

async function resolveSeriesBySessionVariant(sessionId, animeDoc, subOrDub) {
  if (!sessionId) return null

  // 1. Try stable ID for this variant
  const seriesId = stableId("s", `${sessionId}:${subOrDub}`)
  let doc = await getDocument(config.seriesCollectionId, seriesId)
  if (doc) return doc

  // 2. Fallback to legacy stable ID (without variant suffix)
  const legacySeriesId = stableId("s", sessionId)
  doc = await getDocument(config.seriesCollectionId, legacySeriesId)
  if (doc && (doc.subOrDub || "sub") === subOrDub) return doc

  // 3. Fallback scan
  const documents = await listAllDocuments(config.seriesCollectionId)
  return (
    documents.find(
      (doc) =>
        (doc.animeId === animeDoc?.$id || doc.animeId === sessionId) &&
        (doc.subOrDub || "sub") === subOrDub
    ) || null
  )
}

async function fetchAnimeJikanDirect(malId) {
  const url = `https://api.jikan.moe/v4/anime/${encodeURIComponent(malId)}`
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "KissanimeX-Appwrite-Function/1.0",
    },
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload?.message || `Jikan fetch failed with ${response.status}`)
  }

  return payload?.data ? normalizeJikanItemDirect(payload.data) : null
}

function getSearchQueries(title) {
  if (!title) return []

  const queries = [title.trim()]

  // Cleaned query: replace punctuation with space, remove duplicate spaces
  const cleaned = title
    .replace(/[:;\-\(\)\{\}\[\]\.,\/\?\!]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (cleaned && cleaned.toLowerCase() !== title.toLowerCase().trim()) {
    queries.push(cleaned)
  }

  // Shortened query: first 4 words of cleaned query
  const words = cleaned.split(" ")
  if (words.length > 4) {
    const shortened = words.slice(0, 4).join(" ")
    if (shortened) {
      queries.push(shortened)
    }
  }

  // Deduplicate
  return [...new Set(queries)]
}

async function resolveAnimePaheSessionId(animeDoc) {
  if (!animeDoc) return null

  // If the document already has a valid AnimePahe sourceId (not starting with mal_), return it
  if (animeDoc.sourceId && !animeDoc.sourceId.startsWith("mal_")) {
    return animeDoc.sourceId
  }

  // Otherwise, search AnimePahe by name with fallbacks
  const queries = getSearchQueries(animeDoc.title)
  for (const query of queries) {
    try {
      console.log(`[resolveAnimePaheSessionId] Searching AnimePahe for: "${query}"`)
      const results = await searchAnimePaheDirect(query)
      if (results && results.length > 0) {
        const queryLower = query.toLowerCase()
        const match = results.find((r) => r.title.toLowerCase() === queryLower) || results[0]
        console.log(`[resolveAnimePaheSessionId] Mapped query "${query}" to AnimePahe session "${match.sourceId}"`)
        return match.sourceId
      }
    } catch (err) {
      console.error(`[resolveAnimePaheSessionId] Mapping failed for query "${query}":`, err.message)
    }
  }

  return null
}

async function searchGogoanimeWorker(query) {
  const url = `${config.gogoApiUrl}/search/${encodeURIComponent(query)}`
  console.log(`[GogoWorker] Fetching: ${url}`)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Worker search failed: ${res.statusText}`)
  }
  const payload = await res.json()
  return Array.isArray(payload?.results) ? payload.results : []
}

async function fetchGogoanimeWorkerDetails(gogoId) {
  const url = `${config.gogoApiUrl}/anime/${encodeURIComponent(gogoId)}`
  console.log(`[GogoWorker] Fetching details: ${url}`)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Worker details failed: ${res.statusText}`)
  }
  return await res.json()
}

async function fetchGogoanimeWorkerDownloads(gogoEpisodeId) {
  const url = `${config.gogoApiUrl}/download/${encodeURIComponent(gogoEpisodeId)}`
  console.log(`[GogoWorker] Fetching downloads: ${url}`)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Worker downloads failed: ${res.statusText}`)
  }
  const payload = await res.json()
  return payload?.results || {}
}

async function resolveGogoanimeSlugs(animeTitle) {
  const queries = getSearchQueries(animeTitle)
  if (!queries.length) return { subId: null, dubId: null }

  for (const query of queries) {
    try {
      console.log(`[GogoWorker] Resolving sub and dub slugs simultaneously for query: "${query}"`)
      const [subResults, dubResults] = await Promise.all([
        searchGogoanimeWorker(query),
        searchGogoanimeWorker(`${query} dub`),
      ])

      const queryLower = query.toLowerCase()

      // Match strategy for sub: matches title and does NOT contain "dub"
      const subMatch =
        subResults.find(
          (r) =>
            r.title &&
            r.title.toLowerCase().includes(queryLower) &&
            !r.title.toLowerCase().includes("dub")
        ) ||
        subResults.find((r) => r.title && r.title.toLowerCase().includes(queryLower)) ||
        subResults[0]

      // Match strategy for dub: matches title and contains "dub"
      const dubMatch =
        dubResults.find(
          (r) =>
            r.title &&
            r.title.toLowerCase().includes(queryLower) &&
            r.title.toLowerCase().includes("dub")
        ) ||
        dubResults.find((r) => r.title && r.title.toLowerCase().includes(queryLower)) ||
        dubResults[0]

      if (subMatch?.id || dubMatch?.id) {
        console.log(`[GogoWorker] Mapped query "${query}" to sub: "${subMatch?.id || null}", dub: "${dubMatch?.id || null}"`)
        return {
          subId: subMatch?.id || null,
          dubId: dubMatch?.id || null,
        }
      }
    } catch (err) {
      console.warn(`[GogoWorker] Slug mapping failed for query "${query}":`, err.message)
    }
  }

  return { subId: null, dubId: null }
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
    const normalized = matches.map(normalizeAnimeDocument)
    const unique = []
    const seen = new Set()
    for (const item of normalized) {
      if (item.session && !seen.has(item.session)) {
        seen.add(item.session)
        unique.push(item)
      }
    }
    return {
      status: true,
      data: unique,
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

  // Deduplicate fresh items before posting and returning
  const uniqueFresh = []
  const seenFresh = new Set()
  for (const item of freshItems) {
    if (item.session && !seenFresh.has(item.session)) {
      seenFresh.add(item.session)
      uniqueFresh.push(item)
    }
  }

  await handleSearchPost({ items: uniqueFresh })
  const savedMatches = await findAnime(query)

  if (savedMatches.length) {
    const normalized = savedMatches.map(normalizeAnimeDocument)
    const unique = []
    const seen = new Set()
    for (const item of normalized) {
      if (item.session && !seen.has(item.session)) {
        seen.add(item.session)
        unique.push(item)
      }
    }
    return {
      status: true,
      data: unique,
      source: "fresh",
      message: "Search results fetched fresh and stored in Appwrite database",
    }
  }

  return {
    status: true,
    data: uniqueFresh,
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
  const subOrDub = url.searchParams.get("subOrDub") || "sub"

  let animeDoc = await resolveAnimeBySession(sessionId)

  // If animeDoc is missing, and sessionId is a MAL ID, let's fetch it fresh from Jikan!
  if (!animeDoc && sessionId.startsWith("mal_")) {
    try {
      const malId = sessionId.replace("mal_", "")
      console.log(`[handleSeriesGet] AnimeDoc is missing. Fetching fresh metadata from Jikan for MAL ID: ${malId}`)
      const jikanItem = await fetchAnimeJikanDirect(malId)
      if (jikanItem) {
        await handleSearchPost({ items: [jikanItem] })
        animeDoc = await resolveAnimeBySession(sessionId)
      }
    } catch (err) {
      console.error("Failed to fetch fresh anime from Jikan for series page:", err)
    }
  }

  // If animeDoc is still missing, create a placeholder so we can proceed without failing
  if (!animeDoc) {
    const documentId = stableId("a", sessionId)
    const data = {
      title: sessionId,
      slug: sessionId,
      sourceId: sessionId,
      lastSyncedAt: new Date().toISOString(),
    }
    await upsertDocument(config.animeCollectionId, documentId, data)
    animeDoc = await resolveAnimeBySession(sessionId)
  }

  let seriesDoc = await resolveSeriesBySessionVariant(sessionId, animeDoc, subOrDub)
  let episodeData = await getEpisodesForSeries(seriesDoc, animeDoc, page)

  // Cache miss for episodes: fetch fresh and sync
  if (!episodeData.episodes.length) {
    let resolvedTargetId = null
    let resolvedOtherId = null

    // Determine target GogoAnime slug
    if (seriesDoc && seriesDoc.sourceId) {
      resolvedTargetId = seriesDoc.sourceId
    } else {
      console.log(`[handleSeriesGet] Resolving GogoAnime slugs for: ${animeDoc.title}`)
      const slugs = await resolveGogoanimeSlugs(animeDoc.title)
      if (subOrDub === "sub") {
        resolvedTargetId = slugs.subId
        resolvedOtherId = slugs.dubId
      } else {
        resolvedTargetId = slugs.dubId
        resolvedOtherId = slugs.subId
      }
    }

    if (resolvedTargetId) {
      try {
        console.log(`[handleSeriesGet] Fetching episodes from GogoAnime Worker for target: ${resolvedTargetId}`)
        const details = await fetchGogoanimeWorkerDetails(resolvedTargetId)

        if (details && Array.isArray(details.episodes) && details.episodes.length > 0) {
          const body = {
            anime: {
              sourceId: sessionId, // Keep original MAL ID / sessionId for anime
              title: animeDoc?.title || details.name || "Untitled",
              slug: animeDoc?.slug || sessionId,
              poster: animeDoc?.posterUrl || details.image || "",
              banner: animeDoc?.bannerUrl || "",
              synopsis: animeDoc?.description || details.plot_summary || "",
              genres: animeDoc?.genres || [],
              status: animeDoc?.status || details.status || "",
              score: animeDoc?.score || null,
              year: animeDoc?.year || null,
              episodeCount: animeDoc?.episodeCount || details.episodes.length,
            },
            series: {
              sourceId: resolvedTargetId,
              title: seriesDoc?.title || animeDoc?.title || details.name || "Untitled",
              poster: seriesDoc?.posterUrl || animeDoc?.posterUrl || details.image || "",
              synopsis: seriesDoc?.synopsis || animeDoc?.description || details.plot_summary || "",
              episodeCount: details.episodes.length,
              subOrDub: subOrDub,
            },
            episodes: details.episodes.map(([epNum, epId]) => ({
              episode: epNum,
              title: `Episode ${epNum}`,
              snapshot: details.image || "",
              session: epId, // Gogoanime episode ID
              id: epId,
            })),
          }

          await handleSeriesPost(body)

          // Sync other variant's placeholder if it has a resolved ID and doesn't exist
          const otherSubOrDub = subOrDub === "sub" ? "dub" : "sub"
          if (resolvedOtherId) {
            const otherSeriesId = stableId("s", `${sessionId}:${otherSubOrDub}`)
            const otherSeriesDoc = await getDocument(config.seriesCollectionId, otherSeriesId)
            if (!otherSeriesDoc) {
              const otherSeriesData = {
                animeId: animeDoc.$id,
                sourceId: resolvedOtherId,
                subOrDub: otherSubOrDub,
                title: `${animeDoc?.title || details.name || "Untitled"} (${otherSubOrDub.toUpperCase()})`,
                posterUrl: animeDoc?.posterUrl || details.image || "",
                synopsis: animeDoc?.description || details.plot_summary || "",
                episodeCount: 0,
                currentPage: 1,
                totalPages: 1,
                lastSyncedAt: new Date().toISOString(),
              }
              await upsertDocument(config.seriesCollectionId, otherSeriesId, otherSeriesData)
            }
          }

          seriesDoc = await resolveSeriesBySessionVariant(sessionId, animeDoc, subOrDub)
          episodeData = await getEpisodesForSeries(seriesDoc, animeDoc, page)
        }
      } catch (err) {
        console.error("[handleSeriesGet] Gogo worker fetch and sync failed, trying fallback to AnimePahe:", err)
      }
    }

    // Fallback to original AnimePahe scraping flow if worker fails/not found
    if (!episodeData.episodes.length) {
      console.log("[handleSeriesGet] Falling back to original AnimePahe scraping flow")
      let animePaheSessionId = null
      if (sessionId && !sessionId.startsWith("mal_")) {
        animePaheSessionId = sessionId
      } else {
        animePaheSessionId = await resolveAnimePaheSessionId(animeDoc)
      }

      if (animePaheSessionId) {
        try {
          let payload
          const freshUrl = buildFreshSeriesUrl(animePaheSessionId, page)
          if (freshUrl) {
            payload = await sourceRequest(freshUrl)
          } else {
            payload = await fetchFreshEpisodesFromAnimePahe(animePaheSessionId, page)
          }

          if (payload && Array.isArray(payload.data)) {
            const body = {
              anime: {
                sourceId: animeDoc?.sourceId || sessionId,
                title: animeDoc?.title || "Untitled",
                slug: animeDoc?.slug || sessionId,
                poster: animeDoc?.posterUrl || "",
                banner: animeDoc?.bannerUrl || "",
                synopsis: animeDoc?.description || "",
                genres: animeDoc?.genres || [],
                status: animeDoc?.status || "",
                score: animeDoc?.score || null,
                year: animeDoc?.year || null,
                episodeCount: animeDoc?.episodeCount || payload.total || payload.data.length,
              },
              series: {
                sourceId: animePaheSessionId,
                title: seriesDoc?.title || animeDoc?.title || "Untitled",
                poster: seriesDoc?.posterUrl || animeDoc?.posterUrl || "",
                synopsis: seriesDoc?.synopsis || animeDoc?.description || "",
                currentPage: payload.current_page || page,
                totalPages: payload.last_page || 1,
                episodeCount: payload.total || payload.data.length,
                subOrDub: "sub",
              },
              episodes: payload.data.map((ep) => ({
                episode: ep.episode,
                title: ep.episode_title || `Episode ${ep.episode}`,
                snapshot: ep.snapshot,
                session: ep.session,
                id: ep.session || ep.id,
              })),
            }

            await handleSeriesPost(body)
            seriesDoc = await resolveSeriesBySessionVariant(sessionId, animeDoc, subOrDub)
            episodeData = await getEpisodesForSeries(seriesDoc, animeDoc, page)
          }
        } catch (err) {
          console.error("Failed to fetch and sync fresh episodes from AnimePahe:", err)
        }
      }
    }
  }

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
    message: episodeData.episodes.length ? "Series data loaded from Appwrite database" : "No episodes found",
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

  const seriesId = stableId("s", `${sourceId}:${series.subOrDub || "sub"}`)
  const seriesData = {
    animeId,
    sourceId: series.sourceId || sourceId,
    subOrDub: series.subOrDub || anime.subOrDub || "sub",
    title: series.title || animeData.title,
    posterUrl: series.poster || series.posterUrl || animeData.posterUrl || "",
    synopsis: series.synopsis || animeData.description || "",
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

  let documents = await listAllDocuments(config.episodeCollectionId)
  let matches = documents.filter((doc) => {
    const sameSeries = doc.seriesId === sessionId || doc.animeId === sessionId
    const sameEpisode = doc.$id === episodeId || doc.sourceId === episodeId || doc.episodeNumber === episodeId
    return sameSeries && sameEpisode
  })

  // Try GogoAnime Cloudflare Worker download endpoint directly without caching
  if (matches.length > 0) {
    const firstMatch = matches[0]
    const gogoEpisodeId = firstMatch.sourceId

    if (gogoEpisodeId) {
      try {
        console.log(`[handleEpisodeGet] Trying Gogo worker downloads for episode ID: ${gogoEpisodeId}`)
        const results = await fetchGogoanimeWorkerDownloads(gogoEpisodeId)
        if (results && typeof results === "object" && Object.keys(results).length > 0) {
          console.log(`[handleEpisodeGet] Successfully fetched direct Gogo worker downloads for: ${gogoEpisodeId}`)
          return Object.entries(results).map(([quality, link]) => ({
            link: link,
            name: quality,
            title: firstMatch.title,
            episode: firstMatch.episodeNumber,
          }))
        }
      } catch (err) {
        console.warn(`[handleEpisodeGet] Gogo worker downloads fetch failed or returned empty for ${gogoEpisodeId}:`, err.message)
      }
    }
  }

  // Fallback: Cache miss for downloadUrl from original AnimePahe kwik links and sync
  const hasDownloadUrls = matches.some((doc) => doc.downloadUrl)
  if (!hasDownloadUrls && matches.length > 0) {
    const firstMatch = matches[0]
    const seriesId = firstMatch.seriesId
    const animeId = firstMatch.animeId
    const episodeSourceId = firstMatch.sourceId

    const animeDoc = await resolveAnimeBySession(sessionId)
    let animeSourceId = null
    if (animeDoc) {
      animeSourceId = await resolveAnimePaheSessionId(animeDoc)
    }
    if (!animeSourceId) {
      animeSourceId = sessionId
    }

    if (animeSourceId && episodeSourceId && !animeSourceId.startsWith("mal_")) {
      try {
        let payload
        const freshUrl = buildFreshEpisodeUrl(animeSourceId, episodeSourceId)
        if (freshUrl) {
          payload = await sourceRequest(freshUrl)
        } else {
          payload = await fetchFreshEpisodeLinksFromAnimePahe(animeSourceId, episodeSourceId)
        }

        const dataObj = payload?.data ? Object.values(payload.data)[0] : null
        if (dataObj && typeof dataObj === "object") {
          const upserts = []
          for (const [quality, val] of Object.entries(dataObj)) {
            const downloadUrl = extractKwikLink(val)
            if (downloadUrl) {
              const qualityLabel = quality.includes("p") ? quality : `${quality}p`
              // Generate a unique ID for this quality of the episode
              const docId = stableId("e", `${seriesId}:${episodeSourceId}:${qualityLabel}`)
              const data = {
                animeId,
                seriesId,
                sourceId: episodeSourceId,
                episodeNumber: firstMatch.episodeNumber,
                title: firstMatch.title,
                snapshotUrl: firstMatch.snapshotUrl,
                downloadUrl,
                downloadUrlExpiresAt: null,
                quality: qualityLabel,
                subOrDub: firstMatch.subOrDub || "sub",
                lastSyncedAt: new Date().toISOString(),
              }
              upserts.push(upsertDocument(config.episodeCollectionId, docId, data))
            }
          }

          if (upserts.length > 0) {
            await Promise.all(upserts)
            const updatedDocs = await listAllDocuments(config.episodeCollectionId)
            matches = updatedDocs.filter((doc) => {
              const sameSeries = doc.seriesId === sessionId || doc.animeId === sessionId
              const sameEpisode = doc.$id === episodeId || doc.sourceId === episodeId || doc.episodeNumber === episodeId
              return sameSeries && sameEpisode
            })
          }
        }
      } catch (err) {
        console.error("Failed to fetch and sync fresh episode links:", err)
      }
    }
  }

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
  requestContext.cfClearance = req?.headers?.["x-cf-clearance"] || ""
  requestContext.fullCookies  = req?.headers?.["x-animepahe-cookies"] || ""
  requestContext.userAgent    = req?.headers?.["x-user-agent"] || req?.headers?.["user-agent"] || ""

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
    console.error("Handler error stack:", error);
    return json(res, error?.status || 500, {
      status: false,
      message: error?.message || "Appwrite function failed",
      details: error?.payload || undefined,
    })
  }
}
