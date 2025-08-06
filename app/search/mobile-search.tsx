"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SearchPreview } from "@/components/search-preview"

export function MobileSearch() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="h-auto">
        <SheetHeader>
          <SheetTitle>Search Anime</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <SearchPreview placeholder="Search for anime..." onSearch={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
