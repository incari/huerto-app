"use client";

import { useState } from "react";
import {
  Plant,
  PlantedItem as PlantedItemType,
  GardenConfig,
} from "@/lib/plants";
import { PlantedItem } from "./planted-item";
import { RemovePlantDialog } from "./remove-plant-dialog";
import { PlantHistoryDialog } from "./plant-history-dialog";

interface PlantedItemWithDialogsProps {
  plantedItem: PlantedItemType;
  plant: Plant;
  config: GardenConfig;
  plantIndexOnSide: number;
  plants: Plant[];
  lineIndex: number;
  onArchivePlant: (
    notes?: string,
    yieldAmount?: number,
    yieldUnit?: string,
  ) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function PlantedItemWithDialogs({
  plantedItem,
  plant,
  config,
  plantIndexOnSide,
  plants,
  lineIndex,
  onArchivePlant,
  onMouseEnter,
  onMouseLeave,
}: PlantedItemWithDialogsProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  const handleRemoveClick = () => {
    setShowRemoveDialog(true);
  };

  const handleRemoveConfirm = (
    notes?: string,
    yieldAmount?: number,
    yieldUnit?: string,
  ) => {
    onArchivePlant(notes, yieldAmount, yieldUnit);
    setShowRemoveDialog(false);
  };

  const handleShowHistory = () => {
    setShowHistoryDialog(true);
  };

  const handleExportPDF = () => {
    // Only import and execute on client side
    if (typeof window !== "undefined") {
      import("@/lib/pdf-export.client").then(({ exportPlantHistoryToPDF }) => {
        exportPlantHistoryToPDF({
          plantedItem,
          currentPlant: plant,
          plants,
          lineIndex,
        });
      });
    }
  };

  return (
    <>
      <PlantedItem
        plantedItem={plantedItem}
        plant={plant}
        config={config}
        plantIndexOnSide={plantIndexOnSide}
        plants={plants}
        onRemove={handleRemoveClick}
        onShowHistory={handleShowHistory}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />

      <RemovePlantDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        plant={plant}
        plantedItem={plantedItem}
        onConfirm={handleRemoveConfirm}
      />

      <PlantHistoryDialog
        open={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
        currentPlant={plant}
        plantedItem={plantedItem}
        plants={plants}
        onExportPDF={handleExportPDF}
      />
    </>
  );
}
