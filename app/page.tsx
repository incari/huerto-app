"use client";

import { useState } from "react";
import { PlantSidebar, SelectedPlantData } from "@/components/plant-sidebar";
import { GardenCanvas } from "@/components/garden-canvas";
import { ConfigPanel } from "@/components/config-panel";
import { PlantManager } from "@/components/plant-manager";
import { PlantTimeline } from "@/components/plant-timeline";
import { SaveLoadDialog } from "@/components/save-load-dialog";
import { useGardenState } from "@/hooks/useGardenState";
import {
  Plant,
  GardenLine,
  GardenConfig,
  defaultPlants,
  LineGroup,
  gardenMethods,
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
  // Use the custom hook for garden state management
  const {
    lines,
    setLines,
    lineGroups,
    setLineGroups,
    config,
    setConfig,
    currentGardenId,
    setCurrentGardenId,
    currentGardenName,
    setCurrentGardenName,
    saveStatus,
    plantCount,
    isLoading,
  } = useGardenState();

  const [selectedPlant, setSelectedPlant] = useState<SelectedPlantData | null>(
    null,
  );
  const [plants, setPlants] = useState<Plant[]>(defaultPlants);
  const [managerOpen, setManagerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("garden");
  const [plantSidebarOpen, setPlantSidebarOpen] = useState(false);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);

  const handleDragStart = (data: SelectedPlantData) => {
    setSelectedPlant(data);
  };

  const handleSelectPlant = (data: SelectedPlantData | null) => {
    setSelectedPlant(data);
    setPlantSidebarOpen(false);
  };

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
    // Merge with default config to ensure new properties are included
    const method = data.config.method || "parades-crestall";
    const defaultConfig = gardenMethods[method];

    setConfig({
      lineSeparationCm: data.config.lineSeparationCm || 40,
      defaultLineLengthCm: data.config.defaultLineLengthCm || 400,
      method,
      showLabels:
        data.config.showLabels !== undefined ? data.config.showLabels : true,
      currentPlantingDate:
        data.config.currentPlantingDate || new Date().toISOString(),
      // Merge groupConfig with defaults to get updated spacing values
      groupConfig: data.config.groupConfig
        ? {
            ...defaultConfig.groupConfig,
            ...data.config.groupConfig,
          }
        : defaultConfig.groupConfig,
    });
  };

  const handleSave = () => {};

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Sprout className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Cargando tu huerto...</p>
        </div>
      </div>
    );
  }

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
