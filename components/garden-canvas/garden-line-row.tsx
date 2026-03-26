import { GardenLine, Plant, GardenConfig, LineGroup } from "@/lib/plants";
import { SelectedPlantData } from "@/components/plant-sidebar";
import { DripLine } from "./drip-line";
import { PlantedItemWithDialogs } from "./planted-item-with-dialogs";
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
  plants: Plant[];
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
  onArchivePlant: (
    lineIndex: number,
    plantId: string,
    notes?: string,
    yieldAmount?: number,
    yieldUnit?: string,
  ) => void;
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
  plants,
  getPlantById,
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
  groupData,
  lineGroups,
  onLineGroupsChange,
}: GardenLineRowProps) {
  // Separate plants by side
  const topPlants = line.plants.filter(
    (p) => p.side === "top" && p.plantId !== "",
  );
  const bottomPlants = line.plants.filter(
    (p) => p.side === "bottom" && p.plantId !== "",
  );

  // Helper to render planted items
  const renderPlantedItems = (plants: typeof line.plants) => {
    return plants.map((plantedItem, plantIndex) => {
      const plant = getPlantById(plantedItem.plantId);
      if (!plant) return null;

      // Calculate index among plants on the same side for label alternation
      const plantsOnSameSide = line.plants.filter(
        (p) => p.side === plantedItem.side,
      );
      const indexOnSide = plantsOnSameSide.findIndex(
        (p) => p.id === plantedItem.id,
      );

      return (
        <PlantedItemWithDialogs
          key={plantedItem.id}
          plantedItem={plantedItem}
          plant={plant}
          config={config}
          plantIndexOnSide={indexOnSide}
          plants={plants}
          lineIndex={originalIndex}
          onArchivePlant={(notes, yieldAmount, yieldUnit) =>
            onArchivePlant(
              originalIndex,
              plantedItem.id,
              notes,
              yieldAmount,
              yieldUnit,
            )
          }
          onMouseEnter={() => setHoveredLineIndex(originalIndex)}
          onMouseLeave={() => setHoveredLineIndex(null)}
        />
      );
    });
  };

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
        >
          {renderPlantedItems(topPlants)}
          {dragOverLine === originalIndex &&
            dragPosition !== null &&
            dragSide === "top" && (
              <DragPreview
                position={dragPosition}
                emoji={selectedPlant?.plant.emoji || "?"}
              />
            )}
          {hoverLineIndex === originalIndex &&
            hoverPositionCm !== null &&
            hoverSide === "top" && (
              <PlacementHint
                position={hoverPositionCm}
                emoji={selectedPlant?.plant.emoji || "?"}
              />
            )}
        </ClickZone>

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
        >
          {renderPlantedItems(bottomPlants)}
          {dragOverLine === originalIndex &&
            dragPosition !== null &&
            dragSide === "bottom" && (
              <DragPreview
                position={dragPosition}
                emoji={selectedPlant?.plant.emoji || "?"}
              />
            )}
          {hoverLineIndex === originalIndex &&
            hoverPositionCm !== null &&
            hoverSide === "bottom" && (
              <PlacementHint
                position={hoverPositionCm}
                emoji={selectedPlant?.plant.emoji || "?"}
              />
            )}
        </ClickZone>

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
  children?: React.ReactNode;
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
  children,
}: ClickZoneProps) {
  // Create a grid with 1px columns - this gives us precise positioning
  // For a 400cm line with 2px/cm, we need 800 columns + 1 for the end position
  const gridColumns = lengthCm * PIXELS_PER_CM + 1;

  return (
    <div
      className={`
        relative flex-1 grid
        ${side === "top" ? "items-end" : "items-start"}
        ${selectedPlant ? "cursor-pointer" : ""}
      `}
      style={{
        width: lengthCm * PIXELS_PER_CM,
        minHeight: "50px", // Ensure enough space for items
        gridTemplateColumns: `repeat(${gridColumns}, 1px)`,
        gridTemplateRows: "1fr",
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface DragPreviewProps {
  position: number;
  emoji: string;
}

function DragPreview({ position, emoji }: DragPreviewProps) {
  return (
    <div
      className="opacity-50 pointer-events-none flex justify-center"
      style={{
        gridColumn: `${position * PIXELS_PER_CM + 1} / span 1`,
        zIndex: 20,
      }}
    >
      <div className="relative flex flex-col items-center">
        <span
          className="text-2xl select-none block"
          style={{
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {emoji}
        </span>
      </div>
    </div>
  );
}

interface PlacementHintProps {
  position: number;
  emoji: string;
}

function PlacementHint({ position, emoji }: PlacementHintProps) {
  return (
    <div
      className="opacity-30 pointer-events-none flex justify-center"
      style={{
        gridColumn: `${position * PIXELS_PER_CM + 1} / span 1`,
        zIndex: 15,
      }}
    >
      <div className="relative flex flex-col items-center">
        <span
          className="text-2xl select-none block"
          style={{
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {emoji}
        </span>
      </div>
    </div>
  );
}
