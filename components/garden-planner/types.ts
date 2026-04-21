export type PlannerMode = "design" | "plant";
export type CameraMode = "2d" | "3d";

export interface Plot {
  widthCm: number;
  depthCm: number;
}

export interface Bed {
  id: string;
  x: number;
  y: number;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  rotation: number;
}

export type IrrigationKind = "sprinkler" | "micro" | "drip" | "soaker";

export interface Irrigation {
  id: string;
  kind: IrrigationKind;
  x: number;
  y: number;
  rotation: number;
  radiusCm: number;
  lengthCm: number;
  widthCm: number;
  spacingCm?: number;
  dropRadiusCm?: number;
}

export const DEFAULT_DRIP_SPACING_CM = 30;
export const DEFAULT_DRIP_DROP_RADIUS_CM = 7.5;

export type PlantKind = "tomato" | "pepper";
export type PlantStage = 1 | 2 | 3 | 4;

export interface PlantItem {
  id: string;
  kind: PlantKind;
  x: number;
  y: number;
  stage?: PlantStage;
}

export interface PlantKindSpec {
  spacingCm: number;
  heightCm: number;
  canopyCm: number;
  stemColor: string;
  foliageColor: string;
  fruitColor: string;
  emoji: string;
}

export const PLANT_KIND_SPECS: Record<PlantKind, PlantKindSpec> = {
  tomato: {
    spacingCm: 50,
    heightCm: 200,
    canopyCm: 70,
    stemColor: "#4d7c0f",
    foliageColor: "#65a30d",
    fruitColor: "#dc2626",
    emoji: "🍅",
  },
  pepper: {
    spacingCm: 35,
    heightCm: 60,
    canopyCm: 45,
    stemColor: "#3f6212",
    foliageColor: "#4d7c0f",
    fruitColor: "#16a34a",
    emoji: "🌶️",
  },
};

export interface TomatoStageSpec {
  heightCm: number;
  canopyCm: number;
  branchCount: number;
  stemLeafCount: number;
  ripeness: number;
  hasStake: boolean;
  label: string;
}

export const TOMATO_STAGE_SPECS: Record<PlantStage, TomatoStageSpec> = {
  1: {
    heightCm: 30,
    canopyCm: 25,
    branchCount: 2,
    stemLeafCount: 4,
    ripeness: 0,
    hasStake: false,
    label: "1 mes",
  },
  2: {
    heightCm: 60,
    canopyCm: 40,
    branchCount: 4,
    stemLeafCount: 6,
    ripeness: 0,
    hasStake: true,
    label: "2 meses",
  },
  3: {
    heightCm: 120,
    canopyCm: 55,
    branchCount: 6,
    stemLeafCount: 8,
    ripeness: 0.25,
    hasStake: true,
    label: "3 meses",
  },
  4: {
    heightCm: 200,
    canopyCm: 70,
    branchCount: 8,
    stemLeafCount: 10,
    ripeness: 0.8,
    hasStake: true,
    label: "4 meses",
  },
};

export const DEFAULT_PLANT_STAGE: PlantStage = 4;

export const PLANT_LABELS: Record<PlantKind, string> = {
  tomato: "Tomate",
  pepper: "Pimiento",
};

export interface PlannerState {
  plot: Plot;
  beds: Bed[];
  irrigations: Irrigation[];
  plants: PlantItem[];
}

export const DEFAULT_PLOT: Plot = {
  widthCm: 400,
  depthCm: 1000,
};

export const DEFAULT_BED: Omit<Bed, "id"> = {
  x: 0,
  y: 0,
  widthCm: 300,
  depthCm: 140,
  heightCm: 20,
  rotation: 0,
};

export const DEFAULT_IRRIGATION: Record<
  IrrigationKind,
  Omit<Irrigation, "id" | "kind" | "x" | "y">
> = {
  sprinkler: { rotation: 0, radiusCm: 200, lengthCm: 0, widthCm: 0 },
  micro: { rotation: 0, radiusCm: 60, lengthCm: 0, widthCm: 0 },
  drip: {
    rotation: 0,
    radiusCm: 0,
    lengthCm: 300,
    widthCm: 30,
    spacingCm: DEFAULT_DRIP_SPACING_CM,
    dropRadiusCm: DEFAULT_DRIP_DROP_RADIUS_CM,
  },
  soaker: { rotation: 0, radiusCm: 0, lengthCm: 300, widthCm: 40 },
};

export const IRRIGATION_LABELS: Record<IrrigationKind, string> = {
  sprinkler: "Aspersor",
  micro: "Microaspersor",
  drip: "Goteo",
  soaker: "Exudante",
};

export function isLinearIrrigation(kind: IrrigationKind): boolean {
  return kind === "drip" || kind === "soaker";
}
