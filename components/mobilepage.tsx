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
            image: "/solelevelling.png",
        },
        {
            title: "Jujutsu Kaisen",
            image: "/anime.png",
        },
        {
            title: "Attack on Titan",
            image: "/attack.png",
        },
        {
            title: "One Piece",
            image: "/onepiece.png",
        },
        {
            title: "Naruto Shippuden",
            image: "/kaiju.png",
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
                image: "ep1.png",
                isPremium: true,
            },
            {
                title: "(Dub) Dekin no Mogura: The Earthbound Mole (English Dub)",
                episode: "5",
                type: "Sub | Dub",
                time: "2:00am",
                image: "ep2.png",
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
                image: "ep4.png",
                isPremium: false,
            },
        ],
    };


    return (
        <main className="md:hidden min-h-screen bg-[#0D0D0D] text-white p-4">
            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={32}
                        height={32}
                    />
                    <h1 className="text-xl font-bold">animepaheX</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Image
                        src="/placeholder-user.jpg"
                        alt="User"
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
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
                                <Card className="bg-transparent border-0">
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
                        src="/featured.png"
                        alt="featured"
                        width={1200}     // set a base intrinsic width
                        height={600}     // set a base intrinsic height
                        className="w-full h-auto object-cover rounded-xl"
                        priority
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
                        <h3 className="text-md font-semibold text-gray-300 my-3">{day}</h3>
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
                                        <h4 className="text-sm font-medium text-white line-clamp-2">{anime.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                            {anime.isPremium && <Crown size={14} className="text-yellow-500" />}
                                            <span>Episode {anime.episode}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{anime.type}</p>
                                    </div>
                                    <div className="text-sm text-cyan-400 font-semibold flex-shrink-0">
                                        {anime.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <button className="w-full mt-6 bg-[#1A1A1A] text-white text-sm font-semibold py-2.5 rounded-md">
                    SHOW MORE
                </button>
            </section>
        </main>
    );
}

export default MobileHomePage;