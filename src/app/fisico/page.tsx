import React from "react";
import { getModalities, getRecentActivities, getWorkoutTemplates } from "@/actions/physical-activity";
import { FisicoPageClient } from "@/components/fisico/FisicoPageClient";

export const dynamic = "force-dynamic";

export default async function FisicoPage() {
  // Parallel fetch to eliminate sequential network latency
  const [modalities, activities, templates] = await Promise.all([
    getModalities(),
    getRecentActivities(),
    getWorkoutTemplates(),
  ]);

  return (
    <FisicoPageClient
      modalities={modalities}
      activities={activities}
      templates={templates}
    />
  );
}
