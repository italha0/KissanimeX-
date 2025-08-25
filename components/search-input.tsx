"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

// Define the props for the component, including the onSearch callback
interface SearchInputProps {
  onSearch: (query: string) => void;
}

// An array of anime names to loop through in the placeholder
const animePlaceholders = [
  "Naruto",
  "One Piece",
  "Jujutsu Kaisen",
  "Attack on Titan",
  "Demon Slayer",
  "My Hero Academia",
]

export function SearchInput({ onSearch }: SearchInputProps) {
  const [query, setQuery] = useState("")
  // State to track the current index of the placeholder text
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  // This effect sets up an interval to change the placeholder every 2 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update the index, looping back to 0 when it reaches the end of the array
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % animePlaceholders.length)
    }, 5000) // Change placeholder every 2000ms (2 seconds)

    // A crucial cleanup function to stop the interval when the component is removed
    return () => clearInterval(intervalId)
  }, []) // The empty dependency array [] ensures this effect runs only once on mount

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  // Construct the dynamic placeholder string
  const dynamicPlaceholder = `Search ${animePlaceholders[placeholderIndex]}...`

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-md items-center space-x-2">
      <Input
        type="text"
        placeholder={dynamicPlaceholder} // Use the dynamic placeholder here
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