"use client";

import { useMemo, useState } from "react";
import {
  Plant,
  PlantedItem,
  GardenLine,
  getPlantTiming,
  calculatePlantDates,
} from "@/lib/plants";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sprout,
  Apple,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface PlantTimelineProps {
  lines: GardenLine[];
  plants: Plant[];
  currentDate?: Date;
}

interface GroupedPlants {
  key: string;
  plantId: string;
  varietyId?: string;
  plant: Plant;
  weekPlanted: string;
  items: { planted: PlantedItem; line: number }[];
}

export function PlantTimeline({
  lines,
  plants,
  currentDate = new Date(),
}: PlantTimelineProps) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Get all planted items grouped by plant type and week
  const groupedPlants = useMemo(() => {
    const items: { planted: PlantedItem; plant: Plant; line: number }[] = [];

    lines.forEach((line, lineIndex) => {
      line.plants.forEach((planted) => {
        const plant = plants.find((p) => p.id === planted.plantId);
        if (plant) {
          items.push({ planted, plant, line: lineIndex + 1 });
        }
      });
    });

    // Group by plantId + varietyId + week planted
    const groups: Map<string, GroupedPlants> = new Map();

    items.forEach((item) => {
      const plantedDate = new Date(item.planted.plantedDate);
      const weekStart = new Date(plantedDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];

      const groupKey = `${item.planted.plantId}-${item.planted.varietyId || "default"}-${weekKey}`;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          key: groupKey,
          plantId: item.planted.plantId,
          varietyId: item.planted.varietyId,
          plant: item.plant,
          weekPlanted: weekKey,
          items: [],
        });
      }

      groups
        .get(groupKey)!
        .items.push({ planted: item.planted, line: item.line });
    });

    return Array.from(groups.values()).sort(
      (a, b) =>
        new Date(a.weekPlanted).getTime() - new Date(b.weekPlanted).getTime(),
    );
  }, [lines, plants]);

  const totalPlants = useMemo(
    () => groupedPlants.reduce((acc, group) => acc + group.items.length, 0),
    [groupedPlants],
  );

  // Generate months for the timeline
  const months = useMemo(() => {
    const result: Date[] = [];
    const baseDate = new Date(currentDate);
    baseDate.setMonth(baseDate.getMonth() + monthOffset - 2);

    for (let i = 0; i < 14; i++) {
      const date = new Date(baseDate);
      date.setMonth(date.getMonth() + i);
      date.setDate(1);
      result.push(date);
    }

    return result;
  }, [currentDate, monthOffset]);

  const monthWidth = 100;
  const totalWidth = months.length * monthWidth;

  const getBarStyle = (startDate: Date, endDate: Date) => {
    const firstMonth = months[0];
    const startOffset =
      ((startDate.getTime() - firstMonth.getTime()) /
        (1000 * 60 * 60 * 24 * 30)) *
      monthWidth;
    const width =
      ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)) *
      monthWidth;

    return {
      left: Math.max(0, startOffset),
      width: Math.max(8, width),
    };
  };

  const isPast = (date: Date) => date < currentDate;

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      month: "short",
      year: "2-digit",
    });
  };

  const formatWeek = (weekKey: string) => {
    const date = new Date(weekKey);
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (groupedPlants.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-card">
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Sin plantas en el huerto
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Anade plantas al huerto para ver la linea de tiempo con las fechas
            de cosecha y retirada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Linea de Tiempo</h3>
          <Badge variant="secondary">
            {totalPlants} plantas en {groupedPlants.length} grupos
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-400" />
              <span className="text-muted-foreground">Crecimiento</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-muted-foreground">Cosecha</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-rose-400" />
              <span className="text-muted-foreground">Retirar</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMonthOffset((o) => o - 3)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setMonthOffset(0)}
            >
              Hoy
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMonthOffset((o) => o + 3)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline content with scroll */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="min-w-max">
            {/* Month headers - sticky */}
            <div className="flex sticky top-0 bg-card z-20 border-b border-border">
              <div className="w-[220px] shrink-0 px-4 py-2 text-xs font-medium text-muted-foreground border-r border-border bg-card">
                Planta / Grupo
              </div>
              <div className="flex">
                {months.map((month, i) => {
                  const isCurrentMonth =
                    month.getMonth() === currentDate.getMonth() &&
                    month.getFullYear() === currentDate.getFullYear();

                  return (
                    <div
                      key={i}
                      className={`text-center text-xs py-2 border-r border-border ${
                        isCurrentMonth
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-muted-foreground"
                      }`}
                      style={{ width: monthWidth }}
                    >
                      {formatMonth(month)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grouped plant rows */}
            {groupedPlants.map((group) => {
              const variety = group.varietyId
                ? group.plant.varieties.find((v) => v.id === group.varietyId)
                : null;

              const firstItem = group.items[0];
              const timing = getPlantTiming(group.plant, group.varietyId);
              const dates = calculatePlantDates(
                firstItem.planted.plantedDate,
                timing,
              );

              const growthBar = getBarStyle(dates.planted, dates.harvestStart);
              const harvestBar = getBarStyle(
                dates.harvestStart,
                dates.harvestEnd,
              );
              const removeBar = getBarStyle(dates.harvestEnd, dates.removeDate);

              const needsRemoval = isPast(dates.removeDate);
              const isHarvesting =
                currentDate >= dates.harvestStart &&
                currentDate <= dates.harvestEnd;
              const isExpanded = expandedGroups.has(group.key);

              return (
                <Collapsible
                  key={group.key}
                  open={isExpanded}
                  onOpenChange={() => toggleGroup(group.key)}
                >
                  {/* Group header row */}
                  <div className="flex hover:bg-muted/30 border-b border-border/50">
                    <CollapsibleTrigger className="w-[220px] shrink-0 px-4 py-3 flex items-center gap-2 border-r border-border text-left hover:bg-muted/50 transition-colors">
                      <span className="text-xl">{group.plant.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {group.plant.name}
                            {variety && (
                              <span className="font-normal text-muted-foreground ml-1">
                                ({variety.name})
                              </span>
                            )}
                          </p>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {group.items.length}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Semana del {formatWeek(group.weekPlanted)}
                        </p>
                      </div>
                      {needsRemoval && (
                        <Badge
                          variant="destructive"
                          className="text-xs shrink-0"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Retirar
                        </Badge>
                      )}
                      {isHarvesting && !needsRemoval && (
                        <Badge className="text-xs shrink-0 bg-emerald-500">
                          <Apple className="h-3 w-3 mr-1" />
                          Cosecha
                        </Badge>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </CollapsibleTrigger>

                    <div
                      className="relative h-14 flex-1"
                      style={{ minWidth: totalWidth }}
                    >
                      {/* Growth phase */}
                      <div
                        className={`absolute top-3 h-4 rounded-l-full ${isPast(dates.harvestStart) ? "bg-amber-300" : "bg-amber-400"}`}
                        style={{ left: growthBar.left, width: growthBar.width }}
                        title={`Crecimiento: ${timing.growthWeeks} semanas`}
                      >
                        <Sprout className="h-3 w-3 text-amber-800 absolute left-2 top-0.5" />
                      </div>

                      {/* Harvest phase */}
                      <div
                        className={`absolute top-3 h-4 ${isPast(dates.harvestEnd) ? "bg-emerald-400" : "bg-emerald-500"}`}
                        style={{
                          left: harvestBar.left,
                          width: harvestBar.width,
                        }}
                        title={`Cosecha: ${timing.harvestWeeks} semanas`}
                      >
                        <Apple className="h-3 w-3 text-emerald-900 absolute left-2 top-0.5" />
                      </div>

                      {/* Decline/removal phase */}
                      <div
                        className={`absolute top-3 h-4 rounded-r-full ${isPast(dates.removeDate) ? "bg-rose-300" : "bg-rose-400"}`}
                        style={{ left: removeBar.left, width: removeBar.width }}
                        title="Fase de retirada"
                      />

                      {/* Today marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-primary/70 z-10"
                        style={{
                          left:
                            getBarStyle(months[0], currentDate).left +
                            (currentDate.getDate() / 30) * monthWidth,
                        }}
                      />
                    </div>
                  </div>

                  {/* Expanded items */}
                  <CollapsibleContent>
                    {group.items.map((item, idx) => {
                      const itemDates = calculatePlantDates(
                        item.planted.plantedDate,
                        timing,
                      );
                      const itemGrowthBar = getBarStyle(
                        itemDates.planted,
                        itemDates.harvestStart,
                      );
                      const itemHarvestBar = getBarStyle(
                        itemDates.harvestStart,
                        itemDates.harvestEnd,
                      );
                      const itemRemoveBar = getBarStyle(
                        itemDates.harvestEnd,
                        itemDates.removeDate,
                      );

                      return (
                        <div
                          key={item.planted.id}
                          className="flex hover:bg-muted/20 bg-muted/10"
                        >
                          <div className="w-[220px] shrink-0 px-4 py-2 flex items-center gap-2 border-r border-border pl-10">
                            <span className="text-muted-foreground text-xs">
                              L{item.line} - {item.planted.positionCm}cm (
                              {item.planted.side === "top" ? "arriba" : "abajo"}
                              )
                            </span>
                          </div>

                          <div
                            className="relative h-10 flex-1"
                            style={{ minWidth: totalWidth }}
                          >
                            <div
                              className="absolute top-3 h-2 rounded-l bg-amber-300/60"
                              style={{
                                left: itemGrowthBar.left,
                                width: itemGrowthBar.width,
                              }}
                            />
                            <div
                              className="absolute top-3 h-2 bg-emerald-400/60"
                              style={{
                                left: itemHarvestBar.left,
                                width: itemHarvestBar.width,
                              }}
                            />
                            <div
                              className="absolute top-3 h-2 rounded-r bg-rose-300/60"
                              style={{
                                left: itemRemoveBar.left,
                                width: itemRemoveBar.width,
                              }}
                            />

                            {/* Dates */}
                            <div className="absolute bottom-0 text-xs text-muted-foreground">
                              <span
                                className="absolute whitespace-nowrap"
                                style={{ left: itemGrowthBar.left }}
                              >
                                {itemDates.planted.toLocaleDateString("es-ES", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
