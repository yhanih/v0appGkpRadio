"use client";

import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
} from "lucide-react";
import { useState } from "react";

export function ListenSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(75);

  return (
    <section id="listen" className="py-24 sm:py-32 bg-primary relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-secondary blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              Listen Live
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-primary-foreground mt-4 mb-6 text-balance">
              Tune In Anytime, Anywhere
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 text-pretty">
              Stream our broadcasts live on any device. Whether you&apos;re at
              home, in your car, or on the go, God Kingdom Principles Radio is
              just a click away.
            </p>

            {/* Platform Links */}
            <div className="flex flex-wrap gap-4">
              {["Apple Podcasts", "Spotify", "Google Podcasts", "TuneIn"].map(
                (platform) => (
                  <Button
                    key={platform}
                    variant="outline"
                    className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                  >
                    {platform}
                  </Button>
                )
              )}
            </div>
          </div>

          {/* Right - Audio Player */}
          <div className="bg-card rounded-2xl p-8 shadow-2xl">
            {/* Now Playing */}
            <div className="text-center mb-8">
              <div className="w-32 h-32 mx-auto rounded-full bg-secondary/20 flex items-center justify-center mb-6 relative">
                <div
                  className={`absolute inset-0 rounded-full border-4 border-secondary/30 ${isPlaying ? "animate-spin" : ""}`}
                  style={{ animationDuration: "3s" }}
                />
                <div className="w-24 h-24 rounded-full bg-secondary/30 flex items-center justify-center">
                  <Volume2 className="w-10 h-10 text-secondary" />
                </div>
              </div>
              <p className="text-sm text-secondary font-medium">Now Playing</p>
              <h3 className="font-serif text-2xl font-semibold text-foreground mt-1">
                Kingdom Principles
              </h3>
              <p className="text-muted-foreground">with Rev. Sarah Johnson</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-300"
                  style={{ width: isPlaying ? "45%" : "0%" }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Live</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  On Air
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Previous"
              >
                <SkipBack className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-secondary/90 transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7 ml-1" />
                )}
              </button>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Next"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="flex-1 h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary"
                aria-label="Volume"
              />
              <span className="text-xs text-muted-foreground w-8">
                {isMuted ? 0 : volume}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
