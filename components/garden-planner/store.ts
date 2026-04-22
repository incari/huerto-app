import { create, type StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { temporal } from "zundo";
import {
  Bed,
  CameraMode,
  DEFAULT_BED,
  DEFAULT_IRRIGATION,
  DEFAULT_PLANT_STAGE,
  DEFAULT_PLOT,
  Group,
  Irrigation,
  IrrigationKind,
  PLANT_KIND_SPECS,
  PlantItem,
  PlantKind,
  PlantStage,
  Plot,
  PlannerMode,
} from "./types";

const LEGACY_PLANT_KIND_MAP: Record<string, PlantKind> = {
  pepper: "pepper-red",
};

function migratePlant(p: PlantItem): PlantItem | null {
  const mapped = LEGACY_PLANT_KIND_MAP[p.kind as string] ?? p.kind;
  if (!(mapped in PLANT_KIND_SPECS)) return null;
  return { ...p, kind: mapped as PlantKind };
}

export type LockCategory = "plot" | "beds" | "irrigations" | "plants";

interface PlannerStore {
  mode: PlannerMode;
  camera: CameraMode;
  plot: Plot;
  beds: Bed[];
  irrigations: Irrigation[];
  plants: PlantItem[];
  groups: Group[];
  selectedId: string | null;
  selectedIds: string[];
  isDragging: boolean;
  lockPlot: boolean;
  lockBeds: boolean;
  lockIrrigations: boolean;
  lockPlants: boolean;

  setMode: (mode: PlannerMode) => void;
  setCamera: (camera: CameraMode) => void;
  setPlot: (plot: Partial<Plot>) => void;
  setDragging: (dragging: boolean) => void;

  addBed: () => void;
  updateBed: (id: string, patch: Partial<Bed>) => void;
  removeBed: (id: string) => void;
  duplicateBed: (id: string) => void;
  setBedLocked: (id: string, locked: boolean) => void;

  addIrrigation: (kind: IrrigationKind) => void;
  updateIrrigation: (id: string, patch: Partial<Irrigation>) => void;
  removeIrrigation: (id: string) => void;
  duplicateIrrigation: (id: string) => void;
  setIrrigationLocked: (id: string, locked: boolean) => void;

  addPlant: (kind: PlantKind, stage?: PlantStage) => void;
  updatePlant: (id: string, patch: Partial<PlantItem>) => void;
  removePlant: (id: string) => void;
  duplicatePlant: (id: string) => void;
  setPlantLocked: (id: string, locked: boolean) => void;

  toggleCategoryLock: (category: LockCategory) => void;
  setCategoryLock: (category: LockCategory, locked: boolean) => void;
  toggleSelectedLocked: () => void;

  select: (id: string | null) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  translateItems: (ids: string[], dxCm: number, dyCm: number) => void;
  groupSelection: () => void;
  ungroupSelection: () => void;
  removeSelected: () => void;
  duplicateSelected: () => void;

  undo: () => void;
  redo: () => void;
  pauseHistory: () => void;
  commitHistory: () => void;
}

function findGroupForId(groups: Group[], id: string): Group | undefined {
  return groups.find((g) => g.itemIds.includes(id));
}

function expandWithGroup(id: string, groups: Group[]): string[] {
  const g = findGroupForId(groups, id);
  return g ? [...g.itemIds] : [id];
}

function syncSelection(ids: string[]): {
  selectedIds: string[];
  selectedId: string | null;
} {
  const deduped = Array.from(new Set(ids));
  return {
    selectedIds: deduped,
    selectedId: deduped.length === 1 ? deduped[0] : null,
  };
}

function pruneGroups(groups: Group[], removedIds: string[]): Group[] {
  if (removedIds.length === 0) return groups;
  const removed = new Set(removedIds);
  return groups
    .map((g) => ({ ...g, itemIds: g.itemIds.filter((id) => !removed.has(id)) }))
    .filter((g) => g.itemIds.length >= 2);
}

function temporalPartialize(state: PlannerStore) {
  const {
    selectedId: _sid,
    selectedIds: _sids,
    isDragging: _drag,
    mode: _m,
    camera: _c,
    undo: _u,
    redo: _r,
    ...rest
  } = state;
  return rest as Partial<PlannerStore>;
}

export function isBedLocked(s: PlannerStore, bed: Bed): boolean {
  return s.lockBeds || bed.locked === true;
}
export function isIrrigationLocked(s: PlannerStore, irr: Irrigation): boolean {
  return s.lockIrrigations || irr.locked === true;
}
export function isPlantLocked(s: PlannerStore, p: PlantItem): boolean {
  return s.lockPlants || p.locked === true;
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
    temporal(
      ((set, get) => ({
        mode: "design",
        camera: "2d",
        plot: DEFAULT_PLOT,
        beds: [],
        irrigations: [],
        plants: [],
        groups: [],
        selectedId: null,
        selectedIds: [],
        isDragging: false,
        lockPlot: false,
        lockBeds: false,
        lockIrrigations: false,
        lockPlants: false,

        setMode: (mode) => set({ mode }),
        setCamera: (camera) => set({ camera }),
        setPlot: (patch) =>
          set((s) => {
            if (s.lockPlot) return s;
            const plot = { ...s.plot, ...patch };
            return {
              plot,
              beds: s.beds.map((b) => clampBedToPlot(b, plot)),
            };
          }),
        setDragging: (isDragging) => set({ isDragging }),

        addBed: () =>
          set((s) => {
            if (s.lockBeds) return s;
            const id = newId("bed");
            const bed = clampBedToPlot({ id, ...DEFAULT_BED }, s.plot);
            return {
              beds: [...s.beds, bed],
              ...syncSelection([id]),
            };
          }),
        updateBed: (id, patch) =>
          set((s) => {
            if (s.lockBeds) return s;
            return {
              beds: s.beds.map((b) => {
                if (b.id !== id) return b;
                if (b.locked) return b;
                return clampBedToPlot({ ...b, ...patch }, s.plot);
              }),
            };
          }),
        removeBed: (id) =>
          set((s) => {
            if (s.lockBeds) return s;
            const target = s.beds.find((b) => b.id === id);
            if (target?.locked) return s;
            const nextIds = s.selectedIds.filter((sid) => sid !== id);
            return {
              beds: s.beds.filter((b) => b.id !== id),
              groups: pruneGroups(s.groups, [id]),
              ...syncSelection(nextIds),
            };
          }),
        duplicateBed: (id) =>
          set((s) => {
            if (s.lockBeds) return s;
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
                locked: false,
              },
              s.plot,
            );
            return {
              beds: [...s.beds, copy],
              ...syncSelection([newBedId]),
            };
          }),
        setBedLocked: (id, locked) =>
          set((s) => ({
            beds: s.beds.map((b) => (b.id === id ? { ...b, locked } : b)),
          })),
        addIrrigation: (kind) =>
          set((s) => {
            if (s.lockIrrigations) return s;
            const id = newId("irr");
            const irr = clampIrrigationToPlot(
              { id, kind, x: 0, y: 0, ...DEFAULT_IRRIGATION[kind] },
              s.plot,
            );
            return {
              irrigations: [...s.irrigations, irr],
              ...syncSelection([id]),
            };
          }),
        updateIrrigation: (id, patch) =>
          set((s) => {
            if (s.lockIrrigations) return s;
            return {
              irrigations: s.irrigations.map((i) => {
                if (i.id !== id) return i;
                if (i.locked) return i;
                return clampIrrigationToPlot({ ...i, ...patch }, s.plot);
              }),
            };
          }),
        removeIrrigation: (id) =>
          set((s) => {
            if (s.lockIrrigations) return s;
            const target = s.irrigations.find((i) => i.id === id);
            if (target?.locked) return s;
            const nextIds = s.selectedIds.filter((sid) => sid !== id);
            return {
              irrigations: s.irrigations.filter((i) => i.id !== id),
              groups: pruneGroups(s.groups, [id]),
              ...syncSelection(nextIds),
            };
          }),
        duplicateIrrigation: (id) =>
          set((s) => {
            if (s.lockIrrigations) return s;
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
                locked: false,
              },
              s.plot,
            );
            return {
              irrigations: [...s.irrigations, copy],
              ...syncSelection([newIrrId]),
            };
          }),
        setIrrigationLocked: (id, locked) =>
          set((s) => ({
            irrigations: s.irrigations.map((i) =>
              i.id === id ? { ...i, locked } : i,
            ),
          })),

        addPlant: (kind, stage = DEFAULT_PLANT_STAGE) =>
          set((s) => {
            if (s.lockPlants) return s;
            const id = newId("plant");
            const plant = clampPlantToPlot(
              { id, kind, x: 0, y: 0, stage },
              s.plot,
            );
            return {
              plants: [...s.plants, plant],
              ...syncSelection([id]),
            };
          }),
        updatePlant: (id, patch) =>
          set((s) => {
            if (s.lockPlants) return s;
            return {
              plants: s.plants.map((p) => {
                if (p.id !== id) return p;
                if (p.locked) return p;
                return clampPlantToPlot({ ...p, ...patch }, s.plot);
              }),
            };
          }),
        removePlant: (id) =>
          set((s) => {
            if (s.lockPlants) return s;
            const target = s.plants.find((p) => p.id === id);
            if (target?.locked) return s;
            const nextIds = s.selectedIds.filter((sid) => sid !== id);
            return {
              plants: s.plants.filter((p) => p.id !== id),
              groups: pruneGroups(s.groups, [id]),
              ...syncSelection(nextIds),
            };
          }),
        duplicatePlant: (id) =>
          set((s) => {
            if (s.lockPlants) return s;
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
                locked: false,
              },
              s.plot,
            );
            return {
              plants: [...s.plants, copy],
              ...syncSelection([newPlantId]),
            };
          }),
        setPlantLocked: (id, locked) =>
          set((s) => ({
            plants: s.plants.map((p) => (p.id === id ? { ...p, locked } : p)),
          })),

        toggleCategoryLock: (category) =>
          set((s) => {
            switch (category) {
              case "plot":
                return { lockPlot: !s.lockPlot };
              case "beds":
                return { lockBeds: !s.lockBeds };
              case "irrigations":
                return { lockIrrigations: !s.lockIrrigations };
              case "plants":
                return { lockPlants: !s.lockPlants };
            }
          }),
        setCategoryLock: (category, locked) =>
          set(() => {
            switch (category) {
              case "plot":
                return { lockPlot: locked };
              case "beds":
                return { lockBeds: locked };
              case "irrigations":
                return { lockIrrigations: locked };
              case "plants":
                return { lockPlants: locked };
            }
          }),

        toggleSelectedLocked: () =>
          set((s) => {
            if (s.selectedIds.length === 0) return s;
            const ids = new Set(s.selectedIds);
            const anyUnlocked = s.selectedIds.some((id) => {
              if (isBedId(id)) return !s.beds.find((b) => b.id === id)?.locked;
              if (isIrrigationId(id))
                return !s.irrigations.find((i) => i.id === id)?.locked;
              if (isPlantId(id))
                return !s.plants.find((p) => p.id === id)?.locked;
              return false;
            });
            const next = anyUnlocked;
            return {
              beds: s.beds.map((b) =>
                ids.has(b.id) ? { ...b, locked: next } : b,
              ),
              irrigations: s.irrigations.map((i) =>
                ids.has(i.id) ? { ...i, locked: next } : i,
              ),
              plants: s.plants.map((p) =>
                ids.has(p.id) ? { ...p, locked: next } : p,
              ),
            };
          }),

        select: (id) =>
          set((s) => {
            if (id === null) return syncSelection([]);
            return syncSelection(expandWithGroup(id, s.groups));
          }),
        toggleSelection: (id) =>
          set((s) => {
            const groupIds = expandWithGroup(id, s.groups);
            const current = new Set(s.selectedIds);
            const allSelected = groupIds.every((gid) => current.has(gid));
            if (allSelected) {
              for (const gid of groupIds) current.delete(gid);
            } else {
              for (const gid of groupIds) current.add(gid);
            }
            return syncSelection(Array.from(current));
          }),
        clearSelection: () => set(() => syncSelection([])),
        translateItems: (ids, dxCm, dyCm) =>
          set((s) => {
            if (ids.length === 0 || (dxCm === 0 && dyCm === 0)) return s;
            const idSet = new Set(ids);
            const moveBed = (b: Bed): Bed => {
              if (!idSet.has(b.id)) return b;
              if (s.lockBeds || b.locked) return b;
              return clampBedToPlot(
                { ...b, x: b.x + dxCm, y: b.y + dyCm },
                s.plot,
              );
            };
            const moveIrr = (i: Irrigation): Irrigation => {
              if (!idSet.has(i.id)) return i;
              if (s.lockIrrigations || i.locked) return i;
              return clampIrrigationToPlot(
                { ...i, x: i.x + dxCm, y: i.y + dyCm },
                s.plot,
              );
            };
            const movePlant = (p: PlantItem): PlantItem => {
              if (!idSet.has(p.id)) return p;
              if (s.lockPlants || p.locked) return p;
              return clampPlantToPlot(
                { ...p, x: p.x + dxCm, y: p.y + dyCm },
                s.plot,
              );
            };
            return {
              beds: s.beds.map(moveBed),
              irrigations: s.irrigations.map(moveIrr),
              plants: s.plants.map(movePlant),
            };
          }),
        groupSelection: () =>
          set((s) => {
            if (s.selectedIds.length < 2) return s;
            const ids = Array.from(new Set(s.selectedIds));
            // Remove any existing groups that overlap with the selection,
            // then create a single new group containing every selected id.
            const remaining = s.groups.filter(
              (g) => !g.itemIds.some((gid) => ids.includes(gid)),
            );
            const newGroup: Group = { id: newId("group"), itemIds: ids };
            return {
              groups: [...remaining, newGroup],
              ...syncSelection(ids),
            };
          }),
        ungroupSelection: () =>
          set((s) => {
            if (s.selectedIds.length === 0) return s;
            const selected = new Set(s.selectedIds);
            const remaining = s.groups.filter(
              (g) => !g.itemIds.some((gid) => selected.has(gid)),
            );
            if (remaining.length === s.groups.length) return s;
            return { groups: remaining };
          }),
        removeSelected: () =>
          set((s) => {
            if (s.selectedIds.length === 0) return s;
            const ids = new Set(s.selectedIds);
            const beds = s.beds.filter((b) => {
              if (!ids.has(b.id)) return true;
              if (s.lockBeds || b.locked) return true;
              return false;
            });
            const irrigations = s.irrigations.filter((i) => {
              if (!ids.has(i.id)) return true;
              if (s.lockIrrigations || i.locked) return true;
              return false;
            });
            const plants = s.plants.filter((p) => {
              if (!ids.has(p.id)) return true;
              if (s.lockPlants || p.locked) return true;
              return false;
            });
            const removed = [
              ...s.beds.filter((b) => !beds.includes(b)).map((b) => b.id),
              ...s.irrigations
                .filter((i) => !irrigations.includes(i))
                .map((i) => i.id),
              ...s.plants.filter((p) => !plants.includes(p)).map((p) => p.id),
            ];
            const nextIds = s.selectedIds.filter(
              (sid) => !removed.includes(sid),
            );
            return {
              beds,
              irrigations,
              plants,
              groups: pruneGroups(s.groups, removed),
              ...syncSelection(nextIds),
            };
          }),
        duplicateSelected: () => {
          const s = get();
          if (s.selectedIds.length === 0) return;
          const newIds: string[] = [];
          const idMap = new Map<string, string>();
          for (const id of s.selectedIds) {
            if (isBedId(id)) {
              const source = s.beds.find((b) => b.id === id);
              if (!source || s.lockBeds) continue;
              const nid = newId("bed");
              idMap.set(id, nid);
              newIds.push(nid);
            } else if (isIrrigationId(id)) {
              const source = s.irrigations.find((i) => i.id === id);
              if (!source || s.lockIrrigations) continue;
              const nid = newId("irr");
              idMap.set(id, nid);
              newIds.push(nid);
            } else if (isPlantId(id)) {
              const source = s.plants.find((p) => p.id === id);
              if (!source || s.lockPlants) continue;
              const nid = newId("plant");
              idMap.set(id, nid);
              newIds.push(nid);
            }
          }
          set((state) => {
            const offset = 20;
            const newBeds: Bed[] = [];
            const newIrrs: Irrigation[] = [];
            const newPlants: PlantItem[] = [];
            for (const [oldId, nid] of idMap) {
              if (isBedId(oldId)) {
                const src = state.beds.find((b) => b.id === oldId);
                if (!src) continue;
                newBeds.push(
                  clampBedToPlot(
                    {
                      ...src,
                      id: nid,
                      x: src.x + offset,
                      y: src.y + offset,
                      locked: false,
                    },
                    state.plot,
                  ),
                );
              } else if (isIrrigationId(oldId)) {
                const src = state.irrigations.find((i) => i.id === oldId);
                if (!src) continue;
                newIrrs.push(
                  clampIrrigationToPlot(
                    {
                      ...src,
                      id: nid,
                      x: src.x + offset,
                      y: src.y + offset,
                      locked: false,
                    },
                    state.plot,
                  ),
                );
              } else if (isPlantId(oldId)) {
                const src = state.plants.find((p) => p.id === oldId);
                if (!src) continue;
                newPlants.push(
                  clampPlantToPlot(
                    {
                      ...src,
                      id: nid,
                      x: src.x + offset,
                      y: src.y + offset,
                      locked: false,
                    },
                    state.plot,
                  ),
                );
              }
            }
            return {
              beds: [...state.beds, ...newBeds],
              irrigations: [...state.irrigations, ...newIrrs],
              plants: [...state.plants, ...newPlants],
              ...syncSelection(newIds),
            };
          });
        },

        undo: () => usePlannerStore.temporal.getState().undo(),
        redo: () => usePlannerStore.temporal.getState().redo(),
        pauseHistory: () => usePlannerStore.temporal.getState().pause(),
        commitHistory: () => {
          const t = usePlannerStore.temporal.getState();
          t.resume();
        },
      })) as StateCreator<PlannerStore, [], []>,
      {
        partialize: temporalPartialize,
        limit: 100,
        equality: (a, b) =>
          a.beds === b.beds &&
          a.irrigations === b.irrigations &&
          a.plants === b.plants &&
          a.groups === b.groups &&
          a.plot === b.plot &&
          a.lockPlot === b.lockPlot &&
          a.lockBeds === b.lockBeds &&
          a.lockIrrigations === b.lockIrrigations &&
          a.lockPlants === b.lockPlants,
      },
    ),
    {
      name: "huerto-planner",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        mode: s.mode,
        camera: s.camera,
        plot: s.plot,
        beds: s.beds,
        irrigations: s.irrigations,
        plants: s.plants,
        groups: s.groups,
        lockPlot: s.lockPlot,
        lockBeds: s.lockBeds,
        lockIrrigations: s.lockIrrigations,
        lockPlants: s.lockPlants,
      }),
      migrate: (persisted) => {
        const state = persisted as Partial<PlannerStore> | undefined;
        if (!state) return persisted as PlannerStore;
        const plants = Array.isArray(state.plants)
          ? state.plants
              .map((p) => migratePlant(p as PlantItem))
              .filter((p): p is PlantItem => p !== null)
          : [];
        const groups = Array.isArray(state.groups) ? state.groups : [];
        return { ...state, plants, groups } as PlannerStore;
      },
    },
  ),
);
