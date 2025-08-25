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
import DesktopHomePage from "@/components/DesktopPage";
import { Button } from "@/components/ui/button";
import { ArrowLeftToLine } from 'lucide-react';

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
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        Search Results for "{searchQuery}"
      </h2>
      {isLoading ? (
        <p className="text-white text-center">Loading...</p>
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