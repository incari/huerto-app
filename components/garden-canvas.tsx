"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import {
  Plant,
  PlantedItem,
  GardenLine,
  GardenConfig,
  LineGroup,
  DRIPPER_SPACING_CM,
  getPlantSpacing,
} from "@/lib/plants";
import { SelectedPlantData } from "@/components/plant-sidebar";
import { Ruler } from "./garden-canvas/ruler";
import { Toolbar } from "./garden-canvas/toolbar";
import { EmptyState } from "./garden-canvas/empty-state";
import { GardenLineRow } from "./garden-canvas/garden-line-row";

interface GardenCanvasProps {
  lines: GardenLine[];
  plants: Plant[];
  lineGroups: LineGroup[];
  onLinesChange: (lines: GardenLine[]) => void;
  onLineGroupsChange: (groups: LineGroup[]) => void;
  selectedPlant: SelectedPlantData | null;
  config: GardenConfig;
}

const PIXELS_PER_CM = 2;

export function GardenCanvas({
  lines,
  plants,
  lineGroups,
  onLinesChange,
  onLineGroupsChange,
  selectedPlant,
  config,
}: GardenCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragOverLine, setDragOverLine] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const [dragSide, setDragSide] = useState<"top" | "bottom">("top");
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [hoverLineIndex, setHoverLineIndex] = useState<number | null>(null);
  const [hoverSide, setHoverSide] = useState<"top" | "bottom" | null>(null);
  const [hoverPositionCm, setHoverPositionCm] = useState<number | null>(null);

  const getPlantById = (id: string) => plants.find((p) => p.id === id);

  // Calculate line heights based on method
  const getLineSpacing = (
    lineIndex: number,
  ): {
    height: number;
    marginBottom: number;
    isGroupEnd: boolean;
    isMiddleSpace: boolean;
  } => {
    if (config.method === "parades-crestall" && config.groupConfig) {
      const {
        linesPerGroup,
        subgroupSize,
        subgroupSpacingCm,
        middleSpacingCm,
        interGroupSpacingCm,
      } = config.groupConfig;
      const positionInGroup = lineIndex % linesPerGroup;
      const isGroupEnd = positionInGroup === linesPerGroup - 1;
      // Middle space is after the first subgroup (after line 2 in a group of 4)
      // For a 4-line group (0,1,2,3), middle space is when positionInGroup === 1
      const isMiddleSpace = positionInGroup === subgroupSize - 1;

      return {
        height: isMiddleSpace
          ? middleSpacingCm * PIXELS_PER_CM
          : subgroupSpacingCm * PIXELS_PER_CM,
        marginBottom: isGroupEnd ? interGroupSpacingCm * PIXELS_PER_CM : 0,
        isGroupEnd,
        isMiddleSpace,
      };
    }

    return {
      height: config.lineSeparationCm * PIXELS_PER_CM,
      marginBottom: 0,
      isGroupEnd: false,
      isMiddleSpace: false,
    };
  };

  // Encuentra la siguiente posición válida para una planta
  const findNextValidPosition = (
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
      Math.round(preferredPositionCm / DRIPPER_SPACING_CM) * DRIPPER_SPACING_CM;
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

    const forward = searchPositions(snappedPreferred + DRIPPER_SPACING_CM, 1);
    if (forward !== null) return forward;

    return searchPositions(snappedPreferred - DRIPPER_SPACING_CM, -1);
  };

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
        const newPlant: PlantedItem = {
          id: `${plant.id}-${Date.now()}`,
          plantId: plant.id,
          varietyId: variety?.id,
          lineIndex,
          positionCm: validPosition,
          side,
          plantedDate: config.currentPlantingDate,
        };

        const newLines = [...lines];
        newLines[lineIndex] = {
          ...line,
          plants: [...line.plants, newPlant].sort(
            (a, b) => a.positionCm - b.positionCm,
          ),
        };
        onLinesChange(newLines);
      }
    },
    [lines, onLinesChange, plants],
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
    [selectedPlant, lines, plants],
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
        const newPlant: PlantedItem = {
          id: `${selectedPlant.plant.id}-${Date.now()}`,
          plantId: selectedPlant.plant.id,
          varietyId: selectedPlant.variety?.id,
          lineIndex,
          positionCm: validPosition,
          side,
          plantedDate: config.currentPlantingDate,
        };

        const newLines = [...lines];
        newLines[lineIndex] = {
          ...line,
          plants: [...line.plants, newPlant].sort(
            (a, b) => a.positionCm - b.positionCm,
          ),
        };
        onLinesChange(newLines);
      }
    },
    [lines, onLinesChange, selectedPlant, plants],
  );

  const removePlant = useCallback(
    (lineIndex: number, plantId: string) => {
      const newLines = [...lines];
      newLines[lineIndex] = {
        ...newLines[lineIndex],
        plants: newLines[lineIndex].plants.filter((p) => p.id !== plantId),
      };
      onLinesChange(newLines);
    },
    [lines, onLinesChange],
  );

  const addLine = () => {
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
  };

  const insertLineAfter = (index: number) => {
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
  };

  const addGroupSeparator = (afterIndex: number) => {
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
  };

  const removeLine = (index: number) => {
    onLinesChange(lines.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    onLinesChange(lines.map((line) => ({ ...line, plants: [] })));
  };

  const maxLineLengthCm = Math.max(
    ...lines.map((l) => l.lengthCm),
    config.defaultLineLengthCm,
  );

  // Generate dripper positions
  const dripperPositions = useMemo(
    () =>
      Array.from(
        { length: Math.floor(maxLineLengthCm / DRIPPER_SPACING_CM) + 1 },
        (_, i) => i * DRIPPER_SPACING_CM,
      ),
    [maxLineLengthCm],
  );

  // Group lines by groupId for visual grouping
  const groupedLines = useMemo(() => {
    const groups: {
      groupId: string;
      lines: { line: GardenLine; originalIndex: number }[];
    }[] = [];
    let currentGroupId: string | undefined = undefined;

    lines.forEach((line, index) => {
      if (line.groupId !== currentGroupId) {
        groups.push({ groupId: line.groupId || "default", lines: [] });
        currentGroupId = line.groupId;
      }
      groups[groups.length - 1].lines.push({ line, originalIndex: index });
    });

    return groups;
  }, [lines]);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-background overflow-hidden">
      <Toolbar onAddLine={addLine} onClearAll={clearAll} config={config} />

      {/* Canvas */}
      <div className="min-h-0 overflow-auto p-6 flex-1" ref={canvasRef}>
        <div className="inline-block">
          <Ruler
            maxLineLengthCm={maxLineLengthCm}
            dripperPositions={dripperPositions}
          />

          {/* Lines container with dotted border */}
          <div className="inline-block bg-amber-50/50 rounded-xl border-2 border-dashed border-amber-200 p-4 pl-24 pr-8 pb-8">
            {groupedLines.map((group, groupIndex) => {
              const groupData = lineGroups.find((g) => g.id === group.groupId);

              return (
                <div key={group.groupId} className="relative mb-4">
                  {/* Group label */}
                  {groupData && (
                    <div className="absolute -left-20 top-0 bottom-0 flex items-center">
                      <div
                        className="writing-mode-vertical text-xs font-medium px-1 py-2 rounded"
                        style={{
                          backgroundColor: groupData.color + "20",
                          color: groupData.color,
                          writingMode: "vertical-rl",
                          textOrientation: "mixed",
                          transform: "rotate(180deg)",
                        }}
                      >
                        {groupData.name}
                      </div>
                    </div>
                  )}

                  {group.lines.map(({ line, originalIndex }, indexInGroup) => {
                    const spacing = getLineSpacing(indexInGroup);
                    const isLastInGroup =
                      indexInGroup === group.lines.length - 1;

                    return (
                      <GardenLineRow
                        key={line.id}
                        line={line}
                        originalIndex={originalIndex}
                        indexInGroup={indexInGroup}
                        isLastInGroup={isLastInGroup}
                        spacing={spacing}
                        dragOverLine={dragOverLine}
                        dragPosition={dragPosition}
                        dragSide={dragSide}
                        hoveredLineIndex={hoveredLineIndex}
                        hoverLineIndex={hoverLineIndex}
                        hoverSide={hoverSide}
                        hoverPositionCm={hoverPositionCm}
                        selectedPlant={selectedPlant}
                        config={config}
                        dripperPositions={dripperPositions}
                        getPlantById={getPlantById}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={() => {
                          setDragOverLine(null);
                          setDragPosition(null);
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        onLineClick={handleLineClick}
                        onRemovePlant={removePlant}
                        onInsertLineAfter={insertLineAfter}
                        onAddGroupSeparator={addGroupSeparator}
                        onRemoveLine={removeLine}
                        setHoveredLineIndex={setHoveredLineIndex}
                        groupData={groupData}
                        lineGroups={lineGroups}
                        onLineGroupsChange={onLineGroupsChange}
                      />
                    );
                  })}

                  {/* Group separator visual - only between groups */}
                  {groupIndex < groupedLines.length - 1 && (
                    <div
                      className="relative border-t-2 border-dashed border-amber-400/50 my-4"
                      style={{
                        marginTop: config.groupConfig?.interGroupSpacingCm
                          ? (config.groupConfig.interGroupSpacingCm / 2) *
                            PIXELS_PER_CM
                          : 30,
                        marginBottom: config.groupConfig?.interGroupSpacingCm
                          ? (config.groupConfig.interGroupSpacingCm / 2) *
                            PIXELS_PER_CM
                          : 30,
                      }}
                    >
                      <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-50 px-3 text-xs text-amber-600 font-medium">
                        {config.groupConfig?.interGroupSpacingCm || 60}cm
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {lines.length === 0 && (
              <EmptyState
                onAddLine={addLine}
                defaultLineLengthCm={config.defaultLineLengthCm}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
