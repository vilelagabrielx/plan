import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding hybrid workout templates on Supabase database...");

  // 1. User Alessandra
  let user = await prisma.user.findFirst({
    where: { email: "alessandra@planner.local" },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "alessandra@planner.local",
        name: "Alessandra",
      },
    });
  }

  console.log(`User created/found: ${user.id} (${user.name})`);

  // 2. Default Habits in Database
  const defaultHabits = [
    { name: "Exercício / Treino", type: "PHYSICAL_ACTIVITY", targetValue: 45, targetUnit: "min", weeklyTargetDays: 4 },
    { name: "Beber Água 2.5L", type: "WATER", targetValue: 2500, targetUnit: "ml", weeklyTargetDays: 7 },
    { name: "Leitura 15 min", type: "CUSTOM", targetValue: 15, targetUnit: "min", weeklyTargetDays: 5 },
  ];

  for (const h of defaultHabits) {
    const existing = await prisma.habit.findFirst({
      where: { userId: user.id, name: h.name },
    });
    if (!existing) {
      await prisma.habit.create({
        data: {
          userId: user.id,
          name: h.name,
          type: h.type,
          targetValue: h.targetValue,
          targetUnit: h.targetUnit,
          weeklyTargetDays: h.weeklyTargetDays,
          isActive: true,
        },
      });
    } else {
      await prisma.habit.update({
        where: { id: existing.id },
        data: {
          targetValue: h.targetValue,
          targetUnit: h.targetUnit,
          weeklyTargetDays: h.weeklyTargetDays,
        },
      });
    }
  }



  // 3. Modalities
  const defaultModalities = [
    { name: "Academia", icon: "Dumbbell", color: "#EF7689" },
    { name: "Corrida", icon: "Footprints", color: "#FF9B8F" },
    { name: "Caminhada", icon: "Activity", color: "#9E6A90" },
    { name: "Yoga", icon: "Sun", color: "#766788" },
    { name: "Ciclismo", icon: "Bike", color: "#71556B" },
  ];

  for (const mod of defaultModalities) {
    const existing = await prisma.activityModality.findFirst({
      where: { userId: user.id, name: mod.name, deletedAt: null },
    });
    if (!existing) {
      await prisma.activityModality.create({
        data: {
          userId: user.id,
          name: mod.name,
          icon: mod.icon,
          color: mod.color,
          isActive: true,
        },
      });
    }
  }

  // 4. Master Exercises Catalog
  const exerciseCatalog = [
    { name: "Supino Reto com Barra", muscleGroup: "Peito" },
    { name: "Crucifixo Inclinado com Halteres", muscleGroup: "Peito" },
    { name: "Tríceps Corda no Pulley", muscleGroup: "Tríceps" },
    { name: "Puxada Frontal Aberta", muscleGroup: "Costas" },
    { name: "Remada Baixa no Cabo", muscleGroup: "Costas" },
    { name: "Rosca Biceps com Halteres", muscleGroup: "Bíceps" },
    { name: "Agachamento Livre", muscleGroup: "Pernas" },
    { name: "Leg Press 45º", muscleGroup: "Pernas" },
    { name: "Elevação Lateral com Halter", muscleGroup: "Ombros" },
  ];

  const createdExercises: Record<string, string> = {};

  for (const item of exerciseCatalog) {
    let ex = await prisma.exercise.findFirst({
      where: { userId: user.id, name: item.name },
    });
    if (!ex) {
      ex = await prisma.exercise.create({
        data: {
          userId: user.id,
          name: item.name,
          muscleGroup: item.muscleGroup,
        },
      });
    }
    createdExercises[item.name] = ex.id;
  }

  // 5. Pre-built Workout Templates
  const templateA = await prisma.workoutTemplate.findFirst({
    where: { userId: user.id, name: "Treino A - Peito & Tríceps" },
  });

  if (!templateA) {
    await prisma.workoutTemplate.create({
      data: {
        userId: user.id,
        name: "Treino A - Peito & Tríceps",
        isActive: true,
        exercises: {
          create: [
            {
              exerciseId: createdExercises["Supino Reto com Barra"],
              order: 1,
              targetSets: 4,
              targetReps: "8-10",
              restTimer: 90,
            },
            {
              exerciseId: createdExercises["Crucifixo Inclinado com Halteres"],
              order: 2,
              targetSets: 3,
              targetReps: "10-12",
              restTimer: 60,
            },
            {
              exerciseId: createdExercises["Tríceps Corda no Pulley"],
              order: 3,
              targetSets: 4,
              targetReps: "12-15",
              restTimer: 60,
            },
          ],
        },
      },
    });
    console.log("Template 'Treino A - Peito & Tríceps' created.");
  }

  const templateB = await prisma.workoutTemplate.findFirst({
    where: { userId: user.id, name: "Treino B - Costas & Bíceps" },
  });

  if (!templateB) {
    await prisma.workoutTemplate.create({
      data: {
        userId: user.id,
        name: "Treino B - Costas & Bíceps",
        isActive: true,
        exercises: {
          create: [
            {
              exerciseId: createdExercises["Puxada Frontal Aberta"],
              order: 1,
              targetSets: 4,
              targetReps: "10-12",
              restTimer: 90,
            },
            {
              exerciseId: createdExercises["Remada Baixa no Cabo"],
              order: 2,
              targetSets: 4,
              targetReps: "10-12",
              restTimer: 60,
            },
            {
              exerciseId: createdExercises["Rosca Biceps com Halteres"],
              order: 3,
              targetSets: 3,
              targetReps: "12",
              restTimer: 60,
            },
          ],
        },
      },
    });
    console.log("Template 'Treino B - Costas & Bíceps' created.");
  }

  const templateC = await prisma.workoutTemplate.findFirst({
    where: { userId: user.id, name: "Treino C - Pernas & Ombros" },
  });

  if (!templateC) {
    await prisma.workoutTemplate.create({
      data: {
        userId: user.id,
        name: "Treino C - Pernas & Ombros",
        isActive: true,
        exercises: {
          create: [
            {
              exerciseId: createdExercises["Agachamento Livre"],
              order: 1,
              targetSets: 4,
              targetReps: "8-10",
              restTimer: 120,
            },
            {
              exerciseId: createdExercises["Leg Press 45º"],
              order: 2,
              targetSets: 4,
              targetReps: "12",
              restTimer: 90,
            },
            {
              exerciseId: createdExercises["Elevação Lateral com Halter"],
              order: 3,
              targetSets: 4,
              targetReps: "12-15",
              restTimer: 60,
            },
          ],
        },
      },
    });
    console.log("Template 'Treino C - Pernas & Ombros' created.");
  }

  console.log("Supabase seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
