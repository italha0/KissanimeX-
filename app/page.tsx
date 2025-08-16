"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchInput } from "@/components/search-input";
import Image from "next/image";
import { AnimeCard } from "@/components/anime-card";
import { EpisodeList } from "@/components/episode-list";
import { DownloadModal } from "@/components/download-modal";
import { searchAnime, getEpisodeDownloadLinks, AnimeSearchResult } from "@/lib/api";
import MobileHomePage from "@/components/mobilepage";

export default function HomePage() {
  // --- State for Page View ---
  const [view, setView] = useState("home"); // 'home', 'searchResults', or 'episodeList'
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AnimeSearchResult[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<AnimeSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- State for Download Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<{ sessionId: string; title: string; number: string } | null>(null);

  // --- Data Fetching for Download Links ---
  const {
    data: modalDownloadLinks,
    isLoading: isModalLoading,
    isError: isModalError,
  } = useQuery({
    queryKey: ["episodeDownloadLinks", selectedEpisode?.sessionId],
    queryFn: () => getEpisodeDownloadLinks(selectedAnime!.session, selectedEpisode!.sessionId),
    enabled: !!selectedEpisode && !!selectedAnime, // Only fetch when an episode is selected
  });


  // --- Event Handlers ---
  const handleSearch = async (query: string) => {
    if (!query) return;
    setIsLoading(true);
    setSearchQuery(query);
    const results = await searchAnime(query);
    setSearchResults(results);
    setView("searchResults");
    setIsLoading(false);
  };

  const handleAnimeSelect = (anime: AnimeSearchResult) => {
    setSelectedAnime(anime);
    setView("episodeList");
  };

  const handleBackToHome = () => {
    setView("home");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedAnime(null);
  };

  const handleBackToResults = () => {
    setView("searchResults");
    setSelectedAnime(null);
  }

  const handleDownloadClick = (episodeSessionId: string, episodeTitle: string, episodeNumber: string) => {
    setSelectedEpisode({ sessionId: episodeSessionId, title: episodeTitle, number: episodeNumber });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEpisode(null);
  };

  // --- Render Functions for Different Views ---

  const renderHome = () => (
    <>
      <main className="hidden md:block min-h-screen bg-black text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-full lg:w-1/2 h-1/3 lg:h-full">
          <Image
            src="/character1.png"
            alt="Anime character"
            fill
            className="object-cover object-left opacity-60 lg:opacity-100"
            priority
          />
        </div>
        <div className="relative z-10 min-h-screen flex flex-col justify-between sm:p-6 lg:p-12">
          <div className="flex-1 flex flex-col gap-4 sm:gap-7 justify-center lg:justify-start lg:mt-18 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-7xl font-bold leading-tight mb-4 sm:mb-8 text-center lg:text-left bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent [text-shadow:0_0_8px_rgba(255,255,255,0.2)]">
              Your Gateway to
              <br />
              Unlimited Animes..
            </h1>
            <div className="w-full mb-6 sm:mb-8 px-2 sm:px-0">
              <SearchInput onSearch={handleSearch} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mb-4 sm:mb-0">
            <div className="space-y-2 sm:space-y-4 p-3 sm:p-0 bg-black/50 rounded-lg sm:bg-transparent">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-2xl">🔥</span>
                <h3 className="text-lg sm:text-xl font-semibold">Trending</h3>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm text-center sm:text-left">
                Naruto • One Piece • Jujutsu Kaisen
              </p>
            </div>
            <div className="space-y-2 sm:space-y-4 p-3 sm:p-0 bg-black/50 rounded-lg sm:bg-transparent">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-2xl">⚡</span>
                <h3 className="text-lg sm:text-xl font-semibold">Fast</h3>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm text-center sm:text-left">
                Low latency search + CDN caching
              </p>
            </div>
            <div className="space-y-2 sm:space-y-4 p-3 sm:p-0 bg-black/50 rounded-lg sm:bg-transparent">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-2xl">❌</span>
                <h3 className="text-lg sm:text-xl font-semibold">Safe</h3>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm text-center sm:text-left">
                No shady trackers or bloat
              </p>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </main>
      {/* Ensure the onSearch prop is passed to the MobileHomePage component */}
      <MobileHomePage onSearch={handleSearch} />
    </>
  );

  const renderSearchResults = () => (
    <div className="container mx-auto ">
      <button onClick={handleBackToHome} className="text-white mb-4 hover:underline">
        &larr; Back to Home
      </button>
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        Search Results for "{searchQuery}"
      </h2>
      {isLoading ? (
        <p className="text-white text-center">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {searchResults.map((anime) => (
            <AnimeCard key={anime.session} anime={anime} onClick={() => handleAnimeSelect(anime)} />
          ))}
        </div>
      )}
    </div>
  );

  const renderEpisodeList = () => (
    <div className="container mx-auto ">
      <button onClick={handleBackToResults} className="text-white mb-4 hover:underline">
        &larr; Back to Results
      </button>
      {selectedAnime && (
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-200 mb-2">{selectedAnime.title}</h1>
            {selectedAnime.synopsis && <p className="text-gray-300 max-w-3xl mx-auto">{selectedAnime.synopsis}</p>}
          </div>
          <EpisodeList
            sessionId={selectedAnime.session}
            onDownloadClick={handleDownloadClick}
          />
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white ">
      {view === "home" && renderHome()}
      {view === "searchResults" && renderSearchResults()}
      {view === "episodeList" && renderEpisodeList()}

      <DownloadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        episodeTitle={selectedEpisode?.title || ""}
        episodeNumber={selectedEpisode?.number || ""}
        downloadLinks={modalDownloadLinks}
        isLoading={isModalLoading}
        isError={isModalError}
      />
    </div>
  );
}