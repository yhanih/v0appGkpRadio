import { Play, Search, Filter, PlayCircle, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const videoCategories = ["All", "Sermons", "Worship", "Youth", "Documentaries"];

const featuredVideos = [
    {
        title: "The Power of Forgiveness",
        series: "Kingdom Foundations",
        duration: "45:20",
        views: "1.2K",
        category: "Sermons",
        color: "bg-secondary"
    },
    {
        title: "Live Sunday Worship: June 15",
        series: "Sunday Service",
        duration: "1:15:00",
        views: "3.5K",
        category: "Worship",
        color: "bg-[#7F5A53]"
    },
    {
        title: "Youth Summit 2025 Highlights",
        series: "Events",
        duration: "12:45",
        views: "850",
        category: "Youth",
        color: "bg-[#2DA072]"
    },
    {
        title: "History of Our Ministry",
        series: "Documentary",
        duration: "28:10",
        views: "2.1K",
        category: "Documentaries",
        color: "bg-[#AC9258]"
    },
    {
        title: "Morning Prayer & Meditation",
        series: "Daily Bread",
        duration: "15:00",
        views: "4.2K",
        category: "Sermons",
        color: "bg-secondary"
    },
    {
        title: "Understanding Grace",
        series: "Kingdom Foundations",
        duration: "38:45",
        views: "1.8K",
        category: "Sermons",
        color: "bg-secondary"
    }
];

export default function VideoPage() {
    return (
        <main className="min-h-screen bg-[#203E3F]">
            {/* Search & Filter Header (Sticky below Nav) */}
            <section className="sticky top-0 z-30 bg-[#203E3F]/90 backdrop-blur-md border-b border-white/10 pt-28 pb-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search sermons, series, or keywords..."
                                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50"
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                            {videoCategories.map((cat) => (
                                <button
                                    key={cat}
                                    className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${cat === "All" ? "bg-secondary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                            <Button variant="ghost" size="sm" className="gap-2 ml-2">
                                <Filter className="w-4 h-4" /> Filter
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hero Video Spotlight */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-secondary/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                    </div>
                    <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-white text-xs font-bold uppercase tracking-wider mb-4">
                                <PlayCircle className="w-3 h-3" /> Featured Now
                            </span>
                            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4">
                                Walk in Faith: New Sermon Series 2025
                            </h2>
                            <p className="text-white/80 text-lg hidden md:block">
                                Start your year with purpose. Join Rev. Sarah Johnson in this groundbreaking
                                multi-part series on establishing Kingdom habits in your daily life.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button size="lg" className="bg-white text-black hover:bg-white/90 rounded-xl px-8">
                                Watch Now
                            </Button>
                            <Button size="lg" variant="outline" className="text-white border-white/40 hover:bg-white/10 rounded-xl px-4">
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Video Grid */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-bold">Trending Content</h3>
                    <Button variant="link" className="text-secondary font-bold">View All Series &rarr;</Button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredVideos.map((video, i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className="aspect-video rounded-3xl overflow-hidden relative mb-4 bg-muted border border-border">
                                <div className={`absolute inset-0 ${video.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PlayCircle className="w-12 h-12 text-white" />
                                </div>
                                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white">
                                    {video.duration}
                                </div>
                            </div>
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h4 className="font-bold text-lg leading-tight mb-2 group-hover:text-secondary transition-colors line-clamp-2">
                                        {video.title}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                        <span className="text-secondary">{video.series}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {video.views} views</span>
                                    </div>
                                </div>
                                <Button size="sm" variant="ghost" className="rounded-full w-8 h-8 p-0">
                                    <Play className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Series Spotlight */}
            <section className="py-24 bg-muted/30 border-t border-border mt-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="font-serif text-3xl font-bold mb-6">Never Miss a Sunday Service</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
                        Subscribe to our YouTube channel or follow our video hub to get
                        notifications the moment we go live or upload a new teaching.
                    </p>
                    <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-10 rounded-2xl h-14 text-lg">
                        Browse All Series
                    </Button>
                </div>
            </section>
        </main>
    );
}
