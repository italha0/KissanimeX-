import Link from "next/link"
import { SearchInput } from "@/components/search-input"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-white p-4">
     
      <div className="flex flex-col items-center gap-6 mt-20">
        <h1 className="text-5xl font-bold text-gray-800">Anime Downloader</h1>
        <SearchInput />
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          Home
        </Link>
      </div>
    </div>
  )
}
