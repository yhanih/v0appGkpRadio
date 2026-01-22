"use client";

import Link from "next/link";
import { Heart, MessageCircle, Users } from "lucide-react";

export function LiveCommunityBar() {
  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Community Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-md border border-gray-200 px-3 py-1">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 font-medium text-sm">
                Join Our Community
              </span>
            </div>
          </div>

          {/* Community Message */}
          <div className="flex-1 min-w-0 max-w-md">
            <div className="bg-white rounded-md px-3 py-1.5 border border-gray-200">
              <p className="text-gray-600 text-xs">
                Connect with believers worldwide. Share prayers, testimonies, and encouragement.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/community?category=Prayers"
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-md px-2.5 py-1 transition-colors text-xs font-medium"
            >
              <Heart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pray</span>
            </Link>
            <Link
              href="/community"
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-md px-2.5 py-1 transition-colors text-xs font-medium"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Community</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
