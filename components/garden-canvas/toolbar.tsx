import { Button } from "@/components/ui/button";
import { Plus, RotateCcw } from "lucide-react";
import { GardenConfig, DRIPPER_SPACING_CM } from "@/lib/plants";

interface ToolbarProps {
  onAddLine: () => void;
  onClearAll: () => void;
  config: GardenConfig;
}

export function Toolbar({ onAddLine, onClearAll, config }: ToolbarProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-border bg-card">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onAddLine}>
          <Plus className="h-4 w-4 mr-1" />
          Linea
        </Button>
        <Button variant="outline" size="sm" onClick={onClearAll}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-sky-500"></span>
          Gotero cada {DRIPPER_SPACING_CM}cm
        </span>
        {config.method === "parades-crestall" && config.groupConfig && (
          <span className="text-primary font-medium">
            Parades: {config.groupConfig.subgroupSpacingCm}cm entre líneas,{" "}
            {config.groupConfig.middleSpacingCm}cm en medio (flores),{" "}
            {config.groupConfig.interGroupSpacingCm}cm entre bancales
          </span>
        )}
      </div>
    </div>
  );
}

