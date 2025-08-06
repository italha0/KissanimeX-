"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Download, Home, Moon, Sun } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { SearchPreview } from "./search-preview"
import { useTheme } from "next-themes"
// Removed MobileSearch import

export function Navigation() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AV</span>
            </div>
            <span className="font-bold text-xl">AnimeVault</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            {/* Removed Browse link */}
            <Link
              href="/downloads"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/downloads" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              <Download className="h-4 w-4" />
              <span>Downloads</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Centralized SearchPreview */}
          <SearchPreview className="w-64" />

          {/* Removed MobileSearch */}

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
