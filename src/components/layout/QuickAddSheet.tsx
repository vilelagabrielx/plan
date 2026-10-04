"use client";

import React, { useState } from "react";
import { 
  X, 
  Droplets, 
  CheckSquare, 
  Activity, 
  DollarSign, 
  UserPlus, 
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";

interface QuickAddSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickAction: (type: string, data?: any) => void;
}

export function QuickAddSheet({ isOpen, onClose, onQuickAction }: QuickAddSheetProps) {
  const [activeSubView, setActiveSubView] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState("");
  const [waterMl, setWaterMl] = useState(250);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  if (!isOpen) return null;

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
      setActiveSubView(null);
      onClose();
    }, 1200);
  };

  const handleWaterAdd = () => {
    onQuickAction("water", waterMl);
    triggerSuccess(`+${waterMl}ml adicionados ao seu dia! 💧`);
  };

  const handleTaskAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    onQuickAction("task", { title: taskInput });
    triggerSuccess(`Tarefa adicionada com sucesso! ✨`);
    setTaskInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs transition-opacity duration-300">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#1C1822] rounded-t-[32px] p-6 pb-10 shadow-2xl animate-sheet-up border-t border-white/20">
        
        <div className="mx-auto w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mb-5" />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#71556B] dark:text-pink-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#EF7689]" />
              Novo Registro Rápido
            </h2>
            <p className="text-xs text-[#766788] dark:text-gray-400">
              Escolha a ação desejada
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
          <div className="py-12 flex flex-col items-center justify-center text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#FF9B8F]/30 text-[#EF7689] flex items-center justify-center mb-3">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <p className="text-base font-semibold text-[#71556B] dark:text-pink-100">
              {successMsg}
            </p>
          </div>
        ) : activeSubView === "water" ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#766788] dark:text-gray-300">
              Adicionar Consumo de Água
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[250, 500, 750].map((ml) => (
                <button
                  key={ml}
                  onClick={() => setWaterMl(ml)}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    waterMl === ml
                      ? "border-[#EF7689] bg-[#EF7689]/10 text-[#EF7689] font-bold"
                      : "border-gray-200 dark:border-gray-800 text-[#71556B] dark:text-gray-300"
                  }`}
                >
                  <Droplets className="w-6 h-6 mx-auto mb-1 text-[#EF7689]" />
                  <span className="text-sm">+{ml} ml</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setActiveSubView(null)}
                className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium text-sm"
              >
                Voltar
              </button>
              <button
                onClick={handleWaterAdd}
                className="flex-1 py-3 rounded-2xl bg-[#EF7689] text-white font-semibold text-sm shadow-md active:scale-95 transition-all"
              >
                Confirmar +{waterMl}ml
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                onClose();
                router.push("/fisico");
              }}
              className="p-4 rounded-2xl bg-[#EF7689]/15 dark:bg-[#EF7689]/10 border border-[#EF7689]/30 text-left hover:bg-[#EF7689]/25 transition-all flex flex-col justify-between h-28"
            >
              <div className="w-9 h-9 rounded-xl bg-[#EF7689]/30 flex items-center justify-center text-[#EF7689]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#71556B] dark:text-pink-100">
                  + Treino / Exercício
                </p>
                <p className="text-[11px] text-[#EF7689] font-bold">
                  Abrir Módulo Físico
                </p>
              </div>
            </button>

            <button
              onClick={() => setActiveSubView("water")}
              className="p-4 rounded-2xl bg-[#FF9B8F]/15 dark:bg-[#FF9B8F]/10 border border-[#FF9B8F]/30 text-left hover:bg-[#FF9B8F]/25 transition-all flex flex-col justify-between h-28"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FF9B8F]/30 flex items-center justify-center text-[#EF7689]">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#71556B] dark:text-pink-100">
                  + Água
                </p>
                <p className="text-[11px] text-[#766788] dark:text-gray-400">
                  Registrar consumo
                </p>
              </div>
            </button>

            <button
              onClick={() => triggerSuccess("Módulo de Consultório em breve!")}
              className="col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-[#71556B]/10 to-[#EF7689]/10 border border-[#EF7689]/20 flex items-center justify-between hover:opacity-90 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#71556B] text-white flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#71556B] dark:text-pink-100">
                    Sessões de Atendimento
                  </p>
                  <p className="text-[10px] text-[#766788] dark:text-gray-400">
                    Consultório & Pacientes
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-[#9E6A90] bg-[#9E6A90]/15 px-2.5 py-1 rounded-full">
                Em breve
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
