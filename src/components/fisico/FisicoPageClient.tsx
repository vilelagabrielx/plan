"use client";

import React, { useState } from "react";
import { MobileShell } from "@/components/layout/MobileShell";
import { PhysicalActivityFeed } from "./PhysicalActivityFeed";
import { LogActivityBottomSheet } from "./LogActivityBottomSheet";
import { Plus, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface ModalityItem {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
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
  loggedSets?: Array<{
    id: string;
    setNumber: number;
    reps: number;
    weight: number;
    exercise: {
      name: string;
    };
  }>;
}

interface WorkoutTemplateItem {
  id: string;
  name: string;
  exercises: Array<{
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
  }>;
}

interface FisicoPageClientProps {
  modalities: ModalityItem[];
  activities: ActivityItem[];
  templates: WorkoutTemplateItem[];
}

export function FisicoPageClient({
  modalities,
  activities,
  templates,
}: FisicoPageClientProps) {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const router = useRouter();

  const handleTabChange = (tab: string) => {
    if (tab === "hoje") router.push("/");
    else if (tab === "agenda") router.push("/agenda");
    else if (tab === "clinica") router.push("/clinica");
    else if (tab === "financas") router.push("/financas");
  };

  return (
    <MobileShell activeTab="fisico" onTabChange={handleTabChange}>
      <div className="px-5 pt-4 space-y-6 pb-24 animate-fade-in">
        
        {/* iOS Large Title Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9E6A90]">
              <Heart className="w-4 h-4 text-[#EF7689]" />
              Saúde & Exercícios
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#71556B] dark:text-pink-100 mt-0.5">
              Atividades Físicas
            </h1>
          </div>

          <button
            onClick={() => setIsBottomSheetOpen(true)}
            className="w-10 h-10 rounded-full bg-[#EF7689] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Feed & Ring Stats */}
        <PhysicalActivityFeed
          activities={activities}
          onOpenLogModal={() => setIsBottomSheetOpen(true)}
        />

        {/* Log Bottom Sheet Modal */}
        <LogActivityBottomSheet
          isOpen={isBottomSheetOpen}
          onClose={() => setIsBottomSheetOpen(false)}
          modalities={modalities}
          templates={templates}
          onSuccess={() => router.refresh()}
        />

      </div>
    </MobileShell>
  );
}
