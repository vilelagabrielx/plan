"use client";

import React, { useState, useTransition } from "react";
import { 
  X, 
  Dumbbell, 
  Footprints, 
  Activity, 
  Sun, 
  Bike, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  FileText,
  Check
} from "lucide-react";
import { logActivity, getLastWorkoutLogs, LoggedSetInput } from "@/actions/physical-activity";

interface ModalityOption {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
}

interface TemplateExerciseItem {
  id: string;
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: string;
  exercise: {
    id: string;
    name: string;
    muscleGroup: string;
  };
}

interface WorkoutTemplateItem {
  id: string;
  name: string;
  exercises: TemplateExerciseItem[];
}

interface LogActivityBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  modalities: ModalityOption[];
  templates?: WorkoutTemplateItem[];
  onSuccess?: () => void;
}

interface SetLogState {
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
  checked: boolean;
}

export function LogActivityBottomSheet({
  isOpen,
  onClose,
  modalities,
  templates = [],
  onSuccess,
}: LogActivityBottomSheetProps) {
  const [selectedModalityId, setSelectedModalityId] = useState<string>("");
  const [duration, setDuration] = useState<number>(45);
  const [intensity, setIntensity] = useState<"LIGHT" | "MODERATE" | "HIGH">("MODERATE");
  const [notes, setNotes] = useState("");

  const [isFullTemplateMode, setIsFullTemplateMode] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [setsLog, setSetsLog] = useState<Record<string, SetLogState[]>>({});
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activeModalities = modalities.length > 0 ? modalities : [
    { id: "mod1", name: "Academia", icon: "Dumbbell", color: "#EF7689" },
    { id: "mod2", name: "Corrida", icon: "Footprints", color: "#FF9B8F" },
    { id: "mod3", name: "Caminhada", icon: "Activity", color: "#9E6A90" },
    { id: "mod4", name: "Yoga", icon: "Sun", color: "#766788" },
    { id: "mod5", name: "Ciclismo", icon: "Bike", color: "#71556B" },
  ];

  const effectiveModalityId = selectedModalityId || activeModalities[0]?.id;

  const handleSelectTemplate = async (tmpl: WorkoutTemplateItem) => {
    setSelectedTemplateId(tmpl.id);
    setIsLoadingLogs(true);

    try {
      const pastSets: Array<{ exerciseId: string; setNumber: number; reps: number; weight: number }> = await getLastWorkoutLogs(tmpl.id);
      
      const newSetsLog: Record<string, SetLogState[]> = {};

      tmpl.exercises.forEach((item) => {
        const exId = item.exerciseId;
        const count = item.targetSets || 3;
        const pastForEx = pastSets.filter((s) => s.exerciseId === exId);

        newSetsLog[exId] = Array.from({ length: count }).map((_, idx) => {
          const past = pastForEx.find((p) => p.setNumber === idx + 1);
          return {
            exerciseId: exId,
            setNumber: idx + 1,
            reps: past ? past.reps : 10,
            weight: past ? past.weight : 20,
            checked: true,
          };
        });
      });

      setSetsLog(newSetsLog);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const toggleSetCheck = (exerciseId: string, setIndex: number) => {
    setSetsLog((prev) => {
      const exSets = [...(prev[exerciseId] || [])];
      if (exSets[setIndex]) {
        exSets[setIndex] = {
          ...exSets[setIndex],
          checked: !exSets[setIndex].checked,
        };
      }
      return { ...prev, [exerciseId]: exSets };
    });
  };

  const updateSetVal = (
    exerciseId: string,
    setIndex: number,
    field: "reps" | "weight",
    val: number
  ) => {
    setSetsLog((prev) => {
      const exSets = [...(prev[exerciseId] || [])];
      if (exSets[setIndex]) {
        exSets[setIndex] = {
          ...exSets[setIndex],
          [field]: Math.max(0, val),
        };
      }
      return { ...prev, [exerciseId]: exSets };
    });
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveModalityId) return;

    let compiledLoggedSets: LoggedSetInput[] = [];

    if (isFullTemplateMode && selectedTemplateId) {
      Object.values(setsLog).forEach((sets) => {
        sets.forEach((s) => {
          if (s.checked) {
            compiledLoggedSets.push({
              exerciseId: s.exerciseId,
              setNumber: s.setNumber,
              reps: s.reps,
              weight: s.weight,
            });
          }
        });
      });
    }

    startTransition(async () => {
      const res = await logActivity({
        modalityId: effectiveModalityId,
        duration,
        intensity,
        notes,
        templateId: isFullTemplateMode ? (selectedTemplateId || undefined) : undefined,
        loggedSets: compiledLoggedSets.length > 0 ? compiledLoggedSets : undefined,
      });

      if (res.success) {
        setSuccessMsg("Treino registrado com sucesso! 🔥");
        setTimeout(() => {
          setSuccessMsg(null);
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      }
    });
  };

  const getModalityIcon = (iconName?: string | null) => {
    switch (iconName) {
      case "Footprints":
        return <Footprints className="w-6 h-6" />;
      case "Activity":
        return <Activity className="w-6 h-6" />;
      case "Sun":
        return <Sun className="w-6 h-6" />;
      case "Bike":
        return <Bike className="w-6 h-6" />;
      default:
        return <Dumbbell className="w-6 h-6" />;
    }
  };

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs transition-opacity duration-300">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#1C1822] rounded-t-[32px] p-6 pb-10 shadow-2xl animate-sheet-up border-t border-white/20 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        <div className="mx-auto w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#71556B] dark:text-pink-100 flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#EF7689]" />
              Registrar Treino
            </h2>
            <p className="text-xs text-[#766788] dark:text-gray-400">
              Registro Rápido ou Detalhado por Ficha
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
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#FF9B8F]/30 text-[#EF7689] flex items-center justify-center mb-3 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <p className="text-base font-semibold text-[#71556B] dark:text-pink-100">
              {successMsg}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. SELEÇÃO DE MODALIDADE */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#766788] dark:text-gray-400 mb-2 block">
                Modalidade
              </label>
              <div className="grid grid-cols-5 gap-2">
                {activeModalities.map((mod) => {
                  const isSelected = effectiveModalityId === mod.id;
                  return (
                    <button
                      type="button"
                      key={mod.id}
                      onClick={() => setSelectedModalityId(mod.id)}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                        isSelected
                          ? "border-[#EF7689] bg-[#EF7689]/15 text-[#EF7689] font-bold scale-105 shadow-xs"
                          : "border-gray-200 dark:border-gray-800 text-[#766788] dark:text-gray-400"
                      }`}
                    >
                      <div 
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: mod.color || "#EF7689" }}
                      >
                        {getModalityIcon(mod.icon)}
                      </div>
                      <span className="text-[10px] truncate w-full font-semibold">
                        {mod.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. DURAÇÃO */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#766788] dark:text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Duração
                </label>
                <span className="text-sm font-extrabold text-[#EF7689]">
                  {duration} minutos
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[15, 30, 45, 60].map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setDuration(m)}
                    className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      duration === m
                        ? "bg-[#EF7689] border-[#EF7689] text-white"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-[#71556B] dark:text-gray-300"
                    }`}
                  >
                    +{m}m
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={10}
                max={120}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-[#EF7689] cursor-pointer"
              />
            </div>

            {/* 3. INTENSIDADE (Apple Segmented Control) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#766788] dark:text-gray-400 mb-1.5 block">
                Intensidade
              </label>
              <div className="p-1 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center gap-1 border border-gray-200 dark:border-gray-700">
                {[
                  { key: "LIGHT", label: "Leve" },
                  { key: "MODERATE", label: "Moderada" },
                  { key: "HIGH", label: "Alta" },
                ].map((option) => (
                  <button
                    type="button"
                    key={option.key}
                    onClick={() => setIntensity(option.key as any)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      intensity === option.key
                        ? "bg-[#9E6A90] text-white shadow-sm"
                        : "text-[#766788] dark:text-gray-400"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TOGGLE FICHA DE TREINO */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsFullTemplateMode(!isFullTemplateMode)}
                className={`w-full py-3 px-4 rounded-2xl border flex items-center justify-between transition-all ${
                  isFullTemplateMode
                    ? "bg-[#9E6A90]/15 border-[#9E6A90] text-[#9E6A90]"
                    : "bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-[#71556B] dark:text-gray-300"
                }`}
              >
                <span className="text-xs font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {isFullTemplateMode ? "📝 Ficha de Treino Selecionada" : "📝 Adicionar Ficha de Treino (Opcional)"}
                </span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#9E6A90] text-white">
                  {isFullTemplateMode ? "Ativa" : "Expandir"}
                </span>
              </button>
            </div>

            {/* SEÇÃO DA FICHA DE TREINO */}
            {isFullTemplateMode && (
              <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800 animate-fadeIn">
                
                {/* Carousel of Templates */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#766788] dark:text-gray-400 mb-2 block">
                    Selecione a Ficha
                  </label>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {templates.map((tmpl) => {
                      const isSelected = selectedTemplateId === tmpl.id;
                      return (
                        <button
                          type="button"
                          key={tmpl.id}
                          onClick={() => handleSelectTemplate(tmpl)}
                          className={`px-4 py-2.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all ${
                            isSelected
                              ? "bg-[#EF7689] border-[#EF7689] text-white shadow-xs"
                              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-[#71556B] dark:text-gray-300"
                          }`}
                        >
                          {tmpl.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isLoadingLogs && (
                  <div className="py-4 text-center text-xs text-[#766788] flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#EF7689]" />
                    Carregando histórico do último treino...
                  </div>
                )}

                {currentTemplate && !isLoadingLogs && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#71556B] dark:text-pink-100">
                        {currentTemplate.name}
                      </span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-bold">
                        ⚡ Preenchido com seu último treino
                      </span>
                    </div>

                    {currentTemplate.exercises.map((item) => {
                      const exSets = setsLog[item.exerciseId] || [];
                      return (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#71556B] dark:text-pink-100">
                              {item.order}. {item.exercise.name}
                            </span>
                            <span className="text-[10px] text-[#766788] font-semibold">
                              Meta: {item.targetSets}x ({item.targetReps})
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {exSets.map((s, sIdx) => (
                              <div
                                key={sIdx}
                                className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-colors ${
                                  s.checked
                                    ? "bg-white dark:bg-[#1C1822] border-[#EF7689]/30"
                                    : "bg-gray-100 dark:bg-gray-800/60 border-transparent opacity-60"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => toggleSetCheck(item.exerciseId, sIdx)}
                                    className={`w-5 h-5 rounded-md flex items-center justify-center text-white ${
                                      s.checked ? "bg-[#EF7689]" : "border border-gray-400"
                                    }`}
                                  >
                                    {s.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </button>
                                  <span className="font-semibold text-[#71556B] dark:text-gray-200">
                                    Série {s.setNumber}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      value={s.weight}
                                      onChange={(e) => updateSetVal(item.exerciseId, sIdx, "weight", Number(e.target.value))}
                                      className="w-12 px-1.5 py-0.5 rounded-lg border border-gray-200 dark:border-gray-700 text-center font-bold text-xs bg-gray-50 dark:bg-gray-800 text-[#71556B] dark:text-gray-100"
                                    />
                                    <span className="text-[10px] text-[#766788]">kg</span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      value={s.reps}
                                      onChange={(e) => updateSetVal(item.exerciseId, sIdx, "reps", Number(e.target.value))}
                                      className="w-10 px-1.5 py-0.5 rounded-lg border border-gray-200 dark:border-gray-700 text-center font-bold text-xs bg-gray-50 dark:bg-gray-800 text-[#71556B] dark:text-gray-100"
                                    />
                                    <span className="text-[10px] text-[#766788]">reps</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#EF7689] to-[#FF9B8F] text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Salvando Treino...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Salvar Treino
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
