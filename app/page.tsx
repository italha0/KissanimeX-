"use client"
import { SearchInput } from "@/components/search-input"
import Image from "next/image"
import ShinyText from "gsap"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Hero Character Background */}
      <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block">
        <Image
          src="/character1.png"
          alt="Anime character"
          fill
          className="object-cover object-left"
          priority
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col justify-between p-6 lg:p-12">
        {/* Main Content - Left Side */}
        <div className="flex-1 flex flex-col gap-7 justify-center max-w-2xl">
          

          <h1 className="text-4xl lg:text-7xl font-bold leading-tight mb-8 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent [text-shadow:0_0_8px_rgba(255,255,255,0.2)]">
            Your Gateway to
            <br />
            Unlimited Animes..
          </h1>


          {/* Search Bar */}
          <div className="mb-8">
            <SearchInput />
          </div>

       
        </div>

        {/* Bottom Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          {/* Trending */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <h3 className="text-xl font-semibold">Trending</h3>
            </div>
            <p className="text-gray-300 text-sm">Naruto • One Piece • Jujutsu Kaisen</p>
          </div>

          {/* Fast */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <h3 className="text-xl font-semibold">Fast</h3>
            </div>
            <p className="text-gray-300 text-sm">Low latency search + CDN caching</p>
          </div>

          {/* Safe */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">❌</span>
              <h3 className="text-xl font-semibold">Safe</h3>
            </div>
            <p className="text-gray-300 text-sm">No shady trackers or bloat</p>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
    </main>
  )
}
