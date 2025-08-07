import Link from "next/link"
import { SearchInput } from "@/components/search-input"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-purple-200 text-purple-800 px-4 py-2 rounded-full text-sm flex items-center gap-2">
        <span>Animepahe CLI Released!</span>
        <Link
          href="https://github.com/animepahe/cli"
          target="_blank"
          rel="noopener noreferrer"
          className="underline flex items-center gap-1"
        >
          latest version
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-external-link"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" x2="21" y1="14" y2="3" />
          </svg>
        </Link>
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
