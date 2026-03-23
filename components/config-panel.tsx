"use client"

import { GardenConfig, gardenMethods } from "@/lib/plants"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Settings, Droplets } from "lucide-react"

interface ConfigPanelProps {
  config: GardenConfig
  onConfigChange: (config: GardenConfig) => void
  plantCount: number
  lineCount: number
}

export function ConfigPanel({ config, onConfigChange, plantCount, lineCount }: ConfigPanelProps) {
  return (
    <div className="w-64 bg-card border-l border-border p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground">Configuración</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm">Método de cultivo</Label>
          <Select
            value={config.method}
            onValueChange={(value: GardenConfig['method']) => {
              const newConfig = gardenMethods[value]
              onConfigChange(newConfig)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="parades-crestall">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  Parades en Crestall
                </div>
              </SelectItem>
              <SelectItem value="traditional">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  Tradicional
                </div>
              </SelectItem>
              <SelectItem value="intensive">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  Intensivo
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Separación entre líneas</Label>
            <span className="text-sm text-muted-foreground">{config.lineSeparationCm} cm</span>
          </div>
          <Slider
            value={[config.lineSeparationCm]}
            onValueChange={([value]) => onConfigChange({ ...config, lineSeparationCm: value })}
            min={15}
            max={80}
            step={5}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Largo de línea</Label>
            <span className="text-sm text-muted-foreground">{config.defaultLineLengthCm} cm</span>
          </div>
          <Slider
            value={[config.defaultLineLengthCm]}
            onValueChange={([value]) => onConfigChange({ ...config, defaultLineLengthCm: value })}
            min={100}
            max={600}
            step={50}
            className="w-full"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border space-y-3">
        <h3 className="text-sm font-medium text-foreground">Resumen</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">{lineCount}</p>
            <p className="text-xs text-muted-foreground">Líneas</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">{plantCount}</p>
            <p className="text-xs text-muted-foreground">Plantas</p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <div className="bg-muted rounded-lg p-3">
          <h4 className="text-xs font-medium text-foreground mb-2">Sobre el método</h4>
          {config.method === 'parades-crestall' && (
            <p className="text-xs text-muted-foreground">
              El método Parades en Crestall utiliza bancales elevados con líneas de goteo separadas 30cm. 
              Ideal para huertos urbanos y cultivo intensivo.
            </p>
          )}
          {config.method === 'traditional' && (
            <p className="text-xs text-muted-foreground">
              Método tradicional con surcos más espaciados (50cm) para facilitar el paso y el mantenimiento.
            </p>
          )}
          {config.method === 'intensive' && (
            <p className="text-xs text-muted-foreground">
              Cultivo intensivo con líneas muy juntas (20cm) para maximizar la producción en espacios pequeños.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
