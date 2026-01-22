"use client";

import { useState, useEffect } from "react";
import { Play, Search, Mic, Video, Bookmark, BookmarkCheck, Clock, Folder, Star, Loader2, AlertCircle } from "lucide-react";
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
                    is_featured: false,
                    created_at: episode.created_at || new Date().toISOString(),
                }));

                // Map videos to MediaItem format
                const mappedVideos: MediaItem[] = (videosData || []).map((video: any) => ({
                    id: video.id,
                    title: video.title,
                    description: video.description || '',
                    thumbnail_url: video.thumbnailurl,
                    duration: video.duration || 0,
                    category: video.category || 'Uncategorized',
                    is_featured: false,
                    created_at: video.created_at || new Date().toISOString(),
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

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#203E3F] to-background pt-24">
            
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-top-5 duration-300">
                    <div className="bg-secondary text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10">
                        <BookmarkCheck className="w-5 h-5" />
                        <span className="font-semibold">{toastMessage}</span>
                    </div>
                </div>
            )}

            {/* Header with Title and Search */}
            <section className="bg-transparent py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-5xl font-bold text-white">Media</h1>
                        <div className="relative w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                            <input
                                type="text"
                                placeholder="Search media..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-secondary/50 backdrop-blur-md"
                            />
                        </div>
                    </div>

                    {/* Modern Tab Switcher */}
                    <div className="flex justify-center">
                        <div className="inline-flex bg-white/5 backdrop-blur-md rounded-2xl p-1 gap-1 border border-white/10 shadow-xl">
                            <button
                                onClick={() => setActiveTab('podcasts')}
                                className={`flex items-center gap-3 px-12 py-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                                    activeTab === 'podcasts'
                                        ? 'bg-secondary text-white shadow-lg shadow-secondary/20 scale-[1.02]'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Mic className="w-5 h-5" />
                                <span>Podcasts</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    activeTab === 'podcasts' 
                                        ? 'bg-white/20 text-white' 
                                        : 'bg-white/10 text-white/50'
                                }`}>
                                    {podcasts.length}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('videos')}
                                className={`flex items-center gap-3 px-12 py-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                                    activeTab === 'videos'
                                        ? 'bg-secondary text-white shadow-lg shadow-secondary/20 scale-[1.02]'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Video className="w-5 h-5" />
                                <span>Videos</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    activeTab === 'videos' 
                                        ? 'bg-white/20 text-white' 
                                        : 'bg-white/10 text-white/50'
                                }`}>
                                    {videos.length}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Section */}
            <section className="py-12 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto mb-4" />
                                <p className="text-muted-foreground">Loading media...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="mb-8 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-destructive" />
                                <div>
                                    <p className="font-semibold text-destructive">Error loading media</p>
                                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Featured Hero - Same structure, different content */}
                    {!loading && !error && featuredContent && (
                        <div className="mb-12 animate-in fade-in duration-500">
                            <div className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl group cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-24 h-24 rounded-full bg-secondary/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                                        <Play className="w-10 h-10 text-white fill-white ml-1" />
                                    </div>
                                </div>
                                <div className="absolute bottom-8 left-8 right-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="px-3 py-1.5 rounded-full bg-secondary/90 backdrop-blur-sm flex items-center gap-2">
                                            {activeTab === 'podcasts' ? <Mic className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                                            <span className="text-white text-xs font-bold uppercase tracking-wider">
                                                Featured {activeTab === 'podcasts' ? 'Episode' : 'Video'}
                                            </span>
                                        </div>
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    </div>
                                    <h2 className="font-serif text-4xl font-bold text-white mb-3">
                                        {featuredContent.title}
                                    </h2>
                                    {'author' in featuredContent && (
                                        <p className="text-white/80 text-lg mb-4">{featuredContent.author}</p>
                                    )}
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-white/70">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm">{formatDuration(featuredContent.duration)}</span>
                                        </div>
                                        {featuredContent.category && (
                                            <div className="flex items-center gap-2 text-white/70">
                                                <Folder className="w-4 h-4" />
                                                <span className="text-sm">{featuredContent.category}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Category Filter Chips */}
                    <div className="flex gap-3 overflow-x-auto pb-3 mb-8 scrollbar-hide">
                        {CATEGORIES.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                                    selectedCategory === category.id
                                        ? 'bg-secondary text-white shadow-md scale-105'
                                        : 'bg-card text-foreground border border-border hover:bg-secondary/10'
                                }`}
                            >
                                <span>{category.icon}</span>
                                <span>{category.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Recent Content - Horizontal Scroll */}
                    {!loading && !error && recentContent.length > 0 && (
                        <div className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-foreground">
                                    Recent {activeTab === 'podcasts' ? 'Episodes' : 'Videos'}
                                </h3>
                                <button className="text-secondary font-semibold hover:underline">
                                    See All →
                                </button>
                            </div>
                            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                                {recentContent.map((item) => (
                                    <div key={item.id} className="flex-shrink-0 w-72 group cursor-pointer">
                                        <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 bg-muted">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-xs font-bold text-white">
                                                {formatDuration(item.duration)}
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-foreground group-hover:text-secondary transition-colors line-clamp-2 mb-1">
                                            {item.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {'author' in item ? item.author : item.category}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Content List - Same structure for both tabs */}
                    {!loading && !error && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-foreground">
                                    All {activeTab === 'podcasts' ? 'Episodes' : 'Videos'}
                                </h3>
                                <span className="text-muted-foreground">{allContent.length} items</span>
                            </div>

                            <div className="space-y-4">
                                {allContent.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                                        {activeTab === 'podcasts' ? <Mic className="w-10 h-10 text-muted-foreground" /> : <Video className="w-10 h-10 text-muted-foreground" />}
                                    </div>
                                    <h4 className="text-xl font-bold text-foreground mb-2">
                                        No {activeTab === 'podcasts' ? 'podcasts' : 'videos'} found
                                    </h4>
                                    <p className="text-muted-foreground">
                                        {searchQuery ? 'Try a different search term' : selectedCategory === 'all' ? 'Check back soon' : 'No content in this category'}
                                    </p>
                                </div>
                            ) : activeTab === 'podcasts' ? (
                                // Podcast Cards
                                allContent.map((podcast) => (
                                    <div key={podcast.id} className="flex gap-4 bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all group cursor-pointer">
                                        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <Play className="w-6 h-6 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            {podcast.is_featured && (
                                                <div className="absolute top-1 right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                                                    <Star className="w-3 h-3 text-white fill-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-foreground group-hover:text-secondary transition-colors line-clamp-2 mb-1">
                                                {podcast.title}
                                            </h4>
                                            {'author' in podcast && podcast.author && (
                                                <p className="text-sm text-muted-foreground mb-2">{podcast.author}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs">
                                                <div className="flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary rounded-lg font-semibold">
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
                                            className="self-center p-2 hover:bg-muted rounded-lg transition-colors"
                                        >
                                            {bookmarkedItems.has(podcast.id) ? (
                                                <BookmarkCheck className="w-5 h-5 text-secondary fill-secondary" />
                                            ) : (
                                                <Bookmark className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                // Video Cards
                                allContent.map((video) => (
                                    <div key={video.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all group cursor-pointer">
                                        <div className="relative aspect-video bg-muted">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                                                    <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-xs font-bold text-white">
                                                {formatDuration(video.duration)}
                                            </div>
                                            {video.is_featured && (
                                                <div className="absolute top-3 left-3 px-2 py-1 bg-secondary rounded-lg flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-white fill-white" />
                                                    <span className="text-white text-xs font-bold">Featured</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-foreground group-hover:text-secondary transition-colors line-clamp-2 mb-2">
                                                    {video.title}
                                                </h4>
                                                <div className="flex items-center gap-3 text-sm">
                                                    {video.category && (
                                                        <span className="text-secondary font-semibold">{video.category}</span>
                                                    )}
                                                    <span className="text-muted-foreground">{formatTimeAgo(video.created_at)}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleBookmark(video.id, video.title, 'video');
                                                }}
                                                className="p-2 hover:bg-muted rounded-lg transition-colors ml-2"
                                            >
                                                {bookmarkedItems.has(video.id) ? (
                                                    <BookmarkCheck className="w-5 h-5 text-secondary fill-secondary" />
                                                ) : (
                                                    <Bookmark className="w-5 h-5 text-muted-foreground" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
