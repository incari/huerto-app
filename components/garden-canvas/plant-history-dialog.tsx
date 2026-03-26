"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plant, PlantedItem, PlantingHistoryEntry } from "@/lib/plants";
import { Download } from "lucide-react";

interface PlantHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlant?: Plant;
  plantedItem: PlantedItem;
  plants: Plant[];
  onExportPDF: () => void;
}

export function PlantHistoryDialog({
  open,
  onOpenChange,
  currentPlant,
  plantedItem,
  plants,
  onExportPDF,
}: PlantHistoryDialogProps) {
  const history = plantedItem.history || [];
  const hasHistory = history.length > 0;

  const getPlantById = (id: string) => plants.find((p) => p.id === id);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateRange = (start: string, end: string) => {
    return `${formatDate(start)} → ${formatDate(end)}`;
  };

  const getCurrentVariety = () => {
    if (!currentPlant || !plantedItem.varietyId) return null;
    return currentPlant.varieties.find((v) => v.id === plantedItem.varietyId);
  };

  const getHistoryVariety = (entry: PlantingHistoryEntry) => {
    const plant = getPlantById(entry.plantId);
    if (!plant || !entry.varietyId) return null;
    return plant.varieties.find((v) => v.id === entry.varietyId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>📜 Historial de Plantaciones</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportPDF}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </DialogTitle>
          <DialogDescription>
            Línea {plantedItem.lineIndex + 1}, {plantedItem.positionCm}cm (
            {plantedItem.side === "top" ? "Arriba" : "Abajo"})
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          <div className="space-y-6 py-4">
            {/* Current Plant */}
            {currentPlant && (
              <div className="relative pl-8">
                {/* Timeline dot - Active */}
                <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-green-500 border-4 border-background shadow-sm" />
                {/* Timeline line */}
                {hasHistory && (
                  <div className="absolute left-[7px] top-5 bottom-0 w-0.5 bg-border" />
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentPlant.emoji}</span>
                    <div>
                      <div className="font-semibold">
                        {currentPlant.name}
                        {getCurrentVariety() && (
                          <span className="text-muted-foreground">
                            {" "}
                            ({getCurrentVariety()?.name})
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        ACTUAL
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    📅 Plantada: {formatDate(plantedItem.plantedDate)}
                  </div>
                </div>
              </div>
            )}

            {/* Historical Plants */}
            {hasHistory ? (
              history.map((entry, index) => {
                const plant = getPlantById(entry.plantId);
                if (!plant) return null;

                const variety = getHistoryVariety(entry);
                const isLast = index === history.length - 1;

                return (
                  <div key={entry.id} className="relative pl-8">
                    {/* Timeline dot - Historical */}
                    <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-muted border-4 border-background shadow-sm" />
                    {/* Timeline line */}
                    {!isLast && (
                      <div className="absolute left-[7px] top-5 bottom-0 w-0.5 bg-border" />
                    )}

                    <div className="space-y-2 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl opacity-70">
                          {plant.emoji}
                        </span>
                        <div className="font-medium text-muted-foreground">
                          {plant.name}
                          {variety && <span> ({variety.name})</span>}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                          📅 {formatDateRange(entry.plantedDate, entry.removedDate)}
                        </div>
                        {entry.yieldAmount && (
                          <div>
                            📊 Cosecha: {entry.yieldAmount} {entry.yieldUnit}
                          </div>
                        )}
                        {entry.harvestNotes && (
                          <div className="bg-muted rounded p-2 mt-2">
                            📝 {entry.harvestNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">🌱</div>
                <div>No hay historial previo en esta posición</div>
                <div className="text-sm mt-1">
                  Esta es la primera plantación aquí
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

