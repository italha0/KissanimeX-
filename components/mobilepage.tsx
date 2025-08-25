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
import { Download } from "lucide-react";
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

    const latestEpisodes = [
        {
            title: "Mushoku Tensei: Jobless Reincarnation",
            episode: "21",
            image: "/episode.webp",
        },
        {
            title: "That Time I Got Reincarnated as a Slime",
            episode: "45",
            image: "/episode.webp",
        },
        {
            title: "Black Clover",
            episode: "171",
            image: "/episode.webp",
        },
        {
            title: "My Hero Academia",
            episode: "114",
            image: "/episode.webp",
        },
        {
            title: "One Punch Man",
            episode: "25",
            image: "/episode.webp",
        },
        {
            title: "Demon Slayer",
            episode: "26",
            image: "/episode.webp",
        }
    ];

    return (
        <main className="md:hidden min-h-screen bg-[#0D0D0D] text-white p-4">
            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Image
                        src="/placeholder-logo.png"
                        alt="Logo"
                        width={32}
                        height={32}
                    />
                    <h1 className="text-xl font-bold">KissanimeX</h1>
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

            {/* Latest Episodes Section */}
            <section>
                <h2 className="text-lg font-semibold mb-4">Latest Episodes</h2>
                <div className="grid grid-cols-2 gap-4">
                    {latestEpisodes.map((anime, index) => (
                        <Card key={index} className="bg-[#1A1A1A] border-0 rounded-lg overflow-hidden">
                            <CardContent className="p-0 relative">
                                <Image
                                    src={anime.image}
                                    alt={anime.title}
                                    width={200}
                                    height={112}
                                    className="w-full object-cover"
                                />
                                <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                    Ep {anime.episode}
                                </div>
                                <div className="p-3">
                                    <h3 className="text-sm font-medium truncate mb-2">{anime.title}</h3>
                                    <button className="w-full bg-[#6C5CE7] text-white text-sm font-semibold py-2 rounded-md flex items-center justify-center gap-2">
                                        <Download size={16} />
                                        <span>Download</span>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </main>
    );
}

export default MobileHomePage;