"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
    Users,
    Search,
    MessageCircle,
    Heart,
    Hand,
    Star,
    Music,
    Sparkles,
    GraduationCap,
    Palette,
    Activity,
    Wallet,
    HeartPulse,
    Baby,
    Filter,
    Plus,
    Share2,
    Bookmark,
    MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewPostModal } from "./new-post-modal";

export const COMMUNITY_CATEGORIES = [
    { id: "all", label: "All", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "Prayers", label: "Prayers", icon: Hand, color: "text-secondary", bg: "bg-secondary/10" },
    { id: "Testimonies", label: "Testimonies", icon: Star, color: "text-[#AC9258]", bg: "bg-[#AC9258]/10" },
    { id: "Praise", label: "Praise", icon: Music, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { id: "Encourage", label: "Encourage", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
    { id: "Born Again", label: "Born Again", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "Youth", label: "Youth", icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "Hobbies", label: "Hobbies", icon: Palette, color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: "Health", label: "Health", icon: Activity, color: "text-pink-500", bg: "bg-pink-500/10" },
    { id: "Finances", label: "Finances", icon: Wallet, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { id: "Family", label: "Family", icon: HeartPulse, color: "text-red-500", bg: "bg-red-500/10" },
    { id: "Children", label: "Children", icon: Baby, color: "text-orange-500", bg: "bg-orange-500/10" },
];

const MOCK_THREADS = [
    {
        id: "1",
        title: "The Power of Forgiveness",
        content: "I want to share how God helped me forgive someone who hurt me deeply. It wasn't easy, but the peace I feel now is worth it.",
        author: "Grace@Nashville",
        category: "Testimonies",
        likes: 45,
        prayers: 12,
        comments: 8,
        time: "2h ago",
        is_anonymous: false
    },
    {
        id: "2",
        title: "Prayer for Wisdom",
        content: "Please pray for me as I make a major career decision this week. I want to be in the center of God's will.",
        author: "Anonymous",
        category: "Prayers",
        likes: 12,
        prayers: 56,
        comments: 4,
        time: "4h ago",
        is_anonymous: true
    },
    {
        id: "3",
        title: "Grateful for Sunday Service",
        content: "The message on Sunday really hit home. God is indeed our provider and sustainer!",
        author: "Marcus@Dallas",
        category: "Praise",
        likes: 89,
        prayers: 5,
        comments: 15,
        time: "6h ago",
        is_anonymous: false
    },
    {
        id: "4",
        title: "New Youth Bible Study",
        content: "So excited for our new series starting this Friday! If you're 18-25, come join us as we explore the Parables.",
        author: "Sarah@Youth",
        category: "Youth",
        likes: 34,
        prayers: 8,
        comments: 12,
        time: "8h ago",
        is_anonymous: false
    },
    {
        id: "5",
        title: "Financial Breakthrough",
        content: "Giving thanks for a surprise provision this week! God really knows our needs before we even ask.",
        author: "James@Houston",
        category: "Finances",
        likes: 67,
        prayers: 22,
        comments: 5,
        time: "10h ago",
        is_anonymous: false
    },
    {
        id: "6",
        title: "Health Update: Healing!",
        content: "Reporting back after last week's prayer request. The doctors were amazed at the recovery. Thank you all for the prayers!",
        author: "Mary@Miami",
        category: "Health",
        likes: 120,
        prayers: 88,
        comments: 32,
        time: "12h ago",
        is_anonymous: false
    },
    {
        id: "7",
        title: "Family Restoration",
        content: "God is mending what was broken in my family. Step by step, we are finding our way back to love and unity.",
        author: "Anonymous",
        category: "Family",
        likes: 56,
        prayers: 45,
        comments: 9,
        time: "1d ago",
        is_anonymous: true
    },
    {
        id: "8",
        title: "Starting a New Business",
        content: "Taking a leap of faith to start a kingdom-focused project. Please pray for clarity and divine connections.",
        author: "David@Seattle",
        category: "Hobbies",
        likes: 23,
        prayers: 15,
        comments: 3,
        time: "1d ago",
        is_anonymous: false
    },
    {
        id: "9",
        title: "Praise for Sunday School",
        content: "The kids had such a great time learning about Noah's Ark today. Grateful for our dedicated teachers!",
        author: "Linda@Atlanta",
        category: "Children",
        likes: 42,
        prayers: 4,
        comments: 6,
        time: "1d ago",
        is_anonymous: false
    }
];

export function CommunityFeed() {
    const searchParams = useSearchParams();
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showNewPostModal, setShowNewPostModal] = useState(false);
    const [visibleCount, setVisibleCount] = useState(3);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const category = searchParams.get("category");
        if (category && COMMUNITY_CATEGORIES.some(c => c.id === category)) {
            setActiveCategory(category);
            setVisibleCount(3); // Reset when category changes
        }
    }, [searchParams]);

    const filteredThreads = useMemo(() => {
        return MOCK_THREADS.filter(t => {
            const matchesCategory = activeCategory === "all" || t.category === activeCategory;
            const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.content.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery]);

    const displayThreads = useMemo(() => {
        return filteredThreads.slice(0, visibleCount);
    }, [filteredThreads, visibleCount]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoadingMore && visibleCount < filteredThreads.length) {
                    setIsLoadingMore(true);
                    // Simulate network delay
                    setTimeout(() => {
                        setVisibleCount(prev => prev + 3);
                        setIsLoadingMore(false);
                    }, 800);
                }
            },
            { threshold: 1.0 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [isLoadingMore, visibleCount, filteredThreads.length]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
            {/* Search & Actions Bar */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search discussions..."
                        className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-lg shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Button variant="outline" className="gap-2 rounded-xl h-12 px-6">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                    <Button
                        onClick={() => setShowNewPostModal(true)}
                        className="flex-1 md:flex-none bg-primary text-white hover:bg-primary/90 h-12 px-8 rounded-xl gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                        <Plus className="w-5 h-5" /> Global Post
                    </Button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {COMMUNITY_CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeCategory === cat.id
                            ? "bg-secondary text-white border-secondary shadow-md scale-105"
                            : "bg-card text-muted-foreground border-border hover:bg-muted"
                            }`}
                    >
                        <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? "text-white" : cat.color}`} />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Feed Content */}
            <div className="grid lg:grid-cols-12 gap-12 mt-8">
                {/* Main Feed */}
                <div className="lg:col-span-8 space-y-6">
                    {filteredThreads.length === 0 ? (
                        <div className="text-center py-24 bg-card border border-dashed border-border rounded-3xl">
                            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                                <Search className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No results found</h3>
                            <p className="text-muted-foreground">Try adjusting your search or category filters.</p>
                        </div>
                    ) : (
                        displayThreads.map((thread) => (
                            <div key={thread.id} className="bg-card border border-border rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all group animate-fade-in text-pretty">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                                            {thread.author[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground leading-none">{thread.author}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">{thread.time} • {thread.category}</p>
                                        </div>
                                    </div>
                                    <button className="text-muted-foreground hover:text-foreground">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>

                                <h3 className="font-serif text-2xl font-bold mb-4 group-hover:text-secondary transition-colors">
                                    {thread.title}
                                </h3>
                                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                                    {thread.content}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-border/50">
                                    <div className="flex items-center gap-6">
                                        <button className="flex items-center gap-2 text-muted-foreground hover:text-rose-500 transition-colors group/stat">
                                            <Heart className="w-5 h-5 group-hover/stat:fill-rose-500" />
                                            <span className="font-bold">{thread.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors group/stat">
                                            <Hand className="w-5 h-5 group-hover/stat:fill-secondary" />
                                            <span className="font-bold">{thread.prayers} <span className="hidden sm:inline">prayed</span></span>
                                        </button>
                                        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group/stat">
                                            <MessageCircle className="w-5 h-5 group-hover/stat:fill-primary" />
                                            <span className="font-bold">{thread.comments}</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground transition-colors">
                                            <Bookmark className="w-4 h-4" />
                                        </button>
                                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground transition-colors">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Sentinel for Infinite Scroll */}
                    <div ref={loadMoreRef} className="py-8 flex justify-center">
                        {isLoadingMore && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-8 h-8 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                                <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading more fellowship...</p>
                            </div>
                        )}
                        {!isLoadingMore && visibleCount >= filteredThreads.length && filteredThreads.length > 0 && (
                            <p className="text-muted-foreground text-sm font-medium">You've reached the end of the feed.</p>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-card border border-border rounded-[2rem] p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-secondary" />
                            Community Stats
                        </h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Total Members</span>
                                <span className="font-bold">2,540</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Prayers Reached</span>
                                <span className="font-bold">45.2K</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Live Discussions</span>
                                <span className="font-bold">12</span>
                            </div>
                        </div>
                        <Button variant="ghost" className="w-full mt-8 text-secondary font-bold hover:bg-secondary/5 rounded-xl">
                            View All Guidelines
                        </Button>
                    </div>

                    <div className="bg-gradient-to-br from-secondary/5 to-primary/5 border border-secondary/10 rounded-[2rem] p-8 text-center">
                        <h3 className="font-bold text-lg mb-4">Need Prayer?</h3>
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                            Our global prayer team is standing by. Post a prayer request and have thousands lift you up.
                        </p>
                        <Button
                            onClick={() => setShowNewPostModal(true)}
                            className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-xl h-12 shadow-md"
                        >
                            Submit Request
                        </Button>
                    </div>
                </div>
            </div>

            <NewPostModal
                isOpen={showNewPostModal}
                onClose={() => setShowNewPostModal(false)}
            />
        </div>
    );
}
