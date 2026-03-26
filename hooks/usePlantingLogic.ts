import { useCallback } from "react";
import {
  Plant,
  GardenLine,
  DRIPPER_SPACING_CM,
  getPlantSpacing,
} from "@/lib/plants";

interface UsePlantingLogicProps {
  getPlantById: (id: string) => Plant | undefined;
}

export function usePlantingLogic({ getPlantById }: UsePlantingLogicProps) {
  /**
   * Finds the next valid position for a plant on a line
   * Ensures proper spacing and snaps to dripper positions
   */
  const findNextValidPosition = useCallback(
    (
      line: GardenLine,
      plant: Plant,
      varietyId: string | undefined,
      preferredPositionCm: number,
      side: "top" | "bottom",
    ): number | null => {
      const plantsOnSide = line.plants.filter((p) => p.side === side);
      const plantSpacing = getPlantSpacing(plant, varietyId);

      const searchPositions = (
        startPos: number,
        direction: 1 | -1,
      ): number | null => {
        let pos = startPos;
        while (pos >= 0 && pos <= line.lengthCm) {
          const snapped =
            Math.round(pos / DRIPPER_SPACING_CM) * DRIPPER_SPACING_CM;

          const hasConflict = plantsOnSide.some((p) => {
            const existingPlant = getPlantById(p.plantId);
            if (!existingPlant) return false;
            const existingSpacing = getPlantSpacing(existingPlant, p.varietyId);
            const minDistance = (plantSpacing + existingSpacing) / 2;
            return Math.abs(p.positionCm - snapped) < minDistance;
          });

          if (!hasConflict && snapped >= 0 && snapped <= line.lengthCm) {
            return snapped;
          }

          pos += direction * DRIPPER_SPACING_CM;
        }
        return null;
      };

      const snappedPreferred =
        Math.round(preferredPositionCm / DRIPPER_SPACING_CM) *
        DRIPPER_SPACING_CM;
      const hasConflictAtPreferred = plantsOnSide.some((p) => {
        const existingPlant = getPlantById(p.plantId);
        if (!existingPlant) return false;
        const existingSpacing = getPlantSpacing(existingPlant, p.varietyId);
        const minDistance = (plantSpacing + existingSpacing) / 2;
        return Math.abs(p.positionCm - snappedPreferred) < minDistance;
      });

      if (
        !hasConflictAtPreferred &&
        snappedPreferred >= 0 &&
        snappedPreferred <= line.lengthCm
      ) {
        return snappedPreferred;
      }

      const forward = searchPositions(
        snappedPreferred + DRIPPER_SPACING_CM,
        1,
      );
      if (forward !== null) return forward;

      return searchPositions(snappedPreferred - DRIPPER_SPACING_CM, -1);
    },
    [getPlantById],
  );

  return {
    findNextValidPosition,
  };
}

