"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getAnimeDiscoveryMeta, getAnimeDiscoveryEpisodes } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Download, Film, Sparkles, Activity } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function AnimeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

  // 1. Fetch Anime Metadata (Cache-first via Next.js API)
  const { data: anime, isLoading: isMetaLoading, isError: isMetaError, error: metaError } = useQuery({
    queryKey: ["animeMeta", id],
    queryFn: () => getAnimeDiscoveryMeta(id),
    enabled: !!id,
  });

  // 2. Fetch Episodes (Cache-first, triggered client-side after metadata loads)
  const malId = anime?.malId;
  const { data: episodes, isLoading: isEpisodesLoading, isError: isEpisodesError } = useQuery({
    queryKey: ["animeEpisodes", id, malId],
    queryFn: () => getAnimeDiscoveryEpisodes(id, malId!),
    enabled: !!malId,
  });

  // 3. Helper to open Nyaa download URL in a new tab
  const handleDownloadClick = (episodeNumber: number) => {
    if (!anime) return;
    
    const cleanTitle = (t: string) => t
      .replace(/:/g, '')        // remove colons
      .replace(/[^\w\s-]/g, '') // remove other special chars
      .trim();

    const nyaaTitle = cleanTitle(anime.titleRomaji || anime.titleEnglish || "Anime");
    const q = `${nyaaTitle} ${episodeNumber}`;
    const qEncoded = encodeURIComponent(q).replace(/%20/g, "+");
    const url = `https://nyaa.si/?f=0&c=1_2&q=${qEncoded}`;
    
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (isMetaLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col items-center justify-center">
        {/* Loading skeleton */}
        <div className="w-full max-w-5xl animate-pulse space-y-8">
          <div className="h-10 w-24 bg-neutral-800 rounded-full" />
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 aspect-[2/3] bg-neutral-800 rounded-2xl" />
            <div className="w-full md:w-2/3 space-y-4">
              <div className="h-8 bg-neutral-800 rounded w-3/4" />
              <div className="h-4 bg-neutral-800 rounded w-1/2" />
              <div className="h-20 bg-neutral-800 rounded" />
              <div className="h-6 bg-neutral-800 rounded w-1/3" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-neutral-800 rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-neutral-800 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isMetaError || !anime) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-red-500">Failed to load anime details</h2>
        <p className="text-neutral-400">{(metaError as Error)?.message || "An unexpected error occurred."}</p>
        <Button onClick={() => router.push("/")} className="bg-neutral-800 hover:bg-neutral-700 text-white rounded-full">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
        </Button>
      </div>
    );
  }

  const title = anime.titleEnglish || anime.titleRomaji;
  const subTitle = anime.titleEnglish && anime.titleRomaji !== anime.titleEnglish ? anime.titleRomaji : null;

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-rose-500 selection:text-white pb-20 overflow-x-hidden">
      {/* Background Banner with blurred poster image */}
      <div className="absolute top-0 left-0 w-full h-[50vh] overflow-hidden pointer-events-none z-0">
        <Image
          src={anime.poster}
          alt=""
          fill
          className="object-cover blur-3xl scale-125 saturate-150 opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="rounded-full bg-white/5 hover:bg-white/10 text-white backdrop-blur-md border border-white/10 px-5"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
          </Button>
        </motion.div>

        {/* Anime Details section */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start mb-16">
          {/* Poster Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full md:w-80 shrink-0 mx-auto md:mx-0"
          >
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              <Image
                src={anime.poster}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 320px"
                priority
              />
            </div>
          </motion.div>

          {/* Metadata details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 space-y-6 text-left"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {anime.status && (
                  <Badge className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-3 py-1 font-semibold uppercase tracking-wider text-xs">
                    {anime.status.replace(/_/g, " ")}
                  </Badge>
                )}
                {anime.rating && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-black rounded-full px-3 py-1 font-bold flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3 fill-black" /> {anime.rating.toFixed(1)} / 10
                  </Badge>
                )}
                {anime.episodeCount && (
                  <Badge className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-3 py-1 font-semibold text-xs">
                    {anime.episodeCount} Episodes
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-white mb-2">
                {title}
              </h1>
              {subTitle && (
                <p className="text-lg text-neutral-400 font-medium italic">
                  {subTitle}
                </p>
              )}
            </div>

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((genre) => (
                  <span
                    key={genre}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-neutral-800/80 text-rose-300 border border-rose-500/10 backdrop-blur-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {anime.synopsis && (
              <div className="bg-neutral-900/50 border border-white/5 p-6 rounded-2xl backdrop-blur-md space-y-2">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                  <Film className="h-4 w-4 text-rose-500" /> Synopsis
                </h3>
                <p
                  className={`text-neutral-300 text-sm sm:text-base leading-relaxed transition-all duration-350 ${
                    isSynopsisExpanded ? "" : "line-clamp-4"
                  }`}
                  dangerouslySetInnerHTML={{ __html: anime.synopsis }}
                />
                {anime.synopsis.length > 250 && (
                  <button
                    onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                    className="text-xs sm:text-sm font-bold text-rose-400 hover:text-rose-300 hover:underline pt-2 focus:outline-none transition-colors"
                  >
                    {isSynopsisExpanded ? "Collapse Description" : "Read Full Synopsis"}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Episode List Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6 text-left"
        >
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-3 text-white">
              <Sparkles className="h-6 w-6 text-rose-500" /> Episodes
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              Select an episode to search on Nyaa tracker.
            </p>
          </div>

          {/* Episodes loading or listing */}
          {!malId ? (
            <div className="bg-neutral-900/40 rounded-xl p-8 text-center text-neutral-400 border border-white/5">
              MAL ID is missing, cannot load episodes from Jikan.
            </div>
          ) : isEpisodesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-neutral-950/60 rounded-xl p-5 border border-white/5 animate-pulse space-y-3">
                  <div className="h-4 bg-neutral-800 rounded w-1/4" />
                  <div className="h-6 bg-neutral-800 rounded w-3/4" />
                  <div className="h-4 bg-neutral-800 rounded w-1/2" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-neutral-800 rounded-full w-24" />
                    <div className="h-8 bg-neutral-800 rounded-full w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : isEpisodesError || !episodes || episodes.length === 0 ? (
            <div className="bg-neutral-900/40 rounded-xl p-8 text-center text-neutral-400 border border-white/5">
              No episodes found for this series.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {episodes.map((ep) => (
                <Card
                  key={ep.episodeNumber}
                  className="bg-neutral-950/80 border border-white/5 hover:border-rose-500/20 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
                >
                  {/* Subtle hover accent line */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-rose-500 to-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black tracking-widest text-neutral-500 uppercase">
                      EPISODE {ep.episodeNumber}
                    </span>
                    <div className="flex gap-2">
                      {ep.filler && (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-[0.65rem] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Filler
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="text-white font-bold leading-snug line-clamp-1 group-hover:text-rose-400 transition-colors duration-200">
                    {ep.title}
                  </h3>

                  {ep.airdate && (
                    <span className="text-xs text-neutral-400 flex items-center gap-1.5 mt-2">
                      <Activity className="h-3.5 w-3.5 text-neutral-600" /> Aired: {ep.airdate}
                    </span>
                  )}

                  {/* Nyaa buttons */}
                  <div className="flex pt-4">
                    <Button
                      size="sm"
                      onClick={() => handleDownloadClick(ep.episodeNumber)}
                      className="w-full bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-semibold py-1.5 h-auto flex items-center justify-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" /> Find Download
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
