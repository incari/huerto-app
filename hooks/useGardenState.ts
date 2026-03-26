import { useState, useEffect, useMemo, useRef } from "react";
import {
  GardenLine,
  GardenConfig,
  LineGroup,
  gardenMethods,
} from "@/lib/plants";
import { useGardens, useCreateGarden, useUpdateGarden } from "./useGardens";

const INITIAL_LINES: GardenLine[] = [
  { id: "line-1", lengthCm: 400, plants: [], groupId: "group-1" },
  { id: "line-2", lengthCm: 400, plants: [], groupId: "group-1" },
  { id: "line-3", lengthCm: 400, plants: [], groupId: "group-1" },
  { id: "line-4", lengthCm: 400, plants: [], groupId: "group-1" },
];

const INITIAL_LINE_GROUPS: LineGroup[] = [
  { id: "group-1", name: "Bancal 1", color: "#22c55e" },
];

export function useGardenState() {
  const [lines, setLines] = useState<GardenLine[]>([]);
  const [lineGroups, setLineGroups] =
    useState<LineGroup[]>(INITIAL_LINE_GROUPS);
  const [config, setConfig] = useState<GardenConfig>(
    gardenMethods["parades-crestall"],
  );
  const [currentGardenId, setCurrentGardenId] = useState<number | null>(null);
  const [currentGardenName, setCurrentGardenName] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  const { data: gardens, isLoading } = useGardens();
  const createGarden = useCreateGarden();
  const updateGarden = useUpdateGarden();

  // Track if we're still on the initial load to prevent auto-save during initialization
  const isInitialLoad = useRef(true);
  const hasInitialized = useRef(false);

  // Initialize garden from fetched data or create new one (only once)
  useEffect(() => {
    if (isLoading || !gardens || hasInitialized.current) return;

    hasInitialized.current = true;

    if (gardens.length > 0) {
      // Load the most recent garden
      const lastGarden = gardens[gardens.length - 1];
      const savedConfig = lastGarden.config;

      setCurrentGardenId(lastGarden.id);
      setCurrentGardenName(lastGarden.name);

      // Load lines with fallback to default length
      // Cast to any because the saved config includes lines and lineGroups
      const savedData = savedConfig as any;
      const loadedLines = (savedData.lines || []).map((line: GardenLine) => ({
        ...line,
        lengthCm: line.lengthCm || savedConfig.defaultLineLengthCm || 400,
      }));

      setLines(loadedLines);
      setLineGroups(savedData.lineGroups || INITIAL_LINE_GROUPS);
      setConfig({
        lineSeparationCm: savedConfig.lineSeparationCm || 40,
        defaultLineLengthCm: savedConfig.defaultLineLengthCm || 400,
        method: savedConfig.method || "parades-crestall",
        showLabels:
          savedConfig.showLabels !== undefined ? savedConfig.showLabels : true,
        currentPlantingDate:
          savedConfig.currentPlantingDate || new Date().toISOString(),
        groupConfig:
          savedConfig.groupConfig ||
          gardenMethods["parades-crestall"].groupConfig,
      });

      // Mark initial load as complete after state is set
      setTimeout(() => {
        isInitialLoad.current = false;
      }, 100);
    } else {
      // Create a new garden with initial lines
      createGarden.mutate(
        {
          name: "Mi Huerto",
          config: {
            ...gardenMethods["parades-crestall"],
            lines: INITIAL_LINES,
            lineGroups: INITIAL_LINE_GROUPS,
          } as any,
          plants: [],
        },
        {
          onSuccess: (newGarden) => {
            setCurrentGardenId(newGarden.id);
            setCurrentGardenName(newGarden.name);
            setLines(INITIAL_LINES);
            setLineGroups(INITIAL_LINE_GROUPS);
            // Mark initial load as complete after state is set
            setTimeout(() => {
              isInitialLoad.current = false;
            }, 100);
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // Auto-save changes (only after initial load is complete)
  useEffect(() => {
    // Skip auto-save during initial load
    if (!currentGardenId || isLoading || isInitialLoad.current) return;

    setSaveStatus("saving");
    const timeoutId = setTimeout(() => {
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

      updateGarden.mutate(
        {
          id: currentGardenId,
          name: currentGardenName,
          config: configToSave,
        },
        {
          onSuccess: () => {
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
          },
          onError: () => {
            setSaveStatus("idle");
          },
        },
      );
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [lines, lineGroups, config, currentGardenId, currentGardenName]);

  // Update line lengths when config changes
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

  return {
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
  };
}
