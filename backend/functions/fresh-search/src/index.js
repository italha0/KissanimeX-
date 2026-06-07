const json = (res, status, data) => {
  res.statusCode = status
  res.headers = {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization",
  }
  res.body = JSON.stringify(data)
  return res
}

function getRequestUrl(req) {
  if (typeof req?.url === "string" && req.url.trim()) {
    return req.url
  }

  const path = typeof req?.path === "string" && req.path.trim() ? req.path.trim() : "/"
  const query = req?.query && typeof req.query === "object" ? req.query : null

  if (!query) return path

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue
    params.set(key, String(value))
  }

  const queryString = params.toString()
  return queryString ? `${path}?${queryString}` : path
}

function normalizeAnimePaheItem(item) {
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

function normalizeJikanItem(item) {
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

async function searchAnimePahe(query) {
  const url = new URL("https://animepahe.ru/api")
  url.searchParams.set("m", "search")
  url.searchParams.set("q", query)

  const response = await fetch(url, {
    headers: {
      accept: "application/json, text/plain, */*",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
      referer: "https://animepahe.ru/",
    },
  })

  const text = await response.text()
  let payload = null

  try {
    payload = JSON.parse(text)
  } catch {
    payload = { message: text }
  }

  if (!response.ok) {
    const message = payload?.message || `AnimePahe search failed with ${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return Array.isArray(payload?.data) ? payload.data.map(normalizeAnimePaheItem).filter((item) => item.sourceId) : []
}

async function searchJikan(query) {
  const url = new URL("https://api.jikan.moe/v4/anime")
  url.searchParams.set("q", query)
  url.searchParams.set("limit", "12")

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

  return Array.isArray(payload?.data) ? payload.data.map(normalizeJikanItem).filter((item) => item.sourceId) : []
}

async function searchFresh(query) {
  try {
    return await searchAnimePahe(query)
  } catch (error) {
    console.warn(`AnimePahe search failed, using Jikan fallback: ${error?.message || error}`)
    return searchJikan(query)
  }
}

export default async function handler({ req, res }) {
  if (req.method === "OPTIONS") {
    return json(res, 204, {})
  }

  if (req.method !== "GET") {
    return json(res, 405, {
      status: false,
      message: "Method not allowed",
    })
  }

  const url = new URL(getRequestUrl(req), "http://localhost")
  const query = String(url.searchParams.get("query") || "").trim()

  if (!query) {
    return json(res, 200, {
      status: true,
      data: [],
      message: "Missing search query",
    })
  }

  try {
    const data = await searchFresh(query)
    return json(res, 200, {
      status: true,
      data,
      message: data.length ? "Fresh search results loaded" : "No fresh results found",
    })
  } catch (error) {
    return json(res, error?.status || 500, {
      status: false,
      data: [],
      message: error?.message || "Fresh search failed",
      details: error?.payload || undefined,
    })
  }
}
