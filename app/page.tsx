"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SearchInput } from "@/components/search-input";
import Image from "next/image";
import {AnimeCard} from "@/components/anime-card";
import { EpisodeList } from "@/components/episode-list";
import { DownloadModal } from "@/components/download-modal";
import { searchAnimeDiscovery, getEpisodeDownloadLinks, AnimeSearchResult } from "@/lib/api";
import MobileHomePage from "@/components/mobilepage";
import DesktopHomePage from "@/components/DesktopPage";
import { Button } from "@/components/ui/button";
import { ArrowLeftToLine } from 'lucide-react';
import { CookieSetup } from "@/components/cookie-setup";

export default function HomePage() {
  const router = useRouter();

  // --- State for Page View ---
  const [view, setView] = useState("home"); // 'home', 'searchResults', or 'episodeList'
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

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
    try {
      const results = await searchAnimeDiscovery(query);
      const mapped = results.map((item: any) => ({
        ...item,
        session: item.anilistId,
        title: item.titleEnglish || item.titleRomaji || "Untitled",
      }));
      setSearchResults(mapped);
    } catch (err) {
      console.error("Search failed:", err);
    }
    setView("searchResults");
    setIsLoading(false);
  };

  const handleAnimeSelect = (anime: any) => {
    router.push(`/anime/${anime.anilistId}`);
  };

  const handleBackToHome = () => {
    setView("home");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedAnime(null);
    setIsSynopsisExpanded(false);
  };

  const handleBackToResults = () => {
    setView("searchResults");
    setSelectedAnime(null);
    setIsSynopsisExpanded(false);
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
      <DesktopHomePage onSearch={handleSearch}/>
      {/* Ensure the onSearch prop is passed to the MobileHomePage component */}
      <MobileHomePage onSearch={handleSearch} />
    </>
  );

  const renderSearchResults = () => (
    <div className="container mx-auto ">
      <Button onClick={handleBackToHome} className="bg-white text-black mb-4 mt-4 ms-4 hover:underline">
        <ArrowLeftToLine/> Back
      </Button>
      <h2 className="text-2xl font-bold mb-6 text-center text-black">
        Search Results for "{searchQuery}"
      </h2>
      {isLoading ? (
        <p className="text-black text-center">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
          {searchResults.map((anime) => (
            <AnimeCard key={anime.session} anime={anime} onClick={() => handleAnimeSelect(anime)} />
          ))}
        </div>
      )}
    </div>
  );

  const renderEpisodeList = () => (
    <div className="container mx-auto ">
      <Button onClick={handleBackToResults} className="bg-white text-black mb-4 ms-4 mt-4 hover:underline">
        <ArrowLeftToLine /> Back
      </Button>
      {selectedAnime && (
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">{selectedAnime.title}</h1>
             {selectedAnime.synopsis && (
              <div className="max-w-3xl mx-auto mt-2 px-4">
                <p
                  className={`text-gray-600 text-sm leading-relaxed transition-all duration-300 ${
                    isSynopsisExpanded ? "" : "line-clamp-3"
                  }`}
                >
                  {selectedAnime.synopsis}
                </p>
                {selectedAnime.synopsis.length > 180 && (
                  <button
                    onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-500 hover:underline mt-1 focus:outline-none"
                  >
                    {isSynopsisExpanded ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>
            )}
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
    <div className="min-h-screen bg-white text-black ">
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
      <CookieSetup />
    </div>
  );
}