"use client"
import { SearchInput } from "@/components/search-input"
import Image from "next/image"

// Define an interface for the component's props
interface MobileHomePageProps {
    onSearch: (query: string) => void;
}

function MobileHomePage({ onSearch }: MobileHomePageProps) {
    return (
        <main className=" md:hidden min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
            <div className="relative z-10 h-[78vh] flex flex-col p-4">
                {/* Hero Section - Search Focused */}
                <div className="flex-1 flex flex-col items-center text-center px-2 mt-16">
                    {/* Title and Image Row */}
                    <div className="flex flex-row justify-between items-center w-full max-w-4xl mb-8">
                        {/* Title on the left */}
                        <div className="text-left">
                            <h1 className="text-2xl font-bold mb-3">
                                Download any Anime
                            </h1>
                            <p className="text-gray-400 text-xs max-w-xs leading-relaxed">
                                Fast, safe, and unlimited anime downloads at your fingertips
                            </p>
                        </div>

                        {/* Image on the right */}
                        <div className="">
                            <Image src="/character1.png" alt="banner" width={300} height={300} />
                            <div className="absolute inset-0 bg-black/40 pointer-events-none" />
                        </div>
                    </div>

                    {/* Featured Search Bar - Centered below */}
                    <div className="w-full max-w-2xl mb-9">
                        <div className="relative">
                            {/* Pass the onSearch prop down to the SearchInput component */}
                            <SearchInput onSearch={onSearch} />
                        </div>
                        <p className="text-xs text-gray-500 mt-4">Try: "Naruto", "One Piece", "Attack on Titan"</p>
                    </div>
                </div>


                {/* Bottom Stats */}
                <div className="text-center py-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500">
                        <span className="text-white font-semibold">50K+</span> Anime Series •
                        <span className="text-white font-semibold"> 1M+</span> Episodes Available
                    </p>
                </div>
            </div>


        </main>
    )
}

export default MobileHomePage;
