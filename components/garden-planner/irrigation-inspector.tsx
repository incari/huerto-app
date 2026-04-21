"use client";

import { Label } from "@/components/ui/label";
import { NumberInput } from "./number-input";
import { usePlannerStore } from "./store";
import {
  DEFAULT_DRIP_DROP_RADIUS_CM,
  DEFAULT_DRIP_SPACING_CM,
  IRRIGATION_LABELS,
  Irrigation,
  isLinearIrrigation,
} from "./types";

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

interface FieldProps {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  min?: number;
  step?: number;
  onCommit: (v: number) => void;
}

function Field({ id, label, value, suffix, min, step, onCommit }: FieldProps) {
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

export function IrrigationInspector() {
  const irrigations = usePlannerStore((s) => s.irrigations);
  const selectedId = usePlannerStore((s) => s.selectedId);
  const updateIrrigation = usePlannerStore((s) => s.updateIrrigation);
  const mode = usePlannerStore((s) => s.mode);

  if (mode !== "design" || !selectedId) return null;
  const irr = irrigations.find((i) => i.id === selectedId);
  if (!irr) return null;

  const patch = (p: Partial<Irrigation>) => updateIrrigation(irr.id, p);
  const linear = isLinearIrrigation(irr.kind);
  const isDrip = irr.kind === "drip";
  const spacingCm = irr.spacingCm ?? DEFAULT_DRIP_SPACING_CM;
  const dropDiameterCm = (irr.dropRadiusCm ?? DEFAULT_DRIP_DROP_RADIUS_CM) * 2;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
      <div className="pointer-events-auto flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
        <div className="flex items-center gap-1 pr-2 border-r border-border self-stretch">
          <span className="text-xs font-semibold">
            {IRRIGATION_LABELS[irr.kind]}
          </span>
        </div>
        {linear ? (
          <>
            <Field
              id="irr-l"
              label="Largo"
              value={irr.lengthCm}
              suffix="cm"
              min={10}
              step={10}
              onCommit={(v) => patch({ lengthCm: Math.max(10, v) })}
            />
            <Field
              id="irr-w"
              label="Ancho"
              value={irr.widthCm}
              suffix="cm"
              min={5}
              step={5}
              onCommit={(v) => patch({ widthCm: Math.max(5, v) })}
            />
            {isDrip && (
              <>
                <Field
                  id="irr-spacing"
                  label="Espaciado"
                  value={spacingCm}
                  suffix="cm"
                  min={5}
                  step={5}
                  onCommit={(v) => patch({ spacingCm: Math.max(5, v) })}
                />
                <Field
                  id="irr-drop"
                  label="Diámetro"
                  value={dropDiameterCm}
                  suffix="cm"
                  min={2}
                  step={1}
                  onCommit={(v) => patch({ dropRadiusCm: Math.max(1, v / 2) })}
                />
              </>
            )}
          </>
        ) : (
          <Field
            id="irr-r"
            label="Radio"
            value={irr.radiusCm}
            suffix="cm"
            min={10}
            step={10}
            onCommit={(v) => patch({ radiusCm: Math.max(10, v) })}
          />
        )}
        <div className="w-px self-stretch bg-border" />
        <Field
          id="irr-x"
          label="X"
          value={irr.x}
          suffix="cm"
          step={1}
          onCommit={(v) => patch({ x: v })}
        />
        <Field
          id="irr-y"
          label="Y"
          value={irr.y}
          suffix="cm"
          step={1}
          onCommit={(v) => patch({ y: v })}
        />
        {linear && (
          <Field
            id="irr-rot"
            label="Rotación"
            value={irr.rotation * RAD_TO_DEG}
            suffix="°"
            step={5}
            onCommit={(v) => patch({ rotation: v * DEG_TO_RAD })}
          />
        )}
      </div>
    </div>
  );
}
