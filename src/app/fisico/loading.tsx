import React from "react";
import { Dumbbell, Loader2, Sparkles } from "lucide-react";

export default function FisicoLoading() {
  return (
    <div className="px-5 pt-6 space-y-6 animate-pulse">
      {/* Skeleton Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-28 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="h-8 w-44 bg-gray-300 dark:bg-gray-700 rounded-xl" />
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Skeleton Activity Ring Widget */}
      <div className="p-6 rounded-[26px] bg-gradient-to-br from-[#71556B]/40 to-[#9E6A90]/40 border border-white/10 flex items-center justify-between h-44 shadow-xs">
        <div className="space-y-3 flex-1">
          <div className="h-3 w-32 bg-white/20 rounded-full" />
          <div className="h-7 w-24 bg-white/30 rounded-lg" />
          <div className="h-3 w-40 bg-white/20 rounded-full" />
        </div>
        <div className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#EF7689] animate-spin" />
        </div>
      </div>

      {/* Skeleton Chart */}
      <div className="p-5 rounded-[26px] bg-white dark:bg-[#1C1822] border border-gray-100 dark:border-gray-800 h-40 flex items-end justify-between gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <div 
              className="w-full max-w-[24px] bg-gray-200 dark:bg-gray-800 rounded-t-xl"
              style={{ height: `${(i % 3 + 1) * 25}%` }}
            />
            <div className="h-2 w-4 bg-gray-200 dark:bg-gray-800 rounded-full" />
          </div>
        ))}
      </div>

      {/* Skeleton Feed List */}
      <div className="space-y-3 pt-2">
        <div className="h-4 w-36 bg-gray-200 dark:bg-gray-800 rounded-full" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 rounded-[22px] bg-white dark:bg-[#1C1822] border border-gray-100 dark:border-gray-800 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gray-200 dark:bg-gray-800" />
              <div className="space-y-2">
                <div className="h-3 w-28 bg-gray-200 dark:bg-gray-800 rounded-full" />
                <div className="h-2.5 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
