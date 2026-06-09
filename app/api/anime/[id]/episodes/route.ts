import { NextRequest, NextResponse } from "next/server";
import { getCachedEpisodes, cacheEpisodes, fetchJikanEpisodes } from "@/lib/anime-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(req.url);
  const malIdStr = searchParams.get("malId");

  if (!malIdStr) {
    return NextResponse.json(
      { success: false, error: "Missing malId query parameter" },
      { status: 400 }
    );
  }

  const malId = parseInt(malIdStr, 10);
  if (isNaN(malId)) {
    return NextResponse.json(
      { success: false, error: "Invalid malId format" },
      { status: 400 }
    );
  }

  try {
    // 1. Check Appwrite cache first
    const cached = await getCachedEpisodes(malId);
    if (cached && cached.length > 0) {
      console.log(`[Episodes API] Cache HIT for malId ${malId}. Found ${cached.length} episodes.`);
      return NextResponse.json({ success: true, data: cached, source: "cache" });
    }

    // 2. Cache miss, fetch from Jikan v4
    console.log(`[Episodes API] Cache MISS for malId ${malId}. Fetching from Jikan...`);
    const episodes = await fetchJikanEpisodes(malId);

    // 3. Cache episodes in Appwrite (cache forever)
    if (episodes.length > 0) {
      console.log(`[Episodes API] Caching ${episodes.length} episodes in Appwrite for malId ${malId}...`);
      await cacheEpisodes(malId, episodes);
    }

    return NextResponse.json({ success: true, data: episodes, source: "jikan" });
  } catch (err: any) {
    console.error(`[Episodes API] Error getting episodes for malId ${malId}:`, err.message);

    // Fallback: try to return whatever is in cache in case Jikan fails
    try {
      const fallbackCached = await getCachedEpisodes(malId);
      if (fallbackCached && fallbackCached.length > 0) {
        console.warn(`[Episodes API] Returning fallback cached episodes due to error`);
        return NextResponse.json({ success: true, data: fallbackCached, source: "fallback-cache" });
      }
    } catch (fallbackErr) {
      console.error("[Episodes API] Fallback cache retrieval failed:", fallbackErr);
    }

    return NextResponse.json(
      { success: false, error: err.message || "Failed to load episodes" },
      { status: 500 }
    );
  }
}
