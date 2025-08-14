"use client"
import { SearchInput } from "@/components/search-input"
import Image from "next/image"
import MobileHomePage from "@/components/mobilepage"

export default function HomePage() {
  return (
    <>
    <main className=" hidden md:block min-h-screen bg-black text-white relative overflow-hidden">
      {/* Hero Character Background - Now visible on mobile */}
      <div className="absolute right-0 top-0 w-full lg:w-1/2 h-1/3 lg:h-full">
        <Image
          src="/character1.png"
          alt="Anime character"
          fill
          className="object-cover object-left opacity-60 lg:opacity-100"
          priority
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-12">
        {/* Main Content - Centered on mobile */}
        <div className="flex-1 flex flex-col gap-4 sm:gap-7 justify-center lg:justify-start lg:mt-18 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-7xl font-bold leading-tight mb-4 sm:mb-8 text-center lg:text-left bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent [text-shadow:0_0_8px_rgba(255,255,255,0.2)]">
            Your Gateway to
            <br />
            Unlimited Animes..
          </h1>

          {/* Search Bar - Full width on mobile */}
          <div className="w-full mb-6 sm:mb-8 px-2 sm:px-0">
            <SearchInput />
          </div>
        </div>

        {/* Bottom Features - Stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mb-4 sm:mb-0">
          {/* Trending */}
          <div className="space-y-2 sm:space-y-4 p-3 sm:p-0 bg-black/50 rounded-lg sm:bg-transparent">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-2xl">🔥</span>
              <h3 className="text-lg sm:text-xl font-semibold">Trending</h3>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm text-center sm:text-left">
              Naruto • One Piece • Jujutsu Kaisen
            </p>
          </div>

          {/* Fast */}
          <div className="space-y-2 sm:space-y-4 p-3 sm:p-0 bg-black/50 rounded-lg sm:bg-transparent">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-2xl">⚡</span>
              <h3 className="text-lg sm:text-xl font-semibold">Fast</h3>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm text-center sm:text-left">
              Low latency search + CDN caching
            </p>
          </div>

          {/* Safe */}
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
      <MobileHomePage />
    </>
  )
}