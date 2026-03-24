import { Button } from "@/components/ui/button";
import { Plus, Sprout } from "lucide-react";
import { DRIPPER_SPACING_CM } from "@/lib/plants";

interface EmptyStateProps {
  onAddLine: () => void;
  defaultLineLengthCm: number;
}

export function EmptyState({ onAddLine, defaultLineLengthCm }: EmptyStateProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Sprout className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Comienza tu huerto
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Añade tu primera línea de goteo para empezar a planificar qué
            plantar. Cada línea tendrá {defaultLineLengthCm}cm de largo con
            goteros cada {DRIPPER_SPACING_CM}cm.
          </p>
        </div>
        <Button onClick={onAddLine} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Añadir primera línea
        </Button>
      </div>
    </div>
  );
}

