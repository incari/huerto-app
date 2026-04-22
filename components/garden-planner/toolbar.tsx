"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { NumberInput } from "./number-input";
import { usePlannerStore } from "./store";
import type { LockCategory } from "./store";
import {
  Box,
  Copy,
  Droplets,
  Group as GroupIcon,
  Lock,
  Map as MapIcon,
  Plus,
  Redo2,
  Sprout,
  Trash2,
  Undo2,
  Ungroup,
  Unlock,
  View,
} from "lucide-react";

export function PlannerToolbar() {
  const mode = usePlannerStore((s) => s.mode);
  const camera = usePlannerStore((s) => s.camera);
  const plot = usePlannerStore((s) => s.plot);
  const selectedIds = usePlannerStore((s) => s.selectedIds);
  const groups = usePlannerStore((s) => s.groups);
  const setMode = usePlannerStore((s) => s.setMode);
  const setCamera = usePlannerStore((s) => s.setCamera);
  const setPlot = usePlannerStore((s) => s.setPlot);
  const addBed = usePlannerStore((s) => s.addBed);
  const removeSelected = usePlannerStore((s) => s.removeSelected);
  const duplicateSelected = usePlannerStore((s) => s.duplicateSelected);
  const groupSelection = usePlannerStore((s) => s.groupSelection);
  const ungroupSelection = usePlannerStore((s) => s.ungroupSelection);
  const undo = usePlannerStore((s) => s.undo);
  const redo = usePlannerStore((s) => s.redo);
  const lockPlot = usePlannerStore((s) => s.lockPlot);
  const lockBeds = usePlannerStore((s) => s.lockBeds);
  const lockIrrigations = usePlannerStore((s) => s.lockIrrigations);
  const lockPlants = usePlannerStore((s) => s.lockPlants);
  const toggleCategoryLock = usePlannerStore((s) => s.toggleCategoryLock);

  const hasSelection = selectedIds.length > 0;
  const canGroup = selectedIds.length >= 2;
  const canUngroup = selectedIds.some((id) =>
    groups.some((g) => g.itemIds.includes(id)),
  );

  const categoryLocks: {
    key: LockCategory;
    active: boolean;
    icon: typeof Box;
    label: string;
  }[] = [
    { key: "plot", active: lockPlot, icon: MapIcon, label: "Parcela" },
    { key: "beds", active: lockBeds, icon: Box, label: "Bancales" },
    {
      key: "irrigations",
      active: lockIrrigations,
      icon: Droplets,
      label: "Riego",
    },
    { key: "plants", active: lockPlants, icon: Sprout, label: "Plantas" },
  ];

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
          disabled={lockPlot}
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
          disabled={lockPlot}
          onCommit={(v) => setPlot({ depthCm: Math.max(50, v) })}
          className="h-8 w-20"
        />
        <span className="text-xs text-muted-foreground">cm</span>
      </div>

      <div className="flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5">
        {categoryLocks.map(({ key, active, icon: Icon, label }) => (
          <Button
            key={key}
            size="icon"
            variant={active ? "default" : "ghost"}
            className="relative h-7 w-7"
            aria-pressed={active}
            aria-label={`${active ? "Desbloquear" : "Bloquear"} ${label.toLowerCase()}`}
            title={`${active ? "Desbloquear" : "Bloquear"} ${label.toLowerCase()}`}
            onClick={() => toggleCategoryLock(key)}
          >
            <Icon className="h-3.5 w-3.5" />
            {active ? (
              <Lock className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5" />
            ) : (
              <Unlock className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 opacity-40" />
            )}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          aria-label="Deshacer"
          title="Deshacer (Ctrl/Cmd+Z)"
          onClick={undo}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          aria-label="Rehacer"
          title="Rehacer (Ctrl/Cmd+Shift+Z)"
          onClick={redo}
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {mode === "design" && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={addBed}
          disabled={lockBeds}
        >
          <Plus className="h-4 w-4" />
          Bancal
        </Button>
      )}

      <Button
        size="sm"
        variant="outline"
        className="gap-1.5"
        onClick={duplicateSelected}
        disabled={!hasSelection}
      >
        <Copy className="h-4 w-4" />
        Duplicar
        {selectedIds.length > 1 && (
          <span className="text-xs text-muted-foreground">
            ({selectedIds.length})
          </span>
        )}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="gap-1.5 text-destructive hover:text-destructive"
        onClick={removeSelected}
        disabled={!hasSelection}
      >
        <Trash2 className="h-4 w-4" />
        Eliminar
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5"
        onClick={groupSelection}
        disabled={!canGroup}
        title="Agrupar (Ctrl/Cmd+G)"
      >
        <GroupIcon className="h-4 w-4" />
        Agrupar
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="gap-1.5"
        onClick={ungroupSelection}
        disabled={!canUngroup}
        title="Desagrupar (Ctrl/Cmd+Shift+G)"
      >
        <Ungroup className="h-4 w-4" />
        Desagrupar
      </Button>
    </div>
  );
}
