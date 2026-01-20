"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, ChevronRight } from "lucide-react";

const programs = [
  {
    id: 1,
    title: "Morning Devotion",
    time: "6:00 AM - 7:00 AM",
    host: "Pastor David",
    description:
      "Start your day with powerful prayers, scripture readings, and inspirational messages to set a godly tone for the day ahead.",
    category: "Devotional",
  },
  {
    id: 2,
    title: "Kingdom Principles",
    time: "9:00 AM - 10:00 AM",
    host: "Rev. Sarah Johnson",
    description:
      "In-depth Bible teaching exploring the foundational principles of God's Kingdom and how to apply them in daily life.",
    category: "Teaching",
  },
  {
    id: 3,
    title: "Worship Hour",
    time: "12:00 PM - 1:00 PM",
    host: "Ministry Team",
    description:
      "A powerful hour of contemporary and traditional worship music to lift your spirit and draw you closer to God's presence.",
    category: "Worship",
  },
  {
    id: 4,
    title: "Family Matters",
    time: "3:00 PM - 4:00 PM",
    host: "The Wilsons",
    description:
      "Practical biblical guidance for building strong Christian families, addressing parenting, marriage, and relationships.",
    category: "Family",
  },
  {
    id: 5,
    title: "Youth On Fire",
    time: "5:00 PM - 6:00 PM",
    host: "Pastor Mike",
    description:
      "Dynamic programming for young believers featuring relevant discussions, music, and testimonies from youth around the world.",
    category: "Youth",
  },
  {
    id: 6,
    title: "Evening Praise",
    time: "8:00 PM - 10:00 PM",
    host: "Various Artists",
    description:
      "End your day in worship with two hours of uplifting praise music and peaceful hymns for reflection and rest.",
    category: "Worship",
  },
];

const categories = [
  "All",
  "Devotional",
  "Teaching",
  "Worship",
  "Family",
  "Youth",
];

export function ProgramsSection() {
  const [activeCategory, setActiveCategory] = useState("All");

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
            <span className="text-sm font-medium text-secondary uppercase tracking-wider">
              Our Programs
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground mt-4 text-balance">
              Daily Programming Schedule
            </h2>
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
