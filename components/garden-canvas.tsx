"use client";

import { useRef, useState, useMemo } from "react";
import {
  Plant,
  GardenLine,
  GardenConfig,
  LineGroup,
  DRIPPER_SPACING_CM,
} from "@/lib/plants";
import { SelectedPlantData } from "@/components/plant-sidebar";
import { Ruler } from "./garden-canvas/ruler";
import { Toolbar } from "./garden-canvas/toolbar";
import { EmptyState } from "./garden-canvas/empty-state";
import { LineGroupContainer } from "./garden-canvas/line-group-container";
import { GroupSeparator } from "./garden-canvas/group-separator";
import { PDFPreviewDialog } from "./garden-canvas/pdf-preview-dialog";
import { usePlantingLogic } from "@/hooks/usePlantingLogic";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useLineManagement } from "@/hooks/useLineManagement";

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
  const gardenContentRef = useRef<HTMLDivElement>(null); // Ref for the garden content with background and border
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);

  // PDF Preview state
  const [pdfPreview, setPdfPreview] = useState<{
    open: boolean;
    blob: Blob | null;
    fileName: string;
    title: string;
  }>({
    open: false,
    blob: null,
    fileName: "",
    title: "",
  });

  const getPlantById = (id: string) => plants.find((p) => p.id === id);

  // Custom hooks for logic separation
  const { findNextValidPosition } = usePlantingLogic({ getPlantById });

  const {
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
  } = useDragAndDrop({
    lines,
    onLinesChange,
    selectedPlant,
    config,
    findNextValidPosition,
  });

  const {
    removePlant,
    archivePlant,
    addLine,
    insertLineAfter,
    addGroupSeparator,
    removeLine,
    clearAll,
  } = useLineManagement({
    lines,
    lineGroups,
    config,
    onLinesChange,
    onLineGroupsChange,
  });

  // Export full garden as visual (screenshot)
  const handleExportVisualPDF = async () => {
    if (typeof window !== "undefined" && gardenContentRef.current) {
      const { exportFullGardenVisualPDF } =
        await import("@/lib/pdf-export.client");
      const result = await exportFullGardenVisualPDF(gardenContentRef.current!);

      setPdfPreview({
        open: true,
        blob: result.blob,
        fileName: result.fileName,
        title: "Vista Previa - Exportación Visual",
      });
    }
  };

  // Export full garden as table
  const handleExportTablePDF = async () => {
    if (typeof window !== "undefined") {
      const { exportFullGardenTablePDF } =
        await import("@/lib/pdf-export.client");
      const result = exportFullGardenTablePDF(lines, plants);

      setPdfPreview({
        open: true,
        blob: result.blob,
        fileName: result.fileName,
        title: "Vista Previa - Exportación de Datos",
      });
    }
  };

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
      <Toolbar
        onAddLine={addLine}
        onClearAll={clearAll}
        onExportVisualPDF={handleExportVisualPDF}
        onExportTablePDF={handleExportTablePDF}
        config={config}
      />

      {/* Canvas */}
      <div className="min-h-0 overflow-auto p-6 flex-1" ref={canvasRef}>
        <div className="inline-block">
          {/* Lines container with dotted border */}
          <div className="inline-block bg-amber-50/50 rounded-xl border-2 border-dashed border-amber-200 p-4 pr-8 pb-8">
            {/* Garden content wrapper - this is what gets exported */}
            <div ref={gardenContentRef}>
              <div className="pl-24">
                <Ruler
                  maxLineLengthCm={maxLineLengthCm}
                  dripperPositions={dripperPositions}
                />
              </div>
              <div className="pl-24">
                {groupedLines.map((group, groupIndex) => {
                  const groupData = lineGroups.find(
                    (g) => g.id === group.groupId,
                  );

                  return (
                    <div key={group.groupId}>
                      <LineGroupContainer
                        group={group}
                        groupData={groupData}
                        lineGroups={lineGroups}
                        config={config}
                        dripperPositions={dripperPositions}
                        plants={plants}
                        dragOverLine={dragOverLine}
                        dragPosition={dragPosition}
                        dragSide={dragSide}
                        hoveredLineIndex={hoveredLineIndex}
                        hoverLineIndex={hoverLineIndex}
                        hoverSide={hoverSide}
                        hoverPositionCm={hoverPositionCm}
                        selectedPlant={selectedPlant}
                        getPlantById={getPlantById}
                        getLineSpacing={getLineSpacing}
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
                        onArchivePlant={archivePlant}
                        onInsertLineAfter={insertLineAfter}
                        onAddGroupSeparator={addGroupSeparator}
                        onRemoveLine={removeLine}
                        setHoveredLineIndex={setHoveredLineIndex}
                        onLineGroupsChange={onLineGroupsChange}
                      />

                      {/* Group separator visual - only between groups */}
                      {groupIndex < groupedLines.length - 1 &&
                        config.groupConfig?.interGroupSpacingCm && (
                          <GroupSeparator
                            interGroupSpacingCm={
                              config.groupConfig.interGroupSpacingCm
                            }
                            pixelsPerCm={PIXELS_PER_CM}
                          />
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
      </div>

      {/* PDF Preview Dialog */}
      <PDFPreviewDialog
        open={pdfPreview.open}
        onOpenChange={(open) => setPdfPreview((prev) => ({ ...prev, open }))}
        pdfBlob={pdfPreview.blob}
        fileName={pdfPreview.fileName}
        title={pdfPreview.title}
      />
    </div>
  );
}
