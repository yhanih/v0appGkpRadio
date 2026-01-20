"use client";

import { useState } from "react";
import { Play, Pause, X, ChevronUp, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useAudioPlayer } from "@/lib/audio-player-context";

export function FloatingAudioPlayer() {
  const { isPlaying, setIsPlaying, isExpanded, setIsExpanded, isVisible, setIsVisible, isMinimized, setIsMinimized } = useAudioPlayer();
  const [progress, setProgress] = useState(35);

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="w-12 h-12 rounded-full bg-[#203E3F] text-white flex items-center justify-center shadow-lg hover:bg-[#2A4A4B] transition-all hover:scale-105 animate-in fade-in zoom-in duration-300"
          aria-label="Maximize player"
        >
          <div className="relative">
            <div className="w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DA072] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2DA072]" />
              </span>
            )}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:bottom-6 z-50 w-auto sm:w-[360px]">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Main Player Bar */}
        <div className="p-3 flex items-center gap-3">
          {/* Album Art */}
          <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#203E3F] to-[#2DA072]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
            {isPlaying && (
              <div className="absolute inset-0 flex items-end justify-center pb-1 gap-0.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-white/80 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 12 + 6}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: "0.5s",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-1.5 py-0.5 bg-[#203E3F] text-white text-[10px] font-medium rounded">
                LIVE
              </span>
            </div>
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              For Your Glory (Official Lyric Video)
            </h4>
            <p className="text-xs text-gray-500 truncate">GKP Radio - Live</p>
          </div>

          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-[#203E3F] text-white flex items-center justify-center hover:bg-[#2A4A4B] transition-colors flex-shrink-0"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>

          {/* Expand/Close Buttons */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Minimize player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-3 pb-3">
          <div className="relative">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2DA072] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Seek"
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>1:24</span>
            <span>4:02</span>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-3 pb-4 pt-2 border-t border-gray-100">
            {/* Current Show Info */}
            <div className="bg-gray-50 rounded-xl p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-[#2DA072] text-white text-[10px] font-medium rounded">
                  Talk
                </span>
                <span className="text-[10px] text-gray-400">Mon-Fri</span>
              </div>
              <h5 className="font-semibold text-gray-900 text-sm">
                Lunch with Jane Peter
              </h5>
              <p className="text-xs text-gray-500 mt-0.5">
                11:00 AM - 12:00 PM • Jane Peter
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 px-3 py-2 bg-[#203E3F] text-white text-xs font-medium rounded-lg hover:bg-[#2A4A4B] transition-colors"
              >
                View Schedule
              </button>
              <button
                type="button"
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                All Podcasts
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
