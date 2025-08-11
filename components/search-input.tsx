"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function SearchInput() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-md items-center space-x-2">
      <Input
        type="text"
        placeholder="Search anime..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 border-2 border-white transition-all hover:shadow-[0_0_8px_2px_rgba(255,255,255,0.3)] hover:border-white/90"
      />
      <Button
        className="bg-white text-black transition-all hover:bg-white/90 hover:shadow-[0_0_8px_2px_rgba(255,255,255,0.3)]"
        type="submit"
        size="icon"
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  )
}