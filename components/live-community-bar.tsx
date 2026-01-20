"use client";

import { useState, useEffect } from "react";
import { Heart, MessageCircle, Users } from "lucide-react";

const liveComments = [
  { user: "Sarah", text: "Praying for everyone here 🙏", location: "Nashville" },
  { user: "Michael", text: "This message is so powerful!", location: "Atlanta" },
  { user: "Emma", text: "God is good all the time", location: "Dallas" },
  { user: "David", text: "Amen! Feeling blessed today", location: "Chicago" },
];

export function LiveCommunityBar() {
  const [currentComment, setCurrentComment] = useState(0);
  const [listeners, setListeners] = useState(2847);

  // Rotate comments
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentComment((prev) => (prev + 1) % liveComments.length);
      // Simulate listener count changes
      setListeners((prev) => prev + Math.floor(Math.random() * 10 - 5));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Live Listeners */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-md border border-gray-200 px-3 py-1">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 font-medium text-sm">
                {listeners.toLocaleString()}
              </span>
            </div>
            <span className="text-gray-500 text-xs hidden sm:inline">
              listening
            </span>
          </div>

          {/* Live Comment Stream */}
          <div className="flex-1 min-w-0 max-w-md">
            <div className="bg-white rounded-md px-3 py-1.5 border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-gray-700 font-medium text-xs">
                    {liveComments[currentComment].user}
                  </span>
                  <span className="text-gray-400 text-xs mx-1.5">·</span>
                  <span className="text-gray-500 text-xs">
                    {liveComments[currentComment].location}
                  </span>
                  <p className="text-gray-600 text-xs truncate">
                    {liveComments[currentComment].text}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-md px-2.5 py-1 transition-colors text-xs font-medium"
              aria-label="Send prayer"
            >
              <Heart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pray</span>
            </button>
            <button
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-md px-2.5 py-1 transition-colors text-xs font-medium"
              aria-label="Comment"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
