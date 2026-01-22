import { CommunityFeed } from "@/components/community-feed";
import { Users, Heart, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function CommunityFeedWrapper() {
    return (
        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">Loading...</div>}>
            <CommunityFeed />
        </Suspense>
    );
}

export default function CommunityPage() {
    return (
        <main className="min-h-screen bg-[#203E3F]">
            {/* Condensed Hero Section */}
            <section className="bg-[#203E3F] pt-32 pb-12 relative overflow-hidden text-white border-b border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(45,160,114,0.1),transparent)]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-4">
                                <Sparkles className="w-3 h-3" />
                                Active Fellowship
                            </div>
                            <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
                                Life is Better <span className="text-secondary">Together</span>
                            </h1>
                            <p className="text-lg text-gray-300 leading-relaxed max-w-xl">
                                Join thousands of believers sharing stories, lifting prayers, and growing in wisdom.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 shrink-0">
                            <Button asChild className="bg-secondary text-white hover:bg-secondary/90 px-6 py-5 rounded-xl gap-2 shadow-lg border-none">
                                <a href="#feed">
                                    <MessageSquare className="w-5 h-5" />
                                    Start a Discussion
                                </a>
                            </Button>
                            <Button asChild className="bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-sm px-6 py-5 rounded-xl transition-all">
                                <a href="#feed" className="font-bold">Browse categories</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Functional Community Feed */}
            <section id="feed" className="bg-background min-h-screen">
                <CommunityFeedWrapper />
            </section>

            {/* Community Groups Section */}
            <section className="py-24 bg-gradient-to-b from-background to-muted/50 border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                            Find Your Small Group
                        </h2>
                        <p className="text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
                            Small groups are the heartbeat of our community. Connect with others
                            who share your season of life or interests for deeper fellowship.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Men of Faith",
                                desc: "Strengthening one another through biblical manhood and leadership.",
                                icon: ShieldCheck,
                                color: "text-blue-500",
                                bg: "bg-blue-500/10"
                            },
                            {
                                title: "Women's Grace",
                                desc: "A safe space for women to grow in grace and sisterhood.",
                                icon: Heart,
                                color: "text-rose-500",
                                bg: "bg-rose-500/10"
                            },
                            {
                                title: "Youth Impact",
                                desc: "Empowering the next generation to live boldly for Christ.",
                                icon: Users,
                                color: "text-emerald-500",
                                bg: "bg-emerald-500/10"
                            }
                        ].map((group, i) => (
                            <div key={i} className="bg-card border border-border p-8 rounded-3xl hover:shadow-lg transition-all text-center group">
                                <div className={`w-14 h-14 ${group.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                                    <group.icon className={`w-7 h-7 ${group.color}`} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{group.title}</h3>
                                <p className="text-muted-foreground mb-6">{group.desc}</p>
                                <Button variant="link" className="text-secondary font-bold">
                                    Join Group &rarr;
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Guidelines CTA */}
            <section className="py-20 bg-background border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Community Guidelines</h4>
                            <p className="text-muted-foreground group-hover:text-secondary transition-colors">Ensuring a safe, respectful, and Christ-centered environment for all.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-white px-8 rounded-xl h-12 transition-all">
                        Read Guidelines
                    </Button>
                </div>
            </section>
        </main>
    );
}
