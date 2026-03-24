"use client";

import { useState, useMemo, useEffect } from "react";
import { PlantSidebar, SelectedPlantData } from "@/components/plant-sidebar";
import { GardenCanvas } from "@/components/garden-canvas";
import { ConfigPanel } from "@/components/config-panel";
import { PlantManager } from "@/components/plant-manager";
import { PlantTimeline } from "@/components/plant-timeline";
import { SaveLoadDialog } from "@/components/save-load-dialog";
import {
  Plant,
  GardenLine,
  GardenConfig,
  gardenMethods,
  defaultPlants,
  LineGroup,
} from "@/lib/plants";
import {
  Sprout,
  Info,
  Layers,
  Calendar,
  Menu,
  Settings as SettingsIcon,
} from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function GardenPlannerPage() {
  const [selectedPlant, setSelectedPlant] = useState<SelectedPlantData | null>(
    null,
  );
  const [config, setConfig] = useState<GardenConfig>(
    gardenMethods["parades-crestall"],
  );
  const [plants, setPlants] = useState<Plant[]>(defaultPlants);
  const [managerOpen, setManagerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("garden");
  const [plantSidebarOpen, setPlantSidebarOpen] = useState(false);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);

  const [lineGroups, setLineGroups] = useState<LineGroup[]>([
    { id: "group-1", name: "Bancal 1", color: "#22c55e" },
  ]);

  const [lines, setLines] = useState<GardenLine[]>([]);

  const [currentGardenId, setCurrentGardenId] = useState<number | null>(null);
  const [currentGardenName, setCurrentGardenName] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [isInitialized, setIsInitialized] = useState(false);

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

  const handleSelectPlant = (data: SelectedPlantData | null) => {
    setSelectedPlant(data);
    setPlantSidebarOpen(false);
  };

  useEffect(() => {
    const initializeGarden = async () => {
      try {
        const response = await fetch("/api/gardens");
        if (response.ok) {
          const gardens = await response.json();
          if (gardens.length > 0) {
            const lastGarden = gardens[gardens.length - 1];
            const savedConfig = lastGarden.config;
            setCurrentGardenId(lastGarden.id);
            setCurrentGardenName(lastGarden.name);

            // Ensure all lines have a valid lengthCm
            const loadedLines = (savedConfig.lines || []).map(
              (line: GardenLine) => ({
                ...line,
                lengthCm:
                  line.lengthCm || savedConfig.defaultLineLengthCm || 400,
              }),
            );
            setLines(loadedLines);

            setLineGroups(
              savedConfig.lineGroups || [
                { id: "group-1", name: "Bancal 1", color: "#22c55e" },
              ],
            );
            // Extract only the config properties, not lines/lineGroups
            setConfig({
              lineSeparationCm: savedConfig.lineSeparationCm || 40,
              defaultLineLengthCm: savedConfig.defaultLineLengthCm || 400,
              method: savedConfig.method || "parades-crestall",
              showLabels:
                savedConfig.showLabels !== undefined
                  ? savedConfig.showLabels
                  : true,
              currentPlantingDate:
                savedConfig.currentPlantingDate || new Date().toISOString(),
              groupConfig:
                savedConfig.groupConfig ||
                gardenMethods["parades-crestall"].groupConfig,
            });
          } else {
            const response = await fetch("/api/gardens", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: "Mi Huerto",
                config: {
                  ...config,
                  lines: [],
                  lineGroups: [
                    { id: "group-1", name: "Bancal 1", color: "#22c55e" },
                  ],
                },
                plants: [],
                middlePlants: [],
              }),
            });
            if (response.ok) {
              const newGarden = await response.json();
              setCurrentGardenId(newGarden.id);
              setCurrentGardenName(newGarden.name);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing garden:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeGarden();
  }, []);

  useEffect(() => {
    if (!isInitialized || !currentGardenId) return;

    setSaveStatus("saving");
    const timeoutId = setTimeout(async () => {
      try {
        const configToSave = {
          lineSeparationCm: config.lineSeparationCm,
          defaultLineLengthCm: config.defaultLineLengthCm,
          method: config.method,
          showLabels: config.showLabels,
          currentPlantingDate: config.currentPlantingDate,
          groupConfig: config.groupConfig,
          lines,
          lineGroups,
        };

        const response = await fetch(`/api/gardens/${currentGardenId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: currentGardenName,
            config: configToSave,
          }),
        });

        if (response.ok) {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        }
      } catch (error) {
        console.error("Error auto-saving garden:", error);
        setSaveStatus("idle");
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [
    lines,
    lineGroups,
    config,
    currentGardenId,
    currentGardenName,
    isInitialized,
  ]);

  const handleLoadGarden = (data: {
    gardenId: number;
    gardenName: string;
    lines: GardenLine[];
    lineGroups: LineGroup[];
    config: GardenConfig;
  }) => {
    setCurrentGardenId(data.gardenId);
    setCurrentGardenName(data.gardenName);

    // Ensure all lines have a valid lengthCm
    const loadedLines = data.lines.map((line) => ({
      ...line,
      lengthCm: line.lengthCm || data.config.defaultLineLengthCm || 400,
    }));
    setLines(loadedLines);

    setLineGroups(data.lineGroups);

    // Extract only the config properties, not lines/lineGroups
    setConfig({
      lineSeparationCm: data.config.lineSeparationCm || 40,
      defaultLineLengthCm: data.config.defaultLineLengthCm || 400,
      method: data.config.method || "parades-crestall",
      showLabels:
        data.config.showLabels !== undefined ? data.config.showLabels : true,
      currentPlantingDate:
        data.config.currentPlantingDate || new Date().toISOString(),
      groupConfig:
        data.config.groupConfig ||
        gardenMethods["parades-crestall"].groupConfig,
    });
  };

  const handleSave = () => {};

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile menu button for plants */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setPlantSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10">
            <Sprout className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-sm md:text-lg text-foreground">
              Planificador de Huerto
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Diseña tu huerto con líneas de goteo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SaveLoadDialog
            currentGardenId={currentGardenId}
            currentGardenName={currentGardenName}
            lines={lines}
            lineGroups={lineGroups}
            config={config}
            onLoad={handleLoadGarden}
            onSave={handleSave}
            saveStatus={saveStatus}
          />

          {/* Mobile config button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setConfigPanelOpen(true)}
          >
            <SettingsIcon className="h-5 w-5" />
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex">
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
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Mobile Plant Sidebar - Sheet/Drawer */}
        <Sheet open={plantSidebarOpen} onOpenChange={setPlantSidebarOpen}>
          <SheetContent
            side="left"
            className="p-0 w-80 sm:w-96 gap-0"
            aria-describedby="plant-sidebar-description"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Plantas</SheetTitle>
              <p id="plant-sidebar-description" className="sr-only">
                Selecciona plantas para añadir a tu huerto
              </p>
            </SheetHeader>
            <PlantSidebar
              plants={plants}
              onDragStart={handleDragStart}
              selectedPlant={selectedPlant}
              onSelectPlant={handleSelectPlant}
              onOpenManager={() => setManagerOpen(true)}
            />
          </SheetContent>
        </Sheet>

        {/* Desktop Plant Sidebar */}
        <div className="hidden lg:block">
          <PlantSidebar
            plants={plants}
            onDragStart={handleDragStart}
            selectedPlant={selectedPlant}
            onSelectPlant={setSelectedPlant}
            onOpenManager={() => setManagerOpen(true)}
          />
        </div>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Selected Plant Indicator */}
          {selectedPlant && (
            <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedPlant.plant.emoji}</span>
                <div>
                  <p className="text-sm font-medium">
                    {selectedPlant.plant.name}
                    {selectedPlant.variety &&
                      ` (${selectedPlant.variety.name})`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Haz clic en el huerto para plantar
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPlant(null)}
                className="h-8"
              >
                Cancelar
              </Button>
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 min-h-0 flex flex-col overflow-hidden"
          >
            <div className="border-b border-border bg-card px-4">
              <TabsList className="h-12">
                <TabsTrigger value="garden" className="gap-2">
                  <Layers className="h-4 w-4" />
                  Huerto
                </TabsTrigger>
                <TabsTrigger value="timeline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="garden"
              className="flex-1 min-h-0 mt-0 overflow-hidden"
            >
              <GardenCanvas
                lines={lines}
                plants={plants}
                lineGroups={lineGroups}
                onLinesChange={setLines}
                onLineGroupsChange={setLineGroups}
                selectedPlant={selectedPlant}
                config={config}
              />
            </TabsContent>

            <TabsContent
              value="timeline"
              className="flex-1 min-h-0 mt-0 overflow-hidden"
            >
              <PlantTimeline lines={lines} plants={plants} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Mobile Config Panel - Sheet/Drawer */}
        <Sheet open={configPanelOpen} onOpenChange={setConfigPanelOpen}>
          <SheetContent
            side="right"
            className="p-0 w-80"
            aria-describedby="config-panel-description"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Configuración</SheetTitle>
              <p id="config-panel-description" className="sr-only">
                Configura el método de cultivo y espaciamiento
              </p>
            </SheetHeader>
            <ConfigPanel
              config={config}
              onConfigChange={setConfig}
              plantCount={plantCount}
              lineCount={lines.length}
            />
          </SheetContent>
        </Sheet>

        {/* Desktop Config Panel */}
        <div className="hidden lg:block">
          <ConfigPanel
            config={config}
            onConfigChange={setConfig}
            plantCount={plantCount}
            lineCount={lines.length}
          />
        </div>
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
