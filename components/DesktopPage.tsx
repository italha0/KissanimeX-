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
        <main className="hidden md:block min-h-screen bg-[#0D0D0D] text-white p-8">
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Image src="/logo.png" alt="Logo" width={40} height={40} />
                    <h1 className="text-2xl font-bold">animepaheX</h1>
                </div>
                <div className="w-full max-w-[600px]">
                    <SearchInput onSearch={onSearch} />
                </div>
                <div className="flex items-center gap-4">
                    <Image
                        src="/placeholder-user.jpg"
                        alt="User"
                        width={48}
                        height={48}
                        className="rounded-full"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Main Content) */}
                <div className="lg:col-span-2">
                    {/* Featured Section */}
                    <section className="mb-8 relative rounded-xl overflow-hidden">
                        <Image
                            src="/featured.png"
                            alt="featured"
                            width={1200}
                            height={600}
                            className="w-full h-auto object-cover"
                            priority
                        />
                       
                        <div className="absolute bottom-0 left-0 p-8">
                           <Button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg">
                                Download Now
                            </Button>
                        </div>
                    </section>

                    {/* New Episodes Section */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">New Episodes</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.values(latestEpisodes).flat().map((anime, index) => (
                                <div key={index} className="flex items-center gap-4 bg-[#1A1A1A] p-3 rounded-lg">
                                    <div className="w-40 flex-shrink-0">
                                        <img
                                            src={anime.image}
                                            alt={anime.title}
                                            className="rounded-md w-full object-cover aspect-video"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-md font-medium text-white line-clamp-2">{anime.title}</h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                            {anime.isPremium && <Crown size={16} className="text-yellow-500" />}
                                            <span>Episode {anime.episode}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column (Trending) */}
                <div className="lg:col-span-1">
                    <section className="bg-[#1A1A1A] p-6 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-6">Trending Now</h2>
                        <div className="flex flex-col gap-5">
                            {trendingAnime.map((anime, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <Image
                                        src={anime.image}
                                        alt={anime.title}
                                        width={80}
                                        height={120}
                                        className="rounded-md object-cover w-20 h-auto"
                                    />
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-semibold">{anime.title}</h3>
                                        <Button variant="outline" size="sm" className="mt-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white">
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

export default DesktopHomePage;