import { NextRequest, NextResponse } from "next/server";
import { getCachedAnime, cacheAnime, fetchAniListDetail } from "@/lib/anime-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const id = params.id;

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing anime ID" }, { status: 400 });
  }

  try {
    // 1. Check Appwrite cache first
    const cached = await getCachedAnime(id);
    if (cached) {
      console.log(`[Metadata API] Cache HIT for AniList ID: ${id}`);
      return NextResponse.json({ success: true, data: cached, source: "cache" });
    }

    // 2. Cache miss, fetch from AniList GraphQL
    console.log(`[Metadata API] Cache MISS for AniList ID: ${id}. Fetching from AniList...`);
    const details = await fetchAniListDetail(id);

    // 3. Cache details in Appwrite
    await cacheAnime(details);

    return NextResponse.json({ success: true, data: details, source: "anilist" });
  } catch (err: any) {
    console.error(`[Metadata API] Error fetching details for ID ${id}:`, err.message);
    
    // In case of AniList error, try to return cached data as a fallback even if getCachedAnime failed or was skipped
    try {
      const fallbackCached = await getCachedAnime(id);
      if (fallbackCached) {
        console.warn(`[Metadata API] Returning fallback cached data due to AniList error`);
        return NextResponse.json({ success: true, data: fallbackCached, source: "fallback-cache" });
      }
    } catch (fallbackErr) {
      console.error("[Metadata API] Fallback cache retrieval failed:", fallbackErr);
    }

    return NextResponse.json(
      { success: false, error: err.message || "Failed to load anime details" },
      { status: 500 }
    );
  }
}
