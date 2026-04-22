"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { PlannerCameras } from "./cameras";
import {
  Beds,
  DragController,
  Ground,
  Irrigations,
  Lights,
  Plants,
  SceneGrid,
  ShadowOptimizer,
} from "./scene";
import { PlannerToolbar } from "./toolbar";
import { BedInspector } from "./bed-inspector";
import { IrrigationInspector } from "./irrigation-inspector";
import { PlantInspector } from "./plant-inspector";
import { usePlannerStore } from "./store";

export function GardenPlanner() {
  const selectedIds = usePlannerStore((s) => s.selectedIds);
  const removeSelected = usePlannerStore((s) => s.removeSelected);
  const duplicateSelected = usePlannerStore((s) => s.duplicateSelected);
  const toggleSelectedLocked = usePlannerStore((s) => s.toggleSelectedLocked);
  const groupSelection = usePlannerStore((s) => s.groupSelection);
  const ungroupSelection = usePlannerStore((s) => s.ungroupSelection);
  const undo = usePlannerStore((s) => s.undo);
  const redo = usePlannerStore((s) => s.redo);
  const clearSelection = usePlannerStore((s) => s.clearSelection);
  const clipboardRef = useRef<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (mod && key === "z") {
        if (e.shiftKey) redo();
        else undo();
        e.preventDefault();
        return;
      }
      if (mod && key === "y") {
        redo();
        e.preventDefault();
        return;
      }
      if (mod && key === "g") {
        if (e.shiftKey) ungroupSelection();
        else groupSelection();
        e.preventDefault();
        return;
      }
      if (mod && key === "l") {
        toggleSelectedLocked();
        e.preventDefault();
        return;
      }
      if (mod && key === "c" && selectedIds.length > 0) {
        clipboardRef.current = [...selectedIds];
        e.preventDefault();
        return;
      }
      if (mod && key === "v" && clipboardRef.current.length > 0) {
        duplicateSelected();
        e.preventDefault();
        return;
      }
      if (mod && key === "d" && selectedIds.length > 0) {
        duplicateSelected();
        e.preventDefault();
        return;
      }
      if (selectedIds.length === 0) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        removeSelected();
      } else if (e.key === "Escape") {
        clearSelection();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    selectedIds,
    removeSelected,
    duplicateSelected,
    toggleSelectedLocked,
    groupSelection,
    ungroupSelection,
    undo,
    redo,
    clearSelection,
  ]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PlannerToolbar />
      <div className="relative flex-1 min-h-0">
        <Canvas shadows="percentage" dpr={[1, 2]} gl={{ antialias: true }}>
          <color attach="background" args={["#f5efe1"]} />
          <fog attach="fog" args={["#f5efe1", 15, 60]} />
          <Sky sunPosition={[5, 8, 3]} distance={450} />
          <Lights />
          <SceneGrid />
          <Ground />
          <Beds />
          <Irrigations />
          <Plants />
          <PlannerCameras />
          <DragController />
          <ShadowOptimizer />
        </Canvas>
        <BedInspector />
        <IrrigationInspector />
        <PlantInspector />
      </div>
    </div>
  );
}
