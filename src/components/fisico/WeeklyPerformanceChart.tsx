"use client";

import React from "react";
import { Flame, Activity, Clock, TrendingUp } from "lucide-react";

interface ActivityItem {
  id: string;
  duration: number;
  intensity: string;
  performedAt: Date | string;
}

interface WeeklyPerformanceChartProps {
  activities: ActivityItem[];
}

export function WeeklyPerformanceChart({ activities }: WeeklyPerformanceChartProps) {
  // Get last 7 days starting from 6 days ago up to today
  const days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const daysData = days.map((dayDate) => {
    const dayName = dayDate.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
    const dayFormatted = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    
    // Sum duration for activities performed on this date
    const totalMinutes = activities
      .filter((a) => {
        const actDate = new Date(a.performedAt);
        actDate.setHours(0, 0, 0, 0);
        return actDate.getTime() === dayDate.getTime();
      })
      .reduce((sum, a) => sum + a.duration, 0);

    return {
      date: dayDate,
      label: dayFormatted,
      minutes: totalMinutes,
      isToday: dayDate.getTime() === new Date().setHours(0, 0, 0, 0),
    };
  });

  const maxMinutes = Math.max(60, ...daysData.map((d) => d.minutes));
  const totalWeeklyMinutes = daysData.reduce((sum, d) => sum + d.minutes, 0);
  const activeDaysCount = daysData.filter((d) => d.minutes > 0).length;

  return (
    <div className="p-5 rounded-[26px] bg-white dark:bg-[#1C1822] border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#766788] dark:text-gray-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#EF7689]" />
            Desempenho dos Últimos 7 Dias
          </span>
          <p className="text-lg font-extrabold text-[#71556B] dark:text-pink-100 mt-0.5">
            {totalWeeklyMinutes} min <span className="text-xs font-semibold text-[#766788] dark:text-gray-400">em {activeDaysCount} dias</span>
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-current" /> {activeDaysCount}d Ativos
          </span>
        </div>
      </div>

      {/* BAR CHART */}
      <div className="h-36 flex items-end justify-between gap-2 pt-4 px-1 border-b border-gray-100 dark:border-gray-800">
        {daysData.map((day, idx) => {
          const heightPercent = day.minutes > 0 ? Math.min(100, Math.max(15, (day.minutes / maxMinutes) * 100)) : 6;
          
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end">
              {/* Tooltip on hover */}
              <span className="text-[10px] font-bold text-[#EF7689] opacity-0 group-hover:opacity-100 transition-opacity">
                {day.minutes > 0 ? `${day.minutes}m` : "-"}
              </span>

              {/* Bar */}
              <div 
                className={`w-full max-w-[28px] rounded-t-xl transition-all duration-500 ease-out ${
                  day.isToday
                    ? "bg-gradient-to-t from-[#EF7689] to-[#FF9B8F] shadow-sm shadow-[#EF7689]/40"
                    : day.minutes > 0
                    ? "bg-[#9E6A90]"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
                style={{ height: `${heightPercent}%` }}
              />

              {/* Day Label */}
              <span className={`text-[10px] font-bold capitalize ${
                day.isToday ? "text-[#EF7689]" : "text-[#766788] dark:text-gray-400"
              }`}>
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#766788] dark:text-gray-400 pt-1">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF7689]" /> Hoje
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#9E6A90]" /> Treino Concluído
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-800" /> Sem Registro
        </span>
      </div>
    </div>
  );
}
