import animeApiHandler from "@/backend/functions/anime-api/src/index.js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type HandlerResponse = {
  statusCode?: number
  headers?: Record<string, string>
  body?: string
}

async function runAnimeApi(request: Request) {
  const url = new URL(request.url)
  const body = request.method === "GET" || request.method === "OPTIONS" ? undefined : await request.text()
  const response: HandlerResponse = {}

  await animeApiHandler({
    req: {
      method: request.method,
      url: `${url.pathname}${url.search}`,
      headers: Object.fromEntries(request.headers.entries()),
      body,
    },
    res: response,
  })

  return new Response(response.body ?? "", {
    status: response.statusCode ?? 200,
    headers: response.headers,
  })
}

export const GET = runAnimeApi
export const POST = runAnimeApi
export const OPTIONS = runAnimeApi
