"use client";

import React, { useState, useTransition } from "react";
import { 
  Flame, 
  Dumbbell, 
  Footprints, 
  Activity, 
  Sun, 
  Bike, 
  Trash2, 
  Clock, 
  Calendar,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText
} from "lucide-react";
import { deleteActivity } from "@/actions/physical-activity";
import { WeeklyPerformanceChart } from "./WeeklyPerformanceChart";


interface LoggedSetItem {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  exercise: {
    name: string;
  };
}

interface ActivityItem {
  id: string;
  duration: number;
  intensity: string;
  notes?: string | null;
  performedAt: Date | string;
  template?: {
    name: string;
  } | null;
  modality: {
    name: string;
    icon?: string | null;
    color?: string | null;
  };
  loggedSets?: LoggedSetItem[];
}

interface PhysicalActivityFeedProps {
  activities: ActivityItem[];
  onOpenLogModal: () => void;
}

export function PhysicalActivityFeed({ activities, onOpenLogModal }: PhysicalActivityFeedProps) {
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (confirm("Deseja remover esta atividade?")) {
      startTransition(async () => {
        await deleteActivity(id);
      });
    }
  };

  const getModalityIcon = (iconName?: string | null) => {
    switch (iconName) {
      case "Footprints":
        return <Footprints className="w-5 h-5" />;
      case "Activity":
        return <Activity className="w-5 h-5" />;
      case "Sun":
        return <Sun className="w-5 h-5" />;
      case "Bike":
        return <Bike className="w-5 h-5" />;
      default:
        return <Dumbbell className="w-5 h-5" />;
    }
  };

  const formatIntensity = (intensity: string) => {
    switch (intensity) {
      case "LIGHT":
        return "Leve";
      case "HIGH":
        return "Alta";
      default:
        return "Moderada";
    }
  };

  const totalMinutes = activities.reduce((acc, item) => acc + item.duration, 0);
  const weeklyTargetMinutes = 210;
  const progressPercent = Math.min(100, Math.round((totalMinutes / weeklyTargetMinutes) * 100));

  return (
    <div className="space-y-6">
      
      {/* APPLE FITNESS STYLE ACTIVITY RINGS & SUMMARY WIDGET */}
      <div className="p-5 rounded-[26px] bg-gradient-to-br from-[#71556B] via-[#9E6A90] to-[#EF7689] text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-pink-200 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#FF9B8F]" />
              Anel de Atividade Semanal
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              {totalMinutes} <span className="text-sm font-normal text-pink-100">/ {weeklyTargetMinutes} min</span>
            </h2>
            <p className="text-xs text-pink-100 mt-1">
              {progressPercent}% da sua meta semanal atingida
            </p>
          </div>

          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#FF9B8F"
                strokeWidth="7"
                strokeDasharray={200}
                strokeDashoffset={200 - (200 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute text-xs font-extrabold text-white">
              {progressPercent}%
            </span>
          </div>
        </div>

        <button
          onClick={onOpenLogModal}
          className="mt-4 w-full py-3 rounded-2xl bg-white text-[#71556B] font-bold text-xs shadow-md flex items-center justify-center gap-1.5 hover:bg-pink-50 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#EF7689]" /> Registrar Novo Treino
        </button>
      </div>

      {/* GRÁFICO DE DESEMPENHO SEMANAL */}
      <WeeklyPerformanceChart activities={activities} />


      {/* HISTÓRICO RECENTE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#71556B] dark:text-pink-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#9E6A90]" />
            Histórico de Treinos
          </h3>
          <span className="text-xs text-[#766788] dark:text-gray-400">
            {activities.length} registros
          </span>
        </div>

        {activities.length === 0 ? (
          <div className="p-8 rounded-[22px] bg-white dark:bg-[#1C1822] border border-gray-100 dark:border-gray-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FF9B8F]/20 text-[#EF7689] flex items-center justify-center mx-auto">
              <Dumbbell className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#71556B] dark:text-pink-100">
              Nenhum treino registrado ainda
            </p>
            <p className="text-xs text-[#766788] dark:text-gray-400">
              Clique em "+ Registrar Novo Treino" para experimentar a versão Simples ou Ficha Completa.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activities.map((item) => {
              const dateObj = new Date(item.performedAt);
              const formattedDate = dateObj.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });

              const isExpanded = expandedId === item.id;
              const hasSets = item.loggedSets && item.loggedSets.length > 0;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-[22px] bg-white dark:bg-[#1C1822] border border-gray-100 dark:border-gray-800 shadow-xs hover:border-[#EF7689]/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div 
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold shadow-xs"
                        style={{ backgroundColor: item.modality.color || "#EF7689" }}
                      >
                        {getModalityIcon(item.modality.icon)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold text-[#71556B] dark:text-pink-100">
                            {item.modality.name}
                          </h4>
                          {item.template && (
                            <span className="text-[9px] font-extrabold bg-[#9E6A90]/15 text-[#9E6A90] px-2 py-0.5 rounded-full flex items-center gap-1">
                              <FileText className="w-3 h-3" /> {item.template.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[#766788] dark:text-gray-400 mt-0.5">
                          <span className="flex items-center gap-1 font-semibold text-[#EF7689]">
                            <Clock className="w-3 h-3" /> {item.duration} min
                          </span>
                          <span>•</span>
                          <span className="font-medium">
                            Intensidade: {formatIntensity(item.intensity)}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {formattedDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {hasSets && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="p-2 rounded-xl text-[#9E6A90] hover:bg-[#9E6A90]/10 transition-colors text-xs font-bold flex items-center gap-1"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Excluir treino (Soft Delete)"
                        className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* EXPANDABLE LOGGED SETS DETAILS */}
                  {isExpanded && hasSets && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2 animate-fadeIn">
                      <p className="text-[11px] font-bold text-[#71556B] dark:text-pink-100 flex items-center gap-1">
                        📋 Séries & Cargas Gravadas:
                      </p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {item.loggedSets?.map((s) => (
                          <div
                            key={s.id}
                            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-between text-[11px]"
                          >
                            <span className="font-medium text-[#71556B] dark:text-gray-200">
                              {s.exercise.name} (Série {s.setNumber})
                            </span>
                            <span className="font-extrabold text-[#EF7689]">
                              {s.weight} kg × {s.reps} reps
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
