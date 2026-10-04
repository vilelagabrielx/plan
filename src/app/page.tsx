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
  Wallet
} from "lucide-react";
import Link from "next/link";
import { getDashboardHabits, toggleHabitCheckIn, logWaterIntake } from "@/actions/habits";
import { getModalities, getWorkoutTemplates } from "@/actions/physical-activity";
import { LogActivityBottomSheet } from "@/components/fisico/LogActivityBottomSheet";

export default function TodayDashboard() {
  const [activeTab, setActiveTab] = useState("hoje");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [habits, setHabits] = useState<Array<{ id: string; title: string; completedToday: boolean; type: string }>>([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [modalities, setModalities] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  const loadData = async () => {
    const [hData, mData, tData] = await Promise.all([
      getDashboardHabits(),
      getModalities(),
      getWorkoutTemplates(),
    ]);
    setHabits(hData);
    setModalities(mData);
    setTemplates(tData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleQuickAction = async (type: string, data?: any) => {
    if (type === "water") {
      showToast(`+${data || 250}ml de água registrados! 💧`);
      await logWaterIntake(Number(data) || 250);
      loadData();
    }
  };


  const handleToggleHabit = async (id: string, currentStatus: boolean, title: string) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completedToday: !currentStatus } : h));
    if (!currentStatus) {
      showToast(`Hábito "${title}" concluído! 🔥`);
    }
    await toggleHabitCheckIn(id);
    loadData();
  };

  const completedCount = habits.filter(h => h.completedToday).length;


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
        <div className="px-5 pt-4 space-y-6">
          
          {/* iOS Large Title Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#766788] dark:text-gray-400">
                Domingo, 4 de Outubro
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

          {/* CARD DE DESTAQUE: ATIVIDADE FÍSICA */}
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
                Registre seus treinos em 5 segundos ou acompanhe a evolução gráfica do seu desempenho.
              </p>
            </div>
          </Link>

          {/* HÁBITOS DO DIA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#71556B] dark:text-pink-100 tracking-tight flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#EF7689]" />
                Hábitos do Dia
              </h2>
              <span className="text-xs text-[#766788] dark:text-gray-400">
                {completedCount}/{habits.length} concluídos
              </span>
            </div>

            {habits.length === 0 ? (
              <div className="p-4 rounded-[20px] bg-white dark:bg-[#1C1822] border border-gray-100 dark:border-gray-800 text-center text-xs text-[#766788] dark:text-gray-400">
                Nenhum hábito cadastrado no banco de dados.
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 pt-1 -mx-5 px-5">
                {habits.map((habit) => {
                  const isExerciseHabit = habit.title.toLowerCase().includes("exercício") || habit.title.toLowerCase().includes("treino");

                  return (
                    <div
                      key={habit.id}
                      className={`min-w-[170px] p-4 rounded-[22px] border transition-all select-none flex flex-col justify-between h-36 relative ${
                        habit.completedToday
                          ? "bg-[#FF9B8F]/20 border-[#EF7689] text-[#71556B] dark:text-pink-100"
                          : "bg-white dark:bg-[#1C1822] border-gray-100 dark:border-gray-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold bg-[#EF7689]"
                        >
                          {habit.title.toLowerCase().includes("água") ? <Droplets className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleHabit(habit.id, habit.completedToday, habit.title)}
                          title="Marcar/Desmarcar rápido"
                          className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                            habit.completedToday ? "bg-[#EF7689] border-[#EF7689] text-white text-xs font-bold" : "border-gray-300 dark:border-gray-600 text-transparent hover:border-[#EF7689]"
                          }`}
                        >
                          ✓
                        </button>
                      </div>

                      <div>
                        <p className="text-xs font-bold line-clamp-1 text-[#71556B] dark:text-pink-100 mb-1">
                          {habit.title}
                        </p>

                        {isExerciseHabit && (
                          <button
                            type="button"
                            onClick={() => setIsLogModalOpen(true)}
                            className="text-[10px] font-extrabold text-[#EF7689] bg-[#EF7689]/10 hover:bg-[#EF7689]/20 px-2.5 py-1 rounded-full flex items-center gap-1 transition-all"
                          >
                            + Detalhes p/ Gráfico
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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

      {/* MODAL DE REGISTRO DETALHADO */}
      <LogActivityBottomSheet
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        modalities={modalities}
        templates={templates}
        onSuccess={loadData}
      />

    </MobileShell>
  );
}

