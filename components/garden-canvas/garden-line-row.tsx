import { GardenLine, Plant, GardenConfig, LineGroup } from "@/lib/plants";
import { SelectedPlantData } from "@/components/plant-sidebar";
import { DripLine } from "./drip-line";
import { PlantedItem } from "./planted-item";
import { LineMenu, LineLabel } from "./line-menu";
import { MiddlePlantZone } from "./middle-plant-zone";

const PIXELS_PER_CM = 2;

interface GardenLineRowProps {
  line: GardenLine;
  originalIndex: number;
  indexInGroup: number;
  isLastInGroup: boolean;
  spacing: {
    height: number;
    marginBottom: number;
    isGroupEnd: boolean;
    isMiddleSpace: boolean;
  };
  dragOverLine: number | null;
  dragPosition: number | null;
  dragSide: "top" | "bottom";
  hoveredLineIndex: number | null;
  hoverLineIndex: number | null;
  hoverSide: "top" | "bottom" | null;
  hoverPositionCm: number | null;
  selectedPlant: SelectedPlantData | null;
  config: GardenConfig;
  dripperPositions: number[];
  getPlantById: (id: string) => Plant | undefined;
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
  onInsertLineAfter: (lineIndex: number) => void;
  onAddGroupSeparator: (lineIndex: number) => void;
  onRemoveLine: (lineIndex: number) => void;
  setHoveredLineIndex: (index: number | null) => void;
  groupData: LineGroup | undefined;
  lineGroups: LineGroup[];
  onLineGroupsChange: (groups: LineGroup[]) => void;
}

export function GardenLineRow({
  line,
  originalIndex,
  indexInGroup,
  isLastInGroup,
  spacing,
  dragOverLine,
  dragPosition,
  dragSide,
  hoveredLineIndex,
  hoverLineIndex,
  hoverSide,
  hoverPositionCm,
  selectedPlant,
  config,
  dripperPositions,
  getPlantById,
  onDrop,
  onDragOver,
  onDragLeave,
  onMouseMove,
  onMouseLeave,
  onLineClick,
  onRemovePlant,
  onInsertLineAfter,
  onAddGroupSeparator,
  onRemoveLine,
  setHoveredLineIndex,
  groupData,
  lineGroups,
  onLineGroupsChange,
}: GardenLineRowProps) {
  return (
    <>
      <div
        className="relative group flex flex-col"
        style={{
          height: spacing.height,
          width: line.lengthCm * PIXELS_PER_CM,
          zIndex: hoveredLineIndex === originalIndex ? 50 : undefined,
        }}
      >
        <ClickZone
          side="top"
          lengthCm={line.lengthCm}
          onDrop={(e) => onDrop(e, originalIndex)}
          onDragOver={(e) => onDragOver(e, originalIndex)}
          onDragLeave={onDragLeave}
          onMouseMove={(e) => onMouseMove(e, originalIndex, "top")}
          onMouseLeave={onMouseLeave}
          onClick={(e) => onLineClick(e, originalIndex, "top")}
          selectedPlant={selectedPlant}
        />

        <DripLine
          lengthCm={line.lengthCm}
          dripperPositions={dripperPositions}
          isDragOver={dragOverLine === originalIndex}
        />

        <ClickZone
          side="bottom"
          lengthCm={line.lengthCm}
          onDrop={(e) => onDrop(e, originalIndex)}
          onDragOver={(e) => onDragOver(e, originalIndex)}
          onDragLeave={onDragLeave}
          onMouseMove={(e) => onMouseMove(e, originalIndex, "bottom")}
          onMouseLeave={onMouseLeave}
          onClick={(e) => onLineClick(e, originalIndex, "bottom")}
          selectedPlant={selectedPlant}
        />

        {dragOverLine === originalIndex && dragPosition !== null && (
          <DragPreview
            position={dragPosition}
            side={dragSide}
            emoji={selectedPlant?.plant.emoji || "?"}
          />
        )}

        {hoverLineIndex === originalIndex &&
          hoverPositionCm !== null &&
          hoverSide !== null && (
            <PlacementHint
              position={hoverPositionCm}
              side={hoverSide}
              emoji={selectedPlant?.plant.emoji || "?"}
            />
          )}

        {line.plants.map((plantedItem) => {
          const plant = getPlantById(plantedItem.plantId);
          if (!plant) return null;

          return (
            <PlantedItem
              key={plantedItem.id}
              plantedItem={plantedItem}
              plant={plant}
              config={config}
              onRemove={() => onRemovePlant(originalIndex, plantedItem.id)}
              onMouseEnter={() => setHoveredLineIndex(originalIndex)}
              onMouseLeave={() => setHoveredLineIndex(null)}
            />
          );
        })}

        {!selectedPlant ? (
          <LineMenu
            lineIndex={originalIndex}
            isLastInGroup={isLastInGroup}
            onInsertLineAfter={() => onInsertLineAfter(originalIndex)}
            onAddGroupSeparator={() => onAddGroupSeparator(originalIndex)}
            onRemoveLine={() => onRemoveLine(originalIndex)}
          />
        ) : (
          <LineLabel lineIndex={originalIndex} />
        )}
      </div>

      {spacing.isMiddleSpace && config.groupConfig?.allowMiddlePlants && (
        <MiddlePlantZone
          lineLengthCm={line.lengthCm}
          groupData={groupData}
          config={config}
          selectedPlant={selectedPlant}
          getPlantById={getPlantById}
          onGroupsChange={onLineGroupsChange}
          lineGroups={lineGroups}
          groupId={line.groupId || "default"}
          height={spacing.height}
        />
      )}
    </>
  );
}

interface ClickZoneProps {
  side: "top" | "bottom";
  lengthCm: number;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onClick: (e: React.MouseEvent) => void;
  selectedPlant: SelectedPlantData | null;
}

function ClickZone({
  side,
  lengthCm,
  onDrop,
  onDragOver,
  onDragLeave,
  onMouseMove,
  onMouseLeave,
  onClick,
  selectedPlant,
}: ClickZoneProps) {
  return (
    <div
      className={`
        relative flex-1
        ${selectedPlant ? "cursor-pointer" : ""}
      `}
      style={{ width: lengthCm * PIXELS_PER_CM }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    />
  );
}

interface DragPreviewProps {
  position: number;
  side: "top" | "bottom";
  emoji: string;
}

function DragPreview({ position, side, emoji }: DragPreviewProps) {
  return (
    <div
      className={`
        absolute -translate-x-1/2 opacity-50 pointer-events-none
        ${side === "top" ? "top-0" : "bottom-0"}
      `}
      style={{
        left: position * PIXELS_PER_CM,
        zIndex: 20,
      }}
    >
      <span className="text-2xl">{emoji}</span>
    </div>
  );
}

interface PlacementHintProps {
  position: number;
  side: "top" | "bottom";
  emoji: string;
}

function PlacementHint({ position, side, emoji }: PlacementHintProps) {
  return (
    <div
      className={`
        absolute -translate-x-1/2 opacity-30 pointer-events-none
        ${side === "top" ? "top-0" : "bottom-0"}
      `}
      style={{
        left: position * PIXELS_PER_CM,
        zIndex: 15,
      }}
    >
      <span className="text-2xl">{emoji}</span>
    </div>
  );
}
