"use client";
import * as React from "react";
import { SearchInput } from "@/components/search-input";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Download  , Crown } from "lucide-react";
import Autoplay from "embla-carousel-autoplay"; // 1. Import the autoplay plugin

// Define an interface for the component's props
interface MobileHomePageProps {
    onSearch: (query: string) => void;
}

function MobileHomePage({ onSearch }: MobileHomePageProps) {
    // Mock data for trending anime and latest episodes
    const trendingAnime = [
        {
            title: "Solo Leveling",
            image: "/solelevelling.webp",
        },
        {
            title: "Jujutsu Kaisen",
            image: "/anime.webp",
        },
        {
            title: "Attack on Titan",
            image: "/attack.webp",
        },
        {
            title: "One Piece",
            image: "/onepiece.webp",
        },
        {
            title: "Naruto Shippuden",
            image: "/kaiju.webp",
        },
    ];

    // Updated mock data for latest episodes to match the screenshot's structure
    const latestEpisodes = {
        Today: [
            {
                title: "(Dub) Jobless Reincarantion Season 2 part 2",
                episode: "17",
                type: "Sub | Dub",
                time: "2:30am",
                image: "ep1.webp",
                isPremium: true,
            },
            {
                title: "(Dub) Dekin no Mogura: The Earthbound Mole (English Dub)",
                episode: "5",
                type: "Sub | Dub",
                time: "2:00am",
                image: "ep2.webp",
                isPremium: true,
            },
        ],
        Yesterday: [
            {
                title: "The Rising of The Shield Hero ",
                episode: "8",
                type: "Subtitled",
                time: "10:00pm",
                image: "ep3.webp",
                isPremium: false,
            },
            {
                title: "One Piece: Egghead Island (1123-Current)",
                episode: "1141",
                type: "Subtitled",
                time: "9:15pm",
                image: "ep4.webp",
                isPremium: false,
            },
        ],
    };


    return (
        <main className="md:hidden min-h-screen bg-white text-black p-4">
            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={32}
                        height={32} 
                        priority  
                    />
                    <h1 className="text-xl font-bold">animepaheX</h1>
                </div>
            </header>

            <div className="mb-8">
                <SearchInput onSearch={onSearch} />
            </div>

        </main>
    );
}

export default MobileHomePage;