"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface NumberInputProps {
  id?: string;
  value: number;
  min?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
  onCommit: (v: number) => void;
}

export function NumberInput({
  id,
  value,
  min,
  step,
  className,
  disabled,
  onCommit,
}: NumberInputProps) {
  const display = String(Math.round(value * 10) / 10);
  const [draft, setDraft] = useState(display);

  useEffect(() => {
    setDraft(display);
  }, [display]);

  const commit = () => {
    if (draft === "" || draft === "-") {
      setDraft(display);
      return;
    }
    const parsed = Number(draft);
    if (!Number.isFinite(parsed)) {
      setDraft(display);
      return;
    }
    onCommit(parsed);
  };

  return (
    <Input
      id={id}
      type="number"
      value={draft}
      min={min}
      step={step}
      className={className}
      disabled={disabled}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        } else if (e.key === "Escape") {
          setDraft(display);
          e.currentTarget.blur();
        }
      }}
    />
  );
}
