"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"
import { SearchInput } from "@/components/search-input"

export default function HomePage() {
  return (
    <main className="bg-[url('/bg-main.svg')] bg-no-repeat bg-center bg-cover min-h-screen flex items-start justify-center p-6">
      <div className="w-full max-w-5xl mx-auto mt-20">
        {/* Glass card hero */}
        <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10 shadow-sm flex flex-col items-center gap-6">
          <h1 className="text-xl sm:text-6xl font-extrabold text-center leading-tight bg-gradient-to-r from-[#887c7c] to-[#1E293B] bg-clip-text text-transparent">
            Your Gateway to Unlimited <br /> Animes..
          </h1>

          <p className="hidden md:block text-center text-gray-500 max-w-2xl">
            Search, find, and download episodes — fast, clean, and no-nonsense.
          </p>

          <div className="w-full flex justify-center items-center">
          
              <SearchInput />
          </div>

          <p className="text-xs text-gray-500">Tip: try searching by show name, raw title.</p>
        </section>

        {/* Optional: small stats / quick links row below hero */}
        <div className="hidden md:grid mt-8  grid-cols-1 sm:grid-cols-3 gap-4 absolute bottom-20 right-0 left-0 ">
          <div className="p-4 rounded-xl bg-white/3 border border-white/6 text-center">
            <div className="text-2xl font-semibold">Trending 🔥</div>
            <div className="text-sm text-gray-400">Naruto • One Piece • Jujutsu Kaisen</div>
          </div>
          <div className="p-4 rounded-xl bg-white/3 border border-white/6 text-center">
            <div className="text-2xl font-semibold">Fast ⚡</div>
            <div className="text-sm text-gray-400">Low latency search + CDN caching</div>
          </div>
          <div className="p-4 rounded-xl bg-white/3 border border-white/6 text-center">
            <div className="text-2xl font-semibold">Safe ⚔</div>
            <div className="text-sm text-gray-400">No shady trackers or bloat</div>
          </div>
        </div>
      </div>
    </main>
  )
}
