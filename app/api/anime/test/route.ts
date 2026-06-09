/**
 * GET /api/anime/test
 *
 * Isolated one-time test endpoint.
 * Reads ANIMEPAHE_COOKIES from server-side env only.
 * Does NOT touch any existing route, cache, or handler.
 * Does NOT read from localStorage or request headers.
 */

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const cookies = process.env.ANIMEPAHE_COOKIES ?? ""

  const response = await fetch(
    "https://animepahe.pw/api?m=search&q=naruto",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-GB,en;q=0.9",
        "Referer": "https://animepahe.pw/",
        "X-Requested-With": "XMLHttpRequest",
        "Cookie": cookies,
      },
    }
  )

  const body = await response.text()

  const isJSON = body.trimStart().startsWith("{") || body.trimStart().startsWith("[")
  const isBlocked =
    body.includes("Just a moment") ||
    body.includes("DDoS-Guard") ||
    body.includes("Checking your browser") ||
    body.includes("Attention Required") ||
    body.includes("challenge-platform")

  return Response.json({
    http_status: response.status,
    is_json: isJSON,
    is_blocked: isBlocked,
    cookie_set: cookies.length > 0,
    cookie_has_clearance: cookies.includes("cf_clearance="),
    body_preview: body.substring(0, 500),
  })
}
