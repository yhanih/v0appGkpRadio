"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, Users, ChevronLeft, ChevronRight, Calendar, MessageSquare, Clock } from "lucide-react";
import { useState, useEffect } from "react";

const scheduleData = [
  {
    title: "Lunch with Jane Peter",
    time: "11:00 AM – 12:00 PM",
    host: "Jane Peter",
    type: "Talk",
    days: "Mon–Fri",
    description: "A lunchtime session to inspire and engage through biblical truths and stories.",
    listeners: 156,
    isLive: true,
  },
  {
    title: "Kingdom Teachings",
    time: "10:00 AM – 11:00 AM",
    host: "Pastor Myles Monroe",
    type: "Preach",
    days: "Mon–Fri",
    description: "Deep dive into biblical principles for kingdom living and spiritual growth.",
    listeners: 342,
    isLive: false,
  },
  {
    title: "Marriage Talk",
    time: "12:00 PM – 1:00 PM",
    host: "Dustin Scott",
    type: "Marriage",
    days: "Tue & Thu",
    description: "Building stronger marriages through faith-centered conversations and guidance.",
    listeners: 128,
    isLive: false,
  },
  {
    title: "Praise & Worship",
    time: "10:00 PM – 12:00 AM",
    host: "Auto-DJ",
    type: "Music",
    days: "Daily",
    description: "Uplifting worship music to end your day in the presence of God.",
    listeners: 89,
    isLive: false,
  },
];

export function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScheduleIndex((prev) => (prev + 1) % scheduleData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentShow = scheduleData[currentScheduleIndex];

  const nextSlide = () => {
    setCurrentScheduleIndex((prev) => (prev + 1) % scheduleData.length);
  };

  const prevSlide = () => {
    setCurrentScheduleIndex((prev) => (prev - 1 + scheduleData.length) % scheduleData.length);
  };

  return (
    <section className="relative min-h-[85vh] pt-24 pb-16 overflow-hidden">
      {/* Dark Background with subtle gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(13,74,62,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(195,157,72,0.1),transparent_50%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          {/* Top Row - Live Indicator & Quick Stats */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Live Indicator */}
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-red-500/10 border border-red-500/30 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
              </span>
              <span className="text-xs font-extrabold text-red-500 tracking-wider uppercase">LIVE NOW</span>
              <span className="text-sm text-white/90 font-medium">Kingdom Teachings with Pastor Myles Monroe</span>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-8 items-center">
              <div className="flex flex-col items-end">
                <span className="text-2xl font-extrabold text-[#c39d48]">2,500+</span>
                <span className="text-xs text-white/60 uppercase tracking-wide">Family Members</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-extrabold text-[#c39d48]">45k+</span>
                <span className="text-xs text-white/60 uppercase tracking-wide">Prayers Lifted Up</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-extrabold text-[#c39d48]">24/7</span>
                <span className="text-xs text-white/60 uppercase tracking-wide">Live Ministry</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-start">
            {/* Left - Title & CTA */}
            <div className="flex flex-col gap-6">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] text-white tracking-tight">
                Welcome to
                <span className="block bg-gradient-to-r from-[#c39d48] via-[#fbbf24] to-[#c39d48] bg-clip-text text-transparent bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]">
                  God Kingdom Principles Radio
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-white/85 leading-relaxed max-w-xl">
                Join our community of believers in daily inspiration, powerful testimonies, and life-changing conversations about faith, hope, and love.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  size="lg"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`gap-3 px-8 py-6 text-lg font-bold rounded-2xl transition-all duration-300 ${
                    isPlaying
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_20px_rgba(239,68,68,0.4)] animate-[pulse-play_2s_ease-in-out_infinite]"
                      : "bg-[#c39d48] hover:bg-[#fbbf24] text-[#092c25] shadow-[0_4px_20px_rgba(195,157,72,0.3)] hover:shadow-[0_8px_30px_rgba(195,157,72,0.4)] hover:-translate-y-1"
                  }`}
                >
                  <span className="flex items-center justify-center w-8 h-8">
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </span>
                  <span>{isPlaying ? "Stop Listening" : "Start Listening"}</span>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="gap-3 px-8 py-6 text-lg font-semibold rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Users className="w-5 h-5" />
                  <span>Join Community</span>
                </Button>
              </div>
            </div>

            {/* Right - Schedule Card Slideshow */}
            <div className="flex items-start justify-center lg:justify-end">
              <div className="w-full max-w-md">
                {/* Daily Schedule Badge */}
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
                    <Calendar className="w-3 h-3" />
                    Daily Schedule
                  </span>
                </div>

                {/* Schedule Card */}
                <div className="relative bg-white/95 backdrop-blur-xl border border-[#0d4a3e]/15 rounded-3xl p-6 shadow-[0_30px_60px_rgba(0,0,0,0.15)] hover:border-[#0d4a3e]/30 hover:shadow-[0_40px_80px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300">
                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/80 backdrop-blur flex items-center justify-center text-white hover:bg-black/90 hover:scale-110 transition-all z-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/80 backdrop-blur flex items-center justify-center text-white hover:bg-black/90 hover:scale-110 transition-all z-10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Card Content */}
                  <div className="relative z-[1]">
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0d4a3e] text-white text-xs font-bold">
                        <MessageSquare className="w-3 h-3" />
                        {currentShow.type}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {currentShow.days}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-sans text-2xl font-extrabold text-slate-900 leading-tight mb-2">
                      {currentShow.title}
                    </h3>

                    {/* Meta */}
                    <p className="text-sm text-slate-500 mb-4">
                      {currentShow.time} • {currentShow.host}
                    </p>

                    {/* Visual Box */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-[#0d4a3e]/10 flex flex-col items-center justify-center">
                      <div className="text-[#0d4a3e] mb-2">
                        <MessageSquare className="w-12 h-12" />
                      </div>
                      <div className="font-bold text-lg text-slate-900">{currentShow.time}</div>
                      <div className="text-xs text-slate-500">{currentShow.days}</div>
                      {currentShow.isLive && (
                        <span className="absolute top-3 right-3 px-2 py-1 rounded bg-red-500 text-white text-xs font-bold animate-pulse">
                          LIVE
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">
                      {currentShow.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#0d4a3e]/20" />
                        <span className="text-sm font-medium text-slate-900">{currentShow.host}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-sm">
                        <Users className="w-4 h-4" />
                        {currentShow.listeners}
                      </div>
                    </div>

                    {/* Dots */}
                    <div className="flex justify-center gap-1 pt-4">
                      {scheduleData.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentScheduleIndex(i)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            i === currentScheduleIndex
                              ? "w-8 bg-[#0d4a3e]"
                              : "w-2 bg-[#0d4a3e]/30 hover:bg-[#0d4a3e]/50"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animation Keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulse-play {
          0%, 100% { box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 4px 30px rgba(239, 68, 68, 0.6); }
        }
      `}</style>
    </section>
  );
}
