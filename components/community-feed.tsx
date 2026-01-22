"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
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
    MoreVertical,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewPostModal } from "./new-post-modal";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { LoginModal } from "./auth/LoginModal";
import { ReportModal } from "./report-modal";

// Keep category IDs in sync with the Supabase seed data so filters don't hide all posts
export const COMMUNITY_CATEGORIES = [
    { id: "all", label: "All", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "Prayers", label: "Prayers", icon: Hand, color: "text-secondary", bg: "bg-secondary/10" },
    { id: "Words of Encouragement", label: "Words of Encouragement", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
    { id: "Praise & Worship", label: "Praise & Worship", icon: Music, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { id: "Sharing Hobbies", label: "Sharing Hobbies", icon: Palette, color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: "Youth Voices", label: "Youth Voices", icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "Bragging on My Child (ren)", label: "Bragging on My Child (ren)", icon: Baby, color: "text-orange-500", bg: "bg-orange-500/10" },
    { id: "To My Wife", label: "To My Wife", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
    { id: "To My Husband", label: "To My Husband", icon: Heart, color: "text-blue-500", bg: "bg-blue-500/10" },
];

// Helper function to get category label, handling any category from database
function getCategoryLabel(category: string): string {
    const categoryObj = COMMUNITY_CATEGORIES.find(c => c.id === category);
    return categoryObj?.label || category;
}

// Skeleton component
function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    );
}

// Thread skeleton component matching thread card structure
function ThreadSkeleton() {
    return (
        <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
                <Skeleton className="w-5 h-5 rounded" />
            </div>
            <Skeleton className="h-7 w-full mb-2" />
            <Skeleton className="h-7 w-3/4 mb-4" />
            <div className="space-y-2 mb-8">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-border/50">
                <div className="flex items-center gap-6">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-8" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="w-10 h-10 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

// Stats skeleton component
function StatsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-8" />
            </div>
        </div>
    );
}

interface Thread {
    id: string;
    userid: string;
    title: string;
    content: string;
    category: string;
    is_anonymous: boolean;
    createdat: string;
    updatedat: string;
    users?: {
        username: string | null;
        fullname: string | null;
        avatarurl: string | null;
    };
    prayer_count?: number;
    comment_count?: number;
    like_count?: number;
}

interface Comment {
    id: string;
    threadid: string;
    userid: string;
    parentid: string | null;
    content: string;
    isedited: boolean;
    createdat: string;
    updatedat: string;
    users?: {
        username: string | null;
        fullname: string | null;
        avatarurl: string | null;
    };
}

function formatTimeAgo(dateString: string): string {
    if (!dateString) return "recently";

    const date = new Date(dateString);
    const now = new Date();

    // Check if date is valid
    if (isNaN(date.getTime())) {
        return "recently";
    }

    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Handle future dates
    if (diffInSeconds < 0) {
        return "recently";
    }

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    // For older dates, show relative time or formatted date
    const diffInDays = Math.floor(diffInSeconds / 86400);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
    return `${Math.floor(diffInDays / 365)}y ago`;
}

export function CommunityFeed() {
    console.log("CommunityFeed component rendering");
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    console.log("User from auth:", user?.id || "not logged in", "Auth loading:", authLoading);
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showNewPostModal, setShowNewPostModal] = useState(false);

    // Database state
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [prayedThreads, setPrayedThreads] = useState<Set<string>>(new Set());
    const [prayingThreadId, setPrayingThreadId] = useState<string | null>(null);
    const [likedThreads, setLikedThreads] = useState<Set<string>>(new Set());
    const [likingThreadId, setLikingThreadId] = useState<string | null>(null);
    const [bookmarkedThreads, setBookmarkedThreads] = useState<Set<string>>(new Set());
    const [bookmarkingThreadId, setBookmarkingThreadId] = useState<string | null>(null);
    const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);
    const [commentsByThread, setCommentsByThread] = useState<Record<string, Comment[]>>({});
    const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
    const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
    const [commentErrors, setCommentErrors] = useState<Record<string, string | null>>({});
    const [stats, setStats] = useState({
        totalMembers: 0,
        totalPrayers: 0,
        activeDiscussions: 0
    });
    const [statsLoading, setStatsLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginRedirect, setLoginRedirect] = useState("/community");

    // Report modal state
    const [reportModal, setReportModal] = useState({
        isOpen: false,
        contentId: "",
        contentType: "thread" as "thread" | "comment",
        contentTitle: ""
    });

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Hybrid auto-load state
    const [visibleCount, setVisibleCount] = useState(10);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const isMountedRef = useRef(true);
    const fetchIdRef = useRef(0);

    const MAX_VISIBLE = 50; // Increased limit for real data

    // Debounced search query
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

    useEffect(() => {
        const category = searchParams.get("category");
        if (category && COMMUNITY_CATEGORIES.some(c => c.id === category)) {
            setActiveCategory(category);
            setVisibleCount(10); // Reset when category changes
        }
    }, [searchParams]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch threads from database
    const fetchThreads = async () => {
        const currentFetchId = ++fetchIdRef.current;
        const isStale = () => !isMountedRef.current || fetchIdRef.current !== currentFetchId;
        const timeoutId = setTimeout(() => {
            if (isStale()) return;
            setError("Request timed out. Please try again.");
            setLoading(false);
        }, 10000);

        console.log("fetchThreads called");
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            console.error("Supabase client is null");
            setError("Database connection unavailable");
            setLoading(false);
            clearTimeout(timeoutId);
            return;
        }

        console.log("Supabase client available, starting query...");
        try {
            setError(null);

            // First, test if we can query the table at all
            console.log("Testing basic query...");
            const testQuery = await supabase
                .from('communitythreads')
                .select('id')
                .limit(1);

            console.log("Test query result:", {
                data: testQuery.data,
                error: testQuery.error,
                count: testQuery.data?.length
            });
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/6855a037-0c28-4943-8b57-f28bdcef9a7d', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'D', location: 'web-app/components/community-feed.tsx:fetchThreads:testQuery', message: 'CommunityFeed test query executed', data: { hasData: Array.isArray(testQuery.data) && testQuery.data.length > 0, dataCount: Array.isArray(testQuery.data) ? testQuery.data.length : 0, hasError: !!testQuery.error, errorCode: (testQuery.error as any)?.code || null, errorMessage: (testQuery.error as any)?.message || null, authUserId: user?.id || null }, timestamp: Date.now() }) }).catch(() => { });
            // #endregion

            if (testQuery.error) {
                console.error("Test query failed:", testQuery.error);
                throw testQuery.error;
            }

            if (activeCategory === "Prayers") {
                console.log("Fetching special Prayer Requests from 'prayers' table...");
                let prayerQuery = supabase
                    .from('prayers')
                    .select('*, users:user_id(id, username, fullname, avatarurl)')
                    .order('created_at', { ascending: false })
                    .limit(visibleCount);

                if (debouncedSearchQuery.trim()) {
                    prayerQuery = prayerQuery.or(`title.ilike.%${debouncedSearchQuery}%,content.ilike.%${debouncedSearchQuery}%`);
                }

                const { data: prayerData, error: prayerError } = await prayerQuery;
                if (prayerError) throw prayerError;

                if (prayerData && prayerData.length > 0) {
                    const prayerIds = prayerData.map(p => p.id);
                    const { data: actionCounts } = await supabase
                        .from('prayer_actions')
                        .select('prayer_id')
                        .in('prayer_id', prayerIds);

                    const countsMap = new Map<string, number>();
                    (actionCounts || []).forEach(a => countsMap.set(a.prayer_id, (countsMap.get(a.prayer_id) || 0) + 1));

                    const mappedPrayers = prayerData.map(p => ({
                        ...p,
                        id: p.id,
                        userid: p.user_id,
                        title: p.title,
                        content: p.content,
                        category: "Prayers",
                        createdat: p.created_at,
                        prayer_count: countsMap.get(p.id) || 0,
                    }));

                    if (!isStale()) {
                        setThreads(mappedPrayers);
                        setLoading(false);
                    }
                    return;
                } else {
                    if (!isStale()) {
                        setThreads([]);
                        setLoading(false);
                    }
                    return;
                }
            }

            console.log("Starting main query with JOIN...");
            let query = supabase
                .from('communitythreads')
                .select(`
                    *,
                    users:userid (id, username, fullname, avatarurl)
                `)
                .order('createdat', { ascending: false })
                .limit(visibleCount);

            // Apply category filter
            if (activeCategory !== "all") {
                query = query.eq('category', activeCategory);
            }

            // Apply search filter
            if (debouncedSearchQuery.trim()) {
                query = query.or(`title.ilike.%${debouncedSearchQuery}%,content.ilike.%${debouncedSearchQuery}%`);
            }

            const { data, error: queryError } = await query;

            // Check if component is still mounted
            if (!isMountedRef.current) {
                return;
            }

            if (queryError) {
                // Log the full error for debugging
                console.warn("Query error details:", {
                    message: queryError.message,
                    code: queryError.code,
                    details: queryError.details,
                    hint: queryError.hint
                });

                // If JOIN fails with RLS recursion, try separate queries
                if (queryError.message?.includes('infinite recursion') ||
                    queryError.message?.includes('policy') ||
                    queryError.message?.includes('permission') ||
                    queryError.code === '42501' ||
                    queryError.code === '42P17') { // 42P17 is the error code for infinite recursion
                    console.warn("JOIN query failed due to RLS, trying separate queries:", queryError.message);

                    // Check if component is still mounted
                    if (!isMountedRef.current) {
                        return;
                    }

                    // Fallback to separate query approach
                    let fallbackQuery = supabase
                        .from('communitythreads')
                        .select('*')
                        .order('createdat', { ascending: false })
                        .limit(visibleCount);

                    if (activeCategory !== "all") {
                        fallbackQuery = fallbackQuery.eq('category', activeCategory);
                    }

                    if (debouncedSearchQuery.trim()) {
                        fallbackQuery = fallbackQuery.or(`title.ilike.%${debouncedSearchQuery}%,content.ilike.%${debouncedSearchQuery}%`);
                    }

                    const { data: fallbackData, error: fallbackError } = await fallbackQuery;

                    // Check if component is still mounted
                    if (!isMountedRef.current) {
                        return;
                    }

                    if (fallbackError) {
                        throw fallbackError;
                    }

                    if (fallbackData && fallbackData.length > 0) {
                        // Fetch users separately
                        const userIds = [...new Set(fallbackData.map(t => t.userid).filter(Boolean))];
                        let usersMap = new Map();

                        if (userIds.length > 0) {
                            // Check if component is still mounted
                            if (!isMountedRef.current) {
                                return;
                            }

                            const { data: usersData, error: usersError } = await supabase
                                .from('users')
                                .select('id, username, fullname, avatarurl')
                                .in('id', userIds);

                            // Check if component is still mounted
                            if (!isMountedRef.current) {
                                return;
                            }

                            if (!usersError && usersData) {
                                usersMap = new Map(
                                    usersData.map(u => [u.id, {
                                        username: u.username,
                                        fullname: u.fullname,
                                        avatarurl: u.avatarurl
                                    }])
                                );
                            }
                        }

                        const threadsWithUsers = fallbackData.map(thread => ({
                            ...thread,
                            users: thread.is_anonymous ? null : (usersMap.get(thread.userid) || null)
                        }));

                        const threadIds = fallbackData.map(t => t.id);

                        // Check if component is still mounted
                        if (isStale()) {
                            return;
                        }

                        await fetchThreadCounts(threadIds, threadsWithUsers, currentFetchId);
                    } else {
                        if (!isStale()) {
                            setThreads([]);
                        }
                    }
                    return;
                }
                throw queryError;
            }

            if (data && data.length > 0) {
                // Data from JOIN query - users should already be included
                // Supabase JOIN returns users as an object (not array) when using foreign key
                const threadsWithUsers = data.map((thread: any) => {
                    // Handle different possible structures from JOIN
                    let userData = null;

                    if (!thread.is_anonymous && thread.userid) {
                        // Check if users is an object (from JOIN)
                        if (thread.users && typeof thread.users === 'object' && !Array.isArray(thread.users)) {
                            userData = {
                                username: thread.users.username,
                                fullname: thread.users.fullname,
                                avatarurl: thread.users.avatarurl
                            };
                        }
                        // If it's already in the format we expect
                        else if (thread.users && thread.users.username !== undefined) {
                            userData = thread.users;
                        }
                    }

                    return {
                        ...thread,
                        users: userData
                    };
                });

                console.log("Threads with users:", threadsWithUsers.map(t => ({
                    id: t.id,
                    hasUser: !!t.users,
                    userData: t.users
                })));

                // Fetch prayer and comment counts
                const threadIds = data.map(t => t.id);
                await fetchThreadCounts(threadIds, threadsWithUsers, currentFetchId);
            } else {
                if (!isStale()) {
                    setThreads([]);
                }
            }
        } catch (err: any) {
            // Ignore if component unmounted or stale
            if (isStale()) {
                return;
            }

            // Handle AbortError (cancelled requests) - don't show error to user
            const errorName = err?.name || err?.constructor?.name;
            if (errorName === 'AbortError' || err?.message?.includes('aborted')) {
                // Silently ignore - request was cancelled (likely due to rapid navigation or unmount)
                // But ensure loading is set to false so UI doesn't hang
                if (!isStale()) {
                    setLoading(false);
                }
                return;
            }

            // Better error logging (only for meaningful errors)
            const errorMessage = err?.message;
            const errorCode = err?.code;

            // Always log errors for debugging
            console.error("Error fetching threads:", {
                message: errorMessage,
                code: errorCode,
                details: err?.details,
                hint: err?.hint,
                name: errorName,
                fullError: err,
                errorType: typeof err,
                errorKeys: err ? Object.keys(err) : []
            });

            if (!isStale()) {
                // Provide more specific error messages
                let userErrorMessage = "Failed to load threads. Please refresh the page.";

                if (errorMessage && errorMessage !== '[object Object]' && errorMessage !== '{}') {
                    userErrorMessage = errorMessage;
                } else if (errorCode === 'PGRST301' || errorCode === '42P01') {
                    userErrorMessage = "Database table not found. Please check your database setup.";
                } else if (errorCode === '42501' || errorCode === '42P17' || errorMessage?.includes('permission') || errorMessage?.includes('policy') || errorMessage?.includes('recursion')) {
                    userErrorMessage = "Permission denied. Please check your authentication and RLS policies.";
                } else if (errorCode === 'PGRST116') {
                    userErrorMessage = "No rows returned. The community feed is empty.";
                } else if (typeof err === 'string') {
                    userErrorMessage = err;
                }

                setError(userErrorMessage);
                setThreads([]);
                setLoading(false); // Set loading to false so user sees error message
            }
        } finally {
            clearTimeout(timeoutId);
            if (!isStale()) {
                setLoading(false);
            }
        }
    };

    // Fetch prayer, comment, and like counts for threads
    const fetchThreadCounts = async (threadIds: string[], threadData: Thread[], activeFetchId?: number) => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return;
        const isStale = () => !isMountedRef.current || (activeFetchId !== undefined && fetchIdRef.current !== activeFetchId);

        // Check if component is still mounted
        if (isStale()) {
            return;
        }

        try {
            // Fetch prayer counts
            const { data: prayerData } = await supabase
                .from('thread_prayers')
                .select('thread_id')
                .in('thread_id', threadIds);

            // Check if component is still mounted
            if (isStale()) {
                return;
            }

            // Fetch comment counts
            const { data: commentData } = await supabase
                .from('communitycomments')
                .select('threadid')
                .in('threadid', threadIds);

            // Check if component is still mounted
            if (isStale()) {
                return;
            }

            // Fetch like counts
            const { data: likeData } = await supabase
                .from('community_thread_likes')
                .select('thread_id')
                .in('thread_id', threadIds);

            // Count prayers, comments, and likes per thread
            const prayerCounts: Record<string, number> = {};
            const commentCounts: Record<string, number> = {};
            const likeCounts: Record<string, number> = {};

            prayerData?.forEach(p => {
                prayerCounts[p.thread_id] = (prayerCounts[p.thread_id] || 0) + 1;
            });

            commentData?.forEach(c => {
                commentCounts[c.threadid] = (commentCounts[c.threadid] || 0) + 1;
            });

            likeData?.forEach(like => {
                likeCounts[like.thread_id] = (likeCounts[like.thread_id] || 0) + 1;
            });

            // Combine data
            const threadsWithCounts: Thread[] = threadData.map(thread => ({
                ...thread,
                prayer_count: prayerCounts[thread.id] || 0,
                comment_count: commentCounts[thread.id] || 0,
                like_count: likeCounts[thread.id] || 0,
            }));

            // Check if component is still mounted before setting state
            if (!isStale()) {
                setThreads(threadsWithCounts);
            }
        } catch (err) {
            // Ignore if component unmounted
            if (isStale()) {
                return;
            }
            console.error("Error fetching counts:", err);
            // Still set threads even if counts fail (only if mounted)
            if (!isStale()) {
                setThreads(threadData.map(t => ({
                    ...t,
                    prayer_count: 0,
                    comment_count: 0,
                    like_count: t.like_count || 0,
                })));
            }
        }
    };

    // Fetch which threads user has prayed for
    const fetchUserPrayedThreads = async () => {
        if (!user) {
            setPrayedThreads(new Set());
            return;
        }

        const supabase = getSupabaseBrowserClient();
        if (!supabase) return;

        try {
            const { data: threadPrayers, error: threadError } = await supabase
                .from('thread_prayers')
                .select('thread_id')
                .eq('user_id', user.id);

            const { data: prayerActions, error: actionError } = await supabase
                .from('prayer_actions')
                .select('prayer_id')
                .eq('user_id', user.id);

            const prayedSet = new Set<string>();
            threadPrayers?.forEach(p => prayedSet.add(p.thread_id));
            prayerActions?.forEach(p => prayedSet.add(p.prayer_id));

            if (!threadError && !actionError) {
                setPrayedThreads(prayedSet);
            }
        } catch (err) {
            console.error("Error fetching user prayers:", err);
        }
    };

    // Fetch which threads user has liked
    const fetchUserLikedThreads = async () => {
        if (!user) {
            setLikedThreads(new Set());
            return;
        }

        const supabase = getSupabaseBrowserClient();
        if (!supabase) return;

        try {
            console.log("[CommunityFeed] Fetching user liked threads for user:", user.id);
            const { data, error } = await supabase
                .from('community_thread_likes')
                .select('thread_id')
                .eq('user_id', user.id);

            if (error) {
                console.error("[CommunityFeed] Error fetching liked threads:", error);
            } else if (data) {
                console.log("[CommunityFeed] User liked threads:", data.map(l => l.thread_id));
                setLikedThreads(new Set(data.map(l => l.thread_id)));
            }
        } catch (err) {
            console.error("[CommunityFeed] Error fetching liked threads:", err);
        }
    };

    // Fetch which threads user has bookmarked
    const fetchBookmarkedThreads = async () => {
        if (!user) {
            setBookmarkedThreads(new Set());
            return;
        }

        const supabase = getSupabaseBrowserClient();
        if (!supabase) return;

        try {
            console.log("[CommunityFeed] Fetching user bookmarks for user:", user.id);
            const { data, error } = await supabase
                .from('bookmarks')
                .select('content_id')
                .eq('userid', user.id)
                .eq('content_type', 'community_thread');

            if (error) {
                console.error("[CommunityFeed] Error fetching bookmarks:", error);
            } else if (data) {
                console.log("[CommunityFeed] User bookmarked threads:", data.map(b => b.content_id));
                setBookmarkedThreads(new Set(data.map(b => b.content_id)));
            }
        } catch (err) {
            console.error("[CommunityFeed] Error fetching bookmarks:", err);
        }
    };

    // Fetch threads on mount and when filters change
    // IMPORTANT: Wait for auth to finish loading before fetching
    useEffect(() => {
        // Don't fetch if auth is still loading
        if (authLoading) {
            console.log("[CommunityFeed] Waiting for auth to load...");
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/6855a037-0c28-4943-8b57-f28bdcef9a7d', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'C', location: 'web-app/components/community-feed.tsx:useEffect:gate', message: 'CommunityFeed blocked by authLoading', data: { authLoading: true, userId: user?.id || null, activeCategory, visibleCount, hasSearch: !!debouncedSearchQuery.trim() }, timestamp: Date.now() }) }).catch(() => { });
            // #endregion
            setLoading(true); // Show loading state while waiting
            return;
        }
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6855a037-0c28-4943-8b57-f28bdcef9a7d', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'C', location: 'web-app/components/community-feed.tsx:useEffect:fetch', message: 'CommunityFeed starting fetch (authLoading=false)', data: { authLoading: false, userId: user?.id || null, activeCategory, visibleCount, hasSearch: !!debouncedSearchQuery.trim() }, timestamp: Date.now() }) }).catch(() => { });
        // #endregion

        isMountedRef.current = true;

        let retryCount = 0;
        const maxRetries = 3;
        const retryDelay = 500;

        const fetchData = async () => {
            if (!isMountedRef.current) return;

            // Ensure Supabase client is ready
            const supabase = getSupabaseBrowserClient();
            if (!supabase) {
                if (retryCount < maxRetries) {
                    retryCount++;
                    console.warn(`[CommunityFeed] Supabase client not ready, retrying (${retryCount}/${maxRetries})...`);
                    setTimeout(() => {
                        if (isMountedRef.current && !authLoading) {
                            fetchData();
                        }
                    }, retryDelay);
                    return;
                } else {
                    console.error("[CommunityFeed] Supabase client not available after retries");
                    setError("Database connection unavailable. Please refresh the page.");
                    setLoading(false);
                    return;
                }
            }

            console.log("[CommunityFeed] Fetching threads...", {
                activeCategory,
                debouncedSearchQuery,
                visibleCount,
                userId: user?.id || "anonymous",
                supabaseReady: true
            });
            setLoading(true);
            setError(null);

            try {
                await fetchThreads();
            } catch (err: any) {
                // Ignore if component unmounted
                if (!isMountedRef.current) {
                    return;
                }
                console.error("[CommunityFeed] Error in fetchData useEffect:", err);
                // fetchThreads already handles error state, but ensure loading is false
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMountedRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCategory, debouncedSearchQuery, visibleCount, authLoading]);

    // Fetch user's prayed threads when user changes
    useEffect(() => {
        fetchUserPrayedThreads();
        fetchUserLikedThreads();
        fetchBookmarkedThreads();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Handle prayer button click
    const handlePray = async (threadId: string) => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            setError("Database connection unavailable");
            return;
        }

        if (prayedThreads.has(threadId) || prayingThreadId === threadId) {
            return; // Already prayed or currently praying, do nothing
        }

        if (!user) {
            setLoginRedirect("/community");
            setShowLoginModal(true);
            return;
        }

        setPrayingThreadId(threadId);
        setError(null);

        try {
            if (activeCategory === "Prayers") {
                const { error: insertError } = await supabase
                    .from('prayer_actions')
                    .insert({
                        prayer_id: threadId,
                        user_id: user.id
                    });

                if (insertError) {
                    if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
                        toast.error("You have already prayed for this request");
                        return;
                    } else if (insertError.message?.includes('rate limit') || insertError.message?.includes('too many')) {
                        setError("Rate limit exceeded. Please wait a moment before praying again.");
                        return;
                    } else {
                        throw insertError;
                    }
                }

                const { count: prayerCount } = await supabase
                    .from('prayer_actions')
                    .select('*', { count: 'exact', head: true })
                    .eq('prayer_id', threadId);

                setPrayedThreads(prev => new Set([...prev, threadId]));
                setThreads(prev => prev.map(t =>
                    t.id === threadId ? { ...t, prayer_count: prayerCount || 0 } : t
                ));
            } else {
                const { error: insertError } = await supabase
                    .from('thread_prayers')
                    .insert({
                        thread_id: threadId,
                        user_id: user.id
                    });

                if (insertError) {
                    if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
                        // Already prayed; continue to refresh counts.
                    } else if (insertError.message?.includes('rate limit') || insertError.message?.includes('too many')) {
                        setError("Rate limit exceeded. Please wait a moment before praying again.");
                        return;
                    } else {
                        throw insertError;
                    }
                }

                const { count: prayerCount } = await supabase
                    .from('thread_prayers')
                    .select('*', { count: 'exact', head: true })
                    .eq('thread_id', threadId);

                setPrayedThreads(prev => new Set([...prev, threadId]));
                setThreads(prev => prev.map(t =>
                    t.id === threadId ? { ...t, prayer_count: prayerCount || 0 } : t
                ));
            }

            const { count: threadPrayersCount } = await supabase
                .from('thread_prayers')
                .select('*', { count: 'exact', head: true });
            const { count: prayerActionsCount } = await supabase
                .from('prayer_actions')
                .select('*', { count: 'exact', head: true });

            setStats(prev => ({ ...prev, totalPrayers: (threadPrayersCount || 0) + (prayerActionsCount || 0) }));
        } catch (err: any) {
            console.error("Error adding prayer:", err);
            if (err.message?.includes('rate limit') || err.message?.includes('too many')) {
                setError("Rate limit exceeded. Please wait a moment before praying again.");
            } else {
                setError("Failed to add prayer. Please try again.");
            }
        } finally {
            setPrayingThreadId(null);
        }
    };

    // Handle like button click
    const handleLike = async (threadId: string) => {
        if (!user) {
            setLoginRedirect("/community");
            setShowLoginModal(true);
            return;
        }

        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            setError("Database connection unavailable");
            return;
        }

        const isLiked = likedThreads.has(threadId);

        setLikingThreadId(threadId);

        try {
            console.log("[CommunityFeed] Toggling like:", { threadId, isLiked, userId: user.id });

            if (isLiked) {
                const { error } = await supabase
                    .from('community_thread_likes')
                    .delete()
                    .eq('thread_id', threadId)
                    .eq('user_id', user.id);

                if (error) {
                    console.error("[CommunityFeed] Error removing like:", error);
                    throw error;
                }
                console.log("[CommunityFeed] Like removed successfully");
            } else {
                const { data, error } = await supabase
                    .from('community_thread_likes')
                    .insert({ thread_id: threadId, user_id: user.id })
                    .select();

                if (error) {
                    console.error("[CommunityFeed] Error adding like:", {
                        message: error.message,
                        code: error.code,
                        details: error.details,
                        hint: error.hint
                    });
                    if (error.code !== '23505') throw error; // Ignore duplicate errors
                } else {
                    console.log("[CommunityFeed] Like added successfully:", data);
                }
            }

            // Update like count
            const { count, error: countError } = await supabase
                .from('community_thread_likes')
                .select('*', { count: 'exact', head: true })
                .eq('thread_id', threadId);

            if (countError) {
                console.error("[CommunityFeed] Error getting like count:", countError);
            }

            // Update local state optimistically
            setLikedThreads(prev => {
                const newSet = new Set(prev);
                if (isLiked) {
                    newSet.delete(threadId);
                } else {
                    newSet.add(threadId);
                }
                return newSet;
            });

            setThreads(prev => prev.map(t =>
                t.id === threadId
                    ? { ...t, like_count: count || 0 }
                    : t
            ));

            // Show success toast
            toast.success(isLiked ? "Like removed" : "Post liked!", {
                duration: 2000,
            });
        } catch (err: any) {
            console.error("[CommunityFeed] Error toggling like:", {
                error: err,
                message: err?.message,
                code: err?.code,
                details: err?.details
            });
            const errorMsg = err?.message?.includes('RLS') || err?.message?.includes('permission')
                ? "You don't have permission to like posts. Please contact support."
                : err?.message || "Failed to update like. Please try again.";
            setError(errorMsg);
            toast.error(errorMsg, {
                duration: 4000,
            });
        } finally {
            setLikingThreadId(null);
        }
    };

    // Handle share button click
    const handleShare = async (threadId: string, threadTitle: string) => {
        const shareUrl = `${window.location.origin}/community?thread=${threadId}`;
        const shareData = {
            title: threadTitle,
            text: `Check out this post: ${threadTitle}`,
            url: shareUrl
        };

        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(shareUrl);
                // Show temporary success message
                const originalError = error;
                setError(null);
                setTimeout(() => {
                    // You could add a toast notification here instead
                    console.log("Link copied to clipboard!");
                }, 100);
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error("Error sharing:", err);
                // Fallback to clipboard
                try {
                    await navigator.clipboard.writeText(shareUrl);
                    console.log("Link copied to clipboard!");
                } catch (clipboardErr) {
                    console.error("Error copying to clipboard:", clipboardErr);
                    setError("Failed to share. Please try again.");
                }
            }
        }
    };

    // Handle bookmark button click
    const handleBookmark = async (threadId: string) => {
        if (!user) {
            setLoginRedirect("/community");
            setShowLoginModal(true);
            return;
        }

        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            setError("Database connection unavailable");
            return;
        }

        const isBookmarked = bookmarkedThreads.has(threadId);

        setBookmarkingThreadId(threadId);

        try {
            console.log("[CommunityFeed] Toggling bookmark:", { threadId, isBookmarked, userId: user.id });

            if (isBookmarked) {
                const { error } = await supabase
                    .from('bookmarks')
                    .delete()
                    .eq('userid', user.id)
                    .eq('content_id', threadId)
                    .eq('content_type', 'community_thread');

                if (error) {
                    console.error("[CommunityFeed] Error removing bookmark:", error);
                    throw error;
                }
                console.log("[CommunityFeed] Bookmark removed successfully");
            } else {
                const { data, error } = await supabase
                    .from('bookmarks')
                    .insert({
                        userid: user.id,
                        content_id: threadId,
                        content_type: 'community_thread'
                    })
                    .select();

                if (error) {
                    console.error("[CommunityFeed] Error adding bookmark:", {
                        message: error.message,
                        code: error.code,
                        details: error.details,
                        hint: error.hint
                    });
                    throw error;
                }
                console.log("[CommunityFeed] Bookmark added successfully:", data);
            }

            // Update local state optimistically
            setBookmarkedThreads(prev => {
                const newSet = new Set(prev);
                if (isBookmarked) {
                    newSet.delete(threadId);
                } else {
                    newSet.add(threadId);
                }
                return newSet;
            });
        } catch (err: any) {
            console.error("[CommunityFeed] Error toggling bookmark:", {
                error: err,
                message: err?.message,
                code: err?.code,
                details: err?.details
            });
            const errorMsg = err?.message?.includes('RLS') || err?.message?.includes('permission')
                ? "You don't have permission to save posts. Please contact support."
                : err?.message || "Failed to save post. Please try again.";
            setError(errorMsg);
        } finally {
            setBookmarkingThreadId(null);
        }
    };

    const fetchCommentsForThread = async (threadId: string) => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            setCommentErrors(prev => ({ ...prev, [threadId]: "Database connection unavailable" }));
            return;
        }

        setCommentsLoading(prev => ({ ...prev, [threadId]: true }));
        setCommentErrors(prev => ({ ...prev, [threadId]: null }));

        try {
            console.log("[CommunityFeed] Fetching comments for thread:", threadId);
            const joinQuery = await supabase
                .from('communitycomments')
                .select(`
                    *,
                    users:userid (id, username, fullname, avatarurl)
                `)
                .eq('threadid', threadId)
                .order('createdat', { ascending: true });

            console.log("[CommunityFeed] Comments query result:", {
                data: joinQuery.data?.length || 0,
                error: joinQuery.error
            });

            if (joinQuery.error) {
                console.warn("[CommunityFeed] JOIN query failed, trying fallback:", joinQuery.error);
                if (joinQuery.error.message?.includes('infinite recursion') ||
                    joinQuery.error.message?.includes('policy') ||
                    joinQuery.error.code === '42501' ||
                    joinQuery.error.code === '42P17') {
                    const { data: fallbackData, error: fallbackError } = await supabase
                        .from('communitycomments')
                        .select('*')
                        .eq('threadid', threadId)
                        .order('createdat', { ascending: true });

                    if (fallbackError) throw fallbackError;

                    const userIds = [...new Set((fallbackData || []).map(c => c.userid).filter(Boolean))];
                    let usersMap = new Map();

                    if (userIds.length > 0) {
                        const { data: usersData } = await supabase
                            .from('users')
                            .select('id, username, fullname, avatarurl')
                            .in('id', userIds);

                        usersMap = new Map(
                            (usersData || []).map(u => [u.id, {
                                username: u.username,
                                fullname: u.fullname,
                                avatarurl: u.avatarurl
                            }])
                        );
                    }

                    const commentsWithUsers = (fallbackData || []).map(comment => ({
                        ...comment,
                        users: usersMap.get(comment.userid) || null
                    }));

                    setCommentsByThread(prev => ({ ...prev, [threadId]: commentsWithUsers }));
                    console.log("[CommunityFeed] Comments loaded via fallback:", commentsWithUsers.length);
                } else {
                    throw joinQuery.error;
                }
            } else {
                const comments = joinQuery.data || [];
                console.log("[CommunityFeed] Comments loaded via JOIN:", comments.length);
                setCommentsByThread(prev => ({ ...prev, [threadId]: comments }));
            }
        } catch (err: any) {
            console.error("[CommunityFeed] Error fetching comments:", {
                error: err,
                message: err?.message,
                code: err?.code,
                details: err?.details
            });
            const errorMsg = err?.message?.includes('RLS') || err?.message?.includes('permission')
                ? "You don't have permission to view comments. Please contact support."
                : "Failed to load comments. Please try again.";
            setCommentErrors(prev => ({ ...prev, [threadId]: errorMsg }));
        } finally {
            setCommentsLoading(prev => ({ ...prev, [threadId]: false }));
        }
    };

    const handleCommentToggle = async (threadId: string) => {
        const next = expandedThreadId === threadId ? null : threadId;
        setExpandedThreadId(next);
        if (next) {
            await fetchCommentsForThread(threadId);
        }
    };

    const handleAddComment = async (threadId: string) => {
        if (!user) {
            setCommentErrors(prev => ({ ...prev, [threadId]: "Please sign in to comment" }));
            return;
        }

        const draft = (commentDrafts[threadId] || "").trim();
        if (!draft) {
            setCommentErrors(prev => ({ ...prev, [threadId]: "Comment cannot be empty" }));
            return;
        }

        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            setCommentErrors(prev => ({ ...prev, [threadId]: "Database connection unavailable" }));
            return;
        }

        try {
            console.log("[CommunityFeed] Adding comment:", { threadId, userId: user.id, contentLength: draft.length });

            const { data, error: insertError } = await supabase
                .from('communitycomments')
                .insert({ threadid: threadId, userid: user.id, content: draft })
                .select();

            if (insertError) {
                console.error("[CommunityFeed] Error adding comment:", {
                    message: insertError.message,
                    code: insertError.code,
                    details: insertError.details,
                    hint: insertError.hint
                });
                throw insertError;
            }

            console.log("[CommunityFeed] Comment added successfully:", data);

            // Update comment count
            const { count, error: countError } = await supabase
                .from('communitycomments')
                .select('*', { count: 'exact', head: true })
                .eq('threadid', threadId);

            if (countError) {
                console.error("[CommunityFeed] Error getting comment count:", countError);
            }

            // Update thread comment count
            setThreads(prev => prev.map(t =>
                t.id === threadId
                    ? { ...t, comment_count: count || 0 }
                    : t
            ));

            // Clear draft and refresh comments
            setCommentDrafts(prev => ({ ...prev, [threadId]: "" }));
            setCommentErrors(prev => ({ ...prev, [threadId]: null }));
            await fetchCommentsForThread(threadId);

            // Show success toast
            toast.success("Comment posted!", {
                duration: 2000,
            });
        } catch (err: any) {
            console.error("[CommunityFeed] Error adding comment:", {
                error: err,
                message: err?.message,
                code: err?.code,
                details: err?.details
            });
            const errorMsg = err?.message?.includes('RLS') || err?.message?.includes('permission')
                ? "You don't have permission to comment. Please contact support."
                : err?.message || "Failed to post comment. Please try again.";
            setCommentErrors(prev => ({ ...prev, [threadId]: errorMsg }));
            toast.error(errorMsg, {
                duration: 4000,
            });
        }
    };

    // Fetch community statistics
    const fetchCommunityStats = async () => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            setStatsLoading(false);
            return;
        }

        try {
            // Fetch total members
            const { count: memberCount } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            // Fetch total prayers
            const { count: prayerCount } = await supabase
                .from('thread_prayers')
                .select('*', { count: 'exact', head: true });

            // Fetch active discussions (last 24 hours)
            const yesterday = new Date();
            yesterday.setHours(yesterday.getHours() - 24);
            const { count: activeCount } = await supabase
                .from('communitythreads')
                .select('*', { count: 'exact', head: true })
                .gte('createdat', yesterday.toISOString());

            setStats({
                totalMembers: memberCount || 0,
                totalPrayers: prayerCount || 0,
                activeDiscussions: activeCount || 0
            });
        } catch (err) {
            console.error("Error fetching stats:", err);
        } finally {
            setStatsLoading(false);
        }
    };

    // Fetch stats on mount
    useEffect(() => {
        fetchCommunityStats();
    }, []);

    // Real-time updates for likes
    useEffect(() => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase || threads.length === 0) return;

        const threadIds = threads.map(t => t.id);
        if (threadIds.length === 0) return;

        const channel = supabase
            .channel('community-likes-updates')
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'community_thread_likes'
                },
                async (payload) => {
                    const threadId = payload.new?.thread_id || payload.old?.thread_id;
                    if (!threadId || !threadIds.includes(threadId)) return;

                    // Refetch like count for this thread
                    const { count } = await supabase
                        .from('community_thread_likes')
                        .select('*', { count: 'exact', head: true })
                        .eq('thread_id', threadId);

                    if (count !== null) {
                        setThreads(prev => prev.map(t =>
                            t.id === threadId
                                ? { ...t, like_count: count }
                                : t
                        ));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [threads]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== undefined) {
                setVisibleCount(10);
                setLoading(true);
                fetchThreads();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const displayThreads = useMemo(() => {
        return threads.slice(0, Math.min(visibleCount, MAX_VISIBLE));
    }, [threads, visibleCount]);

    const hasMore = visibleCount < threads.length && visibleCount < MAX_VISIBLE;
    const reachedCap = visibleCount >= MAX_VISIBLE && threads.length > MAX_VISIBLE;

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoadingMore && hasMore && !loading) {
                    setIsLoadingMore(true);
                    setVisibleCount(prev => Math.min(prev + 10, MAX_VISIBLE));
                    // Loading will be handled by fetchThreads
                    setTimeout(() => setIsLoadingMore(false), 500);
                }
            },
            { threshold: 1.0 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [isLoadingMore, hasMore, loading]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                redirectTo={loginRedirect}
            />
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
                {/* Main Feed - Scrollable Container */}
                <div className="lg:col-span-8">
                    {/* Error Banner */}
                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive">
                            <p className="font-bold">{error}</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setError(null);
                                    setLoading(true);
                                    fetchThreads();
                                }}
                                className="mt-2"
                            >
                                Retry
                            </Button>
                        </div>
                    )}

                    <div className="max-h-[800px] overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-secondary/20 scrollbar-track-transparent">
                        {(loading || authLoading) && threads.length === 0 ? (
                            <div className="text-center py-24">
                                <div className="w-8 h-8 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-muted-foreground font-bold">
                                    {authLoading ? "Loading session..." : "Loading community discussions..."}
                                </p>
                            </div>
                        ) : threads.length === 0 ? (
                            <div className="text-center py-24 bg-card border border-dashed border-border rounded-3xl">
                                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                                    <Search className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No results found</h3>
                                <p className="text-muted-foreground">Try adjusting your search or category filters.</p>
                            </div>
                        ) : (
                            displayThreads.map((thread) => {
                                const authorName = thread.is_anonymous
                                    ? "Anonymous"
                                    : (thread.users?.fullname || thread.users?.username || "User");
                                const authorInitial = authorName[0] || "?";
                                const hasPrayed = prayedThreads.has(thread.id);

                                return (
                                    <div key={thread.id} data-discussion-card className="bg-card border border-border rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all group animate-fade-in text-pretty">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                {thread.is_anonymous ? (
                                                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                                                        ?
                                                    </div>
                                                ) : thread.users?.avatarurl ? (
                                                    <img
                                                        src={thread.users.avatarurl}
                                                        alt={authorName}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                                                        {authorInitial}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-foreground leading-none">{authorName}</h4>
                                                    <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(thread.createdat)} • {getCategoryLabel(thread.category)}</p>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === thread.id ? null : thread.id)}
                                                    className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>

                                                {openMenuId === thread.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                                                        <button
                                                            onClick={() => {
                                                                setReportModal({
                                                                    isOpen: true,
                                                                    contentId: thread.id,
                                                                    contentType: "thread",
                                                                    contentTitle: thread.title
                                                                });
                                                                setOpenMenuId(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2 font-medium"
                                                        >
                                                            <AlertTriangle className="w-4 h-4" />
                                                            Report Discussion
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="font-serif text-2xl font-bold mb-4 group-hover:text-secondary transition-colors">
                                            {thread.title}
                                        </h3>
                                        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                                            {thread.content}
                                        </p>

                                        <div className="flex items-center justify-between pt-6 border-t border-border/50">
                                            <div className="flex items-center gap-6">
                                                <button
                                                    onClick={() => handleLike(thread.id)}
                                                    disabled={likingThreadId === thread.id}
                                                    className={`flex items-center gap-2 transition-colors group/stat ${likedThreads.has(thread.id)
                                                        ? "text-rose-500 cursor-pointer"
                                                        : "text-muted-foreground hover:text-rose-500 cursor-pointer"
                                                        } ${likingThreadId === thread.id ? "opacity-50" : ""}`}
                                                    title={likedThreads.has(thread.id) ? "Unlike" : "Like"}
                                                >
                                                    <Heart className={`w-5 h-5 ${likedThreads.has(thread.id) ? "fill-rose-500" : ""} group-hover/stat:fill-rose-500`} />
                                                    <span className="font-bold">{thread.like_count || 0}</span>
                                                </button>
                                                <button
                                                    onClick={() => handlePray(thread.id)}
                                                    disabled={hasPrayed || prayingThreadId === thread.id}
                                                    className={`flex items-center gap-2 transition-colors group/stat ${hasPrayed
                                                        ? "text-secondary cursor-default"
                                                        : "text-muted-foreground hover:text-secondary cursor-pointer"
                                                        } ${prayingThreadId === thread.id ? "opacity-50" : ""}`}
                                                    title={hasPrayed ? "You've prayed for this" : "Pray for this"}
                                                >
                                                    {prayingThreadId === thread.id ? (
                                                        <div className="w-5 h-5 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                                                    ) : (
                                                        <Hand className={`w-5 h-5 ${hasPrayed ? "fill-secondary" : ""} group-hover/stat:fill-secondary`} />
                                                    )}
                                                    <span className="font-bold">{thread.prayer_count || 0} <span className="hidden sm:inline">prayed</span></span>
                                                </button>
                                                <button
                                                    onClick={() => handleCommentToggle(thread.id)}
                                                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group/stat cursor-pointer"
                                                    title={expandedThreadId === thread.id ? "Hide comments" : "View comments"}
                                                >
                                                    <MessageCircle className="w-5 h-5 group-hover/stat:fill-primary" />
                                                    <span className="font-bold">{thread.comment_count || 0}</span>
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleBookmark(thread.id)}
                                                    disabled={bookmarkingThreadId === thread.id}
                                                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${bookmarkedThreads.has(thread.id)
                                                        ? "bg-secondary/20 text-secondary"
                                                        : "bg-muted/50 hover:bg-muted text-muted-foreground"
                                                        } ${bookmarkingThreadId === thread.id ? "opacity-50" : ""}`}
                                                    title={bookmarkedThreads.has(thread.id) ? "Remove bookmark" : "Save post"}
                                                >
                                                    <Bookmark className={`w-4 h-4 ${bookmarkedThreads.has(thread.id) ? "fill-secondary" : ""}`} />
                                                </button>
                                                <button
                                                    onClick={() => handleShare(thread.id, thread.title)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
                                                    title="Share post"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {expandedThreadId === thread.id && (
                                            <div className="mt-6 pt-6 border-t border-border/50 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-lg font-bold">Comments</h4>
                                                    <span className="text-sm text-muted-foreground">
                                                        {commentsByThread[thread.id]?.length || 0} total
                                                    </span>
                                                </div>

                                                {commentErrors[thread.id] && (
                                                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-semibold">
                                                        {commentErrors[thread.id]}
                                                    </div>
                                                )}

                                                {commentsLoading[thread.id] ? (
                                                    <div className="text-sm text-muted-foreground">Loading comments...</div>
                                                ) : (commentsByThread[thread.id] || []).length === 0 ? (
                                                    <div className="text-sm text-muted-foreground">No comments yet. Be the first to share.</div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {(commentsByThread[thread.id] || []).map(comment => {
                                                            const commenterName = comment.users?.fullname || comment.users?.username || "Community Member";
                                                            const commenterInitial = commenterName[0] || "?";
                                                            return (
                                                                <div key={comment.id} className="flex gap-3">
                                                                    {comment.users?.avatarurl ? (
                                                                        <img
                                                                            src={comment.users.avatarurl}
                                                                            alt={commenterName}
                                                                            className="w-8 h-8 rounded-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-xs font-bold">
                                                                            {commenterInitial}
                                                                        </div>
                                                                    )}
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-semibold">{commenterName}</span>
                                                                            <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdat)}</span>
                                                                        </div>
                                                                        <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                <div className="pt-2">
                                                    <label className="text-sm font-semibold text-foreground block mb-2">
                                                        Add a comment
                                                    </label>
                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        <input
                                                            type="text"
                                                            placeholder={user ? "Share your thoughts..." : "Sign in to comment"}
                                                            disabled={!user}
                                                            value={commentDrafts[thread.id] || ""}
                                                            onChange={(e) =>
                                                                setCommentDrafts(prev => ({ ...prev, [thread.id]: e.target.value }))
                                                            }
                                                            className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                                                        />
                                                        <Button
                                                            disabled={!user || !(commentDrafts[thread.id] || "").trim()}
                                                            onClick={() => handleAddComment(thread.id)}
                                                            className="bg-secondary text-white hover:bg-secondary/90 rounded-xl px-4"
                                                        >
                                                            Post
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}

                        {/* Sentinel for Infinite Scroll */}
                        <div ref={loadMoreRef} className="py-8 flex justify-center">
                            {isLoadingMore && (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-8 h-8 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                                    <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading more fellowship...</p>
                                </div>
                            )}
                            {!isLoadingMore && reachedCap && (
                                <div className="text-center py-6 px-4 bg-muted/30 rounded-2xl border border-border">
                                    <p className="text-sm font-medium text-muted-foreground mb-2">
                                        Showing the latest {MAX_VISIBLE} discussions
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Use filters or search to explore more content
                                    </p>
                                </div>
                            )}
                            {!isLoadingMore && !hasMore && !reachedCap && threads.length > 0 && (
                                <p className="text-muted-foreground text-sm font-medium">You've reached the end of the feed.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-card border border-border rounded-[2rem] p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-secondary" />
                            Community Stats
                        </h3>
                        {statsLoading ? (
                            <StatsSkeleton />
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Total Members</span>
                                    <span className="font-bold">{stats.totalMembers.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Prayers Reached</span>
                                    <span className="font-bold">
                                        {stats.totalPrayers >= 1000
                                            ? `${(stats.totalPrayers / 1000).toFixed(1)}K`
                                            : stats.totalPrayers.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Live Discussions</span>
                                    <span className="font-bold">{stats.activeDiscussions}</span>
                                </div>
                            </div>
                        )}
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
                onSuccess={() => {
                    // Refresh threads after successful post creation
                    setVisibleCount(10);
                    setLoading(true);
                    fetchThreads();
                }}
            />

            <ReportModal
                isOpen={reportModal.isOpen}
                onClose={() => setReportModal(prev => ({ ...prev, isOpen: false }))}
                contentId={reportModal.contentId}
                contentType={reportModal.contentType}
                contentTitle={reportModal.contentTitle}
            />
        </div>
    );
}
