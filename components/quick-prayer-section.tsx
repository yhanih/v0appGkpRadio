"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Heart, MapPin, Sparkles, MessageSquare, Flame, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "./auth/LoginModal";
import { toast } from "sonner";

type PrayerRequest = {
  id: string;
  name: string;
  location: string;
  request: string;
  prayers: number;
  goal: number;
  category: string;
  urgent: boolean;
};

export function QuickPrayerSection() {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [prayed, setPrayed] = useState<Set<string>>(new Set());
  const [totalPrayers, setTotalPrayers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prayingFor, setPrayingFor] = useState<string | null>(null);
  const [lastPrayTime, setLastPrayTime] = useState<number>(0);
  const [prayCount, setPrayCount] = useState(0);
  // Initialize with 0 to avoid hydration mismatch - set actual value in useEffect
  const [rateLimitReset, setRateLimitReset] = useState<number>(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user } = useAuth();

  // UUID validation function
  const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // Initialize rate limit reset time on client only (prevents hydration mismatch)
  useEffect(() => {
    if (rateLimitReset === 0) {
      setRateLimitReset(Date.now() + 60000);
    }
  }, [rateLimitReset]);

  // Client-side rate limiting: max 10 prayers per minute
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    if (rateLimitReset > 0 && now > rateLimitReset) {
      // Reset counter after 1 minute
      setPrayCount(0);
      setRateLimitReset(now + 60000);
      return true;
    }
    return prayCount < 10;
  };

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

      // Fetch prayer requests from communitythreads (match community categories)
      const { data: prayersData, error: prayersError } = await supabase
        .from("communitythreads")
        .select("id, title, content, category, createdat, userid")
        .in("category", ["Prayer Requests", "Pray for Others"])
        .order("createdat", { ascending: false })
        .limit(6);

      if (cancelled) return;

      if (prayersError) {
        setError(prayersError.message);
        setIsLoading(false);
        return;
      }

      if (!prayersData || prayersData.length === 0) {
        setIsLoading(false);
        return;
      }

      // Fetch user info
      const userIds = [...new Set(prayersData.map((p) => p.userid))];
      const { data: usersData } = await supabase
        .from("users")
        .select("id, username, fullname")
        .in("id", userIds);

      const usersMap = new Map((usersData || []).map((u) => [u.id, u]));

      // Fetch prayer counts from thread_prayers table
      const threadIds = prayersData.map((p) => p.id);
      const { data: prayersCountData } = await supabase
        .from("thread_prayers")
        .select("thread_id")
        .in("thread_id", threadIds);

      const prayerCountsMap = new Map<string, number>();
      (prayersCountData || []).forEach((p) => {
        prayerCountsMap.set(
          p.thread_id,
          (prayerCountsMap.get(p.thread_id) || 0) + 1
        );
      });

      // Map to component format
      const mappedRequests: PrayerRequest[] = prayersData.slice(0, 3).map((prayer) => {
        const user = usersMap.get(prayer.userid);
        const name = user?.fullname || user?.username || "Community Member";
        const location = "Community"; // Location not stored in current schema
        const prayerCount = prayerCountsMap.get(prayer.id) || 0;
        const goal = Math.max(prayerCount + 10, 50); // Dynamic goal based on current count

        return {
          id: prayer.id,
          name,
          location,
          request: prayer.content || prayer.title,
          prayers: prayerCount,
          goal,
          category: prayer.category || "Prayer",
          urgent: false, // Could be determined by date or other logic
        };
      });

      if (!cancelled) {
        setPrayerRequests(mappedRequests);
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePray = async (id: string) => {
    if (prayed.has(id) || prayingFor === id) return;

    // UUID validation
    if (!isValidUUID(id)) {
      setError("Invalid prayer request ID");
      return;
    }

    // Client-side rate limiting
    if (!checkRateLimit()) {
      const secondsLeft = Math.ceil((rateLimitReset - Date.now()) / 1000);
      setError(`Rate limit exceeded. Please wait ${secondsLeft} seconds before praying again.`);
      return;
    }

    // Prevent rapid clicks (debounce)
    const timeSinceLastPray = Date.now() - lastPrayTime;
    if (timeSinceLastPray < 1000) {
      setError("Please wait a moment before praying again");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured");
      return;
    }

    setPrayingFor(id);
    setLastPrayTime(Date.now());
    setPrayCount((prev) => prev + 1);

    // If guest, show login modal
    if (!user) {
      setShowLoginModal(true);
      setPrayingFor(null);
      setPrayCount((prev) => Math.max(0, prev - 1));
      return;
    }

    // Insert prayer into thread_prayers table
    // user_id is NOT NULL in schema
    const { error: insertError } = await supabase
      .from("thread_prayers")
      .insert({
        thread_id: id,
        user_id: user.id
      });

    if (insertError) {
      // If error is due to duplicate (user already prayed), that's okay
      if (!insertError.message.includes("duplicate") && !insertError.message.includes("unique")) {
        // Check for rate limit error from database
        if (insertError.message.includes("Rate limit exceeded")) {
          toast.error("Rate limit exceeded: Maximum 10 prayers per minute allowed");
        } else {
          toast.error(`Error: ${insertError.message}`);
        }
        setPrayingFor(null);
        setPrayCount((prev) => Math.max(0, prev - 1)); // Revert count on error
        return;
      }
    }

    // Fetch updated prayer count
    const { count } = await supabase
      .from("thread_prayers")
      .select("*", { count: "exact", head: true })
      .eq("thread_id", id);

    const newPrayerCount = count || 0;

    // Update local state
    setPrayed(new Set([...prayed, id]));
    setTotalPrayers(totalPrayers + 1);

    // Update prayer count in the request
    setPrayerRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, prayers: newPrayerCount } : req
      )
    );

    setPrayingFor(null);
  };

  const progress = (prayers: number, goal: number) => (prayers / goal) * 100;

  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(45,160,114,0.1),transparent)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-6">
            <Flame className="w-3 h-3" />
            Prayer Community
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Lifting Each Other Up in Prayer
          </h2>
          <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
            "For where two or three are gathered together in my name, there am I in the midst of them."
            Join our global community in powerful intercession.
          </p>

          {/* Personal Impact */}
          {totalPrayers > 0 && (
            <div className="mt-6 flex items-center justify-center gap-2 text-secondary animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">You've joined in {totalPrayers} {totalPrayers === 1 ? 'prayer' : 'prayers'} today</span>
            </div>
          )}
        </div>

        {/* Prayer Cards Grid */}
        {isLoading ? (
          <div className="text-center py-12 mb-16">
            <p className="text-primary-foreground/70">Loading prayer requests...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 mb-16">
            <p className="text-destructive">Error loading prayers: {error}</p>
          </div>
        ) : prayerRequests.length === 0 ? (
          <div className="text-center py-12 mb-16">
            <MessageSquare className="w-12 h-12 text-primary-foreground/30 mx-auto mb-4" />
            <p className="text-primary-foreground/70 mb-4">No prayer requests available yet.</p>
            <Button asChild size="lg" className="bg-secondary text-white hover:bg-secondary/90">
              <Link href="/community?category=Prayer%20Requests">Submit a Prayer Request</Link>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {prayerRequests.map((request) => {
              const hasPrayed = prayed.has(request.id);
              const isPraying = prayingFor === request.id;
              const currentPrayers = request.prayers;
              const currentProgress = progress(currentPrayers, request.goal);

              return (
                <div
                  key={request.id}
                  className={`group bg-white rounded-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative border border-white/10 ${hasPrayed ? 'ring-2 ring-secondary' : ''
                    }`}
                >
                  {/* Urgent Badge */}
                  {request.urgent && !hasPrayed && (
                    <div className="absolute -top-3 left-8 bg-destructive text-destructive-foreground text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-tighter">
                      <Flame className="w-3 h-3 fill-current" />
                      Urgent Need
                    </div>
                  )}

                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold">
                        {request.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 leading-tight">{request.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {request.location}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-muted text-muted-foreground uppercase">
                      {request.category}
                    </span>
                  </div>

                  {/* Request Content */}
                  <div className="mb-8 min-h-[80px]">
                    <p className="text-gray-700 leading-relaxed italic">
                      "{request.request}"
                    </p>
                  </div>

                  {/* Progress & Stats */}
                  <div className="space-y-4">
                    <div className="flex items-end justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className={`w-5 h-5 transition-colors ${hasPrayed ? 'fill-secondary text-secondary' : 'text-gray-300'}`} />
                        <span className="text-lg font-bold text-gray-900">{currentPrayers.toLocaleString()}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">Goal: {request.goal}</span>
                    </div>

                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ease-out ${hasPrayed ? 'bg-secondary' : 'bg-accent'
                          }`}
                        style={{ width: `${Math.min(currentProgress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handlePray(request.id)}
                    disabled={hasPrayed || isPraying}
                    className={`w-full mt-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${hasPrayed
                        ? "bg-secondary/10 text-secondary cursor-default"
                        : isPraying
                          ? "bg-primary/50 text-white cursor-wait"
                          : "bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg active:scale-95"
                      }`}
                  >
                    {isPraying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Praying...
                      </>
                    ) : hasPrayed ? (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Prayed
                      </>
                    ) : (
                      <>
                        <Hand className="w-4 h-4" />
                        Pray for {request.name}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer CTA */}
        <div className="text-center bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-sm">
          <MessageSquare className="w-10 h-10 text-secondary mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-primary-foreground mb-4">Need Prayer?</h3>
          <p className="text-primary-foreground/60 mb-8 max-w-xl mx-auto">
            Our community of thousands is ready to stand with you. Share your request and let us lift it up together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-secondary text-white hover:bg-secondary/90 px-8 py-6 text-lg rounded-2xl w-full sm:w-auto">
              <Link href="/community?category=Prayer%20Requests">Submit Prayer Request</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent border-white/20 text-primary-foreground hover:bg-white/10 px-8 py-6 text-lg rounded-2xl w-full sm:w-auto">
              <Link href="/community?category=Prayer%20Requests">View All Requests</Link>
            </Button>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectTo="/hub"
      />
    </section>
  );
}
