import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Trash2, Minus, MoreVertical } from "lucide-react";

interface LineMenuProps {
  lineIndex: number;
  isLastInGroup: boolean;
  onInsertLineAfter: () => void;
  onAddGroupSeparator: () => void;
  onRemoveLine: () => void;
}

export function LineMenu({
  lineIndex,
  isLastInGroup,
  onInsertLineAfter,
  onAddGroupSeparator,
  onRemoveLine,
}: LineMenuProps) {
  return (
    <div className="absolute -left-4 top-1/2 -translate-y-1/2 -translate-x-full pr-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 hover:bg-accent text-[10px] text-muted-foreground hover:text-foreground"
          >
            <MoreVertical className="h-3 w-3 mr-0.5" />L{lineIndex + 1}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem
            onClick={onInsertLineAfter}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir línea debajo
          </DropdownMenuItem>
          {!isLastInGroup && (
            <DropdownMenuItem
              onClick={onAddGroupSeparator}
              className="cursor-pointer text-amber-600"
            >
              <Minus className="h-4 w-4 mr-2" />
              Añadir separador
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onRemoveLine}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar línea
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function LineLabel({ lineIndex }: { lineIndex: number }) {
  return (
    <div className="absolute -left-4 top-1/2 -translate-y-1/2 -translate-x-full pr-1">
      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
        L{lineIndex + 1}
      </span>
    </div>
  );
}
