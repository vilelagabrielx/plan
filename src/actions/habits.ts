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

      const habits = await prisma.habit.findMany({
        where: { userId, isActive: true },
        include: {
          checkIns: {
            where: {
              date: { gte: todayStart },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return habits.map((h) => ({
        id: h.id,
        title: h.name,
        completedToday: h.checkIns.length > 0,
        type: h.type,
      }));
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
