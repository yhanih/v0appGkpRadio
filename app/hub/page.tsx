import { LayoutGrid, Bookmark, Clock, Star, Settings, ExternalLink, ShoppingBag, Heart, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HubPage() {
    return (
        <main className="min-h-screen bg-[#203E3F]">
            <div className="pt-24 min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Welcome Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
                        <div>
                            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">
                                Welcome to the Hub
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Your central point for personal growth, community, and ministry resources.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="gap-2 rounded-xl">
                                <Settings className="w-4 h-4" /> Account Settings
                            </Button>
                            <Button className="bg-primary text-white hover:bg-primary/90 gap-2 rounded-xl px-6">
                                Member Sign In
                            </Button>
                        </div>
                    </div>

                    {/* Dashboard Grid */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left: Quick Stats / Progress */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="bg-card border border-border p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recent</span>
                                    </div>
                                    <h3 className="font-bold text-xl mb-2">Recently Viewed</h3>
                                    <p className="text-sm text-muted-foreground mb-6">Kingdom Principles: Lesson 14</p>
                                    <Button variant="link" className="p-0 h-auto text-secondary font-bold">Resume Teaching &rarr;</Button>
                                </div>
                                <div className="bg-card border border-border p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <Bookmark className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Saved</span>
                                    </div>
                                    <h3 className="font-bold text-xl mb-2">Your Favorites</h3>
                                    <p className="text-sm text-muted-foreground mb-6">12 Saved programs and articles</p>
                                    <Button variant="link" className="p-0 h-auto text-secondary font-bold">View Library &rarr;</Button>
                                </div>
                            </div>

                            {/* Content Suggestions */}
                            <div className="bg-card border border-border rounded-3xl p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold flex items-center gap-3">
                                        <Star className="w-6 h-6 text-[#AC9258]" /> Recommended for You
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        "Finding Peace in Uncertain Times (Sermon)",
                                        "Worship Hour: Morning Gratitude",
                                        "Small Group Study: Galatians Chapter 2"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border cursor-pointer group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground">
                                                    {i + 1}
                                                </div>
                                                <span className="font-medium text-foreground group-hover:text-secondary transition-colors">{item}</span>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-secondary" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Resources & Support */}
                        <div className="space-y-8">
                            <div className="bg-secondary text-white rounded-3xl p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
                                <h3 className="text-2xl font-bold mb-4 relative z-10">Ministry Merch</h3>
                                <p className="text-white/80 mb-8 relative z-10 text-pretty">
                                    Wear the message. Support our broadcasts with apparel and resources that matter.
                                </p>
                                <Button className="w-full bg-white text-secondary hover:bg-white/90 rounded-2xl py-6 gap-2 font-bold relative z-10">
                                    <ShoppingBag className="w-5 h-5" /> Visit Store
                                </Button>
                            </div>

                            <div className="bg-card border border-border rounded-3xl p-8">
                                <h3 className="text-xl font-bold mb-6">Quick Links</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { icon: Heart, label: "Donate", color: "text-rose-500" },
                                        { icon: Hand, label: "Prayers", color: "text-secondary" },
                                        { icon: LayoutGrid, label: "Videos", color: "text-[#AC9258]" },
                                        { icon: ShoppingBag, label: "Orders", color: "text-primary" }
                                    ].map((link, i) => (
                                        <button key={i} className="flex flex-col items-center justify-center p-6 rounded-2xl border border-border hover:border-secondary/50 hover:bg-secondary/5 transition-all gap-3 overflow-hidden">
                                            <link.icon className={`w-6 h-6 ${link.color}`} />
                                            <span className="text-sm font-bold text-foreground">{link.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 text-center">
                                <h4 className="font-bold text-lg mb-2">Need Support?</h4>
                                <p className="text-sm text-muted-foreground mb-6">Our help desk is available for technical or ministry questions.</p>
                                <Button variant="outline" className="w-full rounded-xl border-primary/20 text-primary">Contact Us</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
