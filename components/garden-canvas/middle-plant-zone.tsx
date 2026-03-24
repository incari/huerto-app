import { Plant, GardenConfig, LineGroup, MiddlePlantItem } from "@/lib/plants";
import { SelectedPlantData } from "@/components/plant-sidebar";

const PIXELS_PER_CM = 2;

interface MiddlePlantZoneProps {
  lineLengthCm: number;
  groupData: LineGroup | undefined;
  config: GardenConfig;
  selectedPlant: SelectedPlantData | null;
  getPlantById: (id: string) => Plant | undefined;
  onGroupsChange: (groups: LineGroup[]) => void;
  lineGroups: LineGroup[];
  groupId: string;
  height: number;
}

export function MiddlePlantZone({
  lineLengthCm,
  groupData,
  config,
  selectedPlant,
  getPlantById,
  onGroupsChange,
  lineGroups,
  groupId,
  height,
}: MiddlePlantZoneProps) {
  const middlePlantSpacingCm = config.groupConfig?.middlePlantSpacingCm || 100;
  const spotCount = Math.floor(lineLengthCm / middlePlantSpacingCm) + 1;

  return (
    <div
      className="relative flex items-center justify-center pointer-events-none"
      style={{ height }}
    >
      <div
        className="absolute inset-0 flex items-center pointer-events-none"
        style={{
          width: lineLengthCm * PIXELS_PER_CM,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        <div className="w-full border-t border-dashed border-green-400/40" />
      </div>

      {Array.from({ length: spotCount }).map((_, index) => {
        const positionCm = index * middlePlantSpacingCm;
        if (positionCm > lineLengthCm) return null;

        const existingPlant = groupData?.middlePlants?.find(
          (p) => p.positionCm === positionCm,
        );
        const plant = existingPlant
          ? getPlantById(existingPlant.plantId)
          : null;

        return (
          <MiddlePlantSpot
            key={`spot-${positionCm}`}
            positionCm={positionCm}
            existingPlant={existingPlant}
            plant={plant}
            config={config}
            selectedPlant={selectedPlant}
            onGroupsChange={onGroupsChange}
            lineGroups={lineGroups}
            groupId={groupId}
          />
        );
      })}

      <div className="absolute -left-14 text-[10px] text-green-600 font-medium whitespace-nowrap top-1/2 -translate-y-1/2">
        Flores
      </div>
    </div>
  );
}

interface MiddlePlantSpotProps {
  positionCm: number;
  existingPlant: MiddlePlantItem | undefined;
  plant: Plant | null | undefined;
  config: GardenConfig;
  selectedPlant: SelectedPlantData | null;
  onGroupsChange: (groups: LineGroup[]) => void;
  lineGroups: LineGroup[];
  groupId: string;
}

function MiddlePlantSpot({
  positionCm,
  existingPlant,
  plant,
  config,
  selectedPlant,
  onGroupsChange,
  lineGroups,
  groupId,
}: MiddlePlantSpotProps) {
  const handleRemove = () => {
    if (!existingPlant) return;
    const newGroups = lineGroups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            middlePlants: (g.middlePlants || []).filter(
              (p) => p.id !== existingPlant.id,
            ),
          }
        : g,
    );
    onGroupsChange(newGroups);
  };

  const handleAdd = () => {
    if (
      !selectedPlant ||
      (selectedPlant.plant.category !== "hierbas" &&
        selectedPlant.plant.category !== "flores")
    )
      return;

    const newMiddlePlant: MiddlePlantItem = {
      id: `middle-${Date.now()}`,
      plantId: selectedPlant.plant.id,
      varietyId: selectedPlant.variety?.id,
      positionCm: positionCm,
      plantedDate: config.currentPlantingDate,
    };

    const newGroups = lineGroups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            middlePlants: [...(g.middlePlants || []), newMiddlePlant].sort(
              (a, b) => a.positionCm - b.positionCm,
            ),
          }
        : g,
    );
    onGroupsChange(newGroups);
  };

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
      style={{
        left: positionCm * PIXELS_PER_CM,
        top: "50%",
      }}
    >
      {existingPlant && plant ? (
        <ExistingMiddlePlant
          plant={plant}
          existingPlant={existingPlant}
          config={config}
          onRemove={handleRemove}
        />
      ) : (
        <EmptyMiddlePlantSpot selectedPlant={selectedPlant} onAdd={handleAdd} />
      )}
    </div>
  );
}

interface ExistingMiddlePlantProps {
  plant: Plant;
  existingPlant: MiddlePlantItem;
  config: GardenConfig;
  onRemove: () => void;
}

function ExistingMiddlePlant({
  plant,
  existingPlant,
  config,
  onRemove,
}: ExistingMiddlePlantProps) {
  return (
    <div className="relative group/middle flex flex-col items-center">
      <span className="text-2xl select-none block cursor-pointer">
        {plant.emoji}
      </span>

      {config.showLabels && (
        <div className="text-[9px] font-medium text-foreground whitespace-nowrap mt-0.5 px-1 py-0.5 bg-background rounded border border-border shadow-sm">
          {plant.varieties.find((v) => v.id === existingPlant.varietyId)
            ?.name || plant.name}
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="
          absolute -top-1 -right-1 w-4 h-4 rounded-full
          bg-destructive text-destructive-foreground
          items-center justify-center
          opacity-0 group-hover/middle:opacity-100
          hover:scale-110 transition-all
          text-xs font-bold leading-none
          shadow-sm z-10
          hidden md:flex
        "
        title="Eliminar"
      >
        ×
      </button>
    </div>
  );
}

interface EmptyMiddlePlantSpotProps {
  selectedPlant: SelectedPlantData | null;
  onAdd: () => void;
}

function EmptyMiddlePlantSpot({
  selectedPlant,
  onAdd,
}: EmptyMiddlePlantSpotProps) {
  const canPlant =
    selectedPlant &&
    (selectedPlant.plant.category === "hierbas" ||
      selectedPlant.plant.category === "flores");

  return (
    <div
      className={`
        w-8 h-8 rounded-full border-2 border-dashed
        flex items-center justify-center
        transition-all cursor-pointer
        ${
          canPlant
            ? "border-green-500 bg-green-100/30 hover:bg-green-200/50 hover:border-green-600"
            : "border-green-300/40 bg-green-50/20"
        }
      `}
      onClick={onAdd}
    >
      {canPlant && (
        <span className="text-lg opacity-50">{selectedPlant.plant.emoji}</span>
      )}
    </div>
  );
}
