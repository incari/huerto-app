"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { NumberInput } from "./number-input";
import { isBedId, isIrrigationId, isPlantId, usePlannerStore } from "./store";
import { Box, Copy, Plus, Sprout, Trash2, View } from "lucide-react";

export function PlannerToolbar() {
  const mode = usePlannerStore((s) => s.mode);
  const camera = usePlannerStore((s) => s.camera);
  const plot = usePlannerStore((s) => s.plot);
  const selectedId = usePlannerStore((s) => s.selectedId);
  const setMode = usePlannerStore((s) => s.setMode);
  const setCamera = usePlannerStore((s) => s.setCamera);
  const setPlot = usePlannerStore((s) => s.setPlot);
  const addBed = usePlannerStore((s) => s.addBed);
  const removeBed = usePlannerStore((s) => s.removeBed);
  const duplicateBed = usePlannerStore((s) => s.duplicateBed);
  const removeIrrigation = usePlannerStore((s) => s.removeIrrigation);
  const duplicateIrrigation = usePlannerStore((s) => s.duplicateIrrigation);
  const removePlant = usePlannerStore((s) => s.removePlant);
  const duplicatePlant = usePlannerStore((s) => s.duplicatePlant);

  const onDuplicate = () => {
    if (!selectedId) return;
    if (isBedId(selectedId)) duplicateBed(selectedId);
    else if (isIrrigationId(selectedId)) duplicateIrrigation(selectedId);
    else if (isPlantId(selectedId)) duplicatePlant(selectedId);
  };
  const onRemove = () => {
    if (!selectedId) return;
    if (isBedId(selectedId)) removeBed(selectedId);
    else if (isIrrigationId(selectedId)) removeIrrigation(selectedId);
    else if (isPlantId(selectedId)) removePlant(selectedId);
  };

  return (
    <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-2 flex-wrap">
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={(v) => v && setMode(v as "design" | "plant")}
        className="bg-muted rounded-md p-0.5"
      >
        <ToggleGroupItem value="design" className="gap-1.5 h-8 px-3">
          <Box className="h-4 w-4" />
          Diseñar
        </ToggleGroupItem>
        <ToggleGroupItem value="plant" className="gap-1.5 h-8 px-3">
          <Sprout className="h-4 w-4" />
          Plantar
        </ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup
        type="single"
        value={camera}
        onValueChange={(v) => v && setCamera(v as "2d" | "3d")}
        className="bg-muted rounded-md p-0.5"
      >
        <ToggleGroupItem value="2d" className="h-8 px-3">
          2D
        </ToggleGroupItem>
        <ToggleGroupItem value="3d" className="gap-1.5 h-8 px-3">
          <View className="h-4 w-4" />
          3D
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="flex items-center gap-2">
        <Label htmlFor="plot-w" className="text-xs text-muted-foreground">
          Ancho
        </Label>
        <NumberInput
          id="plot-w"
          value={plot.widthCm}
          min={50}
          onCommit={(v) => setPlot({ widthCm: Math.max(50, v) })}
          className="h-8 w-20"
        />
        <Label htmlFor="plot-d" className="text-xs text-muted-foreground">
          Fondo
        </Label>
        <NumberInput
          id="plot-d"
          value={plot.depthCm}
          min={50}
          onCommit={(v) => setPlot({ depthCm: Math.max(50, v) })}
          className="h-8 w-20"
        />
        <span className="text-xs text-muted-foreground">cm</span>
      </div>

      {mode === "design" && (
        <>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={addBed}
          >
            <Plus className="h-4 w-4" />
            Bancal
          </Button>
          {selectedId && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={onDuplicate}
              >
                <Copy className="h-4 w-4" />
                Duplicar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={onRemove}
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}
