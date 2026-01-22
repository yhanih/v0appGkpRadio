import { ProgramsSection } from "@/components/programs-section";
import { Mic, Headphones, ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Radio Schedule | Daily Programming | GKP Radio",
    description: "View our official daily programming schedule. Stay connected with our faith-based broadcasts.",
};

export default function SchedulePage() {
    return (
        <main className="min-h-screen bg-primary">
            {/* Hero Section */}
            <section className="bg-primary pt-32 pb-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(172,146,88,0.15),transparent)]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-6">
                        <Mic className="w-3 h-3" />
                        Operational Content
                    </div>
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black text-primary-foreground mb-6 leading-[1.1]">
                        Daily Radio<br />Schedule
                    </h1>
                </div>
            </section>

            {/* Main Schedule Section */}
            <ProgramsSection />

            <div className="bg-background py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-muted-foreground mb-8">Want to listen on the go? Take us with you on any platform.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {["Apple Podcasts", "Spotify", "Google Podcasts"].map((platform) => (
                            <div key={platform} className="px-6 py-3 rounded-xl border border-border bg-card text-foreground font-semibold">
                                {platform}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
