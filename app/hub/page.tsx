"use client";

import Link from "next/link";
import { LayoutGrid, Bookmark, Clock, Star, Settings, ExternalLink, ShoppingBag, Heart, Hand, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function HubPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Dashboard data state
    const [bookmarkCount, setBookmarkCount] = useState(0);
    const [recentBookmarks, setRecentBookmarks] = useState<any[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            // Redirect to login with hub as redirect destination using Next.js router
            router.push("/?auth=login&redirect=/hub");
        }
    }, [user, loading, router]);

    // Fetch user dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) {
                setDataLoading(false);
                return;
            }

            setDataLoading(true);
            const supabase = getSupabaseBrowserClient();

            if (!supabase) {
                setDataLoading(false);
                return;
            }

            try {
                // Fetch bookmarks count and recent bookmarks
                const { data: bookmarks, error: bookmarksError } = await supabase
                    .from('bookmarks')
                    .select('id, content_id, content_type, createdat')
                    .eq('userid', user.id)
                    .order('createdat', { ascending: false })
                    .limit(10);

                if (bookmarksError) throw bookmarksError;

                setBookmarkCount(bookmarks?.length || 0);
                setRecentBookmarks(bookmarks || []);

                // Fetch recommendations (recent episodes/videos)
                const [episodesResult, videosResult] = await Promise.all([
                    supabase
                        .from('episodes')
                        .select('id, title, description, category')
                        .eq('ispublished', true)
                        .order('created_at', { ascending: false })
                        .limit(3),
                    supabase
                        .from('videos')
                        .select('id, title, description, category')
                        .eq('ispublished', true)
                        .order('created_at', { ascending: false })
                        .limit(3),
                ]);

                const recommendationsList: any[] = [];

                if (episodesResult.data) {
                    episodesResult.data.forEach(ep => {
                        recommendationsList.push({
                            id: ep.id,
                            title: ep.title,
                            type: 'Sermon',
                            category: ep.category,
                        });
                    });
                }

                if (videosResult.data) {
                    videosResult.data.forEach(vid => {
                        recommendationsList.push({
                            id: vid.id,
                            title: vid.title,
                            type: 'Video',
                            category: vid.category,
                        });
                    });
                }

                setRecommendations(recommendationsList.slice(0, 3));
            } catch (err: any) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setDataLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (loading) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-secondary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-secondary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Redirecting to login...</p>
                </div>
            </main>
        );
    }
    return (
        <main className="min-h-screen bg-[#203E3F]">
            <div className="pt-24 min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Welcome Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
                        <div>
                            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">
                                Welcome{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}!
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Your central point for personal growth, community, and ministry resources.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                asChild
                                variant="outline"
                                className="gap-2 rounded-xl"
                            >
                                <Link href="/profile">
                                    <Settings className="w-4 h-4" /> Account Settings
                                </Link>
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
                                    {dataLoading ? (
                                        <div className="space-y-3 py-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    ) : recentBookmarks.length > 0 ? (
                                        <>
                                            <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                                                {recentBookmarks[0].content_type === 'episode' ? 'Episode' : 'Video'}
                                            </p>
                                            <Button variant="link" className="p-0 h-auto text-secondary font-bold">
                                                View Library &rarr;
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-muted-foreground mb-6">No recent activity</p>
                                            <Button variant="link" className="p-0 h-auto text-secondary font-bold" asChild>
                                                <Link href="/media">Browse Media &rarr;</Link>
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <div className="bg-card border border-border p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <Bookmark className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Saved</span>
                                    </div>
                                    <h3 className="font-bold text-xl mb-2">Your Favorites</h3>
                                    {dataLoading ? (
                                        <div className="space-y-3 py-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-2/3" />
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm text-muted-foreground mb-6">
                                                {bookmarkCount} {bookmarkCount === 1 ? 'Saved program' : 'Saved programs'} and articles
                                            </p>
                                            <Button variant="link" className="p-0 h-auto text-secondary font-bold" asChild>
                                                <Link href="/media">View Library &rarr;</Link>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Content Suggestions */}
                            <div className="bg-card border border-border rounded-3xl p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold flex items-center gap-3">
                                        <Star className="w-6 h-6 text-[#AC9258]" /> Recommended for You
                                    </h3>
                                </div>
                                {dataLoading ? (
                                    <div className="space-y-4 py-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <Skeleton className="w-10 h-10 rounded-lg" />
                                                <Skeleton className="h-6 flex-1" />
                                            </div>
                                        ))}
                                    </div>
                                ) : recommendations.length > 0 ? (
                                    <div className="space-y-4">
                                        {recommendations.map((item, i) => (
                                            <Link
                                                key={item.id}
                                                href={`/media`}
                                                className="flex items-center justify-between p-4 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground">
                                                        {i + 1}
                                                    </div>
                                                    <span className="font-medium text-foreground group-hover:text-secondary transition-colors">
                                                        {item.title} ({item.type})
                                                    </span>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-secondary" />
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No recommendations available yet
                                    </p>
                                )}
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
                                <Button asChild className="w-full bg-white text-secondary hover:bg-white/90 rounded-2xl py-6 gap-2 font-bold relative z-10">
                                    <Link href="/merch">
                                        <ShoppingBag className="w-5 h-5" /> Visit Store
                                    </Link>
                                </Button>
                            </div>

                            <div className="bg-card border border-border rounded-3xl p-8">
                                <h3 className="text-xl font-bold mb-6">Quick Links</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { icon: Heart, label: "Donate", color: "text-rose-500", href: "/donate" },
                                        { icon: Hand, label: "Prayers", color: "text-secondary", href: "/community?category=Prayers" },
                                        { icon: LayoutGrid, label: "Videos", color: "text-[#AC9258]", href: "/video" },
                                        { icon: ShoppingBag, label: "Orders", color: "text-primary", href: "/merch" }
                                    ].map((link, i) => (
                                        link.href ? (
                                            <Link key={i} href={link.href} className="flex flex-col items-center justify-center p-6 rounded-2xl border border-border hover:border-secondary/50 hover:bg-secondary/5 transition-all gap-3 overflow-hidden">
                                                <link.icon className={`w-6 h-6 ${link.color}`} />
                                                <span className="text-sm font-bold text-foreground">{link.label}</span>
                                            </Link>
                                        ) : (
                                            <button key={i} className="flex flex-col items-center justify-center p-6 rounded-2xl border border-border hover:border-secondary/50 hover:bg-secondary/5 transition-all gap-3 overflow-hidden">
                                                <link.icon className={`w-6 h-6 ${link.color}`} />
                                                <span className="text-sm font-bold text-foreground">{link.label}</span>
                                            </button>
                                        )
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
