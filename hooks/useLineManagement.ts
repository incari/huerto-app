import { useCallback } from "react";
import {
  GardenLine,
  LineGroup,
  GardenConfig,
  PlantingHistoryEntry,
} from "@/lib/plants";

interface UseLineManagementProps {
  lines: GardenLine[];
  lineGroups: LineGroup[];
  config: GardenConfig;
  onLinesChange: (lines: GardenLine[]) => void;
  onLineGroupsChange: (groups: LineGroup[]) => void;
}

export function useLineManagement({
  lines,
  lineGroups,
  config,
  onLinesChange,
  onLineGroupsChange,
}: UseLineManagementProps) {
  // Archive plant to history instead of deleting
  const archivePlant = useCallback(
    (
      lineIndex: number,
      plantId: string,
      notes?: string,
      yieldAmount?: number,
      yieldUnit?: string,
    ) => {
      const newLines = [...lines];
      const line = newLines[lineIndex];
      const plantToArchive = line.plants.find((p) => p.id === plantId);

      if (!plantToArchive) return;

      // Create history entry from the plant being removed
      const historyEntry: PlantingHistoryEntry = {
        id: `history-${Date.now()}`,
        plantId: plantToArchive.plantId,
        varietyId: plantToArchive.varietyId,
        plantedDate: plantToArchive.plantedDate,
        removedDate: new Date().toISOString(),
        harvestNotes: notes,
        yieldAmount,
        yieldUnit,
      };

      // Find all plants in the same position (within 5cm tolerance) and same side
      // to transfer the history to them
      const positionTolerance = 5; // cm
      const samePositionPlants = line.plants.filter(
        (p) =>
          p.id !== plantId &&
          p.side === plantToArchive.side &&
          Math.abs(p.positionCm - plantToArchive.positionCm) <
            positionTolerance,
      );

      // If there are other plants in the same position, add this plant's history to them
      // Otherwise, we'll store it temporarily and add it when a new plant is placed
      const updatedPlants = line.plants
        .filter((p) => p.id !== plantId)
        .map((p) => {
          // If this plant is in the same position, inherit the history
          if (
            p.side === plantToArchive.side &&
            Math.abs(p.positionCm - plantToArchive.positionCm) <
              positionTolerance
          ) {
            return {
              ...p,
              history: [
                ...(plantToArchive.history || []),
                historyEntry,
                ...(p.history || []),
              ],
            };
          }
          return p;
        });

      // If no plants in the same position, we need to store the history for future plants
      // We'll add a "ghost" marker plant that only contains history
      if (samePositionPlants.length === 0) {
        const ghostPlant: PlantedItem = {
          id: `ghost-${lineIndex}-${plantToArchive.positionCm}-${plantToArchive.side}`,
          plantId: "", // Empty plantId marks this as a ghost
          lineIndex,
          positionCm: plantToArchive.positionCm,
          side: plantToArchive.side,
          plantedDate: new Date().toISOString(),
          history: [...(plantToArchive.history || []), historyEntry],
        };
        updatedPlants.push(ghostPlant);
      }

      newLines[lineIndex] = {
        ...line,
        plants: updatedPlants,
      };

      onLinesChange(newLines);
    },
    [lines, onLinesChange],
  );

  // Legacy remove function (for backward compatibility)
  const removePlant = useCallback(
    (lineIndex: number, plantId: string) => {
      archivePlant(lineIndex, plantId);
    },
    [archivePlant],
  );

  const addLine = useCallback(() => {
    if (config.method === "parades-crestall" && config.groupConfig) {
      // Add a new bancal (4 lines) with a new group
      const newGroupId = `group-${Date.now()}`;
      const newGroup: LineGroup = {
        id: newGroupId,
        name: `Bancal ${lineGroups.length + 1}`,
        color: ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"][
          lineGroups.length % 5
        ],
      };
      onLineGroupsChange([...lineGroups, newGroup]);

      // Add 4 lines for the new bancal
      const newLines: GardenLine[] = [];
      for (let i = 0; i < config.groupConfig.linesPerGroup; i++) {
        newLines.push({
          id: `line-${Date.now()}-${i}`,
          lengthCm: config.defaultLineLengthCm || 400,
          plants: [],
          groupId: newGroupId,
        });
      }
      onLinesChange([...lines, ...newLines]);
    } else {
      // Traditional method: add single line
      const lastGroup = lineGroups[lineGroups.length - 1];
      const newLine: GardenLine = {
        id: `line-${Date.now()}`,
        lengthCm: config.defaultLineLengthCm,
        plants: [],
        groupId: lastGroup?.id,
      };
      onLinesChange([...lines, newLine]);
    }
  }, [lines, lineGroups, config, onLinesChange, onLineGroupsChange]);

  const insertLineAfter = useCallback(
    (index: number) => {
      const currentLine = lines[index];
      const newLine: GardenLine = {
        id: `line-${Date.now()}`,
        lengthCm: config.defaultLineLengthCm,
        plants: [],
        groupId: currentLine?.groupId,
      };
      const newLines = [...lines];
      newLines.splice(index + 1, 0, newLine);
      onLinesChange(newLines);
    },
    [lines, config.defaultLineLengthCm, onLinesChange],
  );

  const addGroupSeparator = useCallback(
    (afterIndex: number) => {
      const newGroupId = `group-${Date.now()}`;
      const newGroup: LineGroup = {
        id: newGroupId,
        name: `Bancal ${lineGroups.length + 1}`,
        color: ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"][
          lineGroups.length % 5
        ],
      };
      onLineGroupsChange([...lineGroups, newGroup]);

      // Update lines after the separator to belong to the new group
      const newLines = lines.map((line, index) => {
        if (index > afterIndex) {
          return { ...line, groupId: newGroupId };
        }
        return line;
      });
      onLinesChange(newLines);
    },
    [lines, lineGroups, onLinesChange, onLineGroupsChange],
  );

  const removeLine = useCallback(
    (index: number) => {
      onLinesChange(lines.filter((_, i) => i !== index));
    },
    [lines, onLinesChange],
  );

  const clearAll = useCallback(() => {
    onLinesChange(lines.map((line) => ({ ...line, plants: [] })));
  }, [lines, onLinesChange]);

  return {
    removePlant,
    archivePlant,
    addLine,
    insertLineAfter,
    addGroupSeparator,
    removeLine,
    clearAll,
  };
}
