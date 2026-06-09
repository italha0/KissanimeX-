import { NextRequest, NextResponse } from "next/server";
import { fetchAniListSearch } from "@/lib/anime-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const results = await fetchAniListSearch(query);
    return NextResponse.json({ success: true, data: results });
  } catch (err: any) {
    console.error(`[Search API] Error searching for "${query}":`, err.message);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to search AniList" },
      { status: 500 }
    );
  }
}
