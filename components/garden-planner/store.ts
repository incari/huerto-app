import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Bed,
  CameraMode,
  DEFAULT_BED,
  DEFAULT_IRRIGATION,
  DEFAULT_PLANT_STAGE,
  DEFAULT_PLOT,
  Irrigation,
  IrrigationKind,
  PlantItem,
  PlantKind,
  PlantStage,
  Plot,
  PlannerMode,
} from "./types";

interface PlannerStore {
  mode: PlannerMode;
  camera: CameraMode;
  plot: Plot;
  beds: Bed[];
  irrigations: Irrigation[];
  plants: PlantItem[];
  selectedId: string | null;
  isDragging: boolean;

  setMode: (mode: PlannerMode) => void;
  setCamera: (camera: CameraMode) => void;
  setPlot: (plot: Partial<Plot>) => void;
  setDragging: (dragging: boolean) => void;

  addBed: () => void;
  updateBed: (id: string, patch: Partial<Bed>) => void;
  removeBed: (id: string) => void;
  duplicateBed: (id: string) => void;

  addIrrigation: (kind: IrrigationKind) => void;
  updateIrrigation: (id: string, patch: Partial<Irrigation>) => void;
  removeIrrigation: (id: string) => void;
  duplicateIrrigation: (id: string) => void;

  addPlant: (kind: PlantKind, stage?: PlantStage) => void;
  updatePlant: (id: string, patch: Partial<PlantItem>) => void;
  removePlant: (id: string) => void;
  duplicatePlant: (id: string) => void;

  select: (id: string | null) => void;
}

export function isBedId(id: string | null): boolean {
  return !!id && id.startsWith("bed-");
}
export function isIrrigationId(id: string | null): boolean {
  return !!id && id.startsWith("irr-");
}
export function isPlantId(id: string | null): boolean {
  return !!id && id.startsWith("plant-");
}

let nextId = 1;
const newId = (prefix: string) => `${prefix}-${nextId++}-${Date.now()}`;

const MIN_BED_CM = 10;

export function clampBedToPlot(bed: Bed, plot: Plot): Bed {
  const cos = Math.abs(Math.cos(bed.rotation));
  const sin = Math.abs(Math.sin(bed.rotation));
  const px = plot.widthCm / 2;
  const pz = plot.depthCm / 2;
  // Shrink bed if its rotated AABB exceeds the plot on either axis.
  let widthCm = bed.widthCm;
  let depthCm = bed.depthCm;
  for (let i = 0; i < 2; i++) {
    const hw = widthCm / 2;
    const hd = depthCm / 2;
    const hx = hw * cos + hd * sin;
    const hz = hw * sin + hd * cos;
    if (hx <= px && hz <= pz) break;
    const sx = hx > px ? px / hx : 1;
    const sz = hz > pz ? pz / hz : 1;
    const s = Math.min(sx, sz);
    widthCm = Math.max(MIN_BED_CM, widthCm * s);
    depthCm = Math.max(MIN_BED_CM, depthCm * s);
  }
  const hw = widthCm / 2;
  const hd = depthCm / 2;
  const hx = hw * cos + hd * sin;
  const hz = hw * sin + hd * cos;
  const maxX = Math.max(0, px - hx);
  const maxZ = Math.max(0, pz - hz);
  return {
    ...bed,
    widthCm,
    depthCm,
    x: Math.max(-maxX, Math.min(maxX, bed.x)),
    y: Math.max(-maxZ, Math.min(maxZ, bed.y)),
  };
}

export function clampIrrigationToPlot(irr: Irrigation, plot: Plot): Irrigation {
  const px = plot.widthCm / 2;
  const pz = plot.depthCm / 2;
  return {
    ...irr,
    x: Math.max(-px, Math.min(px, irr.x)),
    y: Math.max(-pz, Math.min(pz, irr.y)),
  };
}

export function clampPlantToPlot(plant: PlantItem, plot: Plot): PlantItem {
  const px = plot.widthCm / 2;
  const pz = plot.depthCm / 2;
  return {
    ...plant,
    x: Math.max(-px, Math.min(px, plant.x)),
    y: Math.max(-pz, Math.min(pz, plant.y)),
  };
}

export const usePlannerStore = create<PlannerStore>()(
  persist(
    (set) => ({
      mode: "design",
      camera: "2d",
      plot: DEFAULT_PLOT,
      beds: [],
      irrigations: [],
      plants: [],
      selectedId: null,
      isDragging: false,

      setMode: (mode) => set({ mode }),
      setCamera: (camera) => set({ camera }),
      setPlot: (patch) =>
        set((s) => {
          const plot = { ...s.plot, ...patch };
          return {
            plot,
            beds: s.beds.map((b) => clampBedToPlot(b, plot)),
          };
        }),
      setDragging: (isDragging) => set({ isDragging }),

      addBed: () =>
        set((s) => {
          const id = newId("bed");
          const bed = clampBedToPlot({ id, ...DEFAULT_BED }, s.plot);
          return {
            beds: [...s.beds, bed],
            selectedId: id,
          };
        }),
      updateBed: (id, patch) =>
        set((s) => ({
          beds: s.beds.map((b) =>
            b.id === id ? clampBedToPlot({ ...b, ...patch }, s.plot) : b,
          ),
        })),
      removeBed: (id) =>
        set((s) => ({
          beds: s.beds.filter((b) => b.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),
      duplicateBed: (id) =>
        set((s) => {
          const source = s.beds.find((b) => b.id === id);
          if (!source) return s;
          const newBedId = newId("bed");
          const offset = 20;
          const copy = clampBedToPlot(
            {
              ...source,
              id: newBedId,
              x: source.x + offset,
              y: source.y + offset,
            },
            s.plot,
          );
          return {
            beds: [...s.beds, copy],
            selectedId: newBedId,
          };
        }),
      addIrrigation: (kind) =>
        set((s) => {
          const id = newId("irr");
          const irr = clampIrrigationToPlot(
            { id, kind, x: 0, y: 0, ...DEFAULT_IRRIGATION[kind] },
            s.plot,
          );
          return {
            irrigations: [...s.irrigations, irr],
            selectedId: id,
          };
        }),
      updateIrrigation: (id, patch) =>
        set((s) => ({
          irrigations: s.irrigations.map((i) =>
            i.id === id ? clampIrrigationToPlot({ ...i, ...patch }, s.plot) : i,
          ),
        })),
      removeIrrigation: (id) =>
        set((s) => ({
          irrigations: s.irrigations.filter((i) => i.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),
      duplicateIrrigation: (id) =>
        set((s) => {
          const source = s.irrigations.find((i) => i.id === id);
          if (!source) return s;
          const newIrrId = newId("irr");
          const offset = 30;
          const copy = clampIrrigationToPlot(
            {
              ...source,
              id: newIrrId,
              x: source.x + offset,
              y: source.y + offset,
            },
            s.plot,
          );
          return {
            irrigations: [...s.irrigations, copy],
            selectedId: newIrrId,
          };
        }),

      addPlant: (kind, stage = DEFAULT_PLANT_STAGE) =>
        set((s) => {
          const id = newId("plant");
          const plant = clampPlantToPlot(
            { id, kind, x: 0, y: 0, stage },
            s.plot,
          );
          return {
            plants: [...s.plants, plant],
            selectedId: id,
          };
        }),
      updatePlant: (id, patch) =>
        set((s) => ({
          plants: s.plants.map((p) =>
            p.id === id ? clampPlantToPlot({ ...p, ...patch }, s.plot) : p,
          ),
        })),
      removePlant: (id) =>
        set((s) => ({
          plants: s.plants.filter((p) => p.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),
      duplicatePlant: (id) =>
        set((s) => {
          const source = s.plants.find((p) => p.id === id);
          if (!source) return s;
          const newPlantId = newId("plant");
          const offset = 20;
          const copy = clampPlantToPlot(
            {
              ...source,
              id: newPlantId,
              x: source.x + offset,
              y: source.y + offset,
            },
            s.plot,
          );
          return {
            plants: [...s.plants, copy],
            selectedId: newPlantId,
          };
        }),

      select: (id) => set({ selectedId: id }),
    }),
    {
      name: "huerto-planner",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        mode: s.mode,
        camera: s.camera,
        plot: s.plot,
        beds: s.beds,
        irrigations: s.irrigations,
        plants: s.plants,
      }),
    },
  ),
);
