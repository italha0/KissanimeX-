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
                        src="/logo.webp"
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

            {/* Trending Now Section */}
            <section className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Trending Now</h2>
                <Carousel
                    // 2. Add the plugins prop
                    plugins={[
                        Autoplay({
                            delay: 2000, // Set the delay to 2 seconds
                        }),
                    ]}
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2">
                        {trendingAnime.map((anime, index) => (
                            <CarouselItem key={index} className="basis-1/3 pl-2">
                                <Card className="bg-transparent border-0 py-0">
                                    <CardContent className="p-0">
                                        <Image
                                            src={anime.image}
                                            alt={anime.title}
                                            width={150}
                                            height={225}
                                            className="rounded-md w-full object-cover"
                                        />
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </section>
            {/* featured section */}
            <section>
                <h2 className="text-lg font-semibold mb-4">Featured</h2>
                <div className="w-full">
                    <Image
                        src="/featured.webp"
                        alt="featured"
                        width={1200}     // set a base intrinsic width
                        height={600}     // set a base intrinsic height
                        className="w-full h-auto object-cover rounded-xl"
                        priority
                        fetchPriority="high" 
                    />
                </div>
            </section>
            {/* New Episodes Section - Updated */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">New Episodes</h2>
                    <button className="text-gray-400 text-2xl">&gt;</button>
                </div>

                {Object.entries(latestEpisodes).map(([day, episodes]) => (
                    <div key={day}>
                        <h3 className="text-md font-semibold text-gray-900 my-3">{day}</h3>
                        <div className="flex flex-col gap-4">
                            {episodes.map((anime, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="w-32 flex-shrink-0">
                                        <img
                                            src={anime.image}
                                            alt={anime.title}
                                            width={128}
                                            height={72}
                                            className="rounded-md w-full object-cover aspect-video"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-sm font-medium text-black line-clamp-2">{anime.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                            {anime.isPremium && <Crown size={14} className="text-yellow-500" />}
                                            <span>Episode {anime.episode}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{anime.type}</p>
                                    </div>
                                    <div className="text-sm text-black font-semibold flex-shrink-0">
                                        {anime.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </section>
        </main>
    );
}

export default MobileHomePage;