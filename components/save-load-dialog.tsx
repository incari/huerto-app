"use client";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Plus, Trash2, Check } from "lucide-react";
import { GardenConfig, GardenLine, LineGroup } from "@/lib/plants";
import { cn } from "@/lib/utils";

interface SavedGarden {
  id: number;
  name: string;
  config: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SaveLoadDialogProps {
  currentGardenId: number | null;
  currentGardenName: string;
  lines: GardenLine[];
  lineGroups: LineGroup[];
  config: GardenConfig;
  onLoad: (data: {
    gardenId: number;
    gardenName: string;
    lines: GardenLine[];
    lineGroups: LineGroup[];
    config: GardenConfig;
  }) => void;
  onSave: () => void;
  saveStatus: "idle" | "saving" | "saved";
}

export function SaveLoadDialog({
  currentGardenId,
  currentGardenName,
  lines,
  lineGroups,
  config,
  onLoad,
  onSave,
  saveStatus,
}: SaveLoadDialogProps) {
  const [savedGardens, setSavedGardens] = useState<SavedGarden[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewGardenDialog, setShowNewGardenDialog] = useState(false);
  const [newGardenName, setNewGardenName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadGardensList();
  }, []);

  const loadGardensList = async () => {
    try {
      const response = await fetch("/api/gardens");
      if (response.ok) {
        const gardens = await response.json();
        setSavedGardens(gardens);
      }
    } catch (error) {
      console.error("Error loading gardens:", error);
    }
  };

  const handleCreateNewGarden = async () => {
    if (!newGardenName.trim()) {
      alert("Por favor, introduce un nombre para el huerto");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/gardens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGardenName,
          config: {
            ...config,
            lines: [],
            lineGroups: [{ id: "group-1", name: "Bancal 1", color: "#22c55e" }],
          },
          plants: [],
          middlePlants: [],
        }),
      });

      if (response.ok) {
        const newGarden = await response.json();
        setNewGardenName("");
        setShowNewGardenDialog(false);
        loadGardensList();
        onLoad({
          gardenId: newGarden.id,
          gardenName: newGarden.name,
          lines: [],
          lineGroups: [{ id: "group-1", name: "Bancal 1", color: "#22c55e" }],
          config,
        });
      } else {
        alert("Error al crear el huerto");
      }
    } catch (error) {
      console.error("Error creating garden:", error);
      alert("Error al crear el huerto");
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (gardenId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/gardens/${gardenId}`);
      if (response.ok) {
        const garden = await response.json();
        const savedConfig = garden.config;
        onLoad({
          gardenId: garden.id,
          gardenName: garden.name,
          lines: savedConfig.lines || [],
          lineGroups: savedConfig.lineGroups || [],
          config: savedConfig,
        });
      } else {
        alert("Error al cargar el huerto");
      }
    } catch (error) {
      console.error("Error loading garden:", error);
      alert("Error al cargar el huerto");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (gardenId: number) => {
    if (gardenId === currentGardenId) {
      alert("No puedes eliminar el huerto activo");
      return;
    }

    if (!confirm("¿Estás seguro de que quieres eliminar este huerto?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/gardens/${gardenId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadGardensList();
      } else {
        alert("Error al eliminar el huerto");
      }
    } catch (error) {
      console.error("Error deleting garden:", error);
      alert("Error al eliminar el huerto");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <Button
        variant="outline"
        className="gap-2 min-w-[200px] justify-between"
        disabled
      >
        <span className="truncate">Cargando...</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 min-w-[200px] justify-between"
          >
            <span className="truncate">{currentGardenName || "Mi Huerto"}</span>
            <div className="flex items-center gap-2">
              {saveStatus === "saving" && (
                <span className="text-xs text-muted-foreground">
                  Guardando...
                </span>
              )}
              {saveStatus === "saved" && (
                <Check className="h-3 w-3 text-green-600" />
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[250px]">
          <DropdownMenuItem
            onClick={() => setShowNewGardenDialog(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Huerto
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {savedGardens.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              No hay otros huertos
            </div>
          ) : (
            savedGardens.map((garden) => (
              <DropdownMenuItem
                key={garden.id}
                onClick={() => handleLoad(garden.id)}
                disabled={loading || garden.id === currentGardenId}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {garden.id === currentGardenId && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                  <span className="truncate">{garden.name}</span>
                </div>
                {garden.id !== currentGardenId && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(garden.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showNewGardenDialog} onOpenChange={setShowNewGardenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Huerto</DialogTitle>
            <DialogDescription>
              Introduce un nombre para tu nuevo huerto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-garden-name">Nombre del huerto</Label>
              <Input
                id="new-garden-name"
                placeholder="Mi huerto de primavera"
                value={newGardenName}
                onChange={(e) => setNewGardenName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateNewGarden();
                  }
                }}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewGardenDialog(false);
                  setNewGardenName("");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateNewGarden}
                disabled={loading || !newGardenName.trim()}
              >
                {loading ? "Creando..." : "Crear Huerto"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
