interface GroupSeparatorProps {
  interGroupSpacingCm: number;
  pixelsPerCm: number;
}

export function GroupSeparator({
  interGroupSpacingCm,
  pixelsPerCm,
}: GroupSeparatorProps) {
  return (
    <div
      className="relative border-t-2 border-dashed border-border my-4"
      style={{
        marginTop: (interGroupSpacingCm / 2) * pixelsPerCm,
        marginBottom: (interGroupSpacingCm / 2) * pixelsPerCm,
      }}
    >
      <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground font-medium">
        {interGroupSpacingCm}cm
      </span>
    </div>
  );
}
