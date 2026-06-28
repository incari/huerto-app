"use client";

import { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SplitToolButton, SplitToolOption } from "./split-tool-button";
import { usePlannerStore } from "./store";
import {
  DEFAULT_PLANT_STAGE,
  PLANT_KIND_SPECS,
  PLANT_LABELS,
  PLANT_STAGE_SPECS,
  PlantKind,
  PlantStage,
} from "./types";
import { Search, Sprout } from "lucide-react";

type PlantCategory =
  | "frutos"
  | "hojas"
  | "raices"
  | "legumbres"
  | "hierbas"
  | "flores";

const PLANT_KIND_CATEGORY: Record<PlantKind, PlantCategory> = {
  tomato: "frutos",
  "pepper-red": "frutos",
  "pepper-green": "frutos",
  "pepper-yellow": "frutos",
  eggplant: "frutos",
  cucumber: "frutos",
  zucchini: "frutos",
  pumpkin: "frutos",
  watermelon: "frutos",
  melon: "frutos",
  strawberry: "frutos",
  lettuce: "hojas",
  spinach: "hojas",
  arugula: "hojas",
  escarole: "hojas",
  "corn-salad": "hojas",
  endive: "hojas",
  chard: "hojas",
  celery: "hojas",
  fennel: "hojas",
  cabbage: "hojas",
  "red-cabbage": "hojas",
  broccoli: "hojas",
  romanesco: "hojas",
  cauliflower: "hojas",
  "brussels-sprouts": "hojas",
  artichoke: "hojas",
  asparagus: "hojas",
  onion: "raices",
  garlic: "raices",
  leek: "raices",
  carrot: "raices",
  radish: "raices",
  beet: "raices",
  turnip: "raices",
  potato: "raices",
  beans: "legumbres",
  "green-bean": "legumbres",
  "runner-bean": "legumbres",
  "red-bean": "legumbres",
  "fava-bean": "legumbres",
  pea: "legumbres",
  lupin: "legumbres",
  basil: "hierbas",
  parsley: "hierbas",
  rosemary: "hierbas",
  dill: "hierbas",
  sage: "hierbas",
  oregano: "hierbas",
  "lemon-thyme": "hierbas",
  chives: "hierbas",
  stevia: "hierbas",
  rue: "hierbas",
  calendula: "flores",
  nasturtium: "flores",
  daisy: "flores",
  rose: "flores",
  altabaca: "flores",
};

const CATEGORIES: {
  id: PlantCategory;
  label: string;
  color: string;
}[] = [
  { id: "frutos", label: "Frutos", color: "bg-red-100 text-red-700" },
  { id: "raices", label: "Raíces", color: "bg-orange-100 text-orange-700" },
  { id: "hojas", label: "Hojas", color: "bg-green-100 text-green-700" },
  { id: "legumbres", label: "Legumbres", color: "bg-amber-100 text-amber-700" },
  { id: "hierbas", label: "Hierbas", color: "bg-emerald-100 text-emerald-700" },
  { id: "flores", label: "Flores", color: "bg-pink-100 text-pink-700" },
];

const PLANT_ORDER: PlantKind[] = [
  "tomato",
  "pepper-red",
  "pepper-green",
  "pepper-yellow",
  "eggplant",
  "cucumber",
  "zucchini",
  "pumpkin",
  "watermelon",
  "melon",
  "strawberry",
  "lettuce",
  "spinach",
  "arugula",
  "escarole",
  "corn-salad",
  "endive",
  "chard",
  "celery",
  "fennel",
  "cabbage",
  "red-cabbage",
  "broccoli",
  "romanesco",
  "cauliflower",
  "brussels-sprouts",
  "artichoke",
  "onion",
  "garlic",
  "leek",
  "chives",
  "asparagus",
  "carrot",
  "radish",
  "beet",
  "turnip",
  "potato",
  "beans",
  "green-bean",
  "runner-bean",
  "red-bean",
  "fava-bean",
  "pea",
  "lupin",
  "basil",
  "parsley",
  "rosemary",
  "dill",
  "sage",
  "oregano",
  "lemon-thyme",
  "stevia",
  "rue",
  "calendula",
  "nasturtium",
  "daisy",
  "rose",
  "altabaca",
];

const STAGES: PlantStage[] = [1, 2, 3, 4];

export function PlantPalette() {
  const addPlant = usePlannerStore((s) => s.addPlant);
  const [stages, setStages] = useState<Record<PlantKind, PlantStage>>(() =>
    PLANT_ORDER.reduce(
      (acc, kind) => {
        acc[kind] = DEFAULT_PLANT_STAGE;
        return acc;
      },
      {} as Record<PlantKind, PlantStage>,
    ),
  );
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<PlantCategory | null>(
    null,
  );

  const filteredPlants = useMemo(() => {
    const query = search.trim().toLowerCase();
    return PLANT_ORDER.filter((kind) => {
      const matchesSearch =
        query.length === 0 ||
        PLANT_LABELS[kind].toLowerCase().includes(query) ||
        kind.toLowerCase().includes(query);
      const matchesCategory =
        !activeCategory || PLANT_KIND_CATEGORY[kind] === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <div className="w-72 bg-card border-r border-border flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Sprout className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Plantar</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Elige la planta y su etapa. Pulsa el botón para colocarla y arrástrala
          al sitio.
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plantas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 p-3 border-b border-border">
        {CATEGORIES.map((cat) => (
          <Badge
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "secondary"}
            className={`cursor-pointer text-xs ${activeCategory === cat.id ? "" : cat.color}`}
            onClick={() =>
              setActiveCategory(activeCategory === cat.id ? null : cat.id)
            }
          >
            {cat.label}
          </Badge>
        ))}
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 grid grid-cols-2 gap-2">
          {filteredPlants.map((kind) => {
            const spec = PLANT_KIND_SPECS[kind];
            const stageMap = PLANT_STAGE_SPECS[kind];
            const selected = stages[kind];
            const options = STAGES.map<SplitToolOption<PlantStage>>((s) => ({
              value: s,
              label: `Etapa ${s}`,
              hint: stageMap[s].label,
            }));
            return (
              <SplitToolButton<PlantStage>
                key={kind}
                label={PLANT_LABELS[kind]}
                icon={
                  <span className="text-2xl leading-none">{spec.emoji}</span>
                }
                hint={stageMap[selected].label}
                onActivate={() => addPlant(kind, selected)}
                options={options}
                selected={selected}
                onSelect={(s) => setStages((prev) => ({ ...prev, [kind]: s }))}
                menuAriaLabel={`Cambiar etapa de ${PLANT_LABELS[kind]}`}
              />
            );
          })}
        </div>
        {filteredPlants.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No se encontraron plantas
          </p>
        )}
      </ScrollArea>
    </div>
  );
}
