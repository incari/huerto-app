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
  | "cucumber"
  | "zucchini"
  | "watermelon"
  | "melon"
  | "carrot"
  | "leek"
  | "radish"
  | "beet"
  | "turnip"
  | "potato"
  | "celery"
  | "fennel"
  | "chard"
  | "spinach"
  | "arugula"
  | "escarole"
  | "corn-salad"
  | "endive"
  | "cabbage"
  | "red-cabbage"
  | "broccoli"
  | "romanesco"
  | "brussels-sprouts"
  | "cauliflower"
  | "artichoke"
  | "asparagus"
  | "fava-bean"
  | "pea"
  | "green-bean"
  | "runner-bean"
  | "red-bean"
  | "lupin"
  | "basil"
  | "parsley"
  | "rosemary"
  | "dill"
  | "sage"
  | "oregano"
  | "lemon-thyme"
  | "chives"
  | "stevia"
  | "rue"
  | "calendula"
  | "nasturtium"
  | "daisy"
  | "rose"
  | "altabaca";

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
  zucchini: {
    spacingCm: 75,
    heightCm: 60,
    canopyCm: 120,
    stemColor: "#4d7c0f",
    foliageColor: "#65a30d",
    fruitColor: "#4ade80",
    emoji: "🥒",
  },
  watermelon: {
    spacingCm: 100,
    heightCm: 30,
    canopyCm: 200,
    stemColor: "#4d7c0f",
    foliageColor: "#65a30d",
    fruitColor: "#22c55e",
    emoji: "🍉",
  },
  melon: {
    spacingCm: 100,
    heightCm: 30,
    canopyCm: 180,
    stemColor: "#4d7c0f",
    foliageColor: "#65a30d",
    fruitColor: "#fbbf24",
    emoji: "🍈",
  },
  carrot: {
    spacingCm: 10,
    heightCm: 30,
    canopyCm: 15,
    stemColor: "#65a30d",
    foliageColor: "#84cc16",
    fruitColor: "#f97316",
    emoji: "🥕",
  },
  leek: {
    spacingCm: 15,
    heightCm: 60,
    canopyCm: 12,
    stemColor: "#ecfccb",
    foliageColor: "#84cc16",
    fruitColor: "#d9f99d",
    emoji: "🧅",
  },
  radish: {
    spacingCm: 8,
    heightCm: 20,
    canopyCm: 12,
    stemColor: "#84cc16",
    foliageColor: "#65a30d",
    fruitColor: "#e11d48",
    emoji: "🌱",
  },
  beet: {
    spacingCm: 15,
    heightCm: 35,
    canopyCm: 22,
    stemColor: "#be123c",
    foliageColor: "#15803d",
    fruitColor: "#be123c",
    emoji: "🫚",
  },
  turnip: {
    spacingCm: 20,
    heightCm: 35,
    canopyCm: 22,
    stemColor: "#84cc16",
    foliageColor: "#65a30d",
    fruitColor: "#f5f5f4",
    emoji: "🫚",
  },
  potato: {
    spacingCm: 30,
    heightCm: 60,
    canopyCm: 45,
    stemColor: "#4d7c0f",
    foliageColor: "#65a30d",
    fruitColor: "#a16207",
    emoji: "🥔",
  },
  celery: {
    spacingCm: 25,
    heightCm: 50,
    canopyCm: 30,
    stemColor: "#a3e635",
    foliageColor: "#84cc16",
    fruitColor: "#bef264",
    emoji: "🥬",
  },
  fennel: {
    spacingCm: 25,
    heightCm: 60,
    canopyCm: 30,
    stemColor: "#a3e635",
    foliageColor: "#84cc16",
    fruitColor: "#d9f99d",
    emoji: "🌿",
  },
  chard: {
    spacingCm: 25,
    heightCm: 45,
    canopyCm: 40,
    stemColor: "#f8fafc",
    foliageColor: "#22c55e",
    fruitColor: "#f8fafc",
    emoji: "🥬",
  },
  spinach: {
    spacingCm: 15,
    heightCm: 25,
    canopyCm: 25,
    stemColor: "#166534",
    foliageColor: "#16a34a",
    fruitColor: "#14532d",
    emoji: "🥬",
  },
  arugula: {
    spacingCm: 10,
    heightCm: 20,
    canopyCm: 20,
    stemColor: "#65a30d",
    foliageColor: "#84cc16",
    fruitColor: "#a3e635",
    emoji: "🥬",
  },
  escarole: {
    spacingCm: 25,
    heightCm: 30,
    canopyCm: 35,
    stemColor: "#84cc16",
    foliageColor: "#a3e635",
    fruitColor: "#d9f99d",
    emoji: "🥬",
  },
  "corn-salad": {
    spacingCm: 25,
    heightCm: 15,
    canopyCm: 18,
    stemColor: "#22c55e",
    foliageColor: "#16a34a",
    fruitColor: "#4ade80",
    emoji: "🥬",
  },
  endive: {
    spacingCm: 25,
    heightCm: 30,
    canopyCm: 28,
    stemColor: "#fef08a",
    foliageColor: "#facc15",
    fruitColor: "#fef08a",
    emoji: "🥬",
  },
  cabbage: {
    spacingCm: 50,
    heightCm: 35,
    canopyCm: 45,
    stemColor: "#4ade80",
    foliageColor: "#86efac",
    fruitColor: "#bbf7d0",
    emoji: "🥬",
  },
  "red-cabbage": {
    spacingCm: 50,
    heightCm: 35,
    canopyCm: 45,
    stemColor: "#7c3aed",
    foliageColor: "#6b21a8",
    fruitColor: "#9333ea",
    emoji: "🥬",
  },
  broccoli: {
    spacingCm: 50,
    heightCm: 60,
    canopyCm: 50,
    stemColor: "#166534",
    foliageColor: "#15803d",
    fruitColor: "#14532d",
    emoji: "🥦",
  },
  romanesco: {
    spacingCm: 50,
    heightCm: 55,
    canopyCm: 50,
    stemColor: "#4d7c0f",
    foliageColor: "#65a30d",
    fruitColor: "#84cc16",
    emoji: "🥦",
  },
  "brussels-sprouts": {
    spacingCm: 50,
    heightCm: 80,
    canopyCm: 40,
    stemColor: "#166534",
    foliageColor: "#22c55e",
    fruitColor: "#16a34a",
    emoji: "🥬",
  },
  cauliflower: {
    spacingCm: 50,
    heightCm: 55,
    canopyCm: 50,
    stemColor: "#65a30d",
    foliageColor: "#4d7c0f",
    fruitColor: "#f5f5f4",
    emoji: "🥦",
  },
  artichoke: {
    spacingCm: 75,
    heightCm: 120,
    canopyCm: 90,
    stemColor: "#4d7c0f",
    foliageColor: "#65a30d",
    fruitColor: "#6b7280",
    emoji: "🥬",
  },
  asparagus: {
    spacingCm: 25,
    heightCm: 100,
    canopyCm: 30,
    stemColor: "#84cc16",
    foliageColor: "#a3e635",
    fruitColor: "#bef264",
    emoji: "🌱",
  },
  "fava-bean": {
    spacingCm: 25,
    heightCm: 120,
    canopyCm: 35,
    stemColor: "#65a30d",
    foliageColor: "#4d7c0f",
    fruitColor: "#a3e635",
    emoji: "🫘",
  },
  pea: {
    spacingCm: 25,
    heightCm: 100,
    canopyCm: 30,
    stemColor: "#84cc16",
    foliageColor: "#65a30d",
    fruitColor: "#bef264",
    emoji: "🫛",
  },
  "green-bean": {
    spacingCm: 25,
    heightCm: 180,
    canopyCm: 30,
    stemColor: "#22c55e",
    foliageColor: "#16a34a",
    fruitColor: "#4ade80",
    emoji: "🫘",
  },
  "runner-bean": {
    spacingCm: 25,
    heightCm: 220,
    canopyCm: 35,
    stemColor: "#16a34a",
    foliageColor: "#15803d",
    fruitColor: "#22c55e",
    emoji: "🫘",
  },
  "red-bean": {
    spacingCm: 25,
    heightCm: 180,
    canopyCm: 30,
    stemColor: "#65a30d",
    foliageColor: "#4d7c0f",
    fruitColor: "#dc2626",
    emoji: "🫘",
  },
  lupin: {
    spacingCm: 25,
    heightCm: 80,
    canopyCm: 30,
    stemColor: "#65a30d",
    foliageColor: "#84cc16",
    fruitColor: "#eab308",
    emoji: "🌱",
  },
  basil: {
    spacingCm: 100,
    heightCm: 45,
    canopyCm: 40,
    stemColor: "#4d7c0f",
    foliageColor: "#22c55e",
    fruitColor: "#f8fafc",
    emoji: "🌿",
  },
  parsley: {
    spacingCm: 100,
    heightCm: 35,
    canopyCm: 30,
    stemColor: "#166534",
    foliageColor: "#16a34a",
    fruitColor: "#84cc16",
    emoji: "🌱",
  },
  rosemary: {
    spacingCm: 100,
    heightCm: 70,
    canopyCm: 55,
    stemColor: "#78350f",
    foliageColor: "#166534",
    fruitColor: "#a78bfa",
    emoji: "🌿",
  },
  dill: {
    spacingCm: 100,
    heightCm: 80,
    canopyCm: 40,
    stemColor: "#65a30d",
    foliageColor: "#84cc16",
    fruitColor: "#fde047",
    emoji: "🌿",
  },
  sage: {
    spacingCm: 100,
    heightCm: 50,
    canopyCm: 50,
    stemColor: "#78716c",
    foliageColor: "#84cc16",
    fruitColor: "#a78bfa",
    emoji: "🌿",
  },
  oregano: {
    spacingCm: 100,
    heightCm: 40,
    canopyCm: 45,
    stemColor: "#4d7c0f",
    foliageColor: "#22c55e",
    fruitColor: "#f9a8d4",
    emoji: "🌿",
  },
  "lemon-thyme": {
    spacingCm: 100,
    heightCm: 25,
    canopyCm: 35,
    stemColor: "#78350f",
    foliageColor: "#a3e635",
    fruitColor: "#fef08a",
    emoji: "🌿",
  },
  chives: {
    spacingCm: 100,
    heightCm: 35,
    canopyCm: 25,
    stemColor: "#65a30d",
    foliageColor: "#84cc16",
    fruitColor: "#c084fc",
    emoji: "🌱",
  },
  stevia: {
    spacingCm: 100,
    heightCm: 60,
    canopyCm: 45,
    stemColor: "#4d7c0f",
    foliageColor: "#22c55e",
    fruitColor: "#f8fafc",
    emoji: "🌿",
  },
  rue: {
    spacingCm: 100,
    heightCm: 60,
    canopyCm: 50,
    stemColor: "#65a30d",
    foliageColor: "#a3e635",
    fruitColor: "#fde047",
    emoji: "🌿",
  },
  calendula: {
    spacingCm: 100,
    heightCm: 50,
    canopyCm: 45,
    stemColor: "#65a30d",
    foliageColor: "#84cc16",
    fruitColor: "#f59e0b",
    emoji: "🌼",
  },
  nasturtium: {
    spacingCm: 100,
    heightCm: 35,
    canopyCm: 70,
    stemColor: "#4d7c0f",
    foliageColor: "#65a30d",
    fruitColor: "#ea580c",
    emoji: "🌺",
  },
  daisy: {
    spacingCm: 100,
    heightCm: 45,
    canopyCm: 40,
    stemColor: "#65a30d",
    foliageColor: "#84cc16",
    fruitColor: "#fef3c7",
    emoji: "🌼",
  },
  rose: {
    spacingCm: 100,
    heightCm: 120,
    canopyCm: 80,
    stemColor: "#166534",
    foliageColor: "#15803d",
    fruitColor: "#f43f5e",
    emoji: "🌹",
  },
  altabaca: {
    spacingCm: 100,
    heightCm: 70,
    canopyCm: 60,
    stemColor: "#4d7c0f",
    foliageColor: "#65a30d",
    fruitColor: "#c084fc",
    emoji: "🌸",
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
  zucchini: "Calabacín",
  watermelon: "Sandía",
  melon: "Melón",
  carrot: "Zanahoria",
  leek: "Puerro",
  radish: "Rabanito",
  beet: "Remolacha",
  turnip: "Nabo",
  potato: "Patata",
  celery: "Apio",
  fennel: "Hinojo",
  chard: "Acelga",
  spinach: "Espinaca",
  arugula: "Rúcula",
  escarole: "Escarola",
  "corn-salad": "Canónigos",
  endive: "Endivia",
  cabbage: "Col",
  "red-cabbage": "Lombarda",
  broccoli: "Brócoli",
  romanesco: "Romanesco",
  "brussels-sprouts": "Col de Bruselas",
  cauliflower: "Coliflor",
  artichoke: "Alcachofa",
  asparagus: "Espárrago",
  "fava-bean": "Haba",
  pea: "Guisante",
  "green-bean": "Habichuela",
  "runner-bean": "Judión",
  "red-bean": "Judía Roja",
  lupin: "Altramuz",
  basil: "Albahaca",
  parsley: "Perejil",
  rosemary: "Romero",
  dill: "Eneldo",
  sage: "Salvia",
  oregano: "Orégano",
  "lemon-thyme": "Tomillo Limón",
  chives: "Cebollino",
  stevia: "Stevia",
  rue: "Ruda",
  calendula: "Caléndula",
  nasturtium: "Capuchina",
  daisy: "Margarita",
  rose: "Rosa",
  altabaca: "Altabaca",
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

interface StageOpts {
  branches?: number;
  leaves?: number;
  fruits?: number;
  stake?: boolean;
  labels?: [string, string, string, string];
}

function stages(
  finalH: number,
  finalC: number,
  opts: StageOpts = {},
): Record<PlantStage, PlantStageSpec> {
  const {
    branches = 4,
    leaves = 12,
    fruits = 0,
    stake = false,
    labels = ["Plántula", "Crecimiento", "Flor", "Cosecha"],
  } = opts;
  const r = (n: number) => Math.max(1, Math.round(n));
  return {
    1: {
      heightCm: r(finalH * 0.2),
      canopyCm: r(finalC * 0.3),
      branchCount: r(branches * 0.3),
      leafCount: r(leaves * 0.25),
      fruitCount: 0,
      ripeness: 0,
      hasStake: false,
      label: labels[0],
    },
    2: {
      heightCm: r(finalH * 0.5),
      canopyCm: r(finalC * 0.6),
      branchCount: r(branches * 0.6),
      leafCount: r(leaves * 0.55),
      fruitCount: 0,
      ripeness: 0,
      hasStake: stake,
      label: labels[1],
    },
    3: {
      heightCm: r(finalH * 0.8),
      canopyCm: r(finalC * 0.85),
      branchCount: r(branches * 0.85),
      leafCount: r(leaves * 0.8),
      fruitCount: Math.round(fruits * 0.5),
      ripeness: fruits ? 0.3 : 0,
      hasStake: stake,
      label: labels[2],
    },
    4: {
      heightCm: finalH,
      canopyCm: finalC,
      branchCount: branches,
      leafCount: leaves,
      fruitCount: fruits,
      ripeness: fruits ? 0.95 : 0,
      hasStake: stake,
      label: labels[3],
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
  zucchini: stages(60, 120, { branches: 4, leaves: 14, fruits: 6 }),
  watermelon: stages(30, 200, { branches: 3, leaves: 16, fruits: 3 }),
  melon: stages(30, 180, { branches: 3, leaves: 14, fruits: 3 }),
  carrot: stages(30, 15, { branches: 1, leaves: 8, fruits: 1 }),
  leek: stages(60, 12, { branches: 1, leaves: 6 }),
  radish: stages(20, 12, { branches: 1, leaves: 6, fruits: 1 }),
  beet: stages(35, 22, { branches: 1, leaves: 7, fruits: 1 }),
  turnip: stages(35, 22, { branches: 1, leaves: 7, fruits: 1 }),
  potato: stages(60, 45, { branches: 3, leaves: 14, fruits: 4 }),
  celery: stages(50, 30, { branches: 1, leaves: 12 }),
  fennel: stages(60, 30, { branches: 1, leaves: 10, fruits: 1 }),
  chard: stages(45, 40, { branches: 0, leaves: 14 }),
  spinach: stages(25, 25, { branches: 0, leaves: 12 }),
  arugula: stages(20, 20, { branches: 0, leaves: 14 }),
  escarole: stages(30, 35, { branches: 0, leaves: 18 }),
  "corn-salad": stages(15, 18, { branches: 0, leaves: 12 }),
  endive: stages(30, 28, { branches: 0, leaves: 14 }),
  cabbage: stages(35, 45, { branches: 0, leaves: 18, fruits: 1 }),
  "red-cabbage": stages(35, 45, { branches: 0, leaves: 18, fruits: 1 }),
  broccoli: stages(60, 50, { branches: 2, leaves: 12, fruits: 1 }),
  romanesco: stages(55, 50, { branches: 2, leaves: 12, fruits: 1 }),
  "brussels-sprouts": stages(80, 40, { branches: 6, leaves: 14, fruits: 12 }),
  cauliflower: stages(55, 50, { branches: 2, leaves: 12, fruits: 1 }),
  artichoke: stages(120, 90, { branches: 5, leaves: 16, fruits: 3 }),
  asparagus: stages(100, 30, { branches: 6, leaves: 18 }),
  "fava-bean": stages(120, 35, {
    branches: 2,
    leaves: 14,
    fruits: 8,
    stake: true,
  }),
  pea: stages(100, 30, { branches: 2, leaves: 14, fruits: 8, stake: true }),
  "green-bean": stages(180, 30, {
    branches: 1,
    leaves: 28,
    fruits: 10,
    stake: true,
  }),
  "runner-bean": stages(220, 35, {
    branches: 1,
    leaves: 32,
    fruits: 12,
    stake: true,
  }),
  "red-bean": stages(180, 30, {
    branches: 1,
    leaves: 28,
    fruits: 10,
    stake: true,
  }),
  lupin: stages(80, 30, { branches: 4, leaves: 14, fruits: 3 }),
  basil: stages(45, 40, { branches: 4, leaves: 18 }),
  parsley: stages(35, 30, { branches: 3, leaves: 20 }),
  rosemary: stages(70, 55, { branches: 6, leaves: 30, fruits: 6 }),
  dill: stages(80, 40, { branches: 4, leaves: 16, fruits: 4 }),
  sage: stages(50, 50, { branches: 4, leaves: 16, fruits: 4 }),
  oregano: stages(40, 45, { branches: 4, leaves: 20, fruits: 6 }),
  "lemon-thyme": stages(25, 35, { branches: 5, leaves: 24 }),
  chives: stages(35, 25, { branches: 8, leaves: 8, fruits: 4 }),
  stevia: stages(60, 45, { branches: 4, leaves: 18 }),
  rue: stages(60, 50, { branches: 4, leaves: 16, fruits: 4 }),
  calendula: stages(50, 45, { branches: 3, leaves: 12, fruits: 8 }),
  nasturtium: stages(35, 70, { branches: 4, leaves: 18, fruits: 6 }),
  daisy: stages(45, 40, { branches: 3, leaves: 12, fruits: 10 }),
  rose: stages(120, 80, { branches: 5, leaves: 20, fruits: 6, stake: true }),
  altabaca: stages(70, 60, { branches: 4, leaves: 16, fruits: 8 }),
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
