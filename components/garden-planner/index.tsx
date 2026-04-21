"use client";

import dynamic from "next/dynamic";

export const GardenPlanner = dynamic(
  () => import("./planner-canvas").then((m) => m.GardenPlanner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Cargando planificador 3D…
      </div>
    ),
  },
);

export { BuildPalette } from "./build-palette";
export { PlantPalette } from "./plant-palette";
export { usePlannerStore } from "./store";
