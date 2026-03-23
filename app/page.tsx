"use client";

import { useState, useMemo, useEffect } from "react";
import { PlantSidebar, SelectedPlantData } from "@/components/plant-sidebar";
import { GardenCanvas } from "@/components/garden-canvas";
import { ConfigPanel } from "@/components/config-panel";
import { PlantManager } from "@/components/plant-manager";
import { PlantTimeline } from "@/components/plant-timeline";
import {
  Plant,
  GardenLine,
  GardenConfig,
  gardenMethods,
  defaultPlants,
  LineGroup,
} from "@/lib/plants";
import { Sprout, Info, Layers, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function GardenPlannerPage() {
  const [selectedPlant, setSelectedPlant] = useState<SelectedPlantData | null>(
    null,
  );
  const [config, setConfig] = useState<GardenConfig>(
    gardenMethods["parades-crestall"],
  );
  const [scale, setScale] = useState(1);
  const [plants, setPlants] = useState<Plant[]>(defaultPlants);
  const [managerOpen, setManagerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("garden");

  const [lineGroups, setLineGroups] = useState<LineGroup[]>([
    { id: "group-1", name: "Bancal 1", color: "#22c55e" },
  ]);

  const [lines, setLines] = useState<GardenLine[]>([
    { id: "line-1", lengthCm: 300, plants: [], groupId: "group-1" },
    { id: "line-2", lengthCm: 300, plants: [], groupId: "group-1" },
    { id: "line-3", lengthCm: 300, plants: [], groupId: "group-1" },
    { id: "line-4", lengthCm: 300, plants: [], groupId: "group-1" },
  ]);

  // Actualizar el largo de todas las líneas cuando cambia la configuración
  useEffect(() => {
    setLines((prevLines) =>
      prevLines.map((line) => ({
        ...line,
        lengthCm: config.defaultLineLengthCm,
        plants: line.plants.filter(
          (p) => p.positionCm <= config.defaultLineLengthCm,
        ),
      })),
    );
  }, [config.defaultLineLengthCm]);

  const plantCount = useMemo(
    () => lines.reduce((acc, line) => acc + line.plants.length, 0),
    [lines],
  );

  const handleDragStart = (data: SelectedPlantData) => {
    setSelectedPlant(data);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Sprout className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">
              Planificador de Huerto
            </h1>
            <p className="text-xs text-muted-foreground">
              Diseña tu huerto con líneas de goteo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
              >
                <Info className="h-4 w-4 mr-2" />
                Ayuda
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Como usar el planificador</DialogTitle>
                <DialogDescription>
                  Guia rapida para disenar tu huerto
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-sm">Selecciona una planta</p>
                    <p className="text-sm text-muted-foreground">
                      Haz clic en una planta del panel izquierdo o arrastrala.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-sm">Coloca en la linea</p>
                    <p className="text-sm text-muted-foreground">
                      Haz clic arriba o abajo de la linea. Los puntos azules
                      marcan los goteros cada 25cm.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      Espaciamiento automatico
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Las plantas se colocan automaticamente respetando el
                      espaciamiento.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-sm">Timeline</p>
                    <p className="text-sm text-muted-foreground">
                      Consulta la linea de tiempo para ver cuando cosechar y
                      retirar.
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <PlantSidebar
          plants={plants}
          onDragStart={handleDragStart}
          selectedPlant={selectedPlant}
          onSelectPlant={setSelectedPlant}
          onOpenManager={() => setManagerOpen(true)}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="border-b border-border bg-card px-4">
              <TabsList className="h-12">
                <TabsTrigger
                  value="garden"
                  className="gap-2"
                >
                  <Layers className="h-4 w-4" />
                  Huerto
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Timeline
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="garden"
              className="flex-1 mt-0 overflow-hidden"
            >
              <GardenCanvas
                lines={lines}
                plants={plants}
                lineGroups={lineGroups}
                onLinesChange={setLines}
                onLineGroupsChange={setLineGroups}
                selectedPlant={selectedPlant}
                config={config}
                scale={scale}
                onScaleChange={setScale}
              />
            </TabsContent>

            <TabsContent
              value="timeline"
              className="flex-1 mt-0 overflow-hidden"
            >
              <PlantTimeline
                lines={lines}
                plants={plants}
              />
            </TabsContent>
          </Tabs>
        </div>

        <ConfigPanel
          config={config}
          onConfigChange={setConfig}
          plantCount={plantCount}
          lineCount={lines.length}
        />
      </div>

      {/* Plant Manager Dialog */}
      <PlantManager
        plants={plants}
        onPlantsChange={setPlants}
        open={managerOpen}
        onOpenChange={setManagerOpen}
      />
    </div>
  );
}
