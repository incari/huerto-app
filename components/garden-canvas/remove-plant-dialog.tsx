"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plant, PlantedItem } from "@/lib/plants";

interface RemovePlantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plant: Plant;
  plantedItem: PlantedItem;
  onConfirm: (notes?: string, yieldAmount?: number, yieldUnit?: string) => void;
}

const YIELD_UNITS = ["kg", "g", "unidades", "manojos", "litros"];

export function RemovePlantDialog({
  open,
  onOpenChange,
  plant,
  plantedItem,
  onConfirm,
}: RemovePlantDialogProps) {
  const [notes, setNotes] = useState("");
  const [yieldAmount, setYieldAmount] = useState("");
  const [yieldUnit, setYieldUnit] = useState("kg");

  const handleConfirm = () => {
    const amount = yieldAmount ? parseFloat(yieldAmount) : undefined;
    onConfirm(
      notes.trim() || undefined,
      amount,
      amount ? yieldUnit : undefined
    );
    // Reset form
    setNotes("");
    setYieldAmount("");
    setYieldUnit("kg");
  };

  const variety = plantedItem.varietyId
    ? plant.varieties.find((v) => v.id === plantedItem.varietyId)
    : null;

  const plantName = variety ? `${plant.name} (${variety.name})` : plant.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{plant.emoji}</span>
            ¿Quitar {plantName}?
          </DialogTitle>
          <DialogDescription>
            Esta planta se archivará en el historial de esta posición. Puedes
            agregar notas sobre la cosecha para referencia futura.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Harvest Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              📝 Notas de cosecha <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder='Ej: "Buena producción, plantas saludables"'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Yield Amount */}
          <div className="space-y-2">
            <Label htmlFor="yield">
              📊 Cantidad cosechada <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="yield"
                type="number"
                step="0.1"
                min="0"
                placeholder="Ej: 5"
                value={yieldAmount}
                onChange={(e) => setYieldAmount(e.target.value)}
                className="flex-1"
              />
              <Select value={yieldUnit} onValueChange={setYieldUnit}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YIELD_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Planting Info */}
          <div className="rounded-lg bg-muted p-3 text-sm">
            <div className="font-medium mb-1">Información de plantación:</div>
            <div className="text-muted-foreground space-y-0.5">
              <div>📅 Plantada: {new Date(plantedItem.plantedDate).toLocaleDateString('es-ES')}</div>
              <div>📍 Posición: {plantedItem.positionCm}cm ({plantedItem.side === "top" ? "Arriba" : "Abajo"})</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} variant="destructive">
            Quitar y Archivar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

