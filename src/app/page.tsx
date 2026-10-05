"use client";

import React, { useState, useEffect } from "react";
import { MobileShell } from "@/components/layout/MobileShell";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Droplets, 
  Flame, 
  Activity, 
  Plus, 
  Sparkles,
  Calendar as CalendarIcon,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
  Heart,
  Brain,
  Wallet,
  Settings,
  Dumbbell,
  Check,
  Trophy,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { getDashboardHabits, toggleHabitCheckIn, logWaterIntake } from "@/actions/habits";
import { getModalities, getWorkoutTemplates } from "@/actions/physical-activity";
import { LogActivityBottomSheet } from "@/components/fisico/LogActivityBottomSheet";
import { ConfigureGoalsModal } from "@/components/habits/ConfigureGoalsModal";

interface HabitItem {
  id: string;
  title: string;
  type: string;
  targetValue: number;
  targetUnit: string;
  weeklyTargetDays: number;
  todayProgress: number;
  completedToday: boolean;
  weeklyDaysCount: number;
}

function DashboardSkeleton() {
  return (
    <div className="px-5 pt-4 space-y-6 pb-24 animate-skeleton">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded-2xl" />
        </div>
        <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Destaque Banner Skeleton */}
      <div className="p-5 rounded-[24px] bg-gray-200 dark:bg-gray-800/60 h-36 flex flex-col justify-between border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <div className="h-3.5 w-32 bg-gray-300 dark:bg-gray-700 rounded-full" />
          <div className="h-6 w-36 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-56 bg-gray-300 dark:bg-gray-700 rounded-lg" />
          <div className="h-3.5 w-44 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>
      </div>

      {/* Metas & Hábitos Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-44 bg-gray-300 dark:bg-gray-700 rounded-lg" />
            <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded-full" />
          </div>
          <div className="h-7 w-28 bg-gray-200 dark:bg-gray-800 rounded-full" />
        </div>

        {/* Card Água Skeleton */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-[#1C1822] border border-gray-100 dark:border-gray-800 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-gray-800" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded-full" />
              </div>
            </div>
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full" />
          <div className="flex gap-2 pt-1">
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>
        </div>

        {/* Card Exercícios Skeleton */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-[#1C1822] border border-gray-100 dark:border-gray-800 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-gray-800" />
              <div className="space-y-1.5">
                <div className="h-4 w-36 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                <div className="h-3 w-28 bg-gray-200 dark:bg-gray-800 rounded-full" />
              </div>
            </div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>
          <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function TodayDashboard() {
  const [activeTab, setActiveTab] = useState("hoje");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [modalities, setModalities] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingHabitId, setUpdatingHabitId] = useState<string | null>(null);
  const [isWaterAdding, setIsWaterAdding] = useState(false);

  const loadData = async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const [hData, mData, tData] = await Promise.all([
        getDashboardHabits(),
        getModalities(),
        getWorkoutTemplates(),
      ]);
      setHabits(hData);
      setModalities(mData);
      setTemplates(tData);
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleQuickAction = async (type: string, data?: any) => {
    if (type === "water") {
      const amount = Number(data) || 250;
      setIsWaterAdding(true);
      showToast(`+${amount}ml de água registrados! 💧`);
      try {
        await logWaterIntake(amount);
        await loadData();
      } finally {
        setIsWaterAdding(false);
      }
    }
  };

  const handleToggleHabit = async (id: string, currentStatus: boolean, title: string) => {
    setUpdatingHabitId(id);
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completedToday: !currentStatus } : h));
    if (!currentStatus) {
      showToast(`Hábito "${title}" concluído! 🔥`);
    }
    try {
      await toggleHabitCheckIn(id);
      await loadData();
    } finally {
      setUpdatingHabitId(null);
    }
  };

  const waterHabit = habits.find(h => h.type === "WATER" || h.title.toLowerCase().includes("água"));
  const exerciseHabit = habits.find(h => h.type === "PHYSICAL_ACTIVITY" || h.title.toLowerCase().includes("exercício") || h.title.toLowerCase().includes("treino"));
  const otherHabits = habits.filter(h => h.id !== waterHabit?.id && h.id !== exerciseHabit?.id);

  const completedCount = habits.filter(h => h.completedToday).length;

  const todayDateFormatted = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const capitalizedDate = todayDateFormatted.charAt(0).toUpperCase() + todayDateFormatted.slice(1);

  return (
    <MobileShell 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      onQuickAction={handleQuickAction}
    >

      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#71556B] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#FF9B8F]" />
          {toastMessage}
        </div>
      )}

      {/* HOJE TAB */}
      {activeTab === "hoje" && (
        isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="px-5 pt-4 space-y-6 pb-24 animate-fade-in">
            {/* iOS Large Title Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#766788] dark:text-gray-400">
                  {capitalizedDate}
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#71556B] dark:text-pink-100">
                  Olá, Alessandra 👋
                </h1>
              </div>
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#EF7689] to-[#9E6A90] text-white font-extrabold text-base flex items-center justify-center shadow-md ring-2 ring-[#EF7689]/30">
                  A
                </div>
              </div>
            </div>

            {/* CARD DE DESTAQUE: ATIVIDADE FÍSICA & EVOLUÇÃO */}
            <Link href="/fisico" className="block">
              <div className="p-5 rounded-[24px] bg-gradient-to-br from-[#71556B] via-[#9E6A90] to-[#EF7689] text-white shadow-lg relative overflow-hidden group hover:scale-[1.01] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-200 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-[#FF9B8F]" />
                    Saúde & Movimento
                  </span>
                  <span className="text-xs font-extrabold bg-white/20 px-3 py-1 rounded-full text-white flex items-center gap-1">
                    Ver Treinos & Gráficos <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                <p className="text-base font-bold text-white mb-1">
                  Atividades Físicas & Fichas de Treino
                </p>
                <p className="text-xs text-pink-100">
                  Acompanhe gráficos de carga, ritmo e fichas personalizadas.
                </p>
              </div>
            </Link>

            {/* HÁBITOS & METAS */}
            <div className="space-y-4">
              
              {/* Seção Header com Botão Ajustar Metas */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-[#71556B] dark:text-pink-100 tracking-tight flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[#EF7689]" />
                    Metas & Hábitos do Dia
                  </h2>
                  <p className="text-xs text-[#766788] dark:text-gray-400">
                    {completedCount} de {habits.length} metas atingidas hoje
                  </p>
                </div>

                <button
                  onClick={() => setIsGoalsModalOpen(true)}
                  className="text-xs font-bold text-[#EF7689] bg-[#EF7689]/10 hover:bg-[#EF7689]/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Ajustar Metas
                </button>
              </div>

              {/* CARD 1: BEBER ÁGUA */}
              {waterHabit && (
                <div className="p-4 rounded-[22px] bg-white dark:bg-[#1C1822] border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
                        <Droplets className="w-5 h-5 fill-cyan-500/20" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#71556B] dark:text-pink-100">
                          Hidratação (Água)
                        </h3>
                        <p className="text-xs text-[#766788] dark:text-gray-400">
                          Meta: {(waterHabit.targetValue / 1000).toFixed(1)}L por dia
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400">
                        {waterHabit.todayProgress} / {waterHabit.targetValue} ml
                      </span>
                      <p className="text-[10px] font-bold text-gray-400">
                        {Math.min(100, Math.round((waterHabit.todayProgress / waterHabit.targetValue) * 100))}% concluído
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (waterHabit.todayProgress / waterHabit.targetValue) * 100)}%` }}
                    />
                  </div>

                  {/* Quick Add Buttons */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleQuickAction("water", 250)}
                        disabled={isWaterAdding}
                        className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-extrabold text-xs hover:bg-cyan-100 transition-all border border-cyan-200/50 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isWaterAdding ? <Loader2 className="w-3 h-3 animate-spin text-cyan-600" /> : null}
                        + 250ml
                      </button>
                      <button
                        onClick={() => handleQuickAction("water", 500)}
                        disabled={isWaterAdding}
                        className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-extrabold text-xs hover:bg-cyan-100 transition-all border border-cyan-200/50 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isWaterAdding ? <Loader2 className="w-3 h-3 animate-spin text-cyan-600" /> : null}
                        + 500ml
                      </button>
                    </div>

                    {waterHabit.completedToday && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 px-3 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Meta do Dia OK!
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* CARD 2: EXERCÍCIO / TREINO */}
              {exerciseHabit && (
                <div className="p-4 rounded-[22px] bg-white dark:bg-[#1C1822] border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#EF7689]/10 text-[#EF7689] flex items-center justify-center font-bold">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#71556B] dark:text-pink-100">
                          Exercícios & Treinos
                        </h3>
                        <p className="text-xs text-[#766788] dark:text-gray-400">
                          Meta semanal: {exerciseHabit.weeklyTargetDays} dias por semana
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#EF7689]">
                        {exerciseHabit.weeklyDaysCount} de {exerciseHabit.weeklyTargetDays} dias
                      </span>
                      <p className="text-[10px] font-bold text-gray-400">
                        nesta semana
                      </p>
                    </div>
                  </div>

                  {/* Day Dots Indicator */}
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    {Array.from({ length: exerciseHabit.weeklyTargetDays }).map((_, idx) => {
                      const isDone = idx < exerciseHabit.weeklyDaysCount;
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <div 
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all ${
                              isDone 
                                ? "bg-[#EF7689] text-white shadow-xs" 
                                : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                            }`}
                          >
                            {isDone ? "✓" : idx + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setIsLogModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#EF7689] text-white font-extrabold text-xs shadow-xs hover:bg-[#9E6A90] transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Registrar Treino Hoje
                    </button>

                    <button
                      onClick={() => handleToggleHabit(exerciseHabit.id, exerciseHabit.completedToday, exerciseHabit.title)}
                      disabled={updatingHabitId === exerciseHabit.id}
                      className={`text-xs font-bold px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                        exerciseHabit.completedToday
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-gray-200 dark:border-gray-700 text-gray-500"
                      }`}
                    >
                      {updatingHabitId === exerciseHabit.id ? (
                        <Loader2 className="w-3 h-3 animate-spin text-[#EF7689]" />
                      ) : null}
                      {exerciseHabit.completedToday ? "✓ Concluído hoje" : "Marcar feito hoje"}
                    </button>
                  </div>
                </div>
              )}

              {/* CARD 3: OUTROS HÁBITOS */}
              {otherHabits.length > 0 && (
                <div className="p-4 rounded-[22px] bg-white dark:bg-[#1C1822] border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#766788] dark:text-gray-400 mb-2">
                    Outros Hábitos Diários
                  </h3>

                  <div className="space-y-2">
                    {otherHabits.map((habit) => (
                      <div 
                        key={habit.id}
                        onClick={() => handleToggleHabit(habit.id, habit.completedToday, habit.title)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          habit.completedToday
                            ? "bg-pink-50/50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-900"
                            : "bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                            habit.completedToday ? "bg-[#EF7689] border-[#EF7689] text-white" : "border-gray-300 dark:border-gray-600 text-transparent"
                          }`}>
                            {updatingHabitId === habit.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                            ) : (
                              "✓"
                            )}
                          </div>
                          <span className={`text-xs font-bold ${habit.completedToday ? "line-through text-gray-400" : "text-[#71556B] dark:text-pink-100"}`}>
                            {habit.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          {/* OUTRAS ÁREAS */}
          <div className="space-y-3">
            <h2 className="text-lg font-extrabold text-[#71556B] dark:text-pink-100 tracking-tight">
              Outras Áreas
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-[20px] bg-white dark:bg-[#1C1822] border border-gray-100 dark:border-gray-800 text-center">
                <CalendarIcon className="w-6 h-6 text-[#9E6A90] mx-auto mb-1" />
                <p className="text-xs font-bold text-[#71556B] dark:text-pink-100">Agenda & Calendário</p>
                <span className="text-[10px] font-bold text-[#9E6A90] bg-[#9E6A90]/10 px-2.5 py-0.5 rounded-full inline-block mt-1.5">
                  Em breve
                </span>
              </div>

              <div className="p-4 rounded-[20px] bg-white dark:bg-[#1C1822] border border-gray-100 dark:border-gray-800 text-center">
                <Brain className="w-6 h-6 text-[#EF7689] mx-auto mb-1" />
                <p className="text-xs font-bold text-[#71556B] dark:text-pink-100">Atendimentos Clínicos</p>
                <span className="text-[10px] font-bold text-[#9E6A90] bg-[#9E6A90]/10 px-2.5 py-0.5 rounded-full inline-block mt-1.5">
                  Em breve
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    )}

      {/* AGENDA TAB */}
      {activeTab === "agenda" && (
        <div className="px-5 pt-6 text-center py-20 space-y-3">
          <CalendarIcon className="w-12 h-12 text-[#9E6A90] mx-auto" />
          <h2 className="text-xl font-bold text-[#71556B] dark:text-pink-100">Agenda Pessoal</h2>
          <span className="px-3.5 py-1 rounded-full bg-[#9E6A90]/15 text-[#9E6A90] font-bold text-xs inline-block">
            Em breve
          </span>
        </div>
      )}

      {/* CLÍNICA TAB */}
      {activeTab === "clinica" && (
        <div className="px-5 pt-6 text-center py-20 space-y-3">
          <Brain className="w-12 h-12 text-[#9E6A90] mx-auto" />
          <h2 className="text-xl font-bold text-[#71556B] dark:text-pink-100">Consultório & Pacientes</h2>
          <span className="px-3.5 py-1 rounded-full bg-[#9E6A90]/15 text-[#9E6A90] font-bold text-xs inline-block">
            Em breve
          </span>
        </div>
      )}

      {/* FINANÇAS TAB */}
      {activeTab === "financas" && (
        <div className="px-5 pt-6 text-center py-20 space-y-3">
          <Wallet className="w-12 h-12 text-[#9E6A90] mx-auto" />
          <h2 className="text-xl font-bold text-[#71556B] dark:text-pink-100">Finanças Pessoais</h2>
          <span className="px-3.5 py-1 rounded-full bg-[#9E6A90]/15 text-[#9E6A90] font-bold text-xs inline-block">
            Em breve
          </span>
        </div>
      )}

      {/* MODAL DE REGISTRO DETALHADO DE TREINO */}
      <LogActivityBottomSheet
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        modalities={modalities}
        templates={templates}
        onSuccess={loadData}
      />

      {/* MODAL DE CONFIGURAÇÃO DE METAS */}
      <ConfigureGoalsModal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        habits={habits}
        onSuccess={loadData}
      />

    </MobileShell>
  );
}


