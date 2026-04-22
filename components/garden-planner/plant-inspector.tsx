"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, Unlock } from "lucide-react";
import { NumberInput } from "./number-input";
import { usePlannerStore } from "./store";
import { PLANT_LABELS, PlantItem } from "./types";

interface FieldProps {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  step?: number;
  disabled?: boolean;
  onCommit: (v: number) => void;
}

function Field({
  id,
  label,
  value,
  suffix,
  step,
  disabled,
  onCommit,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label
        htmlFor={id}
        className="text-[10px] text-muted-foreground uppercase"
      >
        {label}
      </Label>
      <div className="relative">
        <NumberInput
          id={id}
          value={value}
          step={step}
          disabled={disabled}
          onCommit={onCommit}
          className="h-8 w-20 pr-7"
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export function PlantInspector() {
  const plants = usePlannerStore((s) => s.plants);
  const selectedId = usePlannerStore((s) => s.selectedId);
  const updatePlant = usePlannerStore((s) => s.updatePlant);
  const setPlantLocked = usePlannerStore((s) => s.setPlantLocked);
  const lockPlants = usePlannerStore((s) => s.lockPlants);
  const mode = usePlannerStore((s) => s.mode);

  if (mode !== "plant" || !selectedId) return null;
  const plant = plants.find((p) => p.id === selectedId);
  if (!plant) return null;

  const locked = Boolean(plant.locked) || lockPlants;
  const patch = (p: Partial<PlantItem>) => updatePlant(plant.id, p);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
      <div className="pointer-events-auto flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2 pr-2 border-r border-border self-stretch">
          <span className="text-xs font-semibold">
            {PLANT_LABELS[plant.kind]}
          </span>
          <Button
            size="icon"
            variant={plant.locked ? "default" : "ghost"}
            className="h-7 w-7"
            aria-pressed={plant.locked ?? false}
            aria-label={plant.locked ? "Desbloquear planta" : "Bloquear planta"}
            title={plant.locked ? "Desbloquear planta" : "Bloquear planta"}
            onClick={() => setPlantLocked(plant.id, !plant.locked)}
            disabled={lockPlants && !plant.locked}
          >
            {plant.locked ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <Unlock className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        <Field
          id="plant-x"
          label="X"
          value={plant.x}
          suffix="cm"
          step={1}
          disabled={locked}
          onCommit={(v) => patch({ x: v })}
        />
        <Field
          id="plant-y"
          label="Y"
          value={plant.y}
          suffix="cm"
          step={1}
          disabled={locked}
          onCommit={(v) => patch({ y: v })}
        />
      </div>
    </div>
  );
}

