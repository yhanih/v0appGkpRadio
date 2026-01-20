"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, MapPin, Sparkles, MessageSquare, Flame, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";

const prayerRequests = [
  {
    id: 1,
    name: "Sarah",
    location: "Nashville, TN",
    request: "My mother undergoes surgery this week. We are trusting God for a successful procedure and swift recovery.",
    prayers: 847,
    goal: 1000,
    category: "Health",
    urgent: true,
  },
  {
    id: 2,
    name: "Michael",
    location: "Atlanta, GA",
    request: "Final round of job interviews tomorrow morning. Praying for God's favor and peace that surpasses understanding.",
    prayers: 532,
    goal: 500,
    category: "Career",
    urgent: false,
  },
  {
    id: 3,
    name: "Emma",
    location: "Dallas, TX",
    request: "Seeking clarity and strength to maintain my faith and values while navigating my first year in college.",
    prayers: 389,
    goal: 500,
    category: "Youth",
    urgent: false,
  },
];

export function QuickPrayerSection() {
  const [prayed, setPrayed] = useState<number[]>([]);
  const [totalPrayers, setTotalPrayers] = useState(0);

  const handlePray = (id: number) => {
    if (!prayed.includes(id)) {
      setPrayed([...prayed, id]);
      setTotalPrayers(totalPrayers + 1);
    }
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {prayerRequests.map((request) => {
            const hasPrayed = prayed.includes(request.id);
            const currentPrayers = request.prayers + (hasPrayed ? 1 : 0);
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
                  disabled={hasPrayed}
                  className={`w-full mt-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${hasPrayed
                    ? 'bg-secondary/10 text-secondary cursor-default'
                    : 'bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg active:scale-95'
                    }`}
                >
                  {hasPrayed ? (
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

        {/* Footer CTA */}
        <div className="text-center bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-sm">
          <MessageSquare className="w-10 h-10 text-secondary mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-primary-foreground mb-4">Need Prayer?</h3>
          <p className="text-primary-foreground/60 mb-8 max-w-xl mx-auto">
            Our community of thousands is ready to stand with you. Share your request and let us lift it up together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-secondary text-white hover:bg-secondary/90 px-8 py-6 text-lg rounded-2xl w-full sm:w-auto">
              <Link href="/community?category=Prayers">Submit Prayer Request</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent border-white/20 text-primary-foreground hover:bg-white/10 px-8 py-6 text-lg rounded-2xl w-full sm:w-auto">
              <Link href="/community?category=Prayers">View All Requests</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
