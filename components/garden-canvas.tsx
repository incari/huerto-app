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
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ZoomIn, ZoomOut, RotateCcw, Minus } from "lucide-react";

interface GardenCanvasProps {
  lines: GardenLine[];
  plants: Plant[];
  lineGroups: LineGroup[];
  onLinesChange: (lines: GardenLine[]) => void;
  onLineGroupsChange: (groups: LineGroup[]) => void;
  selectedPlant: SelectedPlantData | null;
  config: GardenConfig;
  scale: number;
  onScaleChange: (scale: number) => void;
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
  scale,
  onScaleChange,
}: GardenCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragOverLine, setDragOverLine] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const [dragSide, setDragSide] = useState<"top" | "bottom">("top");

  const getPlantById = (id: string) => plants.find((p) => p.id === id);

  // Calculate line heights based on method
  const getLineSpacing = (
    lineIndex: number,
  ): { height: number; marginBottom: number; isGroupEnd: boolean } => {
    if (config.method === "parades-crestall" && config.groupConfig) {
      const { linesPerGroup, intraGroupSpacingCm, interGroupSpacingCm } =
        config.groupConfig;
      const positionInGroup = lineIndex % linesPerGroup;
      const isGroupEnd = positionInGroup === linesPerGroup - 1;

      return {
        height: intraGroupSpacingCm * PIXELS_PER_CM,
        marginBottom: isGroupEnd ? interGroupSpacingCm * PIXELS_PER_CM : 0,
        isGroupEnd,
      };
    }

    return {
      height: config.lineSeparationCm * PIXELS_PER_CM,
      marginBottom: 0,
      isGroupEnd: false,
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
      const x = (e.clientX - rect.left) / scale;
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
          plantedDate: new Date().toISOString(),
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
    [lines, onLinesChange, scale, plants],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, lineIndex: number) => {
      e.preventDefault();
      setDragOverLine(lineIndex);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = e.clientY - rect.top;
      const lineMiddle = rect.height / 2;
      setDragPosition(Math.round(x / PIXELS_PER_CM));
      setDragSide(y < lineMiddle ? "top" : "bottom");
    },
    [scale],
  );

  const handleLineClick = useCallback(
    (e: React.MouseEvent, lineIndex: number, side: "top" | "bottom") => {
      if (!selectedPlant) return;

      const line = lines[lineIndex];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
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
          plantedDate: new Date().toISOString(),
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
    [lines, onLinesChange, selectedPlant, scale, plants],
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
    const lastGroup = lineGroups[lineGroups.length - 1];
    const newLine: GardenLine = {
      id: `line-${Date.now()}`,
      lengthCm: config.defaultLineLengthCm,
      plants: [],
      groupId: lastGroup?.id,
    };
    onLinesChange([...lines, newLine]);
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
  const canvasWidthPx = maxLineLengthCm * PIXELS_PER_CM + 120;

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
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addLine}
          >
            <Plus className="h-4 w-4 mr-1" />
            Linea
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-sky-500"></span>
            Gotero cada {DRIPPER_SPACING_CM}cm
          </span>
          {config.method === "parades-crestall" && config.groupConfig && (
            <span className="text-primary font-medium">
              Parades: {config.groupConfig.intraGroupSpacingCm}cm entre lineas,{" "}
              {config.groupConfig.interGroupSpacingCm}cm entre grupos
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onScaleChange(Math.max(0.5, scale - 0.25))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onScaleChange(Math.min(2, scale + 0.25))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="flex-1 overflow-auto p-6"
        ref={canvasRef}
      >
        <div
          className="relative bg-amber-50/50 rounded-xl border-2 border-dashed border-amber-200"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: canvasWidthPx,
            paddingTop: config.groupConfig?.paddingCm
              ? config.groupConfig.paddingCm * PIXELS_PER_CM
              : 40,
            paddingBottom: config.groupConfig?.paddingCm
              ? config.groupConfig.paddingCm * PIXELS_PER_CM
              : 40,
          }}
        >
          {/* Ruler - aligned with dripper positions */}
          <div
            className="absolute top-2 left-20 flex items-end h-8"
            style={{ width: maxLineLengthCm * PIXELS_PER_CM }}
          >
            {dripperPositions.map((pos) => (
              <div
                key={pos}
                className="absolute flex flex-col items-center"
                style={{
                  left: pos * PIXELS_PER_CM,
                  transform: "translateX(-50%)",
                }}
              >
                {pos % 50 === 0 && (
                  <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                    {pos}cm
                  </span>
                )}
                <div
                  className={`w-px ${pos % 50 === 0 ? "h-3 bg-muted-foreground/40" : "h-1.5 bg-muted-foreground/20"}`}
                />
              </div>
            ))}
          </div>

          {/* Lines grouped */}
          <div className="pt-10 pl-20 pr-4">
            {groupedLines.map((group, groupIndex) => {
              const groupData = lineGroups.find((g) => g.id === group.groupId);

              return (
                <div
                  key={group.groupId}
                  className="relative"
                >
                  {/* Group label */}
                  {groupData && (
                    <div className="absolute -left-16 top-0 bottom-0 flex items-center">
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
                    const spacing = getLineSpacing(originalIndex);
                    const isLastInGroup =
                      indexInGroup === group.lines.length - 1;

                    return (
                      <div key={line.id}>
                        <div
                          className="relative group"
                          style={{ height: spacing.height }}
                        >
                          {/* Top click zone */}
                          <div
                            className={`
                              absolute left-0 h-1/2 cursor-pointer transition-all rounded-t-lg
                              ${selectedPlant ? "hover:bg-primary/10" : ""}
                            `}
                            style={{
                              top: 0,
                              width: line.lengthCm * PIXELS_PER_CM,
                            }}
                            onDrop={(e) => handleDrop(e, originalIndex)}
                            onDragOver={(e) => handleDragOver(e, originalIndex)}
                            onDragLeave={() => {
                              setDragOverLine(null);
                              setDragPosition(null);
                            }}
                            onClick={(e) =>
                              handleLineClick(e, originalIndex, "top")
                            }
                          />

                          {/* Drip line */}
                          <div
                            className={`
                              absolute left-0 h-1 rounded-full pointer-events-none transition-all
                              ${dragOverLine === originalIndex ? "bg-primary h-1.5" : "bg-stone-800"}
                            `}
                            style={{
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: line.lengthCm * PIXELS_PER_CM,
                            }}
                          >
                            {/* Dripper marks */}
                            {dripperPositions
                              .filter((pos) => pos <= line.lengthCm)
                              .map((pos) => (
                                <div
                                  key={pos}
                                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                                  style={{ left: pos * PIXELS_PER_CM }}
                                >
                                  <div className="w-2 h-2 rounded-full bg-sky-500 border border-sky-600" />
                                </div>
                              ))}
                          </div>

                          {/* Bottom click zone */}
                          <div
                            className={`
                              absolute left-0 h-1/2 cursor-pointer transition-all rounded-b-lg
                              ${selectedPlant ? "hover:bg-primary/10" : ""}
                            `}
                            style={{
                              bottom: 0,
                              width: line.lengthCm * PIXELS_PER_CM,
                            }}
                            onDrop={(e) => handleDrop(e, originalIndex)}
                            onDragOver={(e) => handleDragOver(e, originalIndex)}
                            onDragLeave={() => {
                              setDragOverLine(null);
                              setDragPosition(null);
                            }}
                            onClick={(e) =>
                              handleLineClick(e, originalIndex, "bottom")
                            }
                          />

                          {/* Drag preview */}
                          {dragOverLine === originalIndex &&
                            dragPosition !== null && (
                              <div
                                className={`
                                absolute -translate-x-1/2 opacity-50 text-2xl pointer-events-none
                                ${dragSide === "top" ? "top-0" : "bottom-0"}
                              `}
                                style={{ left: dragPosition * PIXELS_PER_CM }}
                              >
                                {selectedPlant?.plant.emoji || "?"}
                              </div>
                            )}

                          {/* Plants on this line */}
                          {line.plants.map((plantedItem) => {
                            const plant = getPlantById(plantedItem.plantId);
                            if (!plant) return null;

                            const variety = plantedItem.varietyId
                              ? plant.varieties.find(
                                  (v) => v.id === plantedItem.varietyId,
                                )
                              : null;

                            return (
                              <div
                                key={plantedItem.id}
                                className={`
                                  absolute -translate-x-1/2 cursor-pointer group/plant hover:z-50
                                  ${plantedItem.side === "top" ? "top-0" : "bottom-0"}
                                `}
                                style={{
                                  left: plantedItem.positionCm * PIXELS_PER_CM,
                                  zIndex: 10,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePlant(originalIndex, plantedItem.id);
                                }}
                              >
                                <span className="text-2xl select-none hover:scale-110 transition-transform block">
                                  {plant.emoji}
                                </span>
                                <div
                                  className={`
                                  absolute left-1/2 -translate-x-1/2 opacity-0 group-hover/plant:opacity-100 
                                  transition-opacity bg-card border text-foreground text-xs 
                                  px-2 py-1 rounded shadow-lg whitespace-nowrap z-50
                                  ${plantedItem.side === "top" ? "bottom-full mb-2" : "top-full mt-2"}
                                `}
                                >
                                  <div className="font-medium">
                                    {plant.name}
                                    {variety ? ` (${variety.name})` : ""}
                                  </div>
                                  <div className="text-muted-foreground flex items-center gap-2">
                                    <span>{plantedItem.positionCm}cm</span>
                                    <span className="text-destructive">
                                      Clic para eliminar
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Line controls */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 pl-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ left: line.lengthCm * PIXELS_PER_CM }}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeLine(originalIndex)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Line label */}
                          <div className="absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full pr-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              L{originalIndex + 1}
                            </span>
                          </div>

                          {/* Insert line button */}
                          <div
                            className="absolute left-0 flex items-center justify-center group/separator"
                            style={{
                              bottom: -16,
                              width: line.lengthCm * PIXELS_PER_CM,
                              height: 32,
                            }}
                          >
                            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-transparent group-hover/separator:border-amber-300 transition-colors" />
                            <div className="flex gap-2 opacity-0 group-hover/separator:opacity-100 transition-opacity z-20">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 bg-background hover:bg-primary/10 text-xs"
                                onClick={() => insertLineAfter(originalIndex)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Linea
                              </Button>
                              {!isLastInGroup && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 bg-background hover:bg-amber-500/10 text-xs text-amber-600"
                                  onClick={() =>
                                    addGroupSeparator(originalIndex)
                                  }
                                >
                                  <Minus className="h-3 w-3 mr-1" />
                                  Separador
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
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
          </div>

          {lines.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <p className="text-lg font-medium mb-2">No hay lineas de goteo</p>
              <p className="text-sm mb-4">
                Anade lineas para empezar a plantar
              </p>
              <Button onClick={addLine}>
                <Plus className="h-4 w-4 mr-1" />
                Anadir primera linea
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
