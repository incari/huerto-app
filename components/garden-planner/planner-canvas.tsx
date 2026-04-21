"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { PlannerCameras } from "./cameras";
import { Beds, Ground, Irrigations, Lights, Plants, SceneGrid } from "./scene";
import { PlannerToolbar } from "./toolbar";
import { BedInspector } from "./bed-inspector";
import { IrrigationInspector } from "./irrigation-inspector";
import { isBedId, isIrrigationId, isPlantId, usePlannerStore } from "./store";

export function GardenPlanner() {
  const selectedId = usePlannerStore((s) => s.selectedId);
  const removeBed = usePlannerStore((s) => s.removeBed);
  const duplicateBed = usePlannerStore((s) => s.duplicateBed);
  const removeIrrigation = usePlannerStore((s) => s.removeIrrigation);
  const duplicateIrrigation = usePlannerStore((s) => s.duplicateIrrigation);
  const removePlant = usePlannerStore((s) => s.removePlant);
  const duplicatePlant = usePlannerStore((s) => s.duplicatePlant);
  const select = usePlannerStore((s) => s.select);
  const clipboardRef = useRef<string | null>(null);

  useEffect(() => {
    const duplicate = (id: string) => {
      if (isBedId(id)) duplicateBed(id);
      else if (isIrrigationId(id)) duplicateIrrigation(id);
      else if (isPlantId(id)) duplicatePlant(id);
    };
    const remove = (id: string) => {
      if (isBedId(id)) removeBed(id);
      else if (isIrrigationId(id)) removeIrrigation(id);
      else if (isPlantId(id)) removePlant(id);
    };
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "c" && selectedId) {
        clipboardRef.current = selectedId;
        e.preventDefault();
        return;
      }
      if (mod && e.key.toLowerCase() === "v" && clipboardRef.current) {
        duplicate(clipboardRef.current);
        e.preventDefault();
        return;
      }
      if (mod && e.key.toLowerCase() === "d" && selectedId) {
        duplicate(selectedId);
        e.preventDefault();
        return;
      }
      if (!selectedId) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        remove(selectedId);
      } else if (e.key === "Escape") {
        select(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    selectedId,
    removeBed,
    duplicateBed,
    removeIrrigation,
    duplicateIrrigation,
    removePlant,
    duplicatePlant,
    select,
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
        </Canvas>
        <BedInspector />
        <IrrigationInspector />
      </div>
    </div>
  );
}
