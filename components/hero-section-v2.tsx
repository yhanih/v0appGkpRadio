"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Users, Radio, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSectionV2() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlayed, setAutoPlayed] = useState(false);
  const [liveListeners] = useState(2847); // Dynamic in production

  // Auto-play preview after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!autoPlayed) {
        // Would trigger 5-second audio preview
        setAutoPlayed(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [autoPlayed]);

  const currentShow = {
    title: "Kingdom Teachings with Pastor Myles Monroe",
    time: "LIVE NOW",
    category: "Teaching",
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a1f1e] via-[#203E3F] to-[#0a1f1e]">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#2DA072] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#c39d48] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Live Indicator Bar */}
      <div className="absolute top-0 left-0 right-0 bg-red-600/90 backdrop-blur-sm py-2 z-10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-4 text-white text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="font-bold">LIVE NOW</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">{currentShow.title}</span>
          <span className="hidden md:inline">•</span>
          <div className="hidden md:flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="font-semibold">{liveListeners.toLocaleString()} listening</span>
            <TrendingUp className="w-3 h-3 text-green-300" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-12">
        {/* Small Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
          <Radio className="w-4 h-4 text-[#2DA072]" />
          <span className="text-white text-sm font-medium">24/7 Faith-Based Radio</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Listen to
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#2DA072] via-[#c39d48] to-[#2DA072] animate-gradient">
            God&apos;s Word Live
          </span>
        </h1>

        {/* Value Prop */}
        <p className="text-xl sm:text-2xl text-white/80 mb-4 max-w-2xl mx-auto">
          Join {(liveListeners / 1000).toFixed(1)}K+ believers listening right now
        </p>
        <p className="text-base text-white/60 mb-12 max-w-xl mx-auto">
          Powerful teachings, worship music, and a global community of faith—all in one place.
        </p>

        {/* MASSIVE CTA */}
        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            onClick={() => setIsPlaying(!isPlaying)}
            className="relative group h-20 px-12 text-2xl font-bold bg-gradient-to-r from-[#2DA072] to-[#25886b] hover:from-[#25886b] hover:to-[#2DA072] text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
          >
            {/* Pulsing ring when not playing */}
            {!isPlaying && (
              <span className="absolute -inset-1 bg-[#2DA072] rounded-2xl opacity-30 group-hover:opacity-50 animate-pulse" />
            )}
            
            <span className="relative flex items-center gap-4">
              {isPlaying ? (
                <>
                  <Pause className="w-8 h-8" />
                  <span>Stop Listening</span>
                </>
              ) : (
                <>
                  <Play className="w-8 h-8 ml-1" />
                  <span>Start Listening Free</span>
                </>
              )}
            </span>
          </Button>

          {/* Social Proof */}
          <div className="flex items-center gap-6 text-white/70 text-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2DA072] to-[#c39d48] border-2 border-[#0a1f1e]"
                />
              ))}
              <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-[#0a1f1e] flex items-center justify-center text-xs font-bold">
                +2K
              </div>
            </div>
            <span>Join the community</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-16 max-w-2xl mx-auto">
          {[
            { label: "Daily Shows", value: "24/7" },
            { label: "Believers", value: "2.5K+" },
            { label: "Prayers", value: "45K+" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-[#2DA072] mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-white/60 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
