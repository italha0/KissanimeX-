// components/desktoppage.tsx
"use client";
import * as React from "react";
import Image from "next/image";
import { SearchInput } from "@/components/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define an interface for the component's props
interface DesktopHomePageProps {
    onSearch: (query: string) => void;
}

function DesktopHomePage({ onSearch }: DesktopHomePageProps) {
    // Reusing the same mock data from the mobile component for consistency
    const trendingAnime = [
        { title: "Solo Leveling", image: "/solelevelling.png" },
        { title: "Jujutsu Kaisen", image: "/anime.png" },
        { title: "Attack on Titan", image: "/attack.png" },
        { title: "One Piece", image: "/onepiece.png" },
        { title: "Naruto Shippuden", image: "/kaiju.png" },
    ];

    const latestEpisodes = {
        Today: [
            {
                title: "(Dub) Jobless Reincarantion Season 2 part 2",
                episode: "17",
                type: "Sub | Dub",
                image: "ep1.png",
                isPremium: true,
            },
            {
                title: "(Dub) Dekin no Mogura: The Earthbound Mole (English Dub)",
                episode: "5",
                type: "Sub | Dub",
                image: "ep2.png",
                isPremium: true,
            },
        ],
        Yesterday: [
            {
                title: "The Rising of The Shield Hero ",
                episode: "8",
                type: "Subtitled",
                image: "ep3.webp",
                isPremium: false,
            },
            {
                title: "One Piece: Egghead Island (1123-Current)",
                episode: "1141",
                type: "Subtitled",
                image: "ep4.png",
                isPremium: false,
            },
        ],
    };

    return (
        <main className="hidden md:block min-h-screen bg-white text-black p-8">
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Image src="/logo.png" alt="Logo" width={40} height={40} priority />
                    <h1 className="text-2xl font-bold">animepaheX</h1>
                </div>
                <div className="w-full max-w-[600px]">
                    <SearchInput onSearch={onSearch} />
                </div>
            </header>

          
        </main>
    );
}

export default DesktopHomePage;