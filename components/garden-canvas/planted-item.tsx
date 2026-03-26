"use client";

import { useState } from "react";
import {
  Plant,
  PlantedItem as PlantedItemType,
  GardenConfig,
} from "@/lib/plants";

const PIXELS_PER_CM = 2;

interface PlantedItemProps {
  plantedItem: PlantedItemType;
  plant: Plant;
  config: GardenConfig;
  plantIndexOnSide: number;
  plants: Plant[];
  onRemove: () => void;
  onShowHistory: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function PlantedItem({
  plantedItem,
  plant,
  config,
  plantIndexOnSide,
  plants,
  onRemove,
  onShowHistory,
  onMouseEnter,
  onMouseLeave,
}: PlantedItemProps) {
  const variety = plantedItem.varietyId
    ? plant.varieties.find((v) => v.id === plantedItem.varietyId)
    : null;

  // Alternate label position based on index to prevent overlaps
  // Even indices: label below/above (normal), Odd indices: offset to the side
  const isAlternate = plantIndexOnSide % 2 === 1;

  const hasHistory = (plantedItem.history?.length || 0) > 0;

  return (
    <div
      className="group/plant flex justify-center"
      style={{
        gridColumn: `${plantedItem.positionCm * PIXELS_PER_CM + 1} / span 1`,
        zIndex: 10,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onRemove}
    >
      {/* Container - relative positioning for absolute children */}
      <div className="relative flex flex-col items-center">
        {/* Plant emoji - always visible, fixed size */}
        <span
          className="text-2xl select-none cursor-pointer block"
          style={{
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 30,
            position: "relative",
          }}
          onClick={onShowHistory}
        >
          {plant.emoji}
        </span>

        {/* History indicator - small badge */}
        {hasHistory && (
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold shadow-sm"
            style={{ zIndex: 35 }}
            title={`${plantedItem.history?.length} plantación(es) anterior(es)`}
          >
            {plantedItem.history?.length}
          </div>
        )}

        {/* Label - positioned in flex column */}
        {config.showLabels && (
          <div
            className={`
              text-[9px] font-medium text-foreground whitespace-nowrap
              px-1 py-0.5 bg-background/95 backdrop-blur-sm rounded border border-border shadow-sm
              pointer-events-none
              ${plantedItem.side === "top" ? "order-first mb-0.5" : "order-last mt-0.5"}
            `}
            style={{ zIndex: 20 }}
          >
            {variety ? variety.name : plant.name}
          </div>
        )}

        {/* Remove button */}
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
            shadow-sm
            hidden md:flex
          `}
          style={{ zIndex: 40 }}
          title="Eliminar"
        >
          ×
        </button>

        {/* Detailed tooltip on hover - shows position info */}
        <div
          className={`
            absolute left-1/2 -translate-x-1/2 opacity-0 group-hover/plant:opacity-100
            transition-opacity bg-card border text-foreground text-xs
            px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none
            ${plantedItem.side === "top" ? "bottom-full mb-2" : "top-full mt-2"}
          `}
          style={{ zIndex: 50 }}
        >
          <div className="font-medium">
            {plant.name}
            {variety ? ` (${variety.name})` : ""}
          </div>
          <div className="text-muted-foreground">
            {plantedItem.positionCm}cm
          </div>
        </div>
      </div>
    </div>
  );
}
