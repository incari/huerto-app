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
  locked?: boolean;
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
  locked?: boolean;
}

export const DEFAULT_DRIP_SPACING_CM = 30;
export const DEFAULT_DRIP_DROP_RADIUS_CM = 7.5;

export type PlantKind =
  | "tomato"
  | "pepper-red"
  | "pepper-green"
  | "pepper-yellow"
  | "onion"
  | "garlic"
  | "lettuce"
  | "strawberry"
  | "pumpkin"
  | "eggplant"
  | "beans"
  | "cucumber";

export type PlantStage = 1 | 2 | 3 | 4;

export interface PlantItem {
  id: string;
  kind: PlantKind;
  x: number;
  y: number;
  stage?: PlantStage;
  locked?: boolean;
}

export interface Group {
  id: string;
  itemIds: string[];
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
  "pepper-red": {
    spacingCm: 40,
    heightCm: 70,
    canopyCm: 50,
    stemColor: "#3f6212",
    foliageColor: "#4d7c0f",
    fruitColor: "#dc2626",
    emoji: "🌶️",
  },
  "pepper-green": {
    spacingCm: 40,
    heightCm: 70,
    canopyCm: 50,
    stemColor: "#3f6212",
    foliageColor: "#4d7c0f",
    fruitColor: "#16a34a",
    emoji: "🫑",
  },
  "pepper-yellow": {
    spacingCm: 40,
    heightCm: 70,
    canopyCm: 50,
    stemColor: "#3f6212",
    foliageColor: "#4d7c0f",
    fruitColor: "#eab308",
    emoji: "🌶️",
  },
  onion: {
    spacingCm: 15,
    heightCm: 50,
    canopyCm: 18,
    stemColor: "#a16207",
    foliageColor: "#65a30d",
    fruitColor: "#fde68a",
    emoji: "🧅",
  },
  garlic: {
    spacingCm: 12,
    heightCm: 45,
    canopyCm: 14,
    stemColor: "#fef3c7",
    foliageColor: "#84cc16",
    fruitColor: "#fafaf9",
    emoji: "🧄",
  },
  lettuce: {
    spacingCm: 25,
    heightCm: 30,
    canopyCm: 30,
    stemColor: "#65a30d",
    foliageColor: "#84cc16",
    fruitColor: "#bef264",
    emoji: "🥬",
  },
  strawberry: {
    spacingCm: 30,
    heightCm: 25,
    canopyCm: 35,
    stemColor: "#4d7c0f",
    foliageColor: "#16a34a",
    fruitColor: "#dc2626",
    emoji: "🍓",
  },
  pumpkin: {
    spacingCm: 100,
    heightCm: 40,
    canopyCm: 180,
    stemColor: "#4d7c0f",
    foliageColor: "#65a30d",
    fruitColor: "#ea580c",
    emoji: "🎃",
  },
  eggplant: {
    spacingCm: 50,
    heightCm: 100,
    canopyCm: 70,
    stemColor: "#3f6212",
    foliageColor: "#4d7c0f",
    fruitColor: "#5b21b6",
    emoji: "🍆",
  },
  beans: {
    spacingCm: 20,
    heightCm: 180,
    canopyCm: 30,
    stemColor: "#65a30d",
    foliageColor: "#16a34a",
    fruitColor: "#86efac",
    emoji: "🫘",
  },
  cucumber: {
    spacingCm: 40,
    heightCm: 180,
    canopyCm: 60,
    stemColor: "#65a30d",
    foliageColor: "#4d7c0f",
    fruitColor: "#16a34a",
    emoji: "🥒",
  },
};

export interface PlantStageSpec {
  heightCm: number;
  canopyCm: number;
  branchCount: number;
  leafCount: number;
  fruitCount: number;
  ripeness: number;
  hasStake: boolean;
  label: string;
}

export const DEFAULT_PLANT_STAGE: PlantStage = 4;

export const PLANT_LABELS: Record<PlantKind, string> = {
  tomato: "Tomate",
  "pepper-red": "Pimiento rojo",
  "pepper-green": "Pimiento verde",
  "pepper-yellow": "Pimiento amarillo",
  onion: "Cebolla",
  garlic: "Ajo",
  lettuce: "Lechuga",
  strawberry: "Fresa",
  pumpkin: "Calabaza",
  eggplant: "Berenjena",
  beans: "Judías",
  cucumber: "Pepino",
};

function pepperStages(label1 = "1 mes"): Record<PlantStage, PlantStageSpec> {
  return {
    1: {
      heightCm: 15,
      canopyCm: 15,
      branchCount: 2,
      leafCount: 6,
      fruitCount: 0,
      ripeness: 0,
      hasStake: false,
      label: label1,
    },
    2: {
      heightCm: 30,
      canopyCm: 28,
      branchCount: 4,
      leafCount: 14,
      fruitCount: 0,
      ripeness: 0,
      hasStake: false,
      label: "2 meses",
    },
    3: {
      heightCm: 50,
      canopyCm: 42,
      branchCount: 6,
      leafCount: 22,
      fruitCount: 4,
      ripeness: 0.3,
      hasStake: true,
      label: "3 meses",
    },
    4: {
      heightCm: 70,
      canopyCm: 50,
      branchCount: 7,
      leafCount: 28,
      fruitCount: 7,
      ripeness: 0.9,
      hasStake: true,
      label: "4 meses",
    },
  };
}

export const PLANT_STAGE_SPECS: Record<
  PlantKind,
  Record<PlantStage, PlantStageSpec>
> = {
  tomato: {
    1: {
      heightCm: 30,
      canopyCm: 25,
      branchCount: 2,
      leafCount: 4,
      fruitCount: 0,
      ripeness: 0,
      hasStake: false,
      label: "1 mes",
    },
    2: {
      heightCm: 60,
      canopyCm: 40,
      branchCount: 4,
      leafCount: 6,
      fruitCount: 0,
      ripeness: 0,
      hasStake: true,
      label: "2 meses",
    },
    3: {
      heightCm: 120,
      canopyCm: 55,
      branchCount: 6,
      leafCount: 8,
      fruitCount: 6,
      ripeness: 0.25,
      hasStake: true,
      label: "3 meses",
    },
    4: {
      heightCm: 200,
      canopyCm: 70,
      branchCount: 8,
      leafCount: 10,
      fruitCount: 12,
      ripeness: 0.8,
      hasStake: true,
      label: "4 meses",
    },
  },
  "pepper-red": pepperStages(),
  "pepper-green": pepperStages(),
  "pepper-yellow": pepperStages(),
  onion: {
    1: {
      heightCm: 10,
      canopyCm: 6,
      branchCount: 3,
      leafCount: 3,
      fruitCount: 0,
      ripeness: 0,
      hasStake: false,
      label: "Plántula",
    },
    2: {
      heightCm: 25,
      canopyCm: 10,
      branchCount: 5,
      leafCount: 5,
      fruitCount: 0,
      ripeness: 0,
      hasStake: false,
      label: "Hojas",
    },
    3: {
      heightCm: 40,
      canopyCm: 14,
      branchCount: 7,
      leafCount: 7,
      fruitCount: 1,
      ripeness: 0.4,
      hasStake: false,
      label: "Bulbo",
    },
    4: {
      heightCm: 50,
      canopyCm: 18,
      branchCount: 8,
      leafCount: 8,
      fruitCount: 1,
      ripeness: 1,
      hasStake: false,
      label: "Cosecha",
    },
  },
  garlic: {
    1: {
      heightCm: 10,
      canopyCm: 5,
      branchCount: 3,
      leafCount: 3,
      fruitCount: 0,
      ripeness: 0,
      hasStake: false,
      label: "Plántula",
    },
    2: {
      heightCm: 20,
      canopyCm: 8,
      branchCount: 4,
      leafCount: 4,
      fruitCount: 0,
      ripeness: 0,
      hasStake: false,
      label: "Hojas",
    },
    3: {
      heightCm: 35,
      canopyCm: 11,
      branchCount: 5,
      leafCount: 5,
      fruitCount: 1,
      ripeness: 0.4,
      hasStake: false,
      label: "Bulbo",
    },
    4: {
      heightCm: 45,
      canopyCm: 14,
      branchCount: 6,
      leafCount: 6,
      fruitCount: 1,
      ripeness: 1,
      hasStake: false,
      label: "Cosecha",
    },
  },
  lettuce: {
    1: {
      heightCm: 5,
      canopyCm: 8,
      branchCount: 0,
      leafCount: 4,
      fruitCount: 0,
      ripeness: 0,
      hasStake: false,
      label: "Plántula",
    },
    2: {
      heightCm: 12,
      canopyCm: 16,
      branchCount: 0,
      leafCount: 8,
      fruitCount: 0,
      ripeness: 0,
      hasStake: false,
      label: "Roseta",
    },
    3: {
      heightCm: 20,
      canopyCm: 24,
      branchCount: 0,
      leafCount: 14,
      fruitCount: 0,
      ripeness: 0,
      hasStake: false,
      label: "Cogollo",
    },
    4: {
      heightCm: 30,
      canopyCm: 30,
      branchCount: 0,
      leafCount: 20,
      fruitCount: 0,
      ripeness: 0,
      hasStake: false,
      label: "Cosecha",
    },
  },
  strawberry: {
    1: {
      heightCm: 8,
      canopyCm: 14,
      branchCount: 0,
      leafCount: 3,
      fruitCount: 0,
      ripeness: 0,
      hasStake: false,
      label: "Plántula",
    },
    2: {
      heightCm: 15,
      canopyCm: 22,
      branchCount: 0,
      leafCount: 6,
      fruitCount: 2,
      ripeness: 0,
      hasStake: false,
      label: "Flor",
    },
    3: {
      heightCm: 20,
      canopyCm: 28,
      branchCount: 0,
      leafCount: 9,
      fruitCount: 5,
      ripeness: 0.25,
      hasStake: false,
      label: "Verde",
    },
    4: {
      heightCm: 25,
      canopyCm: 35,
      branchCount: 0,
      leafCount: 12,
      fruitCount: 8,
      ripeness: 0.95,
      hasStake: false,
      label: "Madura",
    },
  },
  pumpkin: {
    1: {
      heightCm: 10,
      canopyCm: 30,
      branchCount: 1,
      leafCount: 3,
      fruitCount: 0,
      ripeness: 0,
      hasStake: false,
      label: "Plántula",
    },
    2: {
      heightCm: 20,
      canopyCm: 80,
      branchCount: 2,
      leafCount: 7,
      fruitCount: 0,
      ripeness: 0,
      hasStake: false,
      label: "Trepa",
    },
    3: {
      heightCm: 35,
      canopyCm: 140,
      branchCount: 3,
      leafCount: 12,
      fruitCount: 2,
      ripeness: 0.2,
      hasStake: false,
      label: "Fruto",
    },
    4: {
      heightCm: 40,
      canopyCm: 180,
      branchCount: 4,
      leafCount: 16,
      fruitCount: 3,
      ripeness: 1,
      hasStake: false,
      label: "Madura",
    },
  },
  eggplant: {
    1: {
      heightCm: 15,
      canopyCm: 18,
      branchCount: 2,
      leafCount: 5,
      fruitCount: 0,
      ripeness: 0,
      hasStake: false,
      label: "1 mes",
    },
    2: {
      heightCm: 40,
      canopyCm: 38,
      branchCount: 4,
      leafCount: 12,
      fruitCount: 0,
      ripeness: 0,
      hasStake: true,
      label: "2 meses",
    },
    3: {
      heightCm: 70,
      canopyCm: 55,
      branchCount: 5,
      leafCount: 18,
      fruitCount: 3,
      ripeness: 0.5,
      hasStake: true,
      label: "3 meses",
    },
    4: {
      heightCm: 100,
      canopyCm: 70,
      branchCount: 6,
      leafCount: 24,
      fruitCount: 5,
      ripeness: 1,
      hasStake: true,
      label: "4 meses",
    },
  },
  beans: {
    1: {
      heightCm: 10,
      canopyCm: 12,
      branchCount: 1,
      leafCount: 3,
      fruitCount: 0,
      ripeness: 0,
      hasStake: false,
      label: "Plántula",
    },
    2: {
      heightCm: 40,
      canopyCm: 18,
      branchCount: 1,
      leafCount: 10,
      fruitCount: 0,
      ripeness: 0,
      hasStake: true,
      label: "Trepa",
    },
    3: {
      heightCm: 100,
      canopyCm: 25,
      branchCount: 1,
      leafCount: 20,
      fruitCount: 4,
      ripeness: 0.1,
      hasStake: true,
      label: "Flor",
    },
    4: {
      heightCm: 180,
      canopyCm: 30,
      branchCount: 1,
      leafCount: 30,
      fruitCount: 10,
      ripeness: 0.7,
      hasStake: true,
      label: "Vainas",
    },
  },
  cucumber: {
    1: {
      heightCm: 10,
      canopyCm: 20,
      branchCount: 1,
      leafCount: 3,
      fruitCount: 0,
      ripeness: 0,
      hasStake: false,
      label: "Plántula",
    },
    2: {
      heightCm: 40,
      canopyCm: 35,
      branchCount: 2,
      leafCount: 8,
      fruitCount: 0,
      ripeness: 0,
      hasStake: true,
      label: "Trepa",
    },
    3: {
      heightCm: 100,
      canopyCm: 50,
      branchCount: 2,
      leafCount: 14,
      fruitCount: 3,
      ripeness: 0.2,
      hasStake: true,
      label: "Flor",
    },
    4: {
      heightCm: 180,
      canopyCm: 60,
      branchCount: 3,
      leafCount: 20,
      fruitCount: 6,
      ripeness: 0.9,
      hasStake: true,
      label: "Frutos",
    },
  },
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
