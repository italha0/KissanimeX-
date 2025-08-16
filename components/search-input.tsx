"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

// Define the props for the component, including the onSearch callback
interface SearchInputProps {
  onSearch: (query: string) => void;
}

export function SearchInput({ onSearch }: SearchInputProps) {
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Call the onSearch function passed from the parent component
    if (query.trim()) {
      onSearch(query.trim())
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