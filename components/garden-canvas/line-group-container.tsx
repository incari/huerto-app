import { GardenLine, LineGroup, GardenConfig, Plant } from "@/lib/plants";
import { SelectedPlantData } from "@/components/plant-sidebar";
import { GardenLineRow } from "./garden-line-row";

interface LineGroupContainerProps {
  group: {
    groupId: string;
    lines: { line: GardenLine; originalIndex: number }[];
  };
  groupData: LineGroup | undefined;
  lineGroups: LineGroup[];
  config: GardenConfig;
  dripperPositions: number[];
  plants: Plant[];
  dragOverLine: number | null;
  dragPosition: number | null;
  dragSide: "top" | "bottom";
  hoveredLineIndex: number | null;
  hoverLineIndex: number | null;
  hoverSide: "top" | "bottom" | null;
  hoverPositionCm: number | null;
  selectedPlant: SelectedPlantData | null;
  getPlantById: (id: string) => Plant | undefined;
  getLineSpacing: (lineIndex: number) => {
    height: number;
    marginBottom: number;
    isGroupEnd: boolean;
    isMiddleSpace: boolean;
  };
  onDrop: (e: React.DragEvent, lineIndex: number) => void;
  onDragOver: (e: React.DragEvent, lineIndex: number) => void;
  onDragLeave: () => void;
  onMouseMove: (
    e: React.MouseEvent,
    lineIndex: number,
    side: "top" | "bottom",
  ) => void;
  onMouseLeave: () => void;
  onLineClick: (
    e: React.MouseEvent,
    lineIndex: number,
    side: "top" | "bottom",
  ) => void;
  onRemovePlant: (lineIndex: number, plantId: string) => void;
  onArchivePlant: (
    lineIndex: number,
    plantId: string,
    notes?: string,
    yieldAmount?: number,
    yieldUnit?: string,
  ) => void;
  onInsertLineAfter: (index: number) => void;
  onAddGroupSeparator: (afterIndex: number) => void;
  onRemoveLine: (index: number) => void;
  setHoveredLineIndex: (index: number | null) => void;
  onLineGroupsChange: (groups: LineGroup[]) => void;
}

export function LineGroupContainer({
  group,
  groupData,
  lineGroups,
  config,
  dripperPositions,
  plants,
  dragOverLine,
  dragPosition,
  dragSide,
  hoveredLineIndex,
  hoverLineIndex,
  hoverSide,
  hoverPositionCm,
  selectedPlant,
  getPlantById,
  getLineSpacing,
  onDrop,
  onDragOver,
  onDragLeave,
  onMouseMove,
  onMouseLeave,
  onLineClick,
  onRemovePlant,
  onArchivePlant,
  onInsertLineAfter,
  onAddGroupSeparator,
  onRemoveLine,
  setHoveredLineIndex,
  onLineGroupsChange,
}: LineGroupContainerProps) {
  return (
    <div className="relative mb-4">
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
        const isLastInGroup = indexInGroup === group.lines.length - 1;

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
            plants={plants}
            getPlantById={getPlantById}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            onLineClick={onLineClick}
            onRemovePlant={onRemovePlant}
            onArchivePlant={onArchivePlant}
            onInsertLineAfter={onInsertLineAfter}
            onAddGroupSeparator={onAddGroupSeparator}
            onRemoveLine={onRemoveLine}
            setHoveredLineIndex={setHoveredLineIndex}
            groupData={groupData}
            lineGroups={lineGroups}
            onLineGroupsChange={onLineGroupsChange}
          />
        );
      })}
    </div>
  );
}
