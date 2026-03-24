import { Plant, PlantedItem as PlantedItemType, GardenConfig } from "@/lib/plants";

const PIXELS_PER_CM = 2;

interface PlantedItemProps {
  plantedItem: PlantedItemType;
  plant: Plant;
  config: GardenConfig;
  onRemove: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function PlantedItem({
  plantedItem,
  plant,
  config,
  onRemove,
  onMouseEnter,
  onMouseLeave,
}: PlantedItemProps) {
  const variety = plantedItem.varietyId
    ? plant.varieties.find((v) => v.id === plantedItem.varietyId)
    : null;

  return (
    <div
      className={`
        absolute -translate-x-1/2 group/plant hover:z-50
        ${plantedItem.side === "top" ? "top-0" : "bottom-0"}
      `}
      style={{
        left: plantedItem.positionCm * PIXELS_PER_CM,
        zIndex: 10,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onRemove}
    >
      <div className="relative flex flex-col items-center">
        <span className="text-2xl select-none block cursor-pointer">
          {plant.emoji}
        </span>

        {config.showLabels && (
          <div className="text-[9px] font-medium text-foreground whitespace-nowrap mt-0.5 px-1 py-0.5 bg-background rounded border border-border shadow-sm">
            {variety ? variety.name : plant.name}
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`
            absolute -top-1 -right-1 w-4 h-4 rounded-full
            bg-destructive text-destructive-foreground
            items-center justify-center
            opacity-0 group-hover/plant:opacity-100
            hover:scale-110 transition-all
            text-xs font-bold leading-none
            shadow-sm z-10
            hidden md:flex
          `}
          title="Eliminar"
        >
          ×
        </button>

        <div
          className={`
            absolute left-1/2 -translate-x-1/2 opacity-0 group-hover/plant:opacity-100
            transition-opacity bg-card border text-foreground text-xs
            px-2 py-1 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none
            ${plantedItem.side === "top" ? "bottom-full mb-2" : "top-full mt-2"}
          `}
        >
          <div className="font-medium">
            {plant.name}
            {variety ? ` (${variety.name})` : ""}
          </div>
          <div className="text-muted-foreground">{plantedItem.positionCm}cm</div>
        </div>
      </div>
    </div>
  );
}

