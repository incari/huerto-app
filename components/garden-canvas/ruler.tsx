import { DRIPPER_SPACING_CM } from "@/lib/plants";

const PIXELS_PER_CM = 2;

interface RulerProps {
  maxLineLengthCm: number;
  dripperPositions: number[];
}

export function Ruler({ maxLineLengthCm, dripperPositions }: RulerProps) {
  return (
    <div
      className="absolute top-2 left-20 flex items-end h-8"
      style={{ width: maxLineLengthCm * PIXELS_PER_CM }}
    >
      {dripperPositions.map((pos) => (
        <div
          key={pos}
          className="absolute flex flex-col items-center"
          style={{
            left: pos * PIXELS_PER_CM,
            transform: "translateX(-50%)",
          }}
        >
          {pos % 50 === 0 && (
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
              {pos}cm
            </span>
          )}
          <div
            className={`w-px ${pos % 50 === 0 ? "h-3 bg-muted-foreground/40" : "h-1.5 bg-muted-foreground/20"}`}
          />
        </div>
      ))}
    </div>
  );
}

