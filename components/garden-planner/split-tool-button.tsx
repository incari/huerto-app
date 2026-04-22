"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SplitToolOption<V extends string | number> {
  value: V;
  label: string;
  icon?: ReactNode;
  hint?: string;
}

interface SplitToolButtonProps<V extends string | number> {
  label: string;
  icon: ReactNode;
  hint?: string;
  onActivate: () => void;
  options: SplitToolOption<V>[];
  selected: V;
  onSelect: (value: V) => void;
  menuAriaLabel: string;
  disabled?: boolean;
  className?: string;
}

export function SplitToolButton<V extends string | number>({
  label,
  icon,
  hint,
  onActivate,
  options,
  selected,
  onSelect,
  menuAriaLabel,
  disabled,
  className,
}: SplitToolButtonProps<V>) {
  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        onClick={onActivate}
        disabled={disabled}
        className="h-auto w-full flex-col gap-1.5 py-3"
      >
        {icon}
        <span className="text-xs">{label}</span>
        {hint && (
          <span className="text-[10px] text-muted-foreground">{hint}</span>
        )}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={menuAriaLabel}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-1 right-1 h-5 w-5 text-muted-foreground hover:bg-accent"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {options.map((opt) => (
            <DropdownMenuItem
              key={String(opt.value)}
              onSelect={() => onSelect(opt.value)}
              data-active={opt.value === selected ? "" : undefined}
            >
              {opt.icon}
              <span>{opt.label}</span>
              {opt.hint && (
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {opt.hint}
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

