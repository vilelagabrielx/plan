"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Home, 
  CalendarDays, 
  Plus, 
  Brain, 
  Wallet, 
  Wifi, 
  Battery, 
  Signal,
  Moon,
  Sun,
  Dumbbell
} from "lucide-react";

import { QuickAddSheet } from "./QuickAddSheet";

interface MobileShellProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onQuickAction?: (type: string, data?: any) => void;
}

export function MobileShell({ 
  children, 
  activeTab = "hoje", 
  onTabChange,
  onQuickAction 
}: MobileShellProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [isDarkMode, mounted]);

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  const handleQuickAction = (type: string, data?: any) => {
    if (onQuickAction) onQuickAction(type, data);
  };

  return (
    <div 
      suppressHydrationWarning
      className={`min-h-screen bg-[#E5E5EA] dark:bg-[#09070D] flex items-center justify-center p-0 sm:p-4 md:p-6 font-sans antialiased ${isDarkMode ? "dark" : ""}`}
    >
      {/* iPhone 11 Container Frame */}
      <div 
        suppressHydrationWarning
        className="relative w-full max-w-[430px] h-[100vh] sm:h-[880px] bg-white dark:bg-[#141118] sm:rounded-[48px] shadow-2xl sm:ring-1 sm:ring-black/10 overflow-hidden flex flex-col transition-colors duration-300"
      >
        
        {/* iOS Status Bar */}
        <div 
          suppressHydrationWarning
          className="w-full pt-safe px-7 pt-3 pb-1 flex items-center justify-between z-40 text-[#71556B] dark:text-pink-100 text-xs font-semibold select-none bg-white/80 dark:bg-[#141118]/85 backdrop-blur-md border-b border-gray-100 dark:border-white/5"
        >
          <div className="flex items-center gap-2" suppressHydrationWarning>
            <span suppressHydrationWarning>09:41</span>
            {mounted && (
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                title="Alternar Modo Claro/Escuro"
                className="p-1 rounded-full bg-gray-100 dark:bg-gray-800 text-amber-500 dark:text-purple-300 hover:scale-110 active:scale-95 transition-all ml-1"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full hidden sm:block shadow-inner" />

          <div className="flex items-center gap-1.5 opacity-90">
            <Signal className="w-3.5 h-3.5 fill-current" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Scrollable Page Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-28" suppressHydrationWarning>
          {children}
        </main>

        {/* iOS Translucent Bottom Navigation Bar */}
        <nav 
          suppressHydrationWarning
          className="absolute bottom-0 inset-x-0 z-40 glass-nav px-3 pt-2 pb-safe mb-1 flex items-center justify-around"
        >
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
              currentTab === "hoje"
                ? "text-[#EF7689] font-bold"
                : "text-[#766788] dark:text-gray-400 font-medium hover:text-[#EF7689]"
            }`}
          >
            <Home className="w-6 h-6 stroke-[2]" />
            <span className="text-[10px] mt-0.5 tracking-tight">Hoje</span>
          </Link>

          <Link
            href="/fisico"
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
              currentTab === "fisico"
                ? "text-[#EF7689] font-bold"
                : "text-[#766788] dark:text-gray-400 font-medium hover:text-[#EF7689]"
            }`}
          >
            <Dumbbell className="w-6 h-6 stroke-[2]" />
            <span className="text-[10px] mt-0.5 tracking-tight">Treinos</span>
          </Link>

          <button
            onClick={() => setIsQuickAddOpen(true)}
            aria-label="Adicionar Rápido"
            className="-mt-5 w-14 h-14 rounded-full bg-gradient-to-tr from-[#EF7689] to-[#FF9B8F] text-white flex items-center justify-center shadow-lg shadow-[#EF7689]/40 active:scale-90 transition-all glow-coral border-2 border-white dark:border-[#141118]"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>

          <button
            onClick={() => handleTabClick("agenda")}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
              currentTab === "agenda"
                ? "text-[#EF7689] font-bold"
                : "text-[#766788] dark:text-gray-400 font-medium hover:text-[#EF7689]"
            }`}
          >
            <CalendarDays className="w-6 h-6 stroke-[2]" />
            <span className="text-[10px] mt-0.5 tracking-tight">Agenda</span>
          </button>

          <button
            onClick={() => handleTabClick("clinica")}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
              currentTab === "clinica"
                ? "text-[#EF7689] font-bold"
                : "text-[#766788] dark:text-gray-400 font-medium hover:text-[#EF7689]"
            }`}
          >
            <Brain className="w-6 h-6 stroke-[2]" />
            <span className="text-[10px] mt-0.5 tracking-tight">Clínica</span>
          </button>
        </nav>


        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-400/50 dark:bg-gray-600/50 rounded-full z-50 pointer-events-none" />

        <QuickAddSheet
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onQuickAction={handleQuickAction}
        />
      </div>
    </div>
  );
}
