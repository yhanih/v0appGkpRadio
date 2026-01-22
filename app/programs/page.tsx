import { Mic, Headphones, ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Program Schedule | Daily Podcasts & Teachings | GKP Radio",
    description: "View our daily broadcast schedule. From morning devotionals to evening worship, find the spiritual nourishment you need on GKP Radio.",
    openGraph: {
        title: "GKP Radio Program Schedule",
        description: "Stay connected with our daily faith-based broadcasts and podcasts.",
        images: ["/logo.png"],
    },
};

export default function ProgramsPage() {
    return (
        <main className="min-h-screen bg-primary">
            {/* Hero Section */}
            <section className="bg-primary pt-32 pb-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(172,146,88,0.15),transparent)]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-6">
                        <Mic className="w-3 h-3" />
                        Discover Truth
                    </div>
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-primary-foreground mb-6 leading-[1.1]">
                        Our Programs &<br />Daily Schedule
                    </h1>
                    <p className="text-xl text-primary-foreground/70 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Deep dive into the Word of God with our curated selection of teachings,
                        heartfelt worship hours, and life-changing family discussions.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 px-8 py-6 rounded-2xl gap-2 text-lg">
                            <PlayCircle className="w-6 h-6" />
                            Latest Episode
                        </Button>
                        <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 rounded-2xl text-lg">
                            Explore All Categories
                        </Button>
                    </div>
                </div>
            </section>


            {/* Host Spotlight / Featured Series */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1">
                            <span className="text-sm font-bold text-secondary uppercase tracking-[0.2em] mb-4 block">
                                Featured Series
                            </span>
                            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-6">
                                Sheffield Family Life Center with Pastor George Weslake
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                Join Pastor George Weslake every afternoon for powerful teachings on
                                spiritual growth and biblical foundations. This broadcast from the
                                Sheffield Family Life Center provides essential keys for living a
                                Christ-centered life in today&apos;s world.
                            </p>
                            <div className="flex flex-col gap-4">
                                {[
                                    "Understanding Biblical Foundations",
                                    "Growing in Spiritual Maturity",
                                    "Kingdom Principles for Daily Living"
                                ].map((topic, i) => (
                                    <div key={i} className="flex items-center gap-3 text-foreground font-medium">
                                        <div className="w-2 h-2 rounded-full bg-secondary" />
                                        {topic}
                                    </div>
                                ))}
                            </div>
                            <Button asChild className="mt-10 bg-primary text-white hover:bg-primary/90 gap-2 px-8 py-6 rounded-xl">
                                <Link href="#">
                                    View Full Bio <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </div>
                        <div className="flex-1 relative">
                            <div className="aspect-[4/5] bg-secondary/10 rounded-3xl overflow-hidden relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Mic className="w-32 h-32 text-secondary/20" />
                                </div>
                            </div>
                            {/* Floating Stat */}
                            <div className="absolute -bottom-8 -left-8 bg-card border border-border p-6 rounded-2xl shadow-xl hidden lg:block">
                                <div className="text-3xl font-bold text-foreground">500+</div>
                                <div className="text-sm text-muted-foreground">Episodes Produced</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Platform Links CTA */}
            <section className="py-20 bg-secondary/5 border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center justify-center gap-3">
                        <Headphones className="text-secondary" />
                        Take us with you on any platform
                    </h2>
                    <div className="flex flex-wrap justify-center gap-6">
                        {["Apple Podcasts", "Spotify", "Google Podcasts", "Amazon Music"].map((platform) => (
                            <a
                                key={platform}
                                href="#"
                                className="px-6 py-4 rounded-xl border border-border bg-card hover:bg-secondary/10 hover:border-secondary/50 transition-all font-semibold text-foreground"
                            >
                                {platform}
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
