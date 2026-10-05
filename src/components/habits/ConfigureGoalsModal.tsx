"use client";

import React, { useState } from "react";
import { X, Settings, Droplets, Dumbbell, Check, Sparkles, Loader2 } from "lucide-react";
import { updateHabitGoal } from "@/actions/habits";

interface HabitGoalItem {
  id: string;
  title: string;
  type: string;
  targetValue: number;
  targetUnit: string;
  weeklyTargetDays: number;
}

interface ConfigureGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: HabitGoalItem[];
  onSuccess: () => void;
}

export function ConfigureGoalsModal({
  isOpen,
  onClose,
  habits,
  onSuccess,
}: ConfigureGoalsModalProps) {
  const waterHabit = habits.find((h) => h.type === "WATER" || h.title.toLowerCase().includes("água"));
  const exerciseHabit = habits.find((h) => h.type === "PHYSICAL_ACTIVITY" || h.title.toLowerCase().includes("exercício"));

  const [waterTarget, setWaterTarget] = useState<number>(waterHabit?.targetValue || 2500);
  const [exerciseDays, setExerciseDays] = useState<number>(exerciseHabit?.weeklyTargetDays || 4);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (waterHabit) {
        await updateHabitGoal(waterHabit.id, waterTarget, 7);
      }
      if (exerciseHabit) {
        await updateHabitGoal(exerciseHabit.id, 45, exerciseDays);
      }

      setSuccessMsg("Metas atualizadas com sucesso! ✨");
      setTimeout(() => {
        setSuccessMsg(null);
        setIsSaving(false);
        onSuccess();
        onClose();
      }, 1000);
    } catch (e) {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#1C1822] rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-sheet-up border-t sm:border border-white/20">
        
        <div className="mx-auto w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-[#71556B] dark:text-pink-100 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#EF7689]" />
              Configurar Metas Pessoais
            </h2>
            <p className="text-xs text-[#766788] dark:text-gray-400">
              Ajuste seus objetivos diários e semanais
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMsg ? (
          <div className="py-10 text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-2 animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <p className="text-sm font-bold text-[#71556B] dark:text-pink-100">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* META DE ÁGUA */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#71556B] dark:text-pink-100 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-[#EF7689]" /> Meta Diária de Água
                </span>
                <span className="text-sm font-extrabold text-[#EF7689]">
                  {(waterTarget / 1000).toFixed(1)} Litros
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[2000, 2500, 3000].map((ml) => (
                  <button
                    type="button"
                    key={ml}
                    onClick={() => setWaterTarget(ml)}
                    className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                      waterTarget === ml
                        ? "bg-[#EF7689] border-[#EF7689] text-white shadow-xs"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-[#71556B] dark:text-gray-300"
                    }`}
                  >
                    {(ml / 1000).toFixed(1)}L ({(ml)}ml)
                  </button>
                ))}
              </div>
            </div>

            {/* META DE TREINOS SEMANAIS */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#71556B] dark:text-pink-100 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-[#9E6A90]" /> Treinos por Semana
                </span>
                <span className="text-sm font-extrabold text-[#9E6A90]">
                  {exerciseDays} dias / semana
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[3, 4, 5, 6].map((days) => (
                  <button
                    type="button"
                    key={days}
                    onClick={() => setExerciseDays(days)}
                    className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                      exerciseDays === days
                        ? "bg-[#9E6A90] border-[#9E6A90] text-white shadow-xs"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-[#71556B] dark:text-gray-300"
                    }`}
                  >
                    {days} dias
                  </button>
                ))}
              </div>
            </div>

            {/* BOTÃO SALVAR */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#EF7689] to-[#FF9B8F] text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando Metas...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Salvar Minhas Metas
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
