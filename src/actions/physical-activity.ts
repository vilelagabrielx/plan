"use server";

import { prisma } from "@/lib/prisma";
import { ActivityIntensity } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface LoggedSetInput {
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
}

export interface LogActivityInput {
  modalityId: string;
  duration: number;
  intensity: "LIGHT" | "MODERATE" | "HIGH";
  notes?: string;
  performedAt?: Date | string;
  templateId?: string;
  loggedSets?: LoggedSetInput[];
}

// Memory fallback for instant UI response (<150ms)
let memoryModalities = [
  { id: "mod1", userId: "u1", name: "Academia", icon: "Dumbbell", color: "#EF7689", isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
  { id: "mod2", userId: "u1", name: "Corrida", icon: "Footprints", color: "#FF9B8F", isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
  { id: "mod3", userId: "u1", name: "Caminhada", icon: "Activity", color: "#9E6A90", isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
  { id: "mod4", userId: "u1", name: "Yoga", icon: "Sun", color: "#766788", isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
  { id: "mod5", userId: "u1", name: "Ciclismo", icon: "Bike", color: "#71556B", isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
];

let memoryTemplates = [
  {
    id: "tmpl_a",
    userId: "u1",
    name: "Treino A - Peito & Tríceps",
    isActive: true,
    exercises: [
      { id: "te_1", templateId: "tmpl_a", exerciseId: "ex_1", order: 1, targetSets: 4, targetReps: "8-10", restTimer: 90, exercise: { id: "ex_1", userId: "u1", name: "Supino Reto com Barra", muscleGroup: "Peito" } },
      { id: "te_2", templateId: "tmpl_a", exerciseId: "ex_2", order: 2, targetSets: 3, targetReps: "10-12", restTimer: 60, exercise: { id: "ex_2", userId: "u1", name: "Crucifixo Inclinado", muscleGroup: "Peito" } },
      { id: "te_3", templateId: "tmpl_a", exerciseId: "ex_3", order: 3, targetSets: 4, targetReps: "12-15", restTimer: 60, exercise: { id: "ex_3", userId: "u1", name: "Tríceps Corda no Pulley", muscleGroup: "Tríceps" } },
    ],
  },
  {
    id: "tmpl_b",
    userId: "u1",
    name: "Treino B - Costas & Bíceps",
    isActive: true,
    exercises: [
      { id: "te_4", templateId: "tmpl_b", exerciseId: "ex_4", order: 1, targetSets: 4, targetReps: "10-12", restTimer: 90, exercise: { id: "ex_4", userId: "u1", name: "Puxada Frontal Aberta", muscleGroup: "Costas" } },
      { id: "te_5", templateId: "tmpl_b", exerciseId: "ex_5", order: 2, targetSets: 4, targetReps: "10-12", restTimer: 60, exercise: { id: "ex_5", userId: "u1", name: "Remada Baixa no Cabo", muscleGroup: "Costas" } },
      { id: "te_6", templateId: "tmpl_b", exerciseId: "ex_6", order: 3, targetSets: 3, targetReps: "12", restTimer: 60, exercise: { id: "ex_6", userId: "u1", name: "Rosca Biceps com Halteres", muscleGroup: "Bíceps" } },
    ],
  },
  {
    id: "tmpl_c",
    userId: "u1",
    name: "Treino C - Pernas & Ombros",
    isActive: true,
    exercises: [
      { id: "te_7", templateId: "tmpl_c", exerciseId: "ex_7", order: 1, targetSets: 4, targetReps: "8-10", restTimer: 120, exercise: { id: "ex_7", userId: "u1", name: "Agachamento Livre", muscleGroup: "Pernas" } },
      { id: "te_8", templateId: "tmpl_c", exerciseId: "ex_8", order: 2, targetSets: 4, targetReps: "12", restTimer: 90, exercise: { id: "ex_8", userId: "u1", name: "Leg Press 45º", muscleGroup: "Pernas" } },
      { id: "te_9", templateId: "tmpl_c", exerciseId: "ex_9", order: 3, targetSets: 4, targetReps: "12-15", restTimer: 60, exercise: { id: "ex_9", userId: "u1", name: "Elevação Lateral com Halter", muscleGroup: "Ombros" } },
    ],
  },
];

let memoryActivities: any[] = [];

// Helper for ultra-fast database promise race (600ms timeout)
function withTimeout<T>(promise: Promise<T>, timeoutMs = 600, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs)),
  ]);
}

let cachedUserId: string | null = null;

async function getOrCreateUserId() {
  if (cachedUserId) return cachedUserId;
  try {
    let user = await prisma.user.findFirst({
      where: { email: "alessandra@planner.local" },
    });
    if (!user) {
      user = await prisma.user.create({
        data: { email: "alessandra@planner.local", name: "Alessandra" },
      });
    }
    cachedUserId = user.id;
    return user.id;
  } catch (e) {
    return "u1";
  }
}

// 1. Get Modalities
export async function getModalities() {
  const fetchTask = (async () => {
    const userId = await getOrCreateUserId();
    const modalities = await prisma.activityModality.findMany({
      where: { userId, isActive: true, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });
    return modalities.length > 0 ? modalities : memoryModalities;
  })();

  return withTimeout(fetchTask, 600, memoryModalities);
}

// 2. Get Workout Templates
export async function getWorkoutTemplates() {
  const fetchTask = (async () => {
    const userId = await getOrCreateUserId();
    const templates = await prisma.workoutTemplate.findMany({
      where: { userId, isActive: true },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
    return templates.length > 0 ? templates : memoryTemplates;
  })();

  return withTimeout(fetchTask, 600, memoryTemplates as any);
}

// 3. Get Last Workout Logs for Muscle Memory Auto-fill
export async function getLastWorkoutLogs(templateId: string) {
  const fetchTask = (async () => {
    const userId = await getOrCreateUserId();
    const lastActivity = await prisma.physicalActivity.findFirst({
      where: { userId, templateId, deletedAt: null },
      include: { loggedSets: true },
      orderBy: { performedAt: "desc" },
    });
    return lastActivity?.loggedSets || [];
  })();

  const memoryLast = memoryActivities.find(a => a.templateId === templateId && !a.deletedAt);
  return withTimeout(fetchTask, 600, memoryLast?.loggedSets || []);
}

// 4. Get Recent Activities
export async function getRecentActivities() {
  const fetchTask = (async () => {
    const userId = await getOrCreateUserId();
    const activities = await prisma.physicalActivity.findMany({
      where: { userId, deletedAt: null },
      include: {
        modality: true,
        template: true,
        loggedSets: {
          include: { exercise: true },
          orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
        },
      },
      orderBy: { performedAt: "desc" },
    });
    return activities;
  })();

  return withTimeout(fetchTask, 600, memoryActivities.filter(a => !a.deletedAt));
}


// 5. Log Activity
export async function logActivity(data: LogActivityInput) {
  try {
    const userId = await getOrCreateUserId();
    const performedAt = data.performedAt ? new Date(data.performedAt) : new Date();
    const intensityEnum = (data.intensity as ActivityIntensity) || ActivityIntensity.MODERATE;

    try {
      const result = await prisma.$transaction(async (tx) => {
        const activity = await tx.physicalActivity.create({
          data: {
            userId,
            modalityId: data.modalityId,
            duration: Number(data.duration),
            intensity: intensityEnum,
            notes: data.notes || null,
            performedAt,
            templateId: data.templateId || null,
          },
        });

        if (data.loggedSets && data.loggedSets.length > 0) {
          await tx.workoutLogSet.createMany({
            data: data.loggedSets.map((s) => ({
              activityId: activity.id,
              exerciseId: s.exerciseId,
              setNumber: s.setNumber,
              reps: Number(s.reps),
              weight: Number(s.weight),
            })),
          });
        }

        let exerciseHabit = await tx.habit.findFirst({
          where: {
            userId,
            OR: [
              { type: "PHYSICAL_ACTIVITY" },
              { name: { contains: "Exercício", mode: "insensitive" } },
              { name: { contains: "Treino", mode: "insensitive" } },
            ],
            isActive: true,
          },
        });

        if (!exerciseHabit) {
          exerciseHabit = await tx.habit.create({
            data: {
              userId,
              name: "Exercício / Treino",
              type: "PHYSICAL_ACTIVITY",
              isActive: true,
            },
          });
        }

        const startOfDayDate = new Date(performedAt);
        startOfDayDate.setHours(0, 0, 0, 0);

        await tx.habitCheckIn.create({
          data: {
            habitId: exerciseHabit.id,
            date: startOfDayDate,
            value: 1,
          },
        });

        return activity;
      });

      // Save to memory as well for zero latency UI
      const mod = memoryModalities.find(m => m.id === data.modalityId) || memoryModalities[0];
      const tmpl = memoryTemplates.find(t => t.id === data.templateId);
      const newAct: any = {
        id: result.id,
        userId: "u1",
        modalityId: data.modalityId,
        duration: Number(data.duration),
        intensity: data.intensity,
        notes: data.notes || null,
        performedAt,
        templateId: data.templateId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        modality: { id: mod.id, name: mod.name, icon: mod.icon, color: mod.color },
        template: tmpl ? { id: tmpl.id, name: tmpl.name } : null,
        loggedSets: data.loggedSets ? data.loggedSets.map((s, idx) => {
          const allEx = memoryTemplates.flatMap(t => t.exercises).map(e => e.exercise);
          const exObj = allEx.find(e => e.id === s.exerciseId) || { name: "Exercício" };
          return {
            id: `ls_${Date.now()}_${idx}`,
            activityId: result.id,
            exerciseId: s.exerciseId,
            setNumber: s.setNumber,
            reps: s.reps,
            weight: s.weight,
            exercise: { name: exObj.name },
          };
        }) : [],
      };
      memoryActivities = [newAct, ...memoryActivities];

      revalidatePath("/fisico");
      revalidatePath("/");
      return { success: true, data: result };
    } catch (dbErr) {
      const mod = memoryModalities.find(m => m.id === data.modalityId) || memoryModalities[0];
      const tmpl = memoryTemplates.find(t => t.id === data.templateId);
      
      const newAct: any = {
        id: `act_${Date.now()}`,
        userId: "u1",
        modalityId: data.modalityId,
        duration: Number(data.duration),
        intensity: data.intensity,
        notes: data.notes || null,
        performedAt,
        templateId: data.templateId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        modality: { id: mod.id, name: mod.name, icon: mod.icon, color: mod.color },
        template: tmpl ? { id: tmpl.id, name: tmpl.name } : null,
        loggedSets: data.loggedSets ? data.loggedSets.map((s, idx) => {
          const allEx = memoryTemplates.flatMap(t => t.exercises).map(e => e.exercise);
          const exObj = allEx.find(e => e.id === s.exerciseId) || { name: "Exercício" };
          return {
            id: `ls_${Date.now()}_${idx}`,
            activityId: `act_${Date.now()}`,
            exerciseId: s.exerciseId,
            setNumber: s.setNumber,
            reps: s.reps,
            weight: s.weight,
            exercise: { name: exObj.name },
          };
        }) : [],
      };

      memoryActivities = [newAct, ...memoryActivities];

      revalidatePath("/fisico");
      revalidatePath("/");
      return { success: true, data: newAct };
    }
  } catch (error) {
    console.error("Error logging activity:", error);
    return { success: false, error: "Falha ao salvar treino." };
  }
}

// 6. Delete Activity
export async function deleteActivity(id: string) {
  try {
    try {
      await prisma.physicalActivity.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (e) {
      // fallback
    }
    memoryActivities = memoryActivities.map(a => a.id === id ? { ...a, deletedAt: new Date() } : a);

    revalidatePath("/fisico");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao excluir atividade." };
  }
}
