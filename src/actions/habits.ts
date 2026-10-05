"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

function withTimeout<T>(promise: Promise<T>, timeoutMs = 1200, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs)),
  ]);
}

export async function getDashboardHabits() {
  const fetchTask = (async () => {
    try {
      const userId = await getOrCreateUserId();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // Start of current week (Monday)
      const weekStart = new Date(todayStart);
      const dayOfWeek = weekStart.getDay();
      const diffToMonday = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      weekStart.setDate(diffToMonday);

      const habits = await prisma.habit.findMany({
        where: { userId, isActive: true },
        include: {
          checkIns: {
            where: {
              date: { gte: weekStart },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return habits.map((h) => {
        const todayCheckIns = h.checkIns.filter((c) => new Date(c.date) >= todayStart);
        const todayProgress = todayCheckIns.reduce((sum, c) => sum + c.value, 0);
        
        // Count unique check-in days this week
        const uniqueDaysThisWeek = new Set(
          h.checkIns.map((c) => new Date(c.date).toDateString())
        ).size;

        const targetValue = h.targetValue || (h.type === "WATER" ? 2500 : 1);
        const isCompleted = todayProgress >= targetValue;

        return {
          id: h.id,
          title: h.name,
          type: h.type,
          targetValue,
          targetUnit: h.targetUnit || (h.type === "WATER" ? "ml" : "check"),
          weeklyTargetDays: h.weeklyTargetDays || 5,
          todayProgress,
          completedToday: isCompleted,
          weeklyDaysCount: uniqueDaysThisWeek,
        };
      });
    } catch (error) {
      return [];
    }
  })();

  return withTimeout(fetchTask, 1200, []);
}

export async function toggleHabitCheckIn(habitId: string) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existingCheckIn = await prisma.habitCheckIn.findFirst({
      where: {
        habitId,
        date: { gte: todayStart },
      },
    });

    if (existingCheckIn) {
      await prisma.habitCheckIn.delete({
        where: { id: existingCheckIn.id },
      });
    } else {
      await prisma.habitCheckIn.create({
        data: {
          habitId,
          date: todayStart,
          value: 1,
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/fisico");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao atualizar hábito." };
  }
}

export async function logWaterIntake(amountMl: number) {
  try {
    const userId = await getOrCreateUserId();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let waterHabit = await prisma.habit.findFirst({
      where: {
        userId,
        OR: [
          { type: "WATER" },
          { name: { contains: "Água", mode: "insensitive" } },
        ],
        isActive: true,
      },
    });

    if (!waterHabit) {
      waterHabit = await prisma.habit.create({
        data: {
          userId,
          name: "Beber Água 2.5L",
          type: "WATER",
          targetValue: 2500,
          targetUnit: "ml",
          weeklyTargetDays: 7,
          isActive: true,
        },
      });
    }

    await prisma.habitCheckIn.create({
      data: {
        habitId: waterHabit.id,
        date: todayStart,
        value: amountMl,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao registrar consumo de água." };
  }
}

export async function updateHabitGoal(habitId: string, targetValue: number, weeklyTargetDays?: number) {
  try {
    await prisma.habit.update({
      where: { id: habitId },
      data: {
        targetValue,
        weeklyTargetDays: weeklyTargetDays || undefined,
      },
    });

    revalidatePath("/");
    revalidatePath("/fisico");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao atualizar meta do hábito." };
  }
}
