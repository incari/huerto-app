"use client"

import { useState } from "react"
import { Plant, PlantTiming, PlantVariety } from "@/lib/plants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Plus, Pencil, Trash2, Leaf, Clock } from "lucide-react"

interface PlantManagerProps {
  plants: Plant[]
  onPlantsChange: (plants: Plant[]) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EMOJI_OPTIONS = ['🍅', '🥕', '🥬', '🌶️', '🍆', '🥒', '🧅', '🧄', '🥔', '🌽', '🥦', '🍓', '🍉', '🍈', '🫑', '🎃', '🌿', '🌱', '🍃', '🫘', '🫛', '🥗', '🍀', '🌻']

const CATEGORIES: { id: Plant['category'], label: string }[] = [
  { id: 'verduras', label: 'Verduras' },
  { id: 'frutas', label: 'Frutas' },
  { id: 'hierbas', label: 'Hierbas' },
  { id: 'legumbres', label: 'Legumbres' },
]

export function PlantManager({ plants, onPlantsChange, open, onOpenChange }: PlantManagerProps) {
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editingVariety, setEditingVariety] = useState<{ plantId: string, variety: PlantVariety | null } | null>(null)

  // Form state for plant
  const [formData, setFormData] = useState({
    name: '',
    emoji: '🍅',
    spacingCm: 30,
    color: '#22c55e',
    category: 'verduras' as Plant['category'],
    growthWeeks: 10,
    harvestWeeks: 8,
    totalWeeks: 20,
  })

  // Form state for variety
  const [varietyFormData, setVarietyFormData] = useState({
    name: '',
    spacingCm: 30,
    growthWeeks: 10,
    harvestWeeks: 8,
    totalWeeks: 20,
    notes: '',
  })

  const resetForm = () => {
    setFormData({
      name: '',
      emoji: '🍅',
      spacingCm: 30,
      color: '#22c55e',
      category: 'verduras',
      growthWeeks: 10,
      harvestWeeks: 8,
      totalWeeks: 20,
    })
  }

  const resetVarietyForm = () => {
    setVarietyFormData({
      name: '',
      spacingCm: 30,
      growthWeeks: 10,
      harvestWeeks: 8,
      totalWeeks: 20,
      notes: '',
    })
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreating(true)
    setEditingPlant({
      id: '',
      name: '',
      emoji: '🍅',
      spacingCm: 30,
      color: '#22c55e',
      category: 'verduras',
      timing: { growthWeeks: 10, harvestWeeks: 8, totalWeeks: 20 },
      varieties: [],
    })
  }

  const openEditDialog = (plant: Plant) => {
    setFormData({
      name: plant.name,
      emoji: plant.emoji,
      spacingCm: plant.spacingCm,
      color: plant.color,
      category: plant.category,
      growthWeeks: plant.timing.growthWeeks,
      harvestWeeks: plant.timing.harvestWeeks,
      totalWeeks: plant.timing.totalWeeks,
    })
    setIsCreating(false)
    setEditingPlant(plant)
  }

  const savePlant = () => {
    if (!formData.name.trim()) return

    const timing: PlantTiming = {
      growthWeeks: formData.growthWeeks,
      harvestWeeks: formData.harvestWeeks,
      totalWeeks: formData.totalWeeks,
    }

    if (isCreating) {
      const newPlant: Plant = {
        id: `custom-${Date.now()}`,
        name: formData.name,
        emoji: formData.emoji,
        spacingCm: formData.spacingCm,
        color: formData.color,
        category: formData.category,
        timing,
        varieties: [],
      }
      onPlantsChange([...plants, newPlant])
    } else if (editingPlant) {
      const updatedPlants = plants.map(p => 
        p.id === editingPlant.id 
          ? { ...p, ...formData, timing }
          : p
      )
      onPlantsChange(updatedPlants)
    }
    
    setEditingPlant(null)
  }

  const deletePlant = (plantId: string) => {
    onPlantsChange(plants.filter(p => p.id !== plantId))
  }

  const openVarietyDialog = (plantId: string, variety: PlantVariety | null = null) => {
    if (variety) {
      setVarietyFormData({
        name: variety.name,
        spacingCm: variety.spacingCm,
        growthWeeks: variety.timing.growthWeeks,
        harvestWeeks: variety.timing.harvestWeeks,
        totalWeeks: variety.timing.totalWeeks,
        notes: variety.notes || '',
      })
    } else {
      const plant = plants.find(p => p.id === plantId)
      if (plant) {
        setVarietyFormData({
          name: '',
          spacingCm: plant.spacingCm,
          growthWeeks: plant.timing.growthWeeks,
          harvestWeeks: plant.timing.harvestWeeks,
          totalWeeks: plant.timing.totalWeeks,
          notes: '',
        })
      }
    }
    setEditingVariety({ plantId, variety })
  }

  const saveVariety = () => {
    if (!varietyFormData.name.trim() || !editingVariety) return

    const { plantId, variety } = editingVariety
    const timing: PlantTiming = {
      growthWeeks: varietyFormData.growthWeeks,
      harvestWeeks: varietyFormData.harvestWeeks,
      totalWeeks: varietyFormData.totalWeeks,
    }

    const updatedPlants = plants.map(p => {
      if (p.id !== plantId) return p

      let newVarieties: PlantVariety[]
      if (variety) {
        // Editing existing variety
        newVarieties = p.varieties.map(v =>
          v.id === variety.id
            ? { ...v, name: varietyFormData.name, spacingCm: varietyFormData.spacingCm, timing, notes: varietyFormData.notes || undefined }
            : v
        )
      } else {
        // Creating new variety
        const newVariety: PlantVariety = {
          id: `${plantId}-${Date.now()}`,
          name: varietyFormData.name,
          spacingCm: varietyFormData.spacingCm,
          timing,
          notes: varietyFormData.notes || undefined,
        }
        newVarieties = [...p.varieties, newVariety]
      }

      return { ...p, varieties: newVarieties }
    })

    onPlantsChange(updatedPlants)
    setEditingVariety(null)
  }

  const deleteVariety = (plantId: string, varietyId: string) => {
    const updatedPlants = plants.map(p => {
      if (p.id !== plantId) return p
      return { ...p, varieties: p.varieties.filter(v => v.id !== varietyId) }
    })
    onPlantsChange(updatedPlants)
  }

  const groupedPlants = CATEGORIES.map(cat => ({
    ...cat,
    plants: plants.filter(p => p.category === cat.id)
  }))

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              Gestionar Plantas
            </DialogTitle>
            <DialogDescription>
              Añade, edita o elimina plantas y sus variedades. Configura el espaciamiento y tiempos de cultivo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between py-2">
            <p className="text-sm text-muted-foreground">{plants.length} plantas en total</p>
            <Button onClick={openCreateDialog} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Nueva Planta
            </Button>
          </div>

          <ScrollArea className="flex-1 min-h-0 pr-4">
            <Accordion type="multiple" className="w-full">
              {groupedPlants.map(group => (
                <AccordionItem key={group.id} value={group.id}>
                  <AccordionTrigger className="text-sm font-medium">
                    {group.label} ({group.plants.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {group.plants.map(plant => (
                        <div key={plant.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{plant.emoji}</span>
                              <div>
                                <p className="font-medium text-sm">{plant.name}</p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span>{plant.spacingCm} cm</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {plant.timing.totalWeeks} sem
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(plant)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deletePlant(plant.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Varieties */}
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium text-muted-foreground">Variedades ({plant.varieties.length})</p>
                              <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => openVarietyDialog(plant.id)}>
                                <Plus className="h-3 w-3 mr-1" />
                                Variedad
                              </Button>
                            </div>
                            {plant.varieties.length > 0 ? (
                              <div className="space-y-1">
                                {plant.varieties.map(variety => (
                                  <div key={variety.id} className="flex items-center justify-between text-sm bg-muted/50 rounded px-2 py-1">
                                    <div>
                                      <span className="font-medium">{variety.name}</span>
                                      <span className="text-muted-foreground text-xs ml-2">
                                        {variety.spacingCm}cm · {variety.timing.totalWeeks} sem
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openVarietyDialog(plant.id, variety)}>
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteVariety(plant.id, variety.id)}>
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">Sin variedades</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {group.plants.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No hay plantas en esta categoría</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Plant Dialog */}
      <Dialog open={editingPlant !== null} onOpenChange={(open) => !open && setEditingPlant(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Nueva Planta' : 'Editar Planta'}</DialogTitle>
            <DialogDescription>
              {isCreating ? 'Configura los datos de la nueva planta' : 'Modifica los datos de la planta'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="timing">Tiempos</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Tomate"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Emoji</Label>
                  <Select value={formData.emoji} onValueChange={(v) => setFormData({ ...formData, emoji: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="grid grid-cols-6 gap-1">
                        {EMOJI_OPTIONS.map(e => (
                          <SelectItem key={e} value={e} className="p-2 cursor-pointer">
                            <span className="text-xl">{e}</span>
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={formData.category} onValueChange={(v: Plant['category']) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="spacing">Espaciamiento (cm)</Label>
                  <Input
                    id="spacing"
                    type="number"
                    min={5}
                    max={200}
                    value={formData.spacingCm}
                    onChange={(e) => setFormData({ ...formData, spacingCm: parseInt(e.target.value) || 30 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-10 p-1"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timing" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="growthWeeks">Semanas de crecimiento</Label>
                <Input
                  id="growthWeeks"
                  type="number"
                  min={1}
                  max={52}
                  value={formData.growthWeeks}
                  onChange={(e) => setFormData({ ...formData, growthWeeks: parseInt(e.target.value) || 10 })}
                />
                <p className="text-xs text-muted-foreground">Tiempo desde siembra hasta primera cosecha</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="harvestWeeks">Semanas de cosecha</Label>
                <Input
                  id="harvestWeeks"
                  type="number"
                  min={1}
                  max={52}
                  value={formData.harvestWeeks}
                  onChange={(e) => setFormData({ ...formData, harvestWeeks: parseInt(e.target.value) || 8 })}
                />
                <p className="text-xs text-muted-foreground">Tiempo que la planta produce frutos</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalWeeks">Semanas totales</Label>
                <Input
                  id="totalWeeks"
                  type="number"
                  min={1}
                  max={104}
                  value={formData.totalWeeks}
                  onChange={(e) => setFormData({ ...formData, totalWeeks: parseInt(e.target.value) || 20 })}
                />
                <p className="text-xs text-muted-foreground">Tiempo total hasta retirar la planta</p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlant(null)}>Cancelar</Button>
            <Button onClick={savePlant}>{isCreating ? 'Crear' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Variety Dialog */}
      <Dialog open={editingVariety !== null} onOpenChange={(open) => !open && setEditingVariety(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingVariety?.variety ? 'Editar Variedad' : 'Nueva Variedad'}</DialogTitle>
            <DialogDescription>
              {editingVariety?.variety ? 'Modifica los datos de la variedad' : 'Configura los datos de la nueva variedad'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="varietyName">Nombre de la variedad</Label>
              <Input
                id="varietyName"
                value={varietyFormData.name}
                onChange={(e) => setVarietyFormData({ ...varietyFormData, name: e.target.value })}
                placeholder="Ej: Cherry, Roma, RAF..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="varietySpacing">Espaciamiento (cm)</Label>
              <Input
                id="varietySpacing"
                type="number"
                min={5}
                max={200}
                value={varietyFormData.spacingCm}
                onChange={(e) => setVarietyFormData({ ...varietyFormData, spacingCm: parseInt(e.target.value) || 30 })}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="vGrowth" className="text-xs">Crecimiento</Label>
                <Input
                  id="vGrowth"
                  type="number"
                  min={1}
                  value={varietyFormData.growthWeeks}
                  onChange={(e) => setVarietyFormData({ ...varietyFormData, growthWeeks: parseInt(e.target.value) || 10 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vHarvest" className="text-xs">Cosecha</Label>
                <Input
                  id="vHarvest"
                  type="number"
                  min={1}
                  value={varietyFormData.harvestWeeks}
                  onChange={(e) => setVarietyFormData({ ...varietyFormData, harvestWeeks: parseInt(e.target.value) || 8 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vTotal" className="text-xs">Total</Label>
                <Input
                  id="vTotal"
                  type="number"
                  min={1}
                  value={varietyFormData.totalWeeks}
                  onChange={(e) => setVarietyFormData({ ...varietyFormData, totalWeeks: parseInt(e.target.value) || 20 })}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Tiempos en semanas</p>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input
                id="notes"
                value={varietyFormData.notes}
                onChange={(e) => setVarietyFormData({ ...varietyFormData, notes: e.target.value })}
                placeholder="Ej: Resistente al frío, alta producción..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVariety(null)}>Cancelar</Button>
            <Button onClick={saveVariety}>{editingVariety?.variety ? 'Guardar' : 'Crear'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
