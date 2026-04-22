"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SplitToolButton, SplitToolOption } from "./split-tool-button";
import { usePlannerStore } from "./store";
import {
  DEFAULT_PLANT_STAGE,
  PLANT_KIND_SPECS,
  PLANT_LABELS,
  PLANT_STAGE_SPECS,
  PlantKind,
  PlantStage,
} from "./types";
import { Sprout } from "lucide-react";

const PLANT_ORDER: PlantKind[] = [
  "tomato",
  "pepper-red",
  "pepper-green",
  "pepper-yellow",
  "eggplant",
  "cucumber",
  "beans",
  "lettuce",
  "strawberry",
  "onion",
  "garlic",
  "pumpkin",
];

const STAGES: PlantStage[] = [1, 2, 3, 4];

export function PlantPalette() {
  const addPlant = usePlannerStore((s) => s.addPlant);
  const [stages, setStages] = useState<Record<PlantKind, PlantStage>>(() =>
    PLANT_ORDER.reduce(
      (acc, kind) => {
        acc[kind] = DEFAULT_PLANT_STAGE;
        return acc;
      },
      {} as Record<PlantKind, PlantStage>,
    ),
  );

  return (
    <div className="w-72 bg-card border-r border-border flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Sprout className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Plantar</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Elige la planta y su etapa. Pulsa el botón para colocarla y arrástrala
          al sitio.
        </p>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 grid grid-cols-2 gap-2">
          {PLANT_ORDER.map((kind) => {
            const spec = PLANT_KIND_SPECS[kind];
            const stageMap = PLANT_STAGE_SPECS[kind];
            const selected = stages[kind];
            const options = STAGES.map<SplitToolOption<PlantStage>>((s) => ({
              value: s,
              label: `Etapa ${s}`,
              hint: stageMap[s].label,
            }));
            return (
              <SplitToolButton<PlantStage>
                key={kind}
                label={PLANT_LABELS[kind]}
                icon={
                  <span className="text-2xl leading-none">{spec.emoji}</span>
                }
                hint={stageMap[selected].label}
                onActivate={() => addPlant(kind, selected)}
                options={options}
                selected={selected}
                onSelect={(s) => setStages((prev) => ({ ...prev, [kind]: s }))}
                menuAriaLabel={`Cambiar etapa de ${PLANT_LABELS[kind]}`}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
