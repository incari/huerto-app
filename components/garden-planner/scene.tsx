"use client";

import { useEffect, useMemo, useRef } from "react";
import { Edges, Grid } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Plane, Vector3 } from "three";
import { usePlannerStore } from "./store";
import {
  Bed,
  DEFAULT_DRIP_DROP_RADIUS_CM,
  DEFAULT_DRIP_SPACING_CM,
  DEFAULT_PLANT_STAGE,
  Irrigation,
  PLANT_KIND_SPECS,
  PlantItem,
  PlantStage,
  Plot,
  TOMATO_STAGE_SPECS,
} from "./types";

const CM_TO_M = 0.01;
const GROUND = new Plane(new Vector3(0, 1, 0), 0);
const SNAP_CM = 5;

type HandleId = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

interface DragState {
  kind: "move" | "resize";
  handle?: HandleId;
  startBed: Bed;
  startHit: { x: number; z: number };
  lastX: number;
  lastY: number;
}

interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

function bedAABB(bed: Bed): AABB {
  const cos = Math.abs(Math.cos(bed.rotation));
  const sin = Math.abs(Math.sin(bed.rotation));
  const hx = (bed.widthCm / 2) * cos + (bed.depthCm / 2) * sin;
  const hz = (bed.widthCm / 2) * sin + (bed.depthCm / 2) * cos;
  return {
    minX: bed.x - hx,
    maxX: bed.x + hx,
    minZ: bed.y - hz,
    maxZ: bed.y + hz,
  };
}

function aabbOverlap(a: AABB, b: AABB): boolean {
  const eps = 0.01;
  return (
    a.minX < b.maxX - eps &&
    a.maxX > b.minX + eps &&
    a.minZ < b.maxZ - eps &&
    a.maxZ > b.minZ + eps
  );
}

function snapMove(
  bed: Bed,
  candX: number,
  candY: number,
  others: Bed[],
  plot: Plot,
): { x: number; y: number } {
  const cos = Math.abs(Math.cos(bed.rotation));
  const sin = Math.abs(Math.sin(bed.rotation));
  const hx = (bed.widthCm / 2) * cos + (bed.depthCm / 2) * sin;
  const hz = (bed.widthCm / 2) * sin + (bed.depthCm / 2) * cos;
  const targetsX: number[] = [-plot.widthCm / 2, plot.widthCm / 2, 0];
  const targetsZ: number[] = [-plot.depthCm / 2, plot.depthCm / 2, 0];
  for (const b of others) {
    const a = bedAABB(b);
    targetsX.push(a.minX, a.maxX, (a.minX + a.maxX) / 2);
    targetsZ.push(a.minZ, a.maxZ, (a.minZ + a.maxZ) / 2);
  }
  let x = candX;
  let y = candY;
  let bestDX = SNAP_CM;
  let bestDY = SNAP_CM;
  for (const t of targetsX) {
    const candidates = [
      { d: Math.abs(candX - hx - t), v: t + hx },
      { d: Math.abs(candX + hx - t), v: t - hx },
      { d: Math.abs(candX - t), v: t },
    ];
    for (const c of candidates) {
      if (c.d < bestDX) {
        bestDX = c.d;
        x = c.v;
      }
    }
  }
  for (const t of targetsZ) {
    const candidates = [
      { d: Math.abs(candY - hz - t), v: t + hz },
      { d: Math.abs(candY + hz - t), v: t - hz },
      { d: Math.abs(candY - t), v: t },
    ];
    for (const c of candidates) {
      if (c.d < bestDY) {
        bestDY = c.d;
        y = c.v;
      }
    }
  }
  return { x, y };
}

const modifiers = { shift: false, alt: false };
if (typeof window !== "undefined") {
  const onDown = (e: KeyboardEvent) => {
    if (e.key === "Shift") modifiers.shift = true;
    if (e.key === "Alt") modifiers.alt = true;
  };
  const onUp = (e: KeyboardEvent) => {
    if (e.key === "Shift") modifiers.shift = false;
    if (e.key === "Alt") modifiers.alt = false;
  };
  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);
}

export function Ground() {
  const plot = usePlannerStore((s) => s.plot);
  const select = usePlannerStore((s) => s.select);
  const w = plot.widthCm * CM_TO_M;
  const d = plot.depthCm * CM_TO_M;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
      onPointerDown={(e) => {
        e.stopPropagation();
        select(null);
      }}
    >
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color="#d6c7a1" roughness={1} />
    </mesh>
  );
}

export function SceneGrid() {
  const plot = usePlannerStore((s) => s.plot);
  const camera = usePlannerStore((s) => s.camera);
  const size = Math.max(plot.widthCm, plot.depthCm) * CM_TO_M * 1.5;

  return (
    <Grid
      args={[size, size]}
      cellSize={0.1}
      cellThickness={0.5}
      cellColor="#b9a878"
      sectionSize={1}
      sectionThickness={1}
      sectionColor="#7a6a3a"
      fadeDistance={size * 2}
      fadeStrength={camera === "2d" ? 0 : 1}
      infiniteGrid={camera === "2d"}
      position={[0, 0.001, 0]}
    />
  );
}

interface BedMeshProps {
  bed: Bed;
  selected: boolean;
}

function intersectGround(e: ThreeEvent<PointerEvent>) {
  const out = new Vector3();
  return e.ray.intersectPlane(GROUND, out) ? out : null;
}

function BedMesh({ bed, selected }: BedMeshProps) {
  const select = usePlannerStore((s) => s.select);
  const updateBed = usePlannerStore((s) => s.updateBed);
  const setDragging = usePlannerStore((s) => s.setDragging);
  const mode = usePlannerStore((s) => s.mode);
  const cameraMode = usePlannerStore((s) => s.camera);

  const dragRef = useRef<DragState | null>(null);
  const { raycaster, pointer, camera } = useThree();

  const w = bed.widthCm * CM_TO_M;
  const d = bed.depthCm * CM_TO_M;
  const h = bed.heightCm * CM_TO_M;

  const beginDrag = (
    e: ThreeEvent<PointerEvent>,
    kind: "move" | "resize",
    handle?: HandleId,
  ) => {
    e.stopPropagation();
    select(bed.id);
    const hit = intersectGround(e);
    if (!hit) return;
    dragRef.current = {
      kind,
      handle,
      startBed: { ...bed },
      startHit: { x: hit.x, z: hit.z },
      lastX: bed.x,
      lastY: bed.y,
    };
    setDragging(true);
  };

  useFrame(() => {
    const drag = dragRef.current;
    if (!drag) return;
    raycaster.setFromCamera(pointer, camera);
    const hit = new Vector3();
    if (!raycaster.ray.intersectPlane(GROUND, hit)) return;
    const dxM = hit.x - drag.startHit.x;
    const dzM = hit.z - drag.startHit.z;
    if (drag.kind === "move") {
      const state = usePlannerStore.getState();
      const others = state.beds.filter((b) => b.id !== bed.id);
      let candX = drag.startBed.x + dxM / CM_TO_M;
      let candY = drag.startBed.y + dzM / CM_TO_M;
      if (!modifiers.shift) {
        const snapped = snapMove(
          drag.startBed,
          candX,
          candY,
          others,
          state.plot,
        );
        candX = snapped.x;
        candY = snapped.y;
      }
      if (!modifiers.alt) {
        const otherBoxes = others.map(bedAABB);
        const collides = (x: number, y: number) => {
          const box = bedAABB({ ...drag.startBed, x, y });
          return otherBoxes.some((o) => aabbOverlap(box, o));
        };
        if (collides(candX, candY)) {
          if (!collides(candX, drag.lastY)) {
            candY = drag.lastY;
          } else if (!collides(drag.lastX, candY)) {
            candX = drag.lastX;
          } else {
            candX = drag.lastX;
            candY = drag.lastY;
          }
        }
      }
      drag.lastX = candX;
      drag.lastY = candY;
      updateBed(bed.id, { x: candX, y: candY });
      return;
    }
    if (drag.kind === "resize" && drag.handle) {
      applyResize(drag, dxM, dzM, (patch) => updateBed(bed.id, patch));
    }
  });

  useEffect(() => {
    const up = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      setDragging(false);
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [setDragging]);

  const showHandles = selected && mode === "design" && cameraMode === "2d";
  const handleSize = 0.12;

  return (
    <group
      position={[bed.x * CM_TO_M, 0, bed.y * CM_TO_M]}
      rotation={[0, bed.rotation, 0]}
    >
      <mesh
        position={[0, h / 2, 0]}
        castShadow
        receiveShadow
        onPointerDown={(e) => beginDrag(e, "move")}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={selected ? "#c2410c" : "#8b5a2b"}
          roughness={0.9}
        />
        <Edges
          threshold={1}
          color={selected ? "#fb923c" : "#1f2937"}
          lineWidth={selected ? 2.5 : 1.5}
        />
      </mesh>
      {showHandles &&
        HANDLE_POSITIONS.map(({ id, sx, sz }) => (
          <mesh
            key={id}
            position={[(sx * w) / 2, h + 0.01, (sz * d) / 2]}
            onPointerDown={(e) => beginDrag(e, "resize", id)}
          >
            <boxGeometry args={[handleSize, handleSize, handleSize]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
    </group>
  );
}

const HANDLE_POSITIONS: { id: HandleId; sx: -1 | 0 | 1; sz: -1 | 0 | 1 }[] = [
  { id: "nw", sx: -1, sz: -1 },
  { id: "n", sx: 0, sz: -1 },
  { id: "ne", sx: 1, sz: -1 },
  { id: "e", sx: 1, sz: 0 },
  { id: "se", sx: 1, sz: 1 },
  { id: "s", sx: 0, sz: 1 },
  { id: "sw", sx: -1, sz: 1 },
  { id: "w", sx: -1, sz: 0 },
];

function applyResize(
  drag: DragState,
  dxM: number,
  dzM: number,
  patch: (p: Partial<Bed>) => void,
) {
  const { startBed, handle } = drag;
  if (!handle) return;
  // world delta -> local delta (undo bed rotation)
  const cos = Math.cos(-startBed.rotation);
  const sin = Math.sin(-startBed.rotation);
  const lx = dxM * cos - dzM * sin;
  const lz = dxM * sin + dzM * cos;
  const east = handle.includes("e");
  const west = handle.includes("w");
  const south = handle.includes("s");
  const north = handle.includes("n");
  let newW = startBed.widthCm;
  let newD = startBed.depthCm;
  if (east) newW = Math.max(10, startBed.widthCm + lx / CM_TO_M);
  if (west) newW = Math.max(10, startBed.widthCm - lx / CM_TO_M);
  if (south) newD = Math.max(10, startBed.depthCm + lz / CM_TO_M);
  if (north) newD = Math.max(10, startBed.depthCm - lz / CM_TO_M);
  let localDx = 0;
  let localDz = 0;
  if (east) localDx = (newW - startBed.widthCm) / 2;
  if (west) localDx = -(newW - startBed.widthCm) / 2;
  if (south) localDz = (newD - startBed.depthCm) / 2;
  if (north) localDz = -(newD - startBed.depthCm) / 2;
  const rcos = Math.cos(startBed.rotation);
  const rsin = Math.sin(startBed.rotation);
  patch({
    widthCm: newW,
    depthCm: newD,
    x: startBed.x + localDx * rcos - localDz * rsin,
    y: startBed.y + localDx * rsin + localDz * rcos,
  });
}

export function Beds() {
  const beds = usePlannerStore((s) => s.beds);
  const selectedId = usePlannerStore((s) => s.selectedId);
  return (
    <>
      {beds.map((b) => (
        <BedMesh key={b.id} bed={b} selected={b.id === selectedId} />
      ))}
    </>
  );
}

const IRR_COLORS: Record<Irrigation["kind"], string> = {
  sprinkler: "#3b82f6",
  micro: "#06b6d4",
  drip: "#14b8a6",
  soaker: "#6366f1",
};

function bedTopAtPoint(beds: Bed[], xCm: number, yCm: number): number {
  let top = 0;
  for (const b of beds) {
    const dx = xCm - b.x;
    const dz = yCm - b.y;
    const c = Math.cos(b.rotation);
    const s = Math.sin(b.rotation);
    const lx = dx * c + dz * s;
    const lz = -dx * s + dz * c;
    if (Math.abs(lx) <= b.widthCm / 2 && Math.abs(lz) <= b.depthCm / 2) {
      if (b.heightCm > top) top = b.heightCm;
    }
  }
  return top * CM_TO_M;
}

function irrigationBaseY(irr: Irrigation, beds: Bed[]): number {
  if (irr.kind !== "drip" && irr.kind !== "soaker") {
    return bedTopAtPoint(beds, irr.x, irr.y);
  }
  const cos = Math.cos(irr.rotation);
  const sin = Math.sin(irr.rotation);
  const half = irr.lengthCm / 2;
  let top = 0;
  for (let i = 0; i <= 4; i++) {
    const t = -half + (i * irr.lengthCm) / 4;
    const px = irr.x + t * cos;
    const py = irr.y + t * sin;
    const y = bedTopAtPoint(beds, px, py);
    if (y > top) top = y;
  }
  return top;
}

interface IrrigationMeshProps {
  irr: Irrigation;
  selected: boolean;
}

function IrrigationMesh({ irr, selected }: IrrigationMeshProps) {
  const select = usePlannerStore((s) => s.select);
  const updateIrrigation = usePlannerStore((s) => s.updateIrrigation);
  const setDragging = usePlannerStore((s) => s.setDragging);
  const cameraMode = usePlannerStore((s) => s.camera);
  const beds = usePlannerStore((s) => s.beds);

  const dragRef = useRef<{
    startIrr: Irrigation;
    startHit: { x: number; z: number };
  } | null>(null);
  const { raycaster, pointer, camera } = useThree();

  const color = IRR_COLORS[irr.kind];
  const isLinear = irr.kind === "drip" || irr.kind === "soaker";
  const isDrip = irr.kind === "drip";
  const radiusM = irr.radiusCm * CM_TO_M;
  const lengthM = irr.lengthCm * CM_TO_M;
  const widthM = irr.widthCm * CM_TO_M;
  const baseY = irrigationBaseY(irr, beds);

  const drops = isDrip
    ? (() => {
        const spacing = Math.max(1, irr.spacingCm ?? DEFAULT_DRIP_SPACING_CM);
        const dropR = Math.max(
          0.5,
          irr.dropRadiusCm ?? DEFAULT_DRIP_DROP_RADIUS_CM,
        );
        const count = Math.max(1, Math.floor(irr.lengthCm / spacing) + 1);
        const span = (count - 1) * spacing;
        const start = -span / 2;
        const list: { xM: number; rM: number }[] = [];
        for (let i = 0; i < count; i++) {
          list.push({
            xM: (start + i * spacing) * CM_TO_M,
            rM: dropR * CM_TO_M,
          });
        }
        return list;
      })()
    : [];

  const beginDrag = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    select(irr.id);
    const hit = intersectGround(e);
    if (!hit) return;
    dragRef.current = {
      startIrr: { ...irr },
      startHit: { x: hit.x, z: hit.z },
    };
    setDragging(true);
  };

  useFrame(() => {
    const drag = dragRef.current;
    if (!drag) return;
    raycaster.setFromCamera(pointer, camera);
    const hit = new Vector3();
    if (!raycaster.ray.intersectPlane(GROUND, hit)) return;
    const dxM = hit.x - drag.startHit.x;
    const dzM = hit.z - drag.startHit.z;
    updateIrrigation(irr.id, {
      x: drag.startIrr.x + dxM / CM_TO_M,
      y: drag.startIrr.y + dzM / CM_TO_M,
    });
  });

  useEffect(() => {
    const up = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      setDragging(false);
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [setDragging]);

  const outline = selected ? "#fb923c" : color;
  const emitterY = cameraMode === "2d" ? 0.02 : 0.1;

  return (
    <group
      position={[irr.x * CM_TO_M, baseY, irr.y * CM_TO_M]}
      rotation={[0, irr.rotation, 0]}
      onPointerDown={beginDrag}
    >
      {isLinear ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <planeGeometry args={[lengthM, widthM]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={isDrip ? 0.1 : 0.25}
          />
          <Edges
            threshold={1}
            color={outline}
            lineWidth={selected ? 2.5 : 1.5}
          />
        </mesh>
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <ringGeometry args={[Math.max(0, radiusM - 0.01), radiusM, 48]} />
          <meshBasicMaterial
            color={outline}
            transparent
            opacity={selected ? 0.9 : 0.7}
          />
        </mesh>
      )}
      {!isLinear && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
          <circleGeometry args={[radiusM, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
      )}
      {isDrip &&
        drops.map((d, i) => (
          <group key={i} position={[d.xM, 0, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
              <circleGeometry args={[d.rM, 24]} />
              <meshBasicMaterial color={color} transparent opacity={0.3} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <ringGeometry args={[Math.max(0, d.rM - 0.005), d.rM, 24]} />
              <meshBasicMaterial color={color} transparent opacity={0.8} />
            </mesh>
          </group>
        ))}
      {/* Emitter marker */}
      <mesh position={[0, emitterY + 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.08, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {irr.kind === "sprinkler" && (
        <mesh position={[0, emitterY + 0.09, 0]} castShadow>
          <sphereGeometry args={[0.035, 16, 12]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}
      {irr.kind === "micro" && (
        <mesh position={[0, emitterY + 0.09, 0]} castShadow>
          <coneGeometry args={[0.03, 0.05, 12]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}
      {isLinear && (
        <mesh position={[0, emitterY + 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, lengthM, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}
    </group>
  );
}

export function Irrigations() {
  const irrigations = usePlannerStore((s) => s.irrigations);
  const selectedId = usePlannerStore((s) => s.selectedId);
  return (
    <>
      {irrigations.map((i) => (
        <IrrigationMesh key={i.id} irr={i} selected={i.id === selectedId} />
      ))}
    </>
  );
}

function hashSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface TomatoBranch {
  t: number;
  azimuth: number;
  tilt: number;
  lengthM: number;
  hasTruss: boolean;
  fruits: { size: number; color: string; ox: number; oy: number; oz: number }[];
  leaves: { t: number; roll: number; scale: number }[];
}

interface TomatoStructure {
  heightM: number;
  canopyR: number;
  branches: TomatoBranch[];
  stemLeaves: { t: number; azimuth: number; scale: number }[];
}

function pickFruitColor(rnd: () => number, ripeness: number): string {
  const r = rnd();
  if (r < ripeness) return "#dc2626";
  if (r < ripeness + 0.12) return "#f97316";
  if (r < ripeness + 0.22) return "#fde047";
  return "#84cc16";
}

function buildTomato(id: string, stage: PlantStage): TomatoStructure {
  const spec = TOMATO_STAGE_SPECS[stage];
  const rnd = mulberry32(hashSeed(id) ^ (stage * 0x9e3779b1));
  const heightM = spec.heightCm * CM_TO_M;
  const canopyR = (spec.canopyCm / 2) * CM_TO_M;

  const branches: TomatoBranch[] = [];
  const count = spec.branchCount;
  for (let i = 0; i < count; i++) {
    const t = 0.3 + ((i + 0.5) / count) * 0.65 + (rnd() - 0.5) * 0.04;
    const azimuth = i * ((Math.PI * 2) / count) + rnd() * 0.7;
    const tilt = 0.9 + rnd() * 0.45;
    const lengthM = canopyR * (0.7 + rnd() * 0.5);
    const hasTruss = stage >= 3 && rnd() > 0.35;
    const trussCount =
      stage === 4 ? 3 + Math.floor(rnd() * 4) : 2 + Math.floor(rnd() * 3);
    const fruits: TomatoBranch["fruits"] = [];
    if (hasTruss) {
      for (let j = 0; j < trussCount; j++) {
        fruits.push({
          size: (stage === 4 ? 0.018 : 0.014) + rnd() * 0.006,
          color: pickFruitColor(rnd, spec.ripeness),
          ox: (rnd() - 0.5) * 0.035,
          oy: -j * 0.028 - rnd() * 0.015,
          oz: (rnd() - 0.5) * 0.035,
        });
      }
    }
    const leafCount = stage === 1 ? 1 : stage <= 3 ? 2 : 3;
    const leaves: TomatoBranch["leaves"] = [];
    for (let j = 0; j < leafCount; j++) {
      leaves.push({
        t: 0.4 + (j / Math.max(1, leafCount)) * 0.55,
        roll: (rnd() - 0.5) * 1.4,
        scale: 0.85 + rnd() * 0.55,
      });
    }
    branches.push({ t, azimuth, tilt, lengthM, hasTruss, fruits, leaves });
  }

  const stemLeaves: TomatoStructure["stemLeaves"] = [];
  for (let i = 0; i < spec.stemLeafCount; i++) {
    stemLeaves.push({
      t: 0.1 + rnd() * 0.85,
      azimuth: rnd() * Math.PI * 2,
      scale: 0.7 + rnd() * 0.5,
    });
  }

  return { heightM, canopyR, branches, stemLeaves };
}

const LEAF_LIGHT = "#86efac";
const LEAF_DARK = "#4d7c0f";
const STEM_GREEN = "#5b8c2a";
const STAKE_COLOR = "#a16207";

function Leaf({ scale = 1 }: { scale?: number }) {
  const s = 0.035 * scale;
  return (
    <group>
      <mesh castShadow scale={[s * 1.4, s * 0.1, s * 0.8]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color={LEAF_LIGHT} roughness={0.9} />
      </mesh>
      <mesh
        castShadow
        position={[s * 0.9, 0, s * 0.6]}
        scale={[s * 0.8, s * 0.1, s * 0.55]}
      >
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color={LEAF_DARK} roughness={0.9} />
      </mesh>
      <mesh
        castShadow
        position={[s * 0.9, 0, -s * 0.6]}
        scale={[s * 0.8, s * 0.1, s * 0.55]}
      >
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color={LEAF_DARK} roughness={0.9} />
      </mesh>
    </group>
  );
}

interface TomatoPlantProps {
  structure: TomatoStructure;
  stage: PlantStage;
  hasStake: boolean;
}

function TomatoPlant({ structure, stage, hasStake }: TomatoPlantProps) {
  const { heightM, branches, stemLeaves } = structure;
  const stemR =
    stage === 1 ? 0.006 : stage === 2 ? 0.009 : stage === 3 ? 0.013 : 0.018;
  const branchR = stemR * 0.55;

  return (
    <group>
      {hasStake && (
        <mesh position={[-0.02, heightM * 0.52, 0]} castShadow>
          <cylinderGeometry args={[0.006, 0.006, heightM * 1.04, 6]} />
          <meshStandardMaterial color={STAKE_COLOR} roughness={0.95} />
        </mesh>
      )}
      <mesh position={[0, heightM / 2, 0]} castShadow>
        <cylinderGeometry args={[stemR * 0.7, stemR, heightM, 8]} />
        <meshStandardMaterial color={STEM_GREEN} roughness={0.9} />
      </mesh>
      {stemLeaves.map((l, i) => (
        <group
          key={`sl-${i}`}
          position={[0, l.t * heightM, 0]}
          rotation={[0, l.azimuth, 0]}
        >
          <group position={[stemR * 1.5, 0, 0]} rotation={[0, 0, -0.6]}>
            <Leaf scale={l.scale} />
          </group>
        </group>
      ))}
      {branches.map((b, i) => (
        <group
          key={`br-${i}`}
          position={[0, b.t * heightM, 0]}
          rotation={[0, b.azimuth, 0]}
        >
          <group rotation={[0, 0, -b.tilt]}>
            <mesh position={[0, b.lengthM / 2, 0]} castShadow>
              <cylinderGeometry args={[branchR * 0.7, branchR, b.lengthM, 6]} />
              <meshStandardMaterial color={STEM_GREEN} roughness={0.9} />
            </mesh>
            {b.leaves.map((l, j) => (
              <group
                key={`l-${j}`}
                position={[0, l.t * b.lengthM, 0]}
                rotation={[0, 0, Math.PI / 2 + l.roll]}
              >
                <Leaf scale={l.scale} />
              </group>
            ))}
          </group>
          {b.hasTruss && (
            <group
              position={[
                Math.sin(b.tilt) * b.lengthM * 0.95,
                Math.cos(b.tilt) * b.lengthM * 0.95,
                0,
              ]}
            >
              {b.fruits.map((f, j) => (
                <mesh key={`f-${j}`} position={[f.ox, f.oy, f.oz]} castShadow>
                  <sphereGeometry args={[f.size, 12, 10]} />
                  <meshStandardMaterial color={f.color} roughness={0.4} />
                </mesh>
              ))}
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

interface PlantMeshProps {
  plant: PlantItem;
  selected: boolean;
}

function PlantMesh({ plant, selected }: PlantMeshProps) {
  const select = usePlannerStore((s) => s.select);
  const updatePlant = usePlannerStore((s) => s.updatePlant);
  const setDragging = usePlannerStore((s) => s.setDragging);
  const beds = usePlannerStore((s) => s.beds);

  const dragRef = useRef<{
    startPlant: PlantItem;
    startHit: { x: number; z: number };
  } | null>(null);
  const { raycaster, pointer, camera } = useThree();

  const spec = PLANT_KIND_SPECS[plant.kind];
  const baseY = bedTopAtPoint(beds, plant.x, plant.y);
  const stage: PlantStage = plant.stage ?? DEFAULT_PLANT_STAGE;
  const tomato = useMemo(
    () => (plant.kind === "tomato" ? buildTomato(plant.id, stage) : null),
    [plant.id, plant.kind, stage],
  );
  const heightM = tomato ? tomato.heightM : spec.heightCm * CM_TO_M;
  const canopyR = tomato ? tomato.canopyR : (spec.canopyCm / 2) * CM_TO_M;
  const stemR = 0.012;
  const outline = selected ? "#fb923c" : "#1f2937";

  const beginDrag = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    select(plant.id);
    const hit = intersectGround(e);
    if (!hit) return;
    dragRef.current = {
      startPlant: { ...plant },
      startHit: { x: hit.x, z: hit.z },
    };
    setDragging(true);
  };

  useFrame(() => {
    const drag = dragRef.current;
    if (!drag) return;
    raycaster.setFromCamera(pointer, camera);
    const hit = new Vector3();
    if (!raycaster.ray.intersectPlane(GROUND, hit)) return;
    const dxM = hit.x - drag.startHit.x;
    const dzM = hit.z - drag.startHit.z;
    updatePlant(plant.id, {
      x: drag.startPlant.x + dxM / CM_TO_M,
      y: drag.startPlant.y + dzM / CM_TO_M,
    });
  });

  useEffect(() => {
    const up = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      setDragging(false);
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [setDragging]);

  return (
    <group
      position={[plant.x * CM_TO_M, baseY, plant.y * CM_TO_M]}
      onPointerDown={beginDrag}
    >
      {tomato ? (
        <TomatoPlant
          structure={tomato}
          stage={stage}
          hasStake={TOMATO_STAGE_SPECS[stage].hasStake}
        />
      ) : (
        <>
          <mesh position={[0, heightM / 2, 0]} castShadow>
            <cylinderGeometry args={[stemR, stemR, heightM, 8]} />
            <meshStandardMaterial color={spec.stemColor} />
          </mesh>
          <mesh position={[0, heightM * 0.7, 0]} castShadow>
            <sphereGeometry args={[canopyR, 16, 12]} />
            <meshStandardMaterial color={spec.foliageColor} roughness={0.9} />
            <Edges
              threshold={1}
              color={outline}
              lineWidth={selected ? 2 : 0.5}
            />
          </mesh>
          <mesh
            position={[canopyR * 0.4, heightM * 0.65, canopyR * 0.2]}
            castShadow
          >
            <sphereGeometry args={[canopyR * 0.22, 12, 10]} />
            <meshStandardMaterial color={spec.fruitColor} />
          </mesh>
          <mesh
            position={[-canopyR * 0.3, heightM * 0.8, -canopyR * 0.3]}
            castShadow
          >
            <sphereGeometry args={[canopyR * 0.18, 12, 10]} />
            <meshStandardMaterial color={spec.fruitColor} />
          </mesh>
        </>
      )}
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[canopyR * 0.9, canopyR, 32]} />
          <meshBasicMaterial color="#fb923c" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );
}

export function Plants() {
  const plants = usePlannerStore((s) => s.plants);
  const selectedId = usePlannerStore((s) => s.selectedId);
  return (
    <>
      {plants.map((p) => (
        <PlantMesh key={p.id} plant={p} selected={p.id === selectedId} />
      ))}
    </>
  );
}

export function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 3]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <hemisphereLight args={["#fef3c7", "#3f6212", 0.3]} />
    </>
  );
}
