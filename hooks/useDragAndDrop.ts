import { useState, useCallback } from "react";
import { GardenLine, Plant, PlantedItem, GardenConfig } from "@/lib/plants";
import { SelectedPlantData } from "@/components/plant-sidebar";

const PIXELS_PER_CM = 2;

interface UseDragAndDropProps {
  lines: GardenLine[];
  onLinesChange: (lines: GardenLine[]) => void;
  selectedPlant: SelectedPlantData | null;
  config: GardenConfig;
  findNextValidPosition: (
    line: GardenLine,
    plant: Plant,
    varietyId: string | undefined,
    preferredPositionCm: number,
    side: "top" | "bottom",
  ) => number | null;
}

export function useDragAndDrop({
  lines,
  onLinesChange,
  selectedPlant,
  config,
  findNextValidPosition,
}: UseDragAndDropProps) {
  const [dragOverLine, setDragOverLine] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const [dragSide, setDragSide] = useState<"top" | "bottom">("top");
  const [hoverLineIndex, setHoverLineIndex] = useState<number | null>(null);
  const [hoverSide, setHoverSide] = useState<"top" | "bottom" | null>(null);
  const [hoverPositionCm, setHoverPositionCm] = useState<number | null>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent, lineIndex: number) => {
      e.preventDefault();
      setDragOverLine(null);
      setDragPosition(null);

      const plantData = e.dataTransfer.getData("plant");
      if (!plantData) return;

      const data: SelectedPlantData = JSON.parse(plantData);
      const plant = data.plant;
      const variety = data.variety;
      const line = lines[lineIndex];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const lineMiddle = rect.height / 2;
      const side: "top" | "bottom" = y < lineMiddle ? "top" : "bottom";
      const positionCm = x / PIXELS_PER_CM;

      const validPosition = findNextValidPosition(
        line,
        plant,
        variety?.id,
        positionCm,
        side,
      );

      if (validPosition !== null) {
        // Look for ghost plants (history markers) in the same position
        const positionTolerance = 5; // cm
        const ghostPlant = line.plants.find(
          (p) =>
            p.plantId === "" && // Ghost plants have empty plantId
            p.side === side &&
            Math.abs(p.positionCm - validPosition) < positionTolerance,
        );

        const newPlant: PlantedItem = {
          id: `${plant.id}-${Date.now()}`,
          plantId: plant.id,
          varietyId: variety?.id,
          lineIndex,
          positionCm: validPosition,
          side,
          plantedDate: config.currentPlantingDate,
          // Inherit history from ghost plant if it exists
          history: ghostPlant?.history || undefined,
        };

        const newLines = [...lines];
        newLines[lineIndex] = {
          ...line,
          plants: [
            ...line.plants.filter((p) => p.id !== ghostPlant?.id), // Remove ghost plant
            newPlant,
          ].sort((a, b) => a.positionCm - b.positionCm),
        };
        onLinesChange(newLines);
      }
    },
    [lines, onLinesChange, config.currentPlantingDate, findNextValidPosition],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, lineIndex: number) => {
      e.preventDefault();
      setDragOverLine(lineIndex);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const lineMiddle = rect.height / 2;
      setDragPosition(Math.round(x / PIXELS_PER_CM));
      setDragSide(y < lineMiddle ? "top" : "bottom");
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent, lineIndex: number, side: "top" | "bottom") => {
      if (!selectedPlant) {
        setHoverLineIndex(null);
        setHoverSide(null);
        setHoverPositionCm(null);
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const positionCm = x / PIXELS_PER_CM;

      const line = lines[lineIndex];
      const validPosition = findNextValidPosition(
        line,
        selectedPlant.plant,
        selectedPlant.variety?.id,
        positionCm,
        side,
      );

      setHoverLineIndex(lineIndex);
      setHoverSide(side);
      setHoverPositionCm(validPosition);
    },
    [selectedPlant, lines, findNextValidPosition],
  );

  const handleMouseLeave = useCallback(() => {
    setHoverLineIndex(null);
    setHoverSide(null);
    setHoverPositionCm(null);
  }, []);

  const handleLineClick = useCallback(
    (e: React.MouseEvent, lineIndex: number, side: "top" | "bottom") => {
      if (!selectedPlant) return;

      const line = lines[lineIndex];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const positionCm = x / PIXELS_PER_CM;

      const validPosition = findNextValidPosition(
        line,
        selectedPlant.plant,
        selectedPlant.variety?.id,
        positionCm,
        side,
      );

      if (validPosition !== null) {
        // Look for ghost plants (history markers) in the same position
        const positionTolerance = 5; // cm
        const ghostPlant = line.plants.find(
          (p) =>
            p.plantId === "" && // Ghost plants have empty plantId
            p.side === side &&
            Math.abs(p.positionCm - validPosition) < positionTolerance,
        );

        const newPlant: PlantedItem = {
          id: `${selectedPlant.plant.id}-${Date.now()}`,
          plantId: selectedPlant.plant.id,
          varietyId: selectedPlant.variety?.id,
          lineIndex,
          positionCm: validPosition,
          side,
          plantedDate: config.currentPlantingDate,
          // Inherit history from ghost plant if it exists
          history: ghostPlant?.history || undefined,
        };

        const newLines = [...lines];
        newLines[lineIndex] = {
          ...line,
          plants: [
            ...line.plants.filter((p) => p.id !== ghostPlant?.id), // Remove ghost plant
            newPlant,
          ].sort((a, b) => a.positionCm - b.positionCm),
        };
        onLinesChange(newLines);
      }
    },
    [
      lines,
      onLinesChange,
      selectedPlant,
      config.currentPlantingDate,
      findNextValidPosition,
    ],
  );

  return {
    dragOverLine,
    dragPosition,
    dragSide,
    hoverLineIndex,
    hoverSide,
    hoverPositionCm,
    handleDrop,
    handleDragOver,
    handleMouseMove,
    handleMouseLeave,
    handleLineClick,
    setDragOverLine,
    setDragPosition,
  };
}
