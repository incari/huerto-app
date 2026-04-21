"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlannerStore } from "./store";
import { IRRIGATION_LABELS, IrrigationKind } from "./types";
import {
  Box,
  ChevronDown,
  CircleDot,
  Droplet,
  Droplets,
  Grip,
  Hammer,
  Layers,
  Plus,
  Sprout,
  Waves,
} from "lucide-react";

interface ToolItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  onClick?: () => void;
}

const IRRIGATION_ICONS: Record<
  IrrigationKind,
  React.ComponentType<{ className?: string }>
> = {
  sprinkler: Droplets,
  micro: CircleDot,
  drip: Droplet,
  soaker: Waves,
};

const IRRIGATION_ORDER: IrrigationKind[] = [
  "sprinkler",
  "micro",
  "drip",
  "soaker",
];

export function BuildPalette() {
  const addBed = usePlannerStore((s) => s.addBed);
  const addIrrigation = usePlannerStore((s) => s.addIrrigation);
  const [irrKind, setIrrKind] = useState<IrrigationKind>("sprinkler");
  const IrrIcon = IRRIGATION_ICONS[irrKind];

  const tools: ToolItem[] = [
    { id: "bed", label: "Bancal", icon: Box, onClick: addBed },
    { id: "border", label: "Borde", icon: Grip, disabled: true },
    { id: "soil", label: "Sustrato", icon: Layers, disabled: true },
    { id: "support", label: "Tutor", icon: Sprout, disabled: true },
  ];

  return (
    <div className="w-72 bg-card border-r border-border flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Hammer className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Construir</h2>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Añade bancales, bordes y elementos a tu huerto.
        </p>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 grid grid-cols-2 gap-2">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <Button
                key={t.id}
                variant="outline"
                disabled={t.disabled}
                onClick={t.onClick}
                className="h-auto flex-col gap-1.5 py-3"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{t.label}</span>
                {t.disabled && (
                  <span className="text-[10px] text-muted-foreground">
                    próximamente
                  </span>
                )}
              </Button>
            );
          })}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => addIrrigation(irrKind)}
              className="h-auto w-full flex-col gap-1.5 py-3"
            >
              <IrrIcon className="h-5 w-5" />
              <span className="text-xs">{IRRIGATION_LABELS[irrKind]}</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Cambiar tipo de riego"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-1 right-1 h-5 w-5 text-muted-foreground hover:bg-accent"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {IRRIGATION_ORDER.map((k) => {
                  const KindIcon = IRRIGATION_ICONS[k];
                  return (
                    <DropdownMenuItem key={k} onSelect={() => setIrrKind(k)}>
                      <KindIcon className="h-4 w-4" />
                      {IRRIGATION_LABELS[k]}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </ScrollArea>
      <div className="p-3 border-t border-border">
        <Button
          size="sm"
          variant="default"
          className="w-full gap-1.5"
          onClick={addBed}
        >
          <Plus className="h-4 w-4" />
          Añadir bancal
        </Button>
      </div>
    </div>
  );
}
