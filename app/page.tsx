import Link from "next/link"
import { SearchInput } from "@/components/search-input"
import Head from "next/head"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-white p-4">
     
      <div className="flex flex-col items-center gap-6 mt-20">
        <h1 className="text-5xl font-bold text-gray-800">Anime Downloader</h1>
        <SearchInput />
       
      </div>
    </div>
  )
}
