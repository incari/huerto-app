"use client";

import { useState } from "react";
import { Plant, PlantVariety } from "@/lib/plants";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, Leaf, ChevronDown, Clock, Settings } from "lucide-react";

export interface SelectedPlantData {
  plant: Plant;
  variety?: PlantVariety;
}

interface PlantSidebarProps {
  plants: Plant[];
  onDragStart: (data: SelectedPlantData) => void;
  selectedPlant: SelectedPlantData | null;
  onSelectPlant: (data: SelectedPlantData | null) => void;
  onOpenManager: () => void;
}

export function PlantSidebar({
  plants,
  onDragStart,
  selectedPlant,
  onSelectPlant,
  onOpenManager,
}: PlantSidebarProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedPlants, setExpandedPlants] = useState<Set<string>>(new Set());

  const categories = [
    { id: "frutos", label: "Frutos", color: "bg-red-100 text-red-700" },
    { id: "raices", label: "Raíces", color: "bg-orange-100 text-orange-700" },
    { id: "hojas", label: "Hojas", color: "bg-green-100 text-green-700" },
    {
      id: "legumbres",
      label: "Legumbres",
      color: "bg-amber-100 text-amber-700",
    },
    {
      id: "hierbas",
      label: "Hierbas",
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      id: "flores",
      label: "Flores",
      color: "bg-pink-100 text-pink-700",
    },
  ];

  const filteredPlants = plants.filter((plant) => {
    const matchesSearch =
      plant.name.toLowerCase().includes(search.toLowerCase()) ||
      plant.varieties.some((v) =>
        v.name.toLowerCase().includes(search.toLowerCase()),
      );
    const matchesCategory =
      !activeCategory || plant.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (plantId: string) => {
    const newExpanded = new Set(expandedPlants);
    if (newExpanded.has(plantId)) {
      newExpanded.delete(plantId);
    } else {
      newExpanded.add(plantId);
    }
    setExpandedPlants(newExpanded);
  };

  const isSelected = (plantId: string, varietyId?: string) => {
    if (!selectedPlant) return false;
    if (varietyId) {
      return selectedPlant.variety?.id === varietyId;
    }
    return selectedPlant.plant.id === plantId && !selectedPlant.variety;
  };

  const handleSelect = (plant: Plant, variety?: PlantVariety) => {
    const data: SelectedPlantData = { plant, variety };
    const currentlySelected = isSelected(plant.id, variety?.id);
    onSelectPlant(currentlySelected ? null : data);
  };

  const handleDrag = (plant: Plant, variety?: PlantVariety) => {
    onDragStart({ plant, variety });
  };

  return (
    <div className="w-72 bg-card border-r border-border flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Plantas</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onOpenManager}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plantas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 p-3 border-b border-border">
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "secondary"}
            className={`cursor-pointer text-xs ${activeCategory === cat.id ? "" : cat.color}`}
            onClick={() =>
              setActiveCategory(activeCategory === cat.id ? null : cat.id)
            }
          >
            {cat.label}
          </Badge>
        ))}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-1">
          {filteredPlants.map((plant) => (
            <div key={plant.id}>
              <div className="flex items-center gap-1">
                {/* Main plant item */}
                <div
                  draggable
                  onDragStart={() => handleDrag(plant)}
                  onClick={() => handleSelect(plant)}
                  className={`
                    flex-1 flex items-center gap-3 p-2.5 rounded-lg cursor-grab active:cursor-grabbing
                    border transition-all duration-150
                    ${
                      isSelected(plant.id)
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-transparent hover:bg-secondary hover:border-border"
                    }
                  `}
                >
                  <span className="text-2xl select-none">{plant.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {plant.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{plant.spacingCm} cm</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {plant.timing.totalWeeks}s
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: plant.color }}
                  />
                </div>

                {/* Expand button for varieties */}
                {plant.varieties.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(plant.id);
                    }}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${expandedPlants.has(plant.id) ? "rotate-180" : ""}`}
                    />
                  </Button>
                )}
              </div>

              {/* Varieties */}
              {plant.varieties.length > 0 && expandedPlants.has(plant.id) && (
                <div className="ml-6 mt-1 space-y-0.5">
                  {plant.varieties.map((variety) => (
                    <div
                      key={variety.id}
                      draggable
                      onDragStart={() => handleDrag(plant, variety)}
                      onClick={() => handleSelect(plant, variety)}
                      className={`
                        flex items-center gap-2 p-2 rounded-md cursor-grab active:cursor-grabbing
                        border transition-all duration-150 text-sm
                        ${
                          isSelected(plant.id, variety.id)
                            ? "border-primary bg-primary/10"
                            : "border-transparent hover:bg-secondary hover:border-border"
                        }
                      `}
                    >
                      <span className="text-base">{plant.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{variety.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{variety.spacingCm} cm</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {variety.timing.totalWeeks}s
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {filteredPlants.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No se encontraron plantas
            </p>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border bg-muted/50">
        <p className="text-xs text-muted-foreground text-center">
          Arrastra o haz clic para seleccionar
        </p>
      </div>
    </div>
  );
}
