const PIXELS_PER_CM = 2;

interface DripLineProps {
  lengthCm: number;
  dripperPositions: number[];
  isDragOver: boolean;
}

export function DripLine({
  lengthCm,
  dripperPositions,
  isDragOver,
}: DripLineProps) {
  return (
    <div
      className={`
        absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full pointer-events-none transition-all
        ${isDragOver ? "bg-primary h-1.5" : "bg-stone-800"}
      `}
      style={{
        width: lengthCm * PIXELS_PER_CM,
      }}
    >
      {dripperPositions
        .filter((pos) => pos <= lengthCm)
        .map((pos) => (
          <div
            key={pos}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: pos * PIXELS_PER_CM }}
          >
            <div className="w-2 h-2 rounded-full bg-sky-500 border border-sky-600" />
          </div>
        ))}
    </div>
  );
}
