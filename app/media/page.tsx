"use client";

import { useState, useEffect } from "react";
import { Play, Search, Mic, Video, Bookmark, BookmarkCheck, Clock, Folder, Star, Filter, TrendingUp, Sparkles, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/auth-context";

type TabType = 'podcasts' | 'videos';

interface MediaItem {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
    duration: number;
    category: string;
    is_featured?: boolean;
    created_at: string;
    author?: string;
}

const CATEGORIES = [
    { id: 'all', label: 'All', icon: '📚' },
    { id: 'sermons', label: 'Sermons', icon: '📖' },
    { id: 'teachings', label: 'Teachings', icon: '🎓' },
    { id: 'worship', label: 'Worship', icon: '🎵' },
    { id: 'testimonies', label: 'Testimonies', icon: '❤️' },
    { id: 'youth', label: 'Youth', icon: '👥' },
];

export default function MediaPage() {
    const [activeTab, setActiveTab] = useState<TabType>('podcasts');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showAllCategories, setShowAllCategories] = useState(false);

    // Data fetching state
    const [podcasts, setPodcasts] = useState<MediaItem[]>([]);
    const [videos, setVideos] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    // Filter functions
    const filterByCategory = (items: any[]) => {
        if (selectedCategory === 'all') return items;
        return items.filter(item =>
            item.category?.toLowerCase().includes(selectedCategory.toLowerCase())
        );
    };

    const filterBySearch = (items: any[]) => {
        if (!searchQuery.trim()) return items;
        return items.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        return `${Math.floor(diffInDays / 30)} months ago`;
    };

    const toggleBookmark = async (id: string, title: string, contentType: 'episode' | 'video' = 'episode') => {
        if (!user) {
            showToastMessage('Please sign in to save content');
            return;
        }

        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            showToastMessage('Failed to connect to database');
            return;
        }

        const isBookmarked = bookmarkedItems.has(id);

        try {
            if (isBookmarked) {
                // Remove bookmark
                const { error } = await supabase
                    .from('bookmarks')
                    .delete()
                    .eq('userid', user.id)
                    .eq('content_id', id)
                    .eq('content_type', contentType);

                if (error) throw error;

                setBookmarkedItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
                showToastMessage('Removed from library');
            } else {
                // Add bookmark
                const { error } = await supabase
                    .from('bookmarks')
                    .insert({
                        userid: user.id,
                        content_id: id,
                        content_type: contentType,
                    });

                if (error) throw error;

                setBookmarkedItems(prev => {
                    const newSet = new Set(prev);
                    newSet.add(id);
                    return newSet;
                });
                showToastMessage('Saved to your library');
            }
        } catch (err: any) {
            console.error('Error toggling bookmark:', err);
            showToastMessage('Failed to update bookmark');
        }
    };

    const showToastMessage = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // Fetch episodes and videos from Supabase
    useEffect(() => {
        const fetchMedia = async () => {
            setLoading(true);
            setError(null);
            const supabase = getSupabaseBrowserClient();

            if (!supabase) {
                setError("Failed to connect to database");
                setLoading(false);
                return;
            }

            try {
                // Fetch episodes
                const { data: episodesData, error: episodesError } = await supabase
                    .from('episodes')
                    .select('id, title, description, thumbnailurl, duration, category, ispublished, created_at')
                    .eq('ispublished', true)
                    .order('created_at', { ascending: false });

                if (episodesError) throw episodesError;

                // Fetch videos
                const { data: videosData, error: videosError } = await supabase
                    .from('videos')
                    .select('id, title, description, thumbnailurl, duration, category, ispublished, created_at')
                    .eq('ispublished', true)
                    .order('created_at', { ascending: false });

                if (videosError) throw videosError;

                // Map episodes to MediaItem format
                const mappedEpisodes: MediaItem[] = (episodesData || []).map((episode: any) => ({
                    id: episode.id,
                    title: episode.title,
                    description: episode.description || '',
                    thumbnail_url: episode.thumbnailurl,
                    duration: episode.duration || 0,
                    category: episode.category || 'Uncategorized',
                    is_featured: false, // Can be determined by playcount or other logic
                    created_at: episode.created_at || episode.publishedat || new Date().toISOString(),
                }));

                // Map videos to MediaItem format
                const mappedVideos: MediaItem[] = (videosData || []).map((video: any) => ({
                    id: video.id,
                    title: video.title,
                    description: video.description || '',
                    thumbnail_url: video.thumbnailurl,
                    duration: video.duration || 0,
                    category: video.category || 'Uncategorized',
                    is_featured: false, // Can be determined by viewcount or other logic
                    created_at: video.created_at || video.publishedat || new Date().toISOString(),
                }));

                setPodcasts(mappedEpisodes);
                setVideos(mappedVideos);
            } catch (err: any) {
                console.error('Error fetching media:', err);
                setError(err.message || 'Failed to load media content');
            } finally {
                setLoading(false);
            }
        };

        fetchMedia();
    }, []);

    // Load user bookmarks
    useEffect(() => {
        const loadBookmarks = async () => {
            if (!user) return;

            const supabase = getSupabaseBrowserClient();
            if (!supabase) return;

            try {
                const { data, error } = await supabase
                    .from('bookmarks')
                    .select('content_id, content_type')
                    .eq('userid', user.id);

                if (error) throw error;

                const bookmarkSet = new Set<string>();
                (data || []).forEach((bookmark: any) => {
                    bookmarkSet.add(bookmark.content_id);
                });
                setBookmarkedItems(bookmarkSet);
            } catch (err) {
                console.error('Error loading bookmarks:', err);
            }
        };

        loadBookmarks();
    }, [user]);

    const filteredPodcasts = filterBySearch(filterByCategory(podcasts));
    const filteredVideos = filterBySearch(filterByCategory(videos));
    const featuredContent = activeTab === 'podcasts'
        ? filteredPodcasts.find(p => p.is_featured) || filteredPodcasts[0]
        : filteredVideos.find(v => v.is_featured) || filteredVideos[0];
    const recentContent = activeTab === 'podcasts' ? filteredPodcasts.slice(0, 4) : filteredVideos.slice(0, 4);
    const allContent = activeTab === 'podcasts' ? filteredPodcasts : filteredVideos;

    // Calculate visible categories
    const visibleCategories = showAllCategories ? CATEGORIES : CATEGORIES.slice(0, 4);
    const hasMoreCategories = CATEGORIES.length > 4;

    return (
        <main className="min-h-screen bg-background pt-20">

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-top-5 duration-300">
                    <div className="bg-secondary text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10">
                        <BookmarkCheck className="w-5 h-5" />
                        <span className="font-semibold">{toastMessage}</span>
                    </div>
                </div>
            )}

            {/* Hero Section with Integrated Search & Tabs */}
            <section className="relative bg-gradient-to-br from-[#203E3F] via-[#2A4A4B] to-[#203E3F] overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">
                                Media Library
                            </h1>
                            <p className="text-white/70 text-lg">Discover inspiring content, anytime, anywhere</p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="text"
                                placeholder="Search podcasts, videos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:bg-white/15 backdrop-blur-xl transition-all"
                            />
                        </div>
                    </div>

                    {/* Enhanced Tab Switcher */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="inline-flex bg-black/20 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10">
                            <button
                                onClick={() => setActiveTab('podcasts')}
                                className={`relative flex items-center gap-2.5 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'podcasts'
                                        ? 'bg-white text-[#203E3F] shadow-xl'
                                        : 'text-white/60 hover:text-white'
                                    }`}
                            >
                                <Mic className="w-4 h-4" />
                                <span>Podcasts</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'podcasts'
                                        ? 'bg-[#203E3F]/10 text-[#203E3F]'
                                        : 'bg-white/10 text-white/60'
                                    }`}>
                                    {podcasts.length}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('videos')}
                                className={`relative flex items-center gap-2.5 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'videos'
                                        ? 'bg-white text-[#203E3F] shadow-xl'
                                        : 'text-white/60 hover:text-white'
                                    }`}
                            >
                                <Video className="w-4 h-4" />
                                <span>Videos</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'videos'
                                        ? 'bg-[#203E3F]/10 text-[#203E3F]'
                                        : 'bg-white/10 text-white/60'
                                    }`}>
                                    {videos.length}
                                </span>
                            </button>
                        </div>

                        {/* Category Pills */}
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 flex-wrap">
                            {visibleCategories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#203E3F] ${selectedCategory === category.id
                                            ? 'bg-white text-[#203E3F] shadow-lg'
                                            : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'
                                        }`}
                                >
                                    <span className="text-base">{category.icon}</span>
                                    <span>{category.label}</span>
                                </button>
                            ))}
                            {hasMoreCategories && !showAllCategories && (
                                <button
                                    onClick={() => setShowAllCategories(true)}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap bg-white/10 text-white/70 hover:bg-white/20 border border-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#203E3F]"
                                >
                                    <span>+{CATEGORIES.length - 4} more</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content - Improved Layout */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto mb-4" />
                                <p className="text-muted-foreground">Loading media content...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="mb-8 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-destructive" />
                                <div>
                                    <p className="font-semibold text-destructive">Error loading content</p>
                                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search Results Count */}
                    {searchQuery && (
                        <div className="mb-6 px-4 py-3 bg-secondary/5 border border-secondary/20 rounded-xl">
                            <p className="text-sm text-foreground">
                                <span className="font-bold">{allContent.length}</span> {allContent.length === 1 ? 'result' : 'results'} for "{searchQuery}"
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="ml-3 text-secondary hover:underline font-semibold focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded"
                                >
                                    Clear search
                                </button>
                            </p>
                        </div>
                    )}

                    {/* Featured Content - Compact Hero */}
                    {!loading && !error && featuredContent && !searchQuery && (
                        <div className="mb-12 animate-in fade-in duration-500">
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles className="w-5 h-5 text-secondary" />
                                <h2 className="text-2xl font-bold text-foreground">Featured {activeTab === 'podcasts' ? 'Episode' : 'Video'}</h2>
                                <span className="text-sm text-muted-foreground">• Hand-picked by our team</span>
                            </div>
                            <div className="relative group cursor-pointer">
                                <div className="grid md:grid-cols-2 gap-8 bg-gradient-to-br from-secondary/5 to-accent/5 border border-border rounded-3xl p-8 hover:shadow-2xl transition-all duration-300">
                                    {/* Left: Thumbnail */}
                                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted shadow-xl">
                                        {featuredContent.thumbnail_url ? (
                                            <Image
                                                src={featuredContent.thumbnail_url}
                                                alt={featuredContent.title}
                                                fill
                                                className="object-cover transition-transform group-hover:scale-105"
                                                unoptimized={featuredContent.thumbnail_url.includes('unsplash')}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-20 h-20 rounded-full bg-secondary/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                                                <Play className="w-9 h-9 text-white fill-white ml-1" />
                                            </div>
                                        </div>
                                        <div className="absolute top-3 left-3 px-3 py-1.5 bg-secondary rounded-xl flex items-center gap-1.5 shadow-lg">
                                            <Star className="w-3.5 h-3.5 text-white fill-white" />
                                            <span className="text-white text-xs font-bold">Featured</span>
                                        </div>
                                    </div>

                                    {/* Right: Details */}
                                    <div className="flex flex-col justify-center">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary rounded-lg text-sm font-bold mb-4 self-start">
                                            {activeTab === 'podcasts' ? <Mic className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                                            <span>{activeTab === 'podcasts' ? 'PODCAST' : 'VIDEO'}</span>
                                        </div>
                                        <h3 className="text-3xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-secondary transition-colors">
                                            {featuredContent.title}
                                        </h3>
                                        {'author' in featuredContent && featuredContent.author && (
                                            <p className="text-lg text-muted-foreground mb-4">{featuredContent.author}</p>
                                        )}
                                        {featuredContent.description && (
                                            <p className="text-muted-foreground mb-6 line-clamp-2">{featuredContent.description}</p>
                                        )}
                                        <div className="flex items-center gap-6 mb-6">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-sm font-medium">{formatDuration(featuredContent.duration)}</span>
                                            </div>
                                            {featuredContent.category && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Folder className="w-4 h-4" />
                                                    <span className="text-sm font-medium">{featuredContent.category}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                className="bg-secondary text-white hover:bg-secondary/90 rounded-xl px-6 shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 group"
                                                title="Play in media player"
                                            >
                                                <Play className="w-4 h-4 mr-2 fill-white group-hover:scale-110 transition-transform" />
                                                Play Now
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="rounded-xl px-6 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                                                onClick={() => toggleBookmark(featuredContent.id, featuredContent.title, activeTab === 'podcasts' ? 'episode' : 'video')}
                                            >
                                                {bookmarkedItems.has(featuredContent.id) ? (
                                                    <BookmarkCheck className="w-4 h-4 mr-2 text-secondary" />
                                                ) : (
                                                    <Bookmark className="w-4 h-4 mr-2" />
                                                )}
                                                {bookmarkedItems.has(featuredContent.id) ? 'Saved' : 'Save'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trending/Recent Section */}
                    {!loading && !error && recentContent.length > 0 && !searchQuery && (
                        <div className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-5 h-5 text-secondary" />
                                    <h2 className="text-2xl font-bold text-foreground">
                                        Trending {activeTab === 'podcasts' ? 'Episodes' : 'Videos'}
                                    </h2>
                                    <span className="text-sm text-muted-foreground">• Most played this week</span>
                                </div>
                                <button className="flex items-center gap-2 text-secondary font-semibold hover:gap-3 transition-all group">
                                    <span>View All</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {recentContent.map((item) => (
                                    <div key={item.id} className="group cursor-pointer">
                                        <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 bg-gradient-to-br from-muted to-muted/50 shadow-md hover:shadow-xl transition-all">
                                            {item.thumbnail_url ? (
                                                <Image
                                                    src={item.thumbnail_url}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover transition-transform group-hover:scale-110"
                                                    unoptimized={item.thumbnail_url.includes('unsplash')}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center scale-90 group-hover:scale-100 transition-transform shadow-xl">
                                                    <Play className="w-6 h-6 text-[#203E3F] fill-[#203E3F] ml-0.5" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-xs font-bold text-white z-10">
                                                {formatDuration(item.duration)}
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-foreground group-hover:text-secondary transition-colors line-clamp-2 mb-1.5 text-sm leading-snug">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                            {'author' in item ? item.author : item.category}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Content Grid - Modern Cards */}
                    {!loading && !error && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold text-foreground">
                                        {searchQuery ? 'Search Results' : `All ${activeTab === 'podcasts' ? 'Episodes' : 'Videos'}`}
                                    </h2>
                                    <span className="text-sm text-muted-foreground">• {allContent.length} {allContent.length === 1 ? 'item' : 'items'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                                        title="Additional filtering options"
                                    >
                                        <Filter className="w-4 h-4 mr-2" />
                                        More Filters
                                    </Button>
                                </div>
                            </div>

                            {allContent.length === 0 ? (
                                <div className="text-center py-20 bg-card/50 rounded-3xl border border-border">
                                    <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                                        {searchQuery ? (
                                            <Search className="w-10 h-10 text-muted-foreground" />
                                        ) : activeTab === 'podcasts' ? (
                                            <Mic className="w-10 h-10 text-muted-foreground" />
                                        ) : (
                                            <Video className="w-10 h-10 text-muted-foreground" />
                                        )}
                                    </div>
                                    <h4 className="text-xl font-bold text-foreground mb-2">
                                        {searchQuery
                                            ? `No results for "${searchQuery}"`
                                            : `No ${activeTab === 'podcasts' ? 'podcasts' : 'videos'} found`
                                        }
                                    </h4>
                                    <p className="text-muted-foreground mb-6">
                                        {searchQuery
                                            ? 'Try a different search term or browse by category'
                                            : selectedCategory === 'all'
                                                ? 'Check back soon for new content'
                                                : `No ${selectedCategory} content available yet`
                                        }
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                        {searchQuery && (
                                            <Button
                                                onClick={() => setSearchQuery('')}
                                                variant="outline"
                                                className="rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                                            >
                                                Clear Search
                                            </Button>
                                        )}
                                        {selectedCategory !== 'all' && !searchQuery && (
                                            <Button
                                                onClick={() => setSelectedCategory('all')}
                                                variant="outline"
                                                className="rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                                            >
                                                View All Categories
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className={activeTab === 'videos' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                                    {activeTab === 'podcasts' ? (
                                        // Podcast List Cards
                                        allContent.map((podcast) => (
                                            <div key={podcast.id} className="group cursor-pointer bg-card hover:bg-card/80 border border-border hover:border-secondary/30 rounded-2xl p-4 transition-all hover:shadow-lg">
                                                <div className="flex gap-4">
                                                    <div className="relative w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-muted to-muted/50 shadow-md">
                                                        {podcast.thumbnail_url ? (
                                                            <Image
                                                                src={podcast.thumbnail_url}
                                                                alt={podcast.title}
                                                                fill
                                                                className="object-cover transition-transform group-hover:scale-110"
                                                                unoptimized={podcast.thumbnail_url.includes('unsplash')}
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 flex items-center justify-center transition-all">
                                                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                                                                    <Play className="w-5 h-5 text-[#203E3F] fill-[#203E3F] ml-0.5" />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {podcast.is_featured && (
                                                            <div className="absolute top-2 right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center shadow-lg z-10">
                                                                <Star className="w-3.5 h-3.5 text-white fill-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <h4 className="font-bold text-foreground group-hover:text-secondary transition-colors line-clamp-2 mb-1.5 text-base">
                                                            {podcast.title}
                                                        </h4>
                                                        {'author' in podcast && podcast.author && (
                                                            <p className="text-sm text-muted-foreground mb-2">{podcast.author}</p>
                                                        )}
                                                        <div className="flex items-center gap-3 text-xs">
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/10 text-secondary rounded-lg font-semibold">
                                                                <Clock className="w-3 h-3" />
                                                                {formatDuration(podcast.duration)}
                                                            </div>
                                                            <span className="text-muted-foreground">{formatTimeAgo(podcast.created_at)}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleBookmark(podcast.id, podcast.title, 'episode');
                                                        }}
                                                        className="self-center p-2.5 hover:bg-secondary/10 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                                                        title={bookmarkedItems.has(podcast.id) ? 'Remove from library' : 'Save to library'}
                                                    >
                                                        {bookmarkedItems.has(podcast.id) ? (
                                                            <BookmarkCheck className="w-5 h-5 text-secondary fill-secondary" />
                                                        ) : (
                                                            <Bookmark className="w-5 h-5 text-muted-foreground" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        // Video Grid Cards
                                        allContent.map((video) => (
                                            <div key={video.id} className="group cursor-pointer">
                                                <div className="bg-card border border-border hover:border-secondary/30 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                                                    <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50">
                                                        {video.thumbnail_url ? (
                                                            <Image
                                                                src={video.thumbnail_url}
                                                                alt={video.title}
                                                                fill
                                                                className="object-cover transition-transform group-hover:scale-105"
                                                                unoptimized={video.thumbnail_url.includes('unsplash')}
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                                        )}
                                                        <div className="absolute inset-0 flex items-center justify-center z-10">
                                                            <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all shadow-xl">
                                                                <Play className="w-7 h-7 text-[#203E3F] fill-[#203E3F] ml-0.5" />
                                                            </div>
                                                        </div>
                                                        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-lg text-xs font-bold text-white z-10">
                                                            {formatDuration(video.duration)}
                                                        </div>
                                                        {video.is_featured && (
                                                            <div className="absolute top-3 left-3 px-2.5 py-1.5 bg-secondary rounded-xl flex items-center gap-1.5 shadow-lg z-10">
                                                                <Star className="w-3 h-3 text-white fill-white" />
                                                                <span className="text-white text-xs font-bold">Featured</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4">
                                                        <div className="flex items-start justify-between gap-3 mb-2">
                                                            <h4 className="font-bold text-foreground group-hover:text-secondary transition-colors line-clamp-2 text-sm leading-snug flex-1">
                                                                {video.title}
                                                            </h4>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleBookmark(video.id, video.title, 'video');
                                                                }}
                                                                className="p-1.5 hover:bg-muted rounded-lg transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                                                                title={bookmarkedItems.has(video.id) ? 'Remove from library' : 'Save to library'}
                                                            >
                                                                {bookmarkedItems.has(video.id) ? (
                                                                    <BookmarkCheck className="w-4 h-4 text-secondary fill-secondary" />
                                                                ) : (
                                                                    <Bookmark className="w-4 h-4 text-muted-foreground" />
                                                                )}
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs">
                                                            {video.category && (
                                                                <span className="text-secondary font-semibold">{video.category}</span>
                                                            )}
                                                            <span className="text-muted-foreground">• {formatTimeAgo(video.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
