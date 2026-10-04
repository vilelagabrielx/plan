import React from "react";
import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="px-5 pt-6 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-28 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="h-8 w-44 bg-gray-300 dark:bg-gray-700 rounded-xl" />
        </div>
        <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Featured Card Skeleton */}
      <div className="p-5 rounded-[24px] bg-gradient-to-br from-[#71556B]/30 to-[#EF7689]/30 h-32 flex flex-col justify-between border border-white/10">
        <div className="h-3 w-32 bg-white/20 rounded-full" />
        <div className="h-5 w-52 bg-white/30 rounded-lg" />
        <div className="h-3 w-40 bg-white/20 rounded-full" />
      </div>

      {/* Habits Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-full" />
        <div className="flex gap-3 overflow-hidden">
          <div className="min-w-[160px] h-36 rounded-[22px] bg-gray-200 dark:bg-gray-800" />
          <div className="min-w-[160px] h-36 rounded-[22px] bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  );
}
