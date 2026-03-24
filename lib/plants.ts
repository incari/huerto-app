export interface PlantTiming {
  growthWeeks: number; // Semanas hasta empezar a producir
  harvestWeeks: number; // Semanas que produce frutos
  totalWeeks: number; // Semanas totales hasta remover
}

export interface PlantVariety {
  id: string;
  name: string;
  spacingCm: number;
  timing: PlantTiming;
  notes?: string;
}

export interface Plant {
  id: string;
  name: string;
  emoji: string;
  spacingCm: number; // Espaciamiento por defecto
  color: string;
  category: "raices" | "hojas" | "frutos" | "legumbres" | "hierbas" | "flores";
  timing: PlantTiming; // Tiempos por defecto
  varieties: PlantVariety[];
}

export const defaultPlants: Plant[] = [
  // FRUTOS (Tomates, Pimientos, Berenjenas, Calabacines, Melones, Sandías, Calabazas, Pepinos)
  {
    id: "tomato",
    name: "Tomate",
    emoji: "🍅",
    spacingCm: 50, // 1 plant every 50cm (alternating sides)
    color: "#dc2626",
    category: "frutos",
    timing: { growthWeeks: 12, harvestWeeks: 12, totalWeeks: 27 }, // 12w growth + 12w harvest + 3w buffer
    varieties: [
      {
        id: "tomato-cherry",
        name: "Cherry",
        spacingCm: 50,
        timing: { growthWeeks: 10, harvestWeeks: 14, totalWeeks: 27 },
      },
      {
        id: "tomato-raf",
        name: "RAF",
        spacingCm: 50,
        timing: { growthWeeks: 14, harvestWeeks: 10, totalWeeks: 27 },
      },
      {
        id: "tomato-verano",
        name: "Verano",
        spacingCm: 50,
        timing: { growthWeeks: 11, harvestWeeks: 12, totalWeeks: 26 },
      },
      {
        id: "tomato-invierno",
        name: "Invierno",
        spacingCm: 50,
        timing: { growthWeeks: 14, harvestWeeks: 10, totalWeeks: 27 },
      },
    ],
  },
  {
    id: "pepper",
    name: "Pimiento",
    emoji: "🫑",
    spacingCm: 50, // 1 plant every 50cm (alternating sides)
    color: "#16a34a",
    category: "frutos",
    timing: { growthWeeks: 10, harvestWeeks: 12, totalWeeks: 25 }, // 10w growth + 12w harvest + 3w buffer
    varieties: [
      {
        id: "pepper-verde",
        name: "Verde",
        spacingCm: 50,
        timing: { growthWeeks: 10, harvestWeeks: 12, totalWeeks: 25 },
      },
      {
        id: "pepper-asar",
        name: "Asar",
        spacingCm: 50,
        timing: { growthWeeks: 12, harvestWeeks: 12, totalWeeks: 27 },
      },
    ],
  },
  {
    id: "eggplant",
    name: "Berenjena",
    emoji: "🍆",
    spacingCm: 50, // 1 plant every 50cm (alternating sides)
    color: "#7c3aed",
    category: "frutos",
    timing: { growthWeeks: 10, harvestWeeks: 14, totalWeeks: 27 }, // 10w growth + 14w harvest + 3w buffer
    varieties: [],
  },
  {
    id: "zucchini",
    name: "Calabacín",
    emoji: "🥒",
    spacingCm: 75, // 1 plant every 75cm (alternating sides)
    color: "#4ade80",
    category: "frutos",
    timing: { growthWeeks: 8, harvestWeeks: 10, totalWeeks: 20 }, // 8w growth + 10w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "pumpkin",
    name: "Calabaza",
    emoji: "🎃",
    spacingCm: 100, // 1 plant every 100cm (alternating sides)
    color: "#ea580c",
    category: "frutos",
    timing: { growthWeeks: 14, harvestWeeks: 6, totalWeeks: 22 }, // 14w growth + 6w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "watermelon",
    name: "Sandía",
    emoji: "🍉",
    spacingCm: 100, // 1 plant every 100cm (alternating sides)
    color: "#22c55e",
    category: "frutos",
    timing: { growthWeeks: 12, harvestWeeks: 4, totalWeeks: 18 }, // 12w growth + 4w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "melon",
    name: "Melón",
    emoji: "🍈",
    spacingCm: 100, // 1 plant every 100cm (alternating sides)
    color: "#fbbf24",
    category: "frutos",
    timing: { growthWeeks: 10, harvestWeeks: 4, totalWeeks: 16 }, // 10w growth + 4w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "cucumber",
    name: "Pepino",
    emoji: "🥒",
    spacingCm: 50, // 1 plant every 50cm (alternating sides)
    color: "#65a30d",
    category: "frutos",
    timing: { growthWeeks: 8, harvestWeeks: 8, totalWeeks: 18 }, // 8w growth + 8w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "strawberry",
    name: "Fresa",
    emoji: "🍓",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#ef4444",
    category: "frutos",
    timing: { growthWeeks: 8, harvestWeeks: 16, totalWeeks: 26 }, // 8w growth + 16w harvest + 2w buffer
    varieties: [],
  },

  // RAÍCES (Zanahorias, Ajos, Cebollas, Puerros, Rábanos, Remolachas, Nabos, Patatas, Apios, Hinojos)
  {
    id: "carrot",
    name: "Zanahoria",
    emoji: "🥕",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#f97316",
    category: "raices",
    timing: { growthWeeks: 12, harvestWeeks: 4, totalWeeks: 18 }, // 12w growth + 4w harvest + 2w buffer
    varieties: [
      {
        id: "carrot-naranja",
        name: "Naranja",
        spacingCm: 25,
        timing: { growthWeeks: 12, harvestWeeks: 4, totalWeeks: 18 },
      },
      {
        id: "carrot-morada",
        name: "Morada",
        spacingCm: 25,
        timing: { growthWeeks: 14, harvestWeeks: 4, totalWeeks: 20 },
      },
    ],
  },
  {
    id: "garlic",
    name: "Ajo",
    emoji: "🧄",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#f5f5f4",
    category: "raices",
    timing: { growthWeeks: 24, harvestWeeks: 4, totalWeeks: 30 }, // 24w growth + 4w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "onion",
    name: "Cebolla",
    emoji: "🧅",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#d97706",
    category: "raices",
    timing: { growthWeeks: 16, harvestWeeks: 4, totalWeeks: 22 }, // 16w growth + 4w harvest + 2w buffer
    varieties: [
      {
        id: "onion-blanca",
        name: "Blanca",
        spacingCm: 25,
        timing: { growthWeeks: 16, harvestWeeks: 4, totalWeeks: 22 },
      },
      {
        id: "onion-roja",
        name: "Roja",
        spacingCm: 25,
        timing: { growthWeeks: 18, harvestWeeks: 4, totalWeeks: 24 },
      },
    ],
  },
  {
    id: "leek",
    name: "Puerro",
    emoji: "🧅",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#84cc16",
    category: "raices",
    timing: { growthWeeks: 20, harvestWeeks: 8, totalWeeks: 30 }, // 20w growth + 8w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "radish",
    name: "Rabanito",
    emoji: "🌱",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#e11d48",
    category: "raices",
    timing: { growthWeeks: 4, harvestWeeks: 2, totalWeeks: 7 }, // 4w growth + 2w harvest + 1w buffer
    varieties: [],
  },
  {
    id: "beet",
    name: "Remolacha",
    emoji: "🫚",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#be123c",
    category: "raices",
    timing: { growthWeeks: 10, harvestWeeks: 4, totalWeeks: 16 }, // 10w growth + 4w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "turnip",
    name: "Nabo",
    emoji: "🫚",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#e5e5e5",
    category: "raices",
    timing: { growthWeeks: 8, harvestWeeks: 4, totalWeeks: 14 }, // 8w growth + 4w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "potato",
    name: "Patata",
    emoji: "🥔",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#a16207",
    category: "raices",
    timing: { growthWeeks: 14, harvestWeeks: 4, totalWeeks: 20 }, // 14w growth + 4w harvest + 2w buffer
    varieties: [
      {
        id: "potato-normal",
        name: "Normal",
        spacingCm: 25,
        timing: { growthWeeks: 14, harvestWeeks: 4, totalWeeks: 20 },
      },
      {
        id: "potato-morada",
        name: "Morada",
        spacingCm: 25,
        timing: { growthWeeks: 16, harvestWeeks: 4, totalWeeks: 22 },
      },
    ],
  },
  {
    id: "celery",
    name: "Apio",
    emoji: "🥬",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#84cc16",
    category: "raices",
    timing: { growthWeeks: 16, harvestWeeks: 8, totalWeeks: 26 }, // 16w growth + 8w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "fennel",
    name: "Hinojo",
    emoji: "🌿",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#a3e635",
    category: "raices",
    timing: { growthWeeks: 12, harvestWeeks: 4, totalWeeks: 18 }, // 12w growth + 4w harvest + 2w buffer
    varieties: [],
  },

  // HOJAS (Lechugas, Acelgas, Espinacas, Rúcula, Escarola, Canónigos, Endivia, Coles, Brócoli, Romanesco, Col de Bruselas, Coliflor, Lombarda)
  {
    id: "lettuce",
    name: "Lechuga",
    emoji: "🥬",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#84cc16",
    category: "hojas",
    timing: { growthWeeks: 8, harvestWeeks: 2, totalWeeks: 11 }, // 8w growth + 2w harvest + 1w buffer
    varieties: [],
  },
  {
    id: "chard",
    name: "Acelga",
    emoji: "🥬",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#22c55e",
    category: "hojas",
    timing: { growthWeeks: 10, harvestWeeks: 12, totalWeeks: 24 }, // 10w growth + 12w harvest + 2w buffer
    varieties: [
      {
        id: "chard-blanca",
        name: "Blanca",
        spacingCm: 25,
        timing: { growthWeeks: 10, harvestWeeks: 12, totalWeeks: 24 },
      },
      {
        id: "chard-roja",
        name: "Roja",
        spacingCm: 25,
        timing: { growthWeeks: 10, harvestWeeks: 12, totalWeeks: 24 },
      },
    ],
  },
  {
    id: "spinach",
    name: "Espinaca",
    emoji: "🥬",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#16a34a",
    category: "hojas",
    timing: { growthWeeks: 6, harvestWeeks: 4, totalWeeks: 11 }, // 6w growth + 4w harvest + 1w buffer
    varieties: [],
  },

  {
    id: "arugula",
    name: "Rúcula",
    emoji: "🥬",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#65a30d",
    category: "hojas",
    timing: { growthWeeks: 4, harvestWeeks: 6, totalWeeks: 11 }, // 4w growth + 6w harvest + 1w buffer
    varieties: [],
  },
  {
    id: "escarole",
    name: "Escarola",
    emoji: "🥬",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#84cc16",
    category: "hojas",
    timing: { growthWeeks: 10, harvestWeeks: 4, totalWeeks: 16 }, // 10w growth + 4w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "corn-salad",
    name: "Canónigos",
    emoji: "🥬",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#22c55e",
    category: "hojas",
    timing: { growthWeeks: 6, harvestWeeks: 4, totalWeeks: 11 }, // 6w growth + 4w harvest + 1w buffer
    varieties: [],
  },
  {
    id: "endive",
    name: "Endivia",
    emoji: "🥬",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#fef08a",
    category: "hojas",
    timing: { growthWeeks: 12, harvestWeeks: 4, totalWeeks: 18 }, // 12w growth + 4w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "cabbage",
    name: "Col",
    emoji: "🥬",
    spacingCm: 50, // 1 plant every 50cm (alternating sides)
    color: "#86efac",
    category: "hojas",
    timing: { growthWeeks: 14, harvestWeeks: 4, totalWeeks: 20 }, // 14w growth + 4w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "broccoli",
    name: "Brócoli",
    emoji: "🥦",
    spacingCm: 50, // 1 plant every 50cm (alternating sides)
    color: "#15803d",
    category: "hojas",
    timing: { growthWeeks: 14, harvestWeeks: 4, totalWeeks: 20 }, // 14w growth + 4w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "romanesco",
    name: "Romanesco",
    emoji: "🥦",
    spacingCm: 50, // 1 plant every 50cm (alternating sides)
    color: "#84cc16",
    category: "hojas",
    timing: { growthWeeks: 16, harvestWeeks: 4, totalWeeks: 22 }, // 16w growth + 4w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "brussels-sprouts",
    name: "Col de Bruselas",
    emoji: "🥬",
    spacingCm: 50, // 1 plant every 50cm (alternating sides)
    color: "#22c55e",
    category: "hojas",
    timing: { growthWeeks: 18, harvestWeeks: 8, totalWeeks: 28 }, // 18w growth + 8w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "cauliflower",
    name: "Coliflor",
    emoji: "🥦",
    spacingCm: 50, // 1 plant every 50cm (alternating sides)
    color: "#f5f5f4",
    category: "hojas",
    timing: { growthWeeks: 14, harvestWeeks: 4, totalWeeks: 20 }, // 14w growth + 4w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "red-cabbage",
    name: "Lombarda",
    emoji: "🥬",
    spacingCm: 50, // 1 plant every 50cm (alternating sides)
    color: "#7c3aed",
    category: "hojas",
    timing: { growthWeeks: 16, harvestWeeks: 4, totalWeeks: 22 }, // 16w growth + 4w harvest + 2w buffer
    varieties: [],
  },

  // LEGUMBRES (Habas, Guisantes, Habichuelas, Judiones, Judías Rojas, Altramuces)
  {
    id: "fava-bean",
    name: "Haba",
    emoji: "🫘",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#65a30d",
    category: "legumbres",
    timing: { growthWeeks: 16, harvestWeeks: 6, totalWeeks: 24 }, // 16w growth + 6w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "pea",
    name: "Guisante",
    emoji: "🫛",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#84cc16",
    category: "legumbres",
    timing: { growthWeeks: 10, harvestWeeks: 4, totalWeeks: 16 }, // 10w growth + 4w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "green-bean",
    name: "Habichuela",
    emoji: "🫘",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#22c55e",
    category: "legumbres",
    timing: { growthWeeks: 8, harvestWeeks: 8, totalWeeks: 18 }, // 8w growth + 8w harvest + 2w buffer
    varieties: [
      {
        id: "green-bean-mata-baja",
        name: "Mata Baja",
        spacingCm: 25,
        timing: { growthWeeks: 8, harvestWeeks: 8, totalWeeks: 18 },
      },
      {
        id: "green-bean-mata-alta",
        name: "Mata Alta",
        spacingCm: 25,
        timing: { growthWeeks: 10, harvestWeeks: 10, totalWeeks: 22 },
      },
    ],
  },
  {
    id: "runner-bean",
    name: "Judión",
    emoji: "🫘",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#16a34a",
    category: "legumbres",
    timing: { growthWeeks: 12, harvestWeeks: 8, totalWeeks: 22 }, // 12w growth + 8w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "red-bean",
    name: "Judía Roja",
    emoji: "🫘",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#dc2626",
    category: "legumbres",
    timing: { growthWeeks: 10, harvestWeeks: 6, totalWeeks: 18 }, // 10w growth + 6w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "lupin",
    name: "Altramuz",
    emoji: "🌱",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#eab308",
    category: "legumbres",
    timing: { growthWeeks: 14, harvestWeeks: 4, totalWeeks: 20 }, // 14w growth + 4w harvest + 2w buffer
    varieties: [],
  },

  // HIERBAS (Albahaca, Perejil, Romero, Eneldo, Salvia, Orégano, Tomillo Limón, Cebollino, Stevia, Ruda)
  // Middle zone only - 100cm spacing
  {
    id: "basil",
    name: "Albahaca",
    emoji: "🌿",
    spacingCm: 100, // Middle zone: 1 plant every 100cm
    color: "#22c55e",
    category: "hierbas",
    timing: { growthWeeks: 6, harvestWeeks: 12, totalWeeks: 20 }, // 6w growth + 12w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "parsley",
    name: "Perejil",
    emoji: "🌱",
    spacingCm: 100, // Middle zone: 1 plant every 100cm
    color: "#16a34a",
    category: "hierbas",
    timing: { growthWeeks: 8, harvestWeeks: 20, totalWeeks: 32 }, // 8w growth + 20w harvest + 4w buffer
    varieties: [],
  },
  {
    id: "rosemary",
    name: "Romero",
    emoji: "🌿",
    spacingCm: 100, // Middle zone: 1 plant every 100cm
    color: "#15803d",
    category: "hierbas",
    timing: { growthWeeks: 12, harvestWeeks: 52, totalWeeks: 72 }, // 12w growth + 52w harvest + 8w buffer (perennial)
    varieties: [],
  },
  {
    id: "dill",
    name: "Eneldo",
    emoji: "🌿",
    spacingCm: 100, // Middle zone: 1 plant every 100cm
    color: "#84cc16",
    category: "hierbas",
    timing: { growthWeeks: 8, harvestWeeks: 12, totalWeeks: 22 }, // 8w growth + 12w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "sage",
    name: "Salvia",
    emoji: "🌿",
    spacingCm: 100, // Middle zone: 1 plant every 100cm
    color: "#65a30d",
    category: "hierbas",
    timing: { growthWeeks: 10, harvestWeeks: 40, totalWeeks: 58 }, // 10w growth + 40w harvest + 8w buffer (perennial)
    varieties: [],
  },
  {
    id: "oregano",
    name: "Orégano",
    emoji: "🌿",
    spacingCm: 100, // Middle zone: 1 plant every 100cm
    color: "#22c55e",
    category: "hierbas",
    timing: { growthWeeks: 8, harvestWeeks: 40, totalWeeks: 56 }, // 8w growth + 40w harvest + 8w buffer (perennial)
    varieties: [],
  },
  {
    id: "lemon-thyme",
    name: "Tomillo Limón",
    emoji: "🌿",
    spacingCm: 100, // Middle zone: 1 plant every 100cm
    color: "#a3e635",
    category: "hierbas",
    timing: { growthWeeks: 10, harvestWeeks: 40, totalWeeks: 58 }, // 10w growth + 40w harvest + 8w buffer (perennial)
    varieties: [],
  },
  {
    id: "chives",
    name: "Cebollino",
    emoji: "🌱",
    spacingCm: 100, // Middle zone: 1 plant every 100cm
    color: "#84cc16",
    category: "hierbas",
    timing: { growthWeeks: 8, harvestWeeks: 30, totalWeeks: 44 }, // 8w growth + 30w harvest + 6w buffer (perennial)
    varieties: [],
  },
  {
    id: "stevia",
    name: "Stevia",
    emoji: "🌿",
    spacingCm: 100, // Middle zone: 1 plant every 100cm
    color: "#22c55e",
    category: "hierbas",
    timing: { growthWeeks: 12, harvestWeeks: 40, totalWeeks: 60 }, // 12w growth + 40w harvest + 8w buffer (perennial)
    varieties: [],
  },
  {
    id: "rue",
    name: "Ruda",
    emoji: "🌿",
    spacingCm: 100, // Middle zone: 1 plant every 100cm
    color: "#65a30d",
    category: "hierbas",
    timing: { growthWeeks: 10, harvestWeeks: 40, totalWeeks: 58 }, // 10w growth + 40w harvest + 8w buffer (perennial)
    varieties: [],
  },

  // FLORES (Caléndula, Capuchina, Margarita, Rosa, Altabaca)
  // Middle zone only - 100cm spacing
  {
    id: "calendula",
    name: "Caléndula",
    emoji: "🌼",
    spacingCm: 100, // Middle zone: 1 plant every 100cm
    color: "#f59e0b",
    category: "flores",
    timing: { growthWeeks: 8, harvestWeeks: 16, totalWeeks: 26 }, // 8w growth + 16w harvest + 2w buffer
    varieties: [],
  },
  {
    id: "nasturtium",
    name: "Capuchina",
    emoji: "🌺",
    spacingCm: 100, // Middle zone: 1 plant every 100cm
    color: "#ea580c",
    category: "flores",
    timing: { growthWeeks: 6, harvestWeeks: 20, totalWeeks: 30 }, // 6w growth + 20w harvest + 4w buffer
    varieties: [],
  },
  {
    id: "daisy",
    name: "Margarita",
    emoji: "🌼",
    spacingCm: 100, // Middle zone: 1 plant every 100cm
    color: "#fef3c7",
    category: "flores",
    timing: { growthWeeks: 10, harvestWeeks: 20, totalWeeks: 34 }, // 10w growth + 20w harvest + 4w buffer
    varieties: [],
  },
  {
    id: "rose",
    name: "Rosa",
    emoji: "🌹",
    spacingCm: 100, // Middle zone: 1 plant every 100cm
    color: "#f43f5e",
    category: "flores",
    timing: { growthWeeks: 16, harvestWeeks: 40, totalWeeks: 64 }, // 16w growth + 40w harvest + 8w buffer (perennial)
    varieties: [],
  },
  {
    id: "altabaca",
    name: "Altabaca",
    emoji: "🌸",
    spacingCm: 100, // Middle zone: 1 plant every 100cm
    color: "#c084fc",
    category: "flores",
    timing: { growthWeeks: 8, harvestWeeks: 16, totalWeeks: 26 }, // 8w growth + 16w harvest + 2w buffer
    varieties: [],
  },

  // OTROS (Alcachofa, Espárrago)
  {
    id: "artichoke",
    name: "Alcachofa",
    emoji: "🥬",
    spacingCm: 75, // 1 plant every 75cm (alternating sides)
    color: "#65a30d",
    category: "hojas",
    timing: { growthWeeks: 24, harvestWeeks: 12, totalWeeks: 40 }, // 24w growth + 12w harvest + 4w buffer
    varieties: [],
  },
  {
    id: "asparagus",
    name: "Espárrago",
    emoji: "🌱",
    spacingCm: 25, // 1 plant every 25cm (both sides)
    color: "#84cc16",
    category: "hojas",
    timing: { growthWeeks: 52, harvestWeeks: 8, totalWeeks: 68 }, // 52w growth + 8w harvest + 8w buffer (perennial)
    varieties: [],
  },
];

export interface PlantedItem {
  id: string;
  plantId: string;
  varietyId?: string; // ID de la variedad (opcional)
  lineIndex: number;
  positionCm: number;
  side: "top" | "bottom";
  plantedDate: string; // Fecha ISO de plantación
}

export interface MiddlePlantItem {
  id: string;
  plantId: string;
  varietyId?: string;
  positionCm: number;
  plantedDate: string;
}

export const DRIPPER_SPACING_CM = 25;

export interface GardenLine {
  id: string;
  lengthCm: number;
  plants: PlantedItem[];
  groupId?: string; // ID del grupo al que pertenece la línea
}

export interface LineGroup {
  id: string;
  name: string;
  color: string;
  middlePlants?: MiddlePlantItem[]; // Flores/hierbas entre líneas 2-3 del bancal
}

export interface GardenConfig {
  lineSeparationCm: number;
  defaultLineLengthCm: number;
  method: "parades-crestall" | "traditional" | "intensive";
  showLabels: boolean; // Mostrar etiquetas de plantas
  currentPlantingDate: string; // Fecha ISO para nuevas plantas
  // Parades en Crestall specific config
  groupConfig?: {
    linesPerGroup: number; // 4 líneas por bancal (2 subgrupos de 2)
    subgroupSize: number; // 2 líneas por subgrupo
    subgroupSpacingCm: number; // 40cm entre líneas 1-2 y 3-4
    middleSpacingCm: number; // 50cm entre líneas 2-3 (para flores/hierbas)
    interGroupSpacingCm: number; // 60cm entre bancales
    paddingCm: number; // 20cm padding arriba/abajo
    allowMiddlePlants: boolean; // Permitir flores/hierbas entre líneas 2-3
    middlePlantSpacingCm: number; // 100cm entre flores/hierbas
  };
}

export const gardenMethods: Record<string, GardenConfig> = {
  "parades-crestall": {
    lineSeparationCm: 40,
    defaultLineLengthCm: 400,
    method: "parades-crestall",
    showLabels: true,
    currentPlantingDate: new Date().toISOString(),
    groupConfig: {
      linesPerGroup: 4,
      subgroupSize: 2,
      subgroupSpacingCm: 40,
      middleSpacingCm: 50,
      interGroupSpacingCm: 60,
      paddingCm: 20,
      allowMiddlePlants: true,
      middlePlantSpacingCm: 100,
    },
  },
  traditional: {
    lineSeparationCm: 50,
    defaultLineLengthCm: 400,
    method: "traditional",
    showLabels: true,
    currentPlantingDate: new Date().toISOString(),
  },
  intensive: {
    lineSeparationCm: 20,
    defaultLineLengthCm: 200,
    method: "intensive",
    showLabels: true,
    currentPlantingDate: new Date().toISOString(),
  },
};

// Función para obtener el timing de una planta o variedad
export function getPlantTiming(plant: Plant, varietyId?: string): PlantTiming {
  if (varietyId) {
    const variety = plant.varieties.find((v) => v.id === varietyId);
    if (variety) return variety.timing;
  }
  return plant.timing;
}

// Función para obtener el spacing de una planta o variedad
export function getPlantSpacing(plant: Plant, varietyId?: string): number {
  if (varietyId) {
    const variety = plant.varieties.find((v) => v.id === varietyId);
    if (variety) return variety.spacingCm;
  }
  return plant.spacingCm;
}

// Función para calcular las fechas importantes de una planta
export function calculatePlantDates(plantedDate: string, timing: PlantTiming) {
  const planted = new Date(plantedDate);
  const harvestStart = new Date(planted);
  harvestStart.setDate(harvestStart.getDate() + timing.growthWeeks * 7);

  const harvestEnd = new Date(harvestStart);
  harvestEnd.setDate(harvestEnd.getDate() + timing.harvestWeeks * 7);

  const removeDate = new Date(planted);
  removeDate.setDate(removeDate.getDate() + timing.totalWeeks * 7);

  return { planted, harvestStart, harvestEnd, removeDate };
}
