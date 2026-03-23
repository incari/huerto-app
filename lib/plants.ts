export interface PlantTiming {
  growthWeeks: number     // Semanas hasta empezar a producir
  harvestWeeks: number    // Semanas que produce frutos
  totalWeeks: number      // Semanas totales hasta remover
}

export interface PlantVariety {
  id: string
  name: string
  spacingCm: number
  timing: PlantTiming
  notes?: string
}

export interface Plant {
  id: string
  name: string
  emoji: string
  spacingCm: number       // Espaciamiento por defecto
  color: string
  category: 'frutas' | 'verduras' | 'hierbas' | 'legumbres'
  timing: PlantTiming     // Tiempos por defecto
  varieties: PlantVariety[]
}

export const defaultPlants: Plant[] = [
  // Frutas
  { 
    id: 'strawberry', 
    name: 'Fresa', 
    emoji: '🍓', 
    spacingCm: 25, 
    color: '#ef4444', 
    category: 'frutas',
    timing: { growthWeeks: 8, harvestWeeks: 16, totalWeeks: 40 },
    varieties: [
      { id: 'strawberry-san-andreas', name: 'San Andreas', spacingCm: 25, timing: { growthWeeks: 6, harvestWeeks: 20, totalWeeks: 40 } },
      { id: 'strawberry-camarosa', name: 'Camarosa', spacingCm: 30, timing: { growthWeeks: 8, harvestWeeks: 16, totalWeeks: 36 } },
    ]
  },
  { 
    id: 'watermelon', 
    name: 'Sandía', 
    emoji: '🍉', 
    spacingCm: 100, 
    color: '#22c55e', 
    category: 'frutas',
    timing: { growthWeeks: 12, harvestWeeks: 4, totalWeeks: 18 },
    varieties: [
      { id: 'watermelon-crimson', name: 'Crimson Sweet', spacingCm: 100, timing: { growthWeeks: 12, harvestWeeks: 4, totalWeeks: 18 } },
      { id: 'watermelon-sugar-baby', name: 'Sugar Baby', spacingCm: 80, timing: { growthWeeks: 10, harvestWeeks: 3, totalWeeks: 15 } },
    ]
  },
  { 
    id: 'melon', 
    name: 'Melón', 
    emoji: '🍈', 
    spacingCm: 90, 
    color: '#fbbf24', 
    category: 'frutas',
    timing: { growthWeeks: 10, harvestWeeks: 4, totalWeeks: 16 },
    varieties: [
      { id: 'melon-piel-sapo', name: 'Piel de Sapo', spacingCm: 90, timing: { growthWeeks: 12, harvestWeeks: 4, totalWeeks: 18 } },
      { id: 'melon-cantalupo', name: 'Cantalupo', spacingCm: 80, timing: { growthWeeks: 10, harvestWeeks: 3, totalWeeks: 15 } },
    ]
  },
  
  // Verduras
  { 
    id: 'tomato', 
    name: 'Tomate', 
    emoji: '🍅', 
    spacingCm: 50, 
    color: '#dc2626', 
    category: 'verduras',
    timing: { growthWeeks: 12, harvestWeeks: 12, totalWeeks: 32 },
    varieties: [
      { id: 'tomato-cherry', name: 'Cherry', spacingCm: 40, timing: { growthWeeks: 10, harvestWeeks: 14, totalWeeks: 28 } },
      { id: 'tomato-raf', name: 'RAF', spacingCm: 60, timing: { growthWeeks: 14, harvestWeeks: 10, totalWeeks: 32 } },
      { id: 'tomato-roma', name: 'Roma', spacingCm: 50, timing: { growthWeeks: 11, harvestWeeks: 12, totalWeeks: 30 } },
      { id: 'tomato-corazon-buey', name: 'Corazón de Buey', spacingCm: 60, timing: { growthWeeks: 14, harvestWeeks: 10, totalWeeks: 32 } },
    ]
  },
  { 
    id: 'pepper', 
    name: 'Pimiento', 
    emoji: '🫑', 
    spacingCm: 40, 
    color: '#16a34a', 
    category: 'verduras',
    timing: { growthWeeks: 10, harvestWeeks: 12, totalWeeks: 28 },
    varieties: [
      { id: 'pepper-california', name: 'California', spacingCm: 45, timing: { growthWeeks: 12, harvestWeeks: 12, totalWeeks: 30 } },
      { id: 'pepper-italiano', name: 'Italiano', spacingCm: 40, timing: { growthWeeks: 10, harvestWeeks: 14, totalWeeks: 28 } },
      { id: 'pepper-padron', name: 'Padrón', spacingCm: 35, timing: { growthWeeks: 8, harvestWeeks: 16, totalWeeks: 26 } },
    ]
  },
  { 
    id: 'chili', 
    name: 'Chile', 
    emoji: '🌶️', 
    spacingCm: 35, 
    color: '#b91c1c', 
    category: 'verduras',
    timing: { growthWeeks: 12, harvestWeeks: 16, totalWeeks: 32 },
    varieties: [
      { id: 'chili-jalapeno', name: 'Jalapeño', spacingCm: 35, timing: { growthWeeks: 12, harvestWeeks: 16, totalWeeks: 32 } },
      { id: 'chili-habanero', name: 'Habanero', spacingCm: 40, timing: { growthWeeks: 14, harvestWeeks: 14, totalWeeks: 34 } },
      { id: 'chili-cayenne', name: 'Cayena', spacingCm: 30, timing: { growthWeeks: 10, harvestWeeks: 18, totalWeeks: 30 } },
    ]
  },
  { 
    id: 'eggplant', 
    name: 'Berenjena', 
    emoji: '🍆', 
    spacingCm: 60, 
    color: '#7c3aed', 
    category: 'verduras',
    timing: { growthWeeks: 10, harvestWeeks: 14, totalWeeks: 28 },
    varieties: [
      { id: 'eggplant-black-beauty', name: 'Black Beauty', spacingCm: 60, timing: { growthWeeks: 10, harvestWeeks: 14, totalWeeks: 28 } },
      { id: 'eggplant-listada', name: 'Listada de Gandía', spacingCm: 55, timing: { growthWeeks: 12, harvestWeeks: 12, totalWeeks: 28 } },
    ]
  },
  { 
    id: 'carrot', 
    name: 'Zanahoria', 
    emoji: '🥕', 
    spacingCm: 8, 
    color: '#f97316', 
    category: 'verduras',
    timing: { growthWeeks: 12, harvestWeeks: 4, totalWeeks: 16 },
    varieties: [
      { id: 'carrot-nantes', name: 'Nantes', spacingCm: 8, timing: { growthWeeks: 10, harvestWeeks: 4, totalWeeks: 14 } },
      { id: 'carrot-chantenay', name: 'Chantenay', spacingCm: 10, timing: { growthWeeks: 12, harvestWeeks: 4, totalWeeks: 16 } },
    ]
  },
  { 
    id: 'corn', 
    name: 'Maíz', 
    emoji: '🌽', 
    spacingCm: 30, 
    color: '#eab308', 
    category: 'verduras',
    timing: { growthWeeks: 12, harvestWeeks: 2, totalWeeks: 16 },
    varieties: [
      { id: 'corn-dulce', name: 'Dulce', spacingCm: 30, timing: { growthWeeks: 12, harvestWeeks: 2, totalWeeks: 16 } },
      { id: 'corn-palomitas', name: 'Palomitas', spacingCm: 25, timing: { growthWeeks: 14, harvestWeeks: 2, totalWeeks: 18 } },
    ]
  },
  { 
    id: 'lettuce', 
    name: 'Lechuga', 
    emoji: '🥬', 
    spacingCm: 25, 
    color: '#84cc16', 
    category: 'verduras',
    timing: { growthWeeks: 8, harvestWeeks: 2, totalWeeks: 10 },
    varieties: [
      { id: 'lettuce-romana', name: 'Romana', spacingCm: 25, timing: { growthWeeks: 8, harvestWeeks: 2, totalWeeks: 10 } },
      { id: 'lettuce-iceberg', name: 'Iceberg', spacingCm: 30, timing: { growthWeeks: 10, harvestWeeks: 2, totalWeeks: 12 } },
      { id: 'lettuce-batavia', name: 'Batavia', spacingCm: 25, timing: { growthWeeks: 7, harvestWeeks: 2, totalWeeks: 9 } },
    ]
  },
  { 
    id: 'broccoli', 
    name: 'Brócoli', 
    emoji: '🥦', 
    spacingCm: 45, 
    color: '#15803d', 
    category: 'verduras',
    timing: { growthWeeks: 14, harvestWeeks: 4, totalWeeks: 20 },
    varieties: []
  },
  { 
    id: 'cucumber', 
    name: 'Pepino', 
    emoji: '🥒', 
    spacingCm: 40, 
    color: '#65a30d', 
    category: 'verduras',
    timing: { growthWeeks: 8, harvestWeeks: 8, totalWeeks: 18 },
    varieties: [
      { id: 'cucumber-español', name: 'Español', spacingCm: 40, timing: { growthWeeks: 8, harvestWeeks: 8, totalWeeks: 18 } },
      { id: 'cucumber-pepinillo', name: 'Pepinillo', spacingCm: 30, timing: { growthWeeks: 6, harvestWeeks: 6, totalWeeks: 14 } },
    ]
  },
  { 
    id: 'onion', 
    name: 'Cebolla', 
    emoji: '🧅', 
    spacingCm: 10, 
    color: '#d97706', 
    category: 'verduras',
    timing: { growthWeeks: 16, harvestWeeks: 4, totalWeeks: 20 },
    varieties: [
      { id: 'onion-blanca', name: 'Blanca', spacingCm: 10, timing: { growthWeeks: 16, harvestWeeks: 4, totalWeeks: 20 } },
      { id: 'onion-morada', name: 'Morada', spacingCm: 12, timing: { growthWeeks: 18, harvestWeeks: 4, totalWeeks: 22 } },
    ]
  },
  { 
    id: 'garlic', 
    name: 'Ajo', 
    emoji: '🧄', 
    spacingCm: 10, 
    color: '#f5f5f4', 
    category: 'verduras',
    timing: { growthWeeks: 24, harvestWeeks: 4, totalWeeks: 28 },
    varieties: [
      { id: 'garlic-blanco', name: 'Blanco', spacingCm: 10, timing: { growthWeeks: 24, harvestWeeks: 4, totalWeeks: 28 } },
      { id: 'garlic-morado', name: 'Morado', spacingCm: 12, timing: { growthWeeks: 26, harvestWeeks: 4, totalWeeks: 30 } },
    ]
  },
  { 
    id: 'potato', 
    name: 'Patata', 
    emoji: '🥔', 
    spacingCm: 30, 
    color: '#a16207', 
    category: 'verduras',
    timing: { growthWeeks: 14, harvestWeeks: 4, totalWeeks: 18 },
    varieties: [
      { id: 'potato-kennebec', name: 'Kennebec', spacingCm: 30, timing: { growthWeeks: 14, harvestWeeks: 4, totalWeeks: 18 } },
      { id: 'potato-red-pontiac', name: 'Red Pontiac', spacingCm: 30, timing: { growthWeeks: 12, harvestWeeks: 4, totalWeeks: 16 } },
    ]
  },
  { 
    id: 'radish', 
    name: 'Rábano', 
    emoji: '🫛', 
    spacingCm: 5, 
    color: '#e11d48', 
    category: 'verduras',
    timing: { growthWeeks: 4, harvestWeeks: 2, totalWeeks: 6 },
    varieties: []
  },
  { 
    id: 'cabbage', 
    name: 'Col', 
    emoji: '🥗', 
    spacingCm: 45, 
    color: '#86efac', 
    category: 'verduras',
    timing: { growthWeeks: 14, harvestWeeks: 4, totalWeeks: 20 },
    varieties: []
  },
  { 
    id: 'pumpkin', 
    name: 'Calabaza', 
    emoji: '🎃', 
    spacingCm: 100, 
    color: '#ea580c', 
    category: 'verduras',
    timing: { growthWeeks: 14, harvestWeeks: 6, totalWeeks: 22 },
    varieties: []
  },
  { 
    id: 'zucchini', 
    name: 'Calabacín', 
    emoji: '🥒', 
    spacingCm: 80, 
    color: '#4ade80', 
    category: 'verduras',
    timing: { growthWeeks: 8, harvestWeeks: 10, totalWeeks: 20 },
    varieties: []
  },
  
  // Hierbas
  { 
    id: 'basil', 
    name: 'Albahaca', 
    emoji: '🌿', 
    spacingCm: 20, 
    color: '#22c55e', 
    category: 'hierbas',
    timing: { growthWeeks: 6, harvestWeeks: 12, totalWeeks: 20 },
    varieties: [
      { id: 'basil-genovesa', name: 'Genovesa', spacingCm: 20, timing: { growthWeeks: 6, harvestWeeks: 12, totalWeeks: 20 } },
      { id: 'basil-morada', name: 'Morada', spacingCm: 25, timing: { growthWeeks: 8, harvestWeeks: 10, totalWeeks: 20 } },
    ]
  },
  { 
    id: 'parsley', 
    name: 'Perejil', 
    emoji: '🌱', 
    spacingCm: 15, 
    color: '#16a34a', 
    category: 'hierbas',
    timing: { growthWeeks: 8, harvestWeeks: 20, totalWeeks: 30 },
    varieties: []
  },
  { 
    id: 'mint', 
    name: 'Menta', 
    emoji: '🍃', 
    spacingCm: 30, 
    color: '#10b981', 
    category: 'hierbas',
    timing: { growthWeeks: 6, harvestWeeks: 30, totalWeeks: 52 },
    varieties: []
  },
  
  // Legumbres
  { 
    id: 'bean', 
    name: 'Judía', 
    emoji: '🫘', 
    spacingCm: 15, 
    color: '#92400e', 
    category: 'legumbres',
    timing: { growthWeeks: 8, harvestWeeks: 8, totalWeeks: 18 },
    varieties: [
      { id: 'bean-verde', name: 'Verde', spacingCm: 15, timing: { growthWeeks: 8, harvestWeeks: 8, totalWeeks: 18 } },
      { id: 'bean-enrame', name: 'Enrame', spacingCm: 20, timing: { growthWeeks: 10, harvestWeeks: 10, totalWeeks: 22 } },
    ]
  },
  { 
    id: 'pea', 
    name: 'Guisante', 
    emoji: '🫛', 
    spacingCm: 8, 
    color: '#65a30d', 
    category: 'legumbres',
    timing: { growthWeeks: 10, harvestWeeks: 4, totalWeeks: 16 },
    varieties: []
  },
]

export interface PlantedItem {
  id: string
  plantId: string
  varietyId?: string       // ID de la variedad (opcional)
  lineIndex: number
  positionCm: number
  side: 'top' | 'bottom'
  plantedDate: string      // Fecha ISO de plantación
}

export const DRIPPER_SPACING_CM = 25

export interface GardenLine {
  id: string
  lengthCm: number
  plants: PlantedItem[]
  groupId?: string  // ID del grupo al que pertenece la línea
}

export interface LineGroup {
  id: string
  name: string
  color: string
}

export interface GardenConfig {
  lineSeparationCm: number
  defaultLineLengthCm: number
  method: 'parades-crestall' | 'traditional' | 'intensive'
  // Parades en Crestall specific config
  groupConfig?: {
    linesPerGroup: number       // 4 líneas por grupo
    intraGroupSpacingCm: number // 40cm entre líneas dentro del grupo
    interGroupSpacingCm: number // 60cm entre grupos
    paddingCm: number           // 20cm padding arriba/abajo
  }
}

export const gardenMethods: Record<string, GardenConfig> = {
  'parades-crestall': {
    lineSeparationCm: 40,
    defaultLineLengthCm: 300,
    method: 'parades-crestall',
    groupConfig: {
      linesPerGroup: 4,
      intraGroupSpacingCm: 40,
      interGroupSpacingCm: 60,
      paddingCm: 20
    }
  },
  'traditional': {
    lineSeparationCm: 50,
    defaultLineLengthCm: 400,
    method: 'traditional'
  },
  'intensive': {
    lineSeparationCm: 20,
    defaultLineLengthCm: 200,
    method: 'intensive'
  }
}

// Función para obtener el timing de una planta o variedad
export function getPlantTiming(plant: Plant, varietyId?: string): PlantTiming {
  if (varietyId) {
    const variety = plant.varieties.find(v => v.id === varietyId)
    if (variety) return variety.timing
  }
  return plant.timing
}

// Función para obtener el spacing de una planta o variedad
export function getPlantSpacing(plant: Plant, varietyId?: string): number {
  if (varietyId) {
    const variety = plant.varieties.find(v => v.id === varietyId)
    if (variety) return variety.spacingCm
  }
  return plant.spacingCm
}

// Función para calcular las fechas importantes de una planta
export function calculatePlantDates(plantedDate: string, timing: PlantTiming) {
  const planted = new Date(plantedDate)
  const harvestStart = new Date(planted)
  harvestStart.setDate(harvestStart.getDate() + timing.growthWeeks * 7)
  
  const harvestEnd = new Date(harvestStart)
  harvestEnd.setDate(harvestEnd.getDate() + timing.harvestWeeks * 7)
  
  const removeDate = new Date(planted)
  removeDate.setDate(removeDate.getDate() + timing.totalWeeks * 7)
  
  return { planted, harvestStart, harvestEnd, removeDate }
}
