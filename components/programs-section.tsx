"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, ChevronRight } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type ScheduleRow = {
  id: string;
  show_title: string;
  hosts: string | null;
  start_time: string;
  end_time: string;
  day_of_week: string;
};

type Program = {
  id: string;
  title: string;
  time: string;
  host: string;
  description: string;
  category: string;
};

const formatTimeRange = (start: string, end: string): string => {
  const to12h = (t: string) => {
    const [hStr, mStr] = t.split(":");
    const h = Number(hStr);
    const m = Number(mStr);
    const hour12 = ((h + 11) % 12) + 1;
    const ampm = h >= 12 ? "PM" : "AM";
    const mm = String(m).padStart(2, "0");
    return `${hour12}:${mm} ${ampm}`;
  };
  return `${to12h(start)} – ${to12h(end)}`;
};

const mapDayToCategory = (row: ScheduleRow): string => {
  const title = row.show_title.toLowerCase();
  if (title.includes("prayer") || title.includes("devotional") || title.includes("connect 4")) return "Devotional";
  if (title.includes("worship") || title.includes("praise")) return "Worship";
  if (title.includes("youth")) return "Youth";
  if (title.includes("marriage") || title.includes("family") || title.includes("kids")) return "Family";
  if (title.includes("meditation")) return "Meditation";
  return "Teaching";
};

const categories = [
  "All",
  "Devotional",
  "Teaching",
  "Worship",
  "Family",
  "Youth",
  "Meditation",
];

export function ProgramsSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 500; // 500ms

    const fetchPrograms = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        // Retry if Supabase client not available (might be loading env vars)
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(() => {
            if (!cancelled) fetchPrograms();
          }, retryDelay);
        } else {
          if (!cancelled) {
            setError("Supabase is not configured");
            setIsLoading(false);
          }
        }
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from("schedule")
          .select("id, show_title, hosts, start_time, end_time, day_of_week")
          .order("start_time", { ascending: true });

        if (cancelled) return;

        if (queryError) {
          console.error("[ProgramsSection] Error fetching programs:", queryError);
          setError(queryError.message);
          setIsLoading(false);
          return;
        }

        if (!data) {
          console.warn("[ProgramsSection] No schedule data available");
          setError("No schedule data available");
          setIsLoading(false);
          return;
        }

        const mappedPrograms: Program[] = data.map((row: ScheduleRow) => ({
          id: row.id,
          title: row.show_title,
          time: formatTimeRange(row.start_time, row.end_time),
          host: row.hosts || "GKP Radio",
          description: row.hosts
            ? `Tune in for ${row.show_title} with ${row.hosts}.`
            : `Spiritual nourishment and ${row.show_title.toLowerCase()} for your day.`,
          category: mapDayToCategory(row),
        }));

        if (!cancelled) {
          setPrograms(mappedPrograms);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[ProgramsSection] Unexpected error fetching programs:", err);
        if (!cancelled) {
          setError("Failed to load programs");
          setIsLoading(false);
        }
      }
    };

    fetchPrograms();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPrograms =
    activeCategory === "All"
      ? programs
      : programs.filter((p) => p.category === activeCategory);

  return (
    <section id="programs" className="py-24 sm:py-32 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="text-sm font-bold text-secondary uppercase tracking-[0.2em] mb-4 block">
              GKP Radio • Our Programs
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground mt-2 text-balance leading-[1.1]">
              Daily Programming Schedule
            </h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
              Experience the power of God&apos;s word through our curated daily broadcasts,
              connecting you to heaven from 6 AM to midnight and beyond.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className={
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:bg-card"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Programs Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading programs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Error loading programs: {error}</p>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No programs found for this category.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Time Header */}
                <div className="bg-primary px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{program.time}</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">
                    {program.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-1">
                    {program.title}
                  </h3>
                  <p className="text-sm text-secondary mb-3">
                    Hosted by {program.host}
                  </p>
                  <p className="text-muted-foreground text-sm mb-4">
                    {program.description}
                  </p>
                  <Link
                    href="/programs"
                    className="inline-flex items-center text-sm font-medium text-secondary hover:text-secondary/80 transition-colors group-hover:gap-2 gap-1"
                  >
                    Learn More
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <Button
            asChild
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
          >
            <Link href="/programs">View Full Schedule</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
