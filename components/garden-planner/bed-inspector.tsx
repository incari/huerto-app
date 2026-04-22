"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, Unlock } from "lucide-react";
import { NumberInput } from "./number-input";
import { usePlannerStore } from "./store";
import { Bed } from "./types";

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

interface FieldProps {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  min?: number;
  step?: number;
  disabled?: boolean;
  onCommit: (v: number) => void;
}

function Field({
  id,
  label,
  value,
  suffix,
  min,
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
          min={min}
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

export function BedInspector() {
  const beds = usePlannerStore((s) => s.beds);
  const selectedId = usePlannerStore((s) => s.selectedId);
  const updateBed = usePlannerStore((s) => s.updateBed);
  const setBedLocked = usePlannerStore((s) => s.setBedLocked);
  const lockBeds = usePlannerStore((s) => s.lockBeds);
  const mode = usePlannerStore((s) => s.mode);

  if (mode !== "design" || !selectedId) return null;
  const bed = beds.find((b) => b.id === selectedId);
  if (!bed) return null;

  const locked = Boolean(bed.locked) || lockBeds;
  const patch = (p: Partial<Bed>) => updateBed(bed.id, p);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
      <div className="pointer-events-auto flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2 pr-2 border-r border-border self-stretch">
          <span className="text-xs font-semibold">Bancal</span>
          <Button
            size="icon"
            variant={bed.locked ? "default" : "ghost"}
            className="h-7 w-7"
            aria-pressed={bed.locked ?? false}
            aria-label={bed.locked ? "Desbloquear bancal" : "Bloquear bancal"}
            title={bed.locked ? "Desbloquear bancal" : "Bloquear bancal"}
            onClick={() => setBedLocked(bed.id, !bed.locked)}
            disabled={lockBeds && !bed.locked}
          >
            {bed.locked ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <Unlock className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        <Field
          id="bed-w"
          label="Ancho"
          value={bed.widthCm}
          suffix="cm"
          min={10}
          step={5}
          disabled={locked}
          onCommit={(v) => patch({ widthCm: Math.max(10, v) })}
        />
        <Field
          id="bed-d"
          label="Fondo"
          value={bed.depthCm}
          suffix="cm"
          min={10}
          step={5}
          disabled={locked}
          onCommit={(v) => patch({ depthCm: Math.max(10, v) })}
        />
        <Field
          id="bed-h"
          label="Alto"
          value={bed.heightCm}
          suffix="cm"
          min={1}
          step={1}
          disabled={locked}
          onCommit={(v) => patch({ heightCm: Math.max(1, v) })}
        />
        <div className="w-px self-stretch bg-border" />
        <Field
          id="bed-x"
          label="X"
          value={bed.x}
          suffix="cm"
          step={1}
          disabled={locked}
          onCommit={(v) => patch({ x: v })}
        />
        <Field
          id="bed-y"
          label="Y"
          value={bed.y}
          suffix="cm"
          step={1}
          disabled={locked}
          onCommit={(v) => patch({ y: v })}
        />
        <Field
          id="bed-r"
          label="Rotación"
          value={bed.rotation * RAD_TO_DEG}
          suffix="°"
          step={5}
          disabled={locked}
          onCommit={(v) => patch({ rotation: v * DEG_TO_RAD })}
        />
      </div>
    </div>
  );
}
