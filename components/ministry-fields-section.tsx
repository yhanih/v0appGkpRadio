"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { MessageCircle, Users, Heart, Clock, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Discussion = {
  id: string;
  category: string;
  categoryColor: string;
  title: string;
  excerpt: string;
  author: string;
  time: string;
  replies: number;
};

type Stats = {
  icon: typeof Users;
  value: string;
  label: string;
  color: string;
};

const categoryColors: Record<string, string> = {
  "Prayer Requests": "#7F5A53",
  "Prayers": "#7F5A53",
  "Testimonies": "#AC9258",
  "Youth Voices": "#2DA072",
  "Praise & Worship": "#AC9258",
  "To My Husband": "#7F5A53",
  "To My Wife": "#7F5A53",
  "Sharing Hobbies": "#2DA072",
  "Words of Encouragement": "#AC9258",
  "Bragging on My Child (ren)": "#2DA072",
  "Pray for Others": "#7F5A53",
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  return `${Math.floor(diffInDays / 7)} ${Math.floor(diffInDays / 7) === 1 ? "week" : "weeks"} ago`;
};

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    const k = Math.floor(num / 1000);
    const remainder = num % 1000;
    if (remainder >= 100) {
      return `${k}.${Math.floor(remainder / 100)}K+`;
    }
    return `${k}K+`;
  }
  return num.toString();
};

export function MinistryFieldsSection() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [stats, setStats] = useState<Stats[]>([
    { icon: Users, value: "0", label: "Community Members", color: "#2DA072" },
    { icon: MessageCircle, value: "0", label: "Discussions", color: "#AC9258" },
    { icon: Heart, value: "0", label: "Prayer Requests", color: "#7F5A53" },
    { icon: Clock, value: "24/7", label: "Community Support", color: "#203E3F" },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        if (!cancelled) {
          setError("Supabase is not configured");
          setIsLoading(false);
        }
        return;
      }

      // Fetch stats
      try {
        const [usersResult, threadsResult, prayersResult] = await Promise.all([
          supabase.from("users").select("id", { count: "exact", head: true }),
          supabase.from("communitythreads").select("id", { count: "exact", head: true }),
          supabase.from("communitythreads").select("id", { count: "exact", head: true }).eq("category", "Prayer"),
        ]);

        if (cancelled) return;

        const memberCount = usersResult.count || 0;
        const discussionCount = threadsResult.count || 0;
        const prayerCount = prayersResult.count || 0;

        setStats([
          { icon: Users, value: formatNumber(memberCount), label: "Community Members", color: "#2DA072" },
          { icon: MessageCircle, value: formatNumber(discussionCount), label: "Discussions", color: "#AC9258" },
          { icon: Heart, value: formatNumber(prayerCount), label: "Prayer Requests", color: "#7F5A53" },
          { icon: Clock, value: "24/7", label: "Community Support", color: "#203E3F" },
        ]);
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching stats:", err);
        }
      }

      // Fetch featured discussions
      const { data: threadsData, error: threadsError } = await supabase
        .from("communitythreads")
        .select("id, title, content, category, createdat, comment_count, userid")
        .order("createdat", { ascending: false })
        .limit(3);

      if (cancelled) return;

      if (threadsError) {
        setError(threadsError.message);
        setIsLoading(false);
        return;
      }

      if (!threadsData || threadsData.length === 0) {
        setIsLoading(false);
        return;
      }

      // Fetch user info for authors
      const userIds = [...new Set(threadsData.map((t) => t.userid))];
      const { data: usersData } = await supabase
        .from("users")
        .select("id, username, fullname")
        .in("id", userIds);

      const usersMap = new Map((usersData || []).map((u) => [u.id, u]));

      const mappedDiscussions: Discussion[] = threadsData.map((thread) => {
        const user = usersMap.get(thread.userid);
        const authorName = user?.fullname || user?.username || "Community Member";
        const excerpt = thread.content.length > 120 ? thread.content.substring(0, 120) + "..." : thread.content;

        return {
          id: thread.id,
          category: thread.category,
          categoryColor: categoryColors[thread.category] || "#7F5A53",
          title: thread.title,
          excerpt,
          author: authorName,
          time: formatTimeAgo(thread.createdat),
          replies: thread.comment_count || 0,
        };
      });

      if (!cancelled) {
        setDiscussions(mappedDiscussions);
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <section className="py-24 bg-background border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-6">
            <Users className="w-3 h-3" />
            Ministry Fields
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Share Stories, Request Prayers & Grow Together
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Join 2,500+ believers sharing authentic testimonies, lifting prayers, and building community.
            Your voice is a vital part of our fellowship.
          </p>
        </div>

        {/* Featured Discussions Header */}
        <div className="flex items-center justify-between mb-10 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-secondary" />
            <h3 className="text-2xl font-bold text-foreground">Featured Discussions</h3>
          </div>
          <Button variant="ghost" asChild className="gap-2 text-secondary hover:text-secondary hover:bg-secondary/5 font-bold">
            <Link href="/community?category=all">
              See More discussions
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </Button>
        </div>

        {/* Discussion Cards */}
        {isLoading ? (
          <div className="text-center py-12 mb-20">
            <p className="text-muted-foreground">Loading discussions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 mb-20">
            <p className="text-destructive">Error loading discussions: {error}</p>
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-12 mb-20">
            <p className="text-muted-foreground">No discussions available yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {discussions.map((discussion) => (
            <Link
              key={discussion.id}
              href={`/community?category=${discussion.category === 'Prayer Requests' ? 'Prayers' : discussion.category}`}
              className="group bg-card border border-border/60 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
            >
              {/* Category */}
              <div className="flex items-center justify-between mb-6">
                <span
                  className="text-[10px] font-bold uppercase px-3 py-1 rounded-full border bg-opacity-5"
                  style={{
                    borderColor: `${discussion.categoryColor}40`,
                    color: discussion.categoryColor,
                    backgroundColor: `${discussion.categoryColor}10`,
                  }}
                >
                  {discussion.category}
                </span>
                <Sparkles className="w-4 h-4 text-accent/30 group-hover:text-accent transition-colors" />
              </div>

              {/* Title */}
              <h4 className="font-serif text-2xl font-bold text-foreground mb-4 line-clamp-2 leading-tight group-hover:text-secondary transition-colors">
                {discussion.title}
              </h4>

              {/* Excerpt */}
              <p className="text-muted-foreground text-base mb-6 line-clamp-3 leading-relaxed">
                {discussion.excerpt}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-6 pt-6 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs">
                    {discussion.author[0]}
                  </div>
                  <span className="font-semibold text-foreground">{discussion.author}</span>
                </div>
                <span>{discussion.time}</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{discussion.replies} replies</span>
                </div>
                <div className="text-sm font-bold text-secondary hover:text-secondary/80 transition-colors flex items-center gap-1 group/btn">
                  Join Discussion
                  <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-card border border-border/40 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-inner"
                style={{ backgroundColor: `${stat.color}10` }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-secondary/5 rounded-3xl p-12 border border-secondary/10">
          <Button asChild size="lg" className="bg-secondary text-white hover:bg-secondary/90 gap-3 px-10 py-7 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <Link href="/community?category=all">
              <Users className="w-6 h-6" />
              Join our Community
            </Link>
          </Button>
          <p className="text-base text-muted-foreground mt-6 font-medium">
            Share your story, ask for prayer, and connect with fellow believers worldwide
          </p>
        </div>
      </div>
    </section>
  );
}
