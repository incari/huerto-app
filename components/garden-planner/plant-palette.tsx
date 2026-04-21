"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlannerStore } from "./store";
import { PLANT_KIND_SPECS, PLANT_LABELS, PlantKind } from "./types";
import { Sprout } from "lucide-react";

const PLANT_ORDER: PlantKind[] = ["tomato", "pepper"];

export function PlantPalette() {
  const addPlant = usePlannerStore((s) => s.addPlant);

  return (
    <div className="w-72 bg-card border-r border-border flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Sprout className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Plantar</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Añade plantas al huerto. Haz clic para colocar en el centro y
          arrástralas a su sitio.
        </p>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 grid grid-cols-2 gap-2">
          {PLANT_ORDER.map((kind) => {
            const spec = PLANT_KIND_SPECS[kind];
            return (
              <Button
                key={kind}
                variant="outline"
                onClick={() => addPlant(kind)}
                className="h-auto flex-col gap-1.5 py-3"
              >
                <span className="text-2xl leading-none">{spec.emoji}</span>
                <span className="text-xs">{PLANT_LABELS[kind]}</span>
                <span className="text-[10px] text-muted-foreground">
                  {spec.spacingCm} cm
                </span>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

