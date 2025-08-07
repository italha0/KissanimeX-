import Link from "next/link"
import { SearchInput } from "@/components/search-input"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-purple-200 text-purple-800 px-4 py-2 rounded-full text-sm flex items-center gap-2">
        
       
      </div>
      <div className="flex flex-col items-center gap-6 mt-20">
        <h1 className="text-3xl font-bold text-gray-800">Anime Downloader</h1>
        <SearchInput />
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          Home
        </Link>
      </div>
    </div>
  )
}
