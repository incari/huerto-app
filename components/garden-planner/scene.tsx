"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import { Edges, Grid } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  Group,
  LatheGeometry,
  Plane,
  Vector2,
  Vector3,
  type Camera,
  type Raycaster,
} from "three";
import {
  clampBedToPlot,
  clampIrrigationToPlot,
  clampPlantToPlot,
  usePlannerStore,
} from "./store";
import {
  Bed,
  DEFAULT_DRIP_DROP_RADIUS_CM,
  DEFAULT_DRIP_SPACING_CM,
  DEFAULT_PLANT_STAGE,
  Irrigation,
  PLANT_KIND_SPECS,
  PLANT_STAGE_SPECS,
  PlantItem,
  PlantKind,
  PlantStage,
  PlantStageSpec,
  Plot,
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

const HIT_SCRATCH = new Vector3();
type DragTickCtx = {
  raycaster: Raycaster;
  pointer: Vector2;
  camera: Camera;
  hit: Vector3;
};
type DragTick = (ctx: DragTickCtx) => void;
let activeDragTick: DragTick | null = null;
function setActiveDragTick(fn: DragTick | null) {
  activeDragTick = fn;
}

export function DragController() {
  const raycaster = useThree((s) => s.raycaster);
  const pointer = useThree((s) => s.pointer);
  const camera = useThree((s) => s.camera);
  useFrame(() => {
    if (!activeDragTick) return;
    raycaster.setFromCamera(pointer, camera);
    if (!raycaster.ray.intersectPlane(GROUND, HIT_SCRATCH)) return;
    activeDragTick({ raycaster, pointer, camera, hit: HIT_SCRATCH });
  });
  return null;
}

export function ShadowOptimizer() {
  const gl = useThree((s) => s.gl);
  const isDragging = usePlannerStore((s) => s.isDragging);
  useEffect(() => {
    if (!gl?.shadowMap) return;
    if (isDragging) {
      gl.shadowMap.autoUpdate = false;
    } else {
      gl.shadowMap.autoUpdate = true;
      gl.shadowMap.needsUpdate = true;
    }
  }, [isDragging, gl]);
  return null;
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

function BedMeshImpl({ bed, selected }: BedMeshProps) {
  const select = usePlannerStore((s) => s.select);
  const toggleSelection = usePlannerStore((s) => s.toggleSelection);
  const updateBed = usePlannerStore((s) => s.updateBed);
  const translateItems = usePlannerStore((s) => s.translateItems);
  const setDragging = usePlannerStore((s) => s.setDragging);
  const pauseHistory = usePlannerStore((s) => s.pauseHistory);
  const commitHistory = usePlannerStore((s) => s.commitHistory);
  const mode = usePlannerStore((s) => s.mode);
  const cameraMode = usePlannerStore((s) => s.camera);
  const lockBeds = usePlannerStore((s) => s.lockBeds);
  const isLocked = bed.locked === true || lockBeds;

  const groupRef = useRef<Group>(null);
  const dragRef = useRef<
    | (DragState & {
        multiIds?: string[];
        lastDxCm?: number;
        lastDyCm?: number;
      })
    | null
  >(null);

  const w = bed.widthCm * CM_TO_M;
  const d = bed.depthCm * CM_TO_M;
  const h = bed.heightCm * CM_TO_M;

  const beginDrag = (
    e: ThreeEvent<PointerEvent>,
    kind: "move" | "resize",
    handle?: HandleId,
  ) => {
    e.stopPropagation();
    if (e.nativeEvent.shiftKey && kind === "move") {
      toggleSelection(bed.id);
      return;
    }
    select(bed.id);
    const s = usePlannerStore.getState();
    if (s.lockBeds || bed.locked) return;
    const hit = intersectGround(e);
    if (!hit) return;
    const ids = s.selectedIds.includes(bed.id) ? s.selectedIds : [bed.id];
    const multiIds = kind === "move" && ids.length > 1 ? ids : undefined;
    dragRef.current = {
      kind,
      handle,
      startBed: { ...bed },
      startHit: { x: hit.x, z: hit.z },
      lastX: bed.x,
      lastY: bed.y,
      multiIds,
      lastDxCm: 0,
      lastDyCm: 0,
    };
    pauseHistory();
    setDragging(true);
    setActiveDragTick(({ hit }) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dxM = hit.x - drag.startHit.x;
      const dzM = hit.z - drag.startHit.z;
      if (drag.kind === "move") {
        if (drag.multiIds) {
          const dxCm = dxM / CM_TO_M;
          const dyCm = dzM / CM_TO_M;
          const stepX = dxCm - (drag.lastDxCm ?? 0);
          const stepY = dyCm - (drag.lastDyCm ?? 0);
          drag.lastDxCm = dxCm;
          drag.lastDyCm = dyCm;
          if (stepX !== 0 || stepY !== 0) {
            translateItems(drag.multiIds, stepX, stepY);
          }
          return;
        }
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
        const clamped = clampBedToPlot(
          { ...drag.startBed, x: candX, y: candY },
          state.plot,
        );
        drag.lastX = clamped.x;
        drag.lastY = clamped.y;
        if (groupRef.current) {
          groupRef.current.position.x = clamped.x * CM_TO_M;
          groupRef.current.position.z = clamped.y * CM_TO_M;
        }
        return;
      }
      if (drag.kind === "resize" && drag.handle) {
        applyResize(drag, dxM, dzM, (patch) => updateBed(bed.id, patch));
      }
    });
  };

  useEffect(() => {
    const up = () => {
      const drag = dragRef.current;
      if (!drag) return;
      const wasSingleMove = drag.kind === "move" && !drag.multiIds;
      const finalX = drag.lastX;
      const finalY = drag.lastY;
      dragRef.current = null;
      setActiveDragTick(null);
      setDragging(false);
      if (
        wasSingleMove &&
        (finalX !== drag.startBed.x || finalY !== drag.startBed.y)
      ) {
        updateBed(bed.id, { x: finalX, y: finalY });
      }
      commitHistory();
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [setDragging, commitHistory, updateBed, bed.id]);

  const showHandles =
    selected && mode === "design" && cameraMode === "2d" && !isLocked;
  const handleSize = 0.12;
  const selectColor = isLocked ? "#64748b" : "#c2410c";
  const edgeColor = selected ? (isLocked ? "#fbbf24" : "#fb923c") : "#1f2937";

  return (
    <group
      ref={groupRef}
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
          color={selected ? selectColor : "#8b5a2b"}
          roughness={0.9}
        />
        <Edges
          threshold={1}
          color={edgeColor}
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

const BedMesh = memo(BedMeshImpl);

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
  const selectedIds = usePlannerStore((s) => s.selectedIds);
  return (
    <>
      {beds.map((b) => (
        <BedMesh key={b.id} bed={b} selected={selectedIds.includes(b.id)} />
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

function IrrigationMeshImpl({ irr, selected }: IrrigationMeshProps) {
  const select = usePlannerStore((s) => s.select);
  const toggleSelection = usePlannerStore((s) => s.toggleSelection);
  const updateIrrigation = usePlannerStore((s) => s.updateIrrigation);
  const translateItems = usePlannerStore((s) => s.translateItems);
  const setDragging = usePlannerStore((s) => s.setDragging);
  const pauseHistory = usePlannerStore((s) => s.pauseHistory);
  const commitHistory = usePlannerStore((s) => s.commitHistory);
  const cameraMode = usePlannerStore((s) => s.camera);
  const beds = usePlannerStore((s) => s.beds);
  const lockIrrigations = usePlannerStore((s) => s.lockIrrigations);
  const isLocked = irr.locked === true || lockIrrigations;

  const groupRef = useRef<Group>(null);
  const dragRef = useRef<{
    startIrr: Irrigation;
    startHit: { x: number; z: number };
    multiIds?: string[];
    lastDxCm: number;
    lastDyCm: number;
    lastX: number;
    lastY: number;
  } | null>(null);

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
    if (e.nativeEvent.shiftKey) {
      toggleSelection(irr.id);
      return;
    }
    select(irr.id);
    const s = usePlannerStore.getState();
    if (s.lockIrrigations || irr.locked) return;
    const hit = intersectGround(e);
    if (!hit) return;
    const ids = s.selectedIds.includes(irr.id) ? s.selectedIds : [irr.id];
    dragRef.current = {
      startIrr: { ...irr },
      startHit: { x: hit.x, z: hit.z },
      multiIds: ids.length > 1 ? ids : undefined,
      lastDxCm: 0,
      lastDyCm: 0,
      lastX: irr.x,
      lastY: irr.y,
    };
    pauseHistory();
    setDragging(true);
    setActiveDragTick(({ hit }) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dxM = hit.x - drag.startHit.x;
      const dzM = hit.z - drag.startHit.z;
      const dxCm = dxM / CM_TO_M;
      const dyCm = dzM / CM_TO_M;
      if (drag.multiIds) {
        const stepX = dxCm - drag.lastDxCm;
        const stepY = dyCm - drag.lastDyCm;
        drag.lastDxCm = dxCm;
        drag.lastDyCm = dyCm;
        if (stepX !== 0 || stepY !== 0) {
          translateItems(drag.multiIds, stepX, stepY);
        }
        return;
      }
      const state = usePlannerStore.getState();
      const clamped = clampIrrigationToPlot(
        {
          ...drag.startIrr,
          x: drag.startIrr.x + dxCm,
          y: drag.startIrr.y + dyCm,
        },
        state.plot,
      );
      drag.lastX = clamped.x;
      drag.lastY = clamped.y;
      if (groupRef.current) {
        groupRef.current.position.x = clamped.x * CM_TO_M;
        groupRef.current.position.z = clamped.y * CM_TO_M;
        groupRef.current.position.y = irrigationBaseY(
          { ...drag.startIrr, x: clamped.x, y: clamped.y },
          state.beds,
        );
      }
    });
  };

  useEffect(() => {
    const up = () => {
      const drag = dragRef.current;
      if (!drag) return;
      const wasSingleMove = !drag.multiIds;
      const finalX = drag.lastX;
      const finalY = drag.lastY;
      dragRef.current = null;
      setActiveDragTick(null);
      setDragging(false);
      if (
        wasSingleMove &&
        (finalX !== drag.startIrr.x || finalY !== drag.startIrr.y)
      ) {
        updateIrrigation(irr.id, { x: finalX, y: finalY });
      }
      commitHistory();
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [setDragging, commitHistory, updateIrrigation, irr.id]);

  const outline = selected ? (isLocked ? "#fbbf24" : "#fb923c") : color;
  const emitterY = cameraMode === "2d" ? 0.02 : 0.1;

  return (
    <group
      ref={groupRef}
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

const IrrigationMesh = memo(IrrigationMeshImpl);

export function Irrigations() {
  const irrigations = usePlannerStore((s) => s.irrigations);
  const selectedIds = usePlannerStore((s) => s.selectedIds);
  return (
    <>
      {irrigations.map((i) => (
        <IrrigationMesh
          key={i.id}
          irr={i}
          selected={selectedIds.includes(i.id)}
        />
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
  const spec = PLANT_STAGE_SPECS.tomato[stage];
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
  for (let i = 0; i < spec.leafCount; i++) {
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

interface KindRenderProps {
  id: string;
  stage: PlantStage;
  spec: PlantStageSpec;
  fruitColor: string;
  heightM: number;
  canopyR: number;
}

let PEPPER_UNIT_GEOM: LatheGeometry | null = null;
function getPepperUnitGeom(): LatheGeometry {
  if (PEPPER_UNIT_GEOM) return PEPPER_UNIT_GEOM;
  // Profile along Y from tip (-1) to shoulder (0). Revolved around Y axis.
  // Slight lobed bell-pepper silhouette with a pinched shoulder.
  const pts: Vector2[] = [
    new Vector2(0.0, -1.0),
    new Vector2(0.18, -0.92),
    new Vector2(0.32, -0.78),
    new Vector2(0.42, -0.6),
    new Vector2(0.47, -0.4),
    new Vector2(0.48, -0.2),
    new Vector2(0.46, -0.05),
    new Vector2(0.42, 0.05),
    new Vector2(0.36, 0.12),
    new Vector2(0.3, 0.14),
  ];
  PEPPER_UNIT_GEOM = new LatheGeometry(pts, 16);
  return PEPPER_UNIT_GEOM;
}

interface PepperFruitProps {
  size: number;
  color: string;
  elongation?: number;
  tilt?: number;
  azimuth?: number;
}

function PepperFruit({
  size,
  color,
  elongation = 1,
  tilt = 0,
  azimuth = 0,
}: PepperFruitProps) {
  const geom = getPepperUnitGeom();
  // Unit profile spans y in [-1, 0.14]; total length ~1.14. Scale to size.
  const capR = size * 0.12;
  const stalkLen = size * 0.28;
  return (
    <group rotation={[0, azimuth, tilt]}>
      <mesh
        geometry={geom}
        scale={[size * 0.55, size * elongation, size * 0.55]}
        castShadow
      >
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
      </mesh>
      <mesh position={[0, size * 0.16, 0]} castShadow>
        <cylinderGeometry args={[capR, capR * 1.3, size * 0.1, 8]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.85} />
      </mesh>
      <mesh position={[0, size * 0.16 + stalkLen / 2, 0]} castShadow>
        <cylinderGeometry args={[capR * 0.45, capR * 0.55, stalkLen, 6]} />
        <meshStandardMaterial color="#65a30d" roughness={0.9} />
      </mesh>
    </group>
  );
}

function BushyPlant({
  id,
  stage,
  spec,
  fruitColor,
  heightM,
  canopyR,
  fruitShape,
}: KindRenderProps & { fruitShape: "sphere" | "oval" | "pepper" }) {
  const rnd = useMemo(
    () => mulberry32(hashSeed(id) ^ (stage * 0x85ebca77)),
    [id, stage],
  );
  const stemR =
    stage === 1 ? 0.006 : stage === 2 ? 0.008 : stage === 3 ? 0.011 : 0.014;
  const branches = useMemo(() => {
    const out: { azimuth: number; tilt: number; length: number }[] = [];
    for (let i = 0; i < spec.branchCount; i++) {
      out.push({
        azimuth:
          i * ((Math.PI * 2) / Math.max(1, spec.branchCount)) + rnd() * 0.5,
        tilt: 0.7 + rnd() * 0.35,
        length: canopyR * (0.8 + rnd() * 0.35),
      });
    }
    return out;
  }, [rnd, spec.branchCount, canopyR]);
  const fruits = useMemo(() => {
    const out: {
      azimuth: number;
      t: number;
      size: number;
      spin: number;
      tilt: number;
      elongation: number;
    }[] = [];
    for (let i = 0; i < spec.fruitCount; i++) {
      out.push({
        azimuth: rnd() * Math.PI * 2,
        t: 0.55 + rnd() * 0.35,
        size: 0.04 + rnd() * 0.025,
        spin: rnd() * Math.PI * 2,
        tilt: (rnd() - 0.5) * 0.6,
        elongation: 0.9 + rnd() * 0.35,
      });
    }
    return out;
  }, [rnd, spec.fruitCount]);
  return (
    <group>
      {spec.hasStake && (
        <mesh position={[-0.02, heightM * 0.52, 0]} castShadow>
          <cylinderGeometry args={[0.006, 0.006, heightM * 1.04, 6]} />
          <meshStandardMaterial color={STAKE_COLOR} roughness={0.95} />
        </mesh>
      )}
      <mesh position={[0, heightM / 2, 0]} castShadow>
        <cylinderGeometry args={[stemR * 0.7, stemR, heightM, 8]} />
        <meshStandardMaterial color={STEM_GREEN} roughness={0.9} />
      </mesh>
      {branches.map((b, i) => (
        <group
          key={`bb-${i}`}
          position={[0, heightM * (0.55 + (i % 3) * 0.1), 0]}
          rotation={[0, b.azimuth, 0]}
        >
          <group rotation={[0, 0, -b.tilt]}>
            <mesh position={[0, b.length / 2, 0]} castShadow>
              <cylinderGeometry
                args={[stemR * 0.5, stemR * 0.6, b.length, 6]}
              />
              <meshStandardMaterial color={STEM_GREEN} roughness={0.9} />
            </mesh>
            <group
              position={[0, b.length * 0.9, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <Leaf scale={0.9} />
            </group>
          </group>
        </group>
      ))}
      {fruits.map((f, i) => {
        const x = Math.cos(f.azimuth) * canopyR * 0.55;
        const z = Math.sin(f.azimuth) * canopyR * 0.55;
        const y = heightM * f.t;
        if (fruitShape === "pepper") {
          return (
            <group key={`fr-${i}`} position={[x, y, z]}>
              <PepperFruit
                size={f.size}
                color={fruitColor}
                elongation={f.elongation}
                tilt={f.tilt}
                azimuth={f.spin}
              />
            </group>
          );
        }
        if (fruitShape === "oval") {
          return (
            <group
              key={`fr-${i}`}
              position={[x, y, z]}
              rotation={[f.tilt, f.spin, 0]}
            >
              <mesh
                scale={[0.75, 1.55, 0.75]}
                position={[0, -f.size * 0.4, 0]}
                castShadow
              >
                <sphereGeometry args={[f.size * 0.55, 16, 12]} />
                <meshStandardMaterial color={fruitColor} roughness={0.25} />
              </mesh>
              <mesh position={[0, 0, 0]} castShadow>
                <coneGeometry args={[f.size * 0.35, f.size * 0.25, 6]} />
                <meshStandardMaterial color="#4d7c0f" roughness={0.85} />
              </mesh>
            </group>
          );
        }
        return (
          <mesh key={`fr-${i}`} position={[x, y, z]} castShadow>
            <sphereGeometry args={[f.size * 0.5, 12, 10]} />
            <meshStandardMaterial color={fruitColor} roughness={0.35} />
          </mesh>
        );
      })}
    </group>
  );
}

function VineClimbPlant({
  id,
  stage,
  spec,
  fruitColor,
  heightM,
  canopyR,
  podShape,
}: KindRenderProps & { podShape: "long" | "flat" }) {
  const rnd = useMemo(
    () => mulberry32(hashSeed(id) ^ (stage * 0xc2b2ae35)),
    [id, stage],
  );
  const stemR = 0.006 + stage * 0.002;
  const leaves = useMemo(() => {
    const out: { t: number; azimuth: number; scale: number }[] = [];
    for (let i = 0; i < spec.leafCount; i++) {
      out.push({
        t:
          0.1 + (i / Math.max(1, spec.leafCount)) * 0.85 + (rnd() - 0.5) * 0.05,
        azimuth: rnd() * Math.PI * 2,
        scale: 0.7 + rnd() * 0.5,
      });
    }
    return out;
  }, [rnd, spec.leafCount]);
  const fruits = useMemo(() => {
    const out: { t: number; azimuth: number; length: number }[] = [];
    for (let i = 0; i < spec.fruitCount; i++) {
      out.push({
        t: 0.4 + rnd() * 0.4,
        azimuth: rnd() * Math.PI * 2,
        length: podShape === "long" ? 0.09 + rnd() * 0.05 : 0.06 + rnd() * 0.03,
      });
    }
    return out;
  }, [rnd, spec.fruitCount, podShape]);
  return (
    <group>
      {spec.hasStake && (
        <mesh position={[0, heightM * 0.52, 0]} castShadow>
          <cylinderGeometry args={[0.007, 0.007, heightM * 1.04, 6]} />
          <meshStandardMaterial color={STAKE_COLOR} roughness={0.95} />
        </mesh>
      )}
      <mesh position={[0, heightM / 2, 0]} castShadow>
        <cylinderGeometry args={[stemR * 0.7, stemR, heightM, 8]} />
        <meshStandardMaterial color={STEM_GREEN} roughness={0.85} />
      </mesh>
      {leaves.map((l, i) => (
        <group
          key={`vl-${i}`}
          position={[0, l.t * heightM, 0]}
          rotation={[0, l.azimuth, 0]}
        >
          <group position={[canopyR * 0.35, 0, 0]} rotation={[0, 0, -0.7]}>
            <Leaf scale={l.scale} />
          </group>
        </group>
      ))}
      {fruits.map((f, i) => {
        const x = Math.cos(f.azimuth) * canopyR * 0.3;
        const z = Math.sin(f.azimuth) * canopyR * 0.3;
        return (
          <group
            key={`vf-${i}`}
            position={[x, f.t * heightM, z]}
            rotation={[0, f.azimuth, 0]}
          >
            <mesh
              castShadow
              scale={podShape === "long" ? [0.5, 1.6, 0.5] : [1, 1.4, 0.3]}
            >
              <cylinderGeometry args={[0.012, 0.012, f.length, 8]} />
              <meshStandardMaterial color={fruitColor} roughness={0.45} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function RootBulbPlant({
  id,
  stage,
  spec,
  heightM,
  canopyR,
  bulbColor,
  bladeColor,
}: KindRenderProps & { bulbColor: string; bladeColor: string }) {
  const rnd = useMemo(
    () => mulberry32(hashSeed(id) ^ (stage * 0xa24b1f49)),
    [id, stage],
  );
  const blades = useMemo(() => {
    const out: { azimuth: number; bend: number; length: number }[] = [];
    const count = Math.max(3, spec.leafCount);
    for (let i = 0; i < count; i++) {
      out.push({
        azimuth: i * ((Math.PI * 2) / count) + rnd() * 0.3,
        bend: 0.15 + rnd() * 0.3,
        length: heightM * (0.7 + rnd() * 0.35),
      });
    }
    return out;
  }, [rnd, spec.leafCount, heightM]);
  const bulbR =
    canopyR *
    (stage === 1 ? 0.25 : stage === 2 ? 0.45 : stage === 3 ? 0.75 : 1);
  return (
    <group>
      <mesh position={[0, bulbR * 0.75, 0]} castShadow>
        <sphereGeometry args={[bulbR, 14, 10]} />
        <meshStandardMaterial color={bulbColor} roughness={0.8} />
      </mesh>
      {blades.map((b, i) => (
        <group
          key={`bl-${i}`}
          position={[0, bulbR, 0]}
          rotation={[b.bend, b.azimuth, 0]}
        >
          <mesh position={[0, b.length / 2, 0]} castShadow>
            <cylinderGeometry args={[0.004, 0.008, b.length, 6]} />
            <meshStandardMaterial color={bladeColor} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function LeafRosettePlant({
  id,
  stage,
  spec,
  heightM,
  canopyR,
}: KindRenderProps) {
  const rnd = useMemo(
    () => mulberry32(hashSeed(id) ^ (stage * 0x7f4a7c15)),
    [id, stage],
  );
  const leaves = useMemo(() => {
    const out: {
      azimuth: number;
      tilt: number;
      scale: number;
      layer: number;
    }[] = [];
    const layers = Math.min(3, Math.max(1, Math.ceil(spec.leafCount / 6)));
    for (let i = 0; i < spec.leafCount; i++) {
      const layer = i % layers;
      out.push({
        azimuth: rnd() * Math.PI * 2,
        tilt: 0.9 - layer * 0.25 + rnd() * 0.15,
        scale: (1 - layer * 0.2) * (0.8 + rnd() * 0.3),
        layer,
      });
    }
    return out;
  }, [rnd, spec.leafCount]);
  return (
    <group>
      {leaves.map((l, i) => (
        <group
          key={`ro-${i}`}
          position={[0, heightM * (0.15 + l.layer * 0.25), 0]}
          rotation={[0, l.azimuth, 0]}
        >
          <group rotation={[0, 0, -l.tilt]}>
            <mesh
              castShadow
              position={[canopyR * 0.5, 0, 0]}
              scale={[canopyR * 1.4 * l.scale, 0.015, canopyR * 0.9 * l.scale]}
            >
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial color={LEAF_LIGHT} roughness={0.9} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

function BerryGroundPlant({
  id,
  stage,
  spec,
  fruitColor,
  heightM,
  canopyR,
}: KindRenderProps) {
  const rnd = useMemo(
    () => mulberry32(hashSeed(id) ^ (stage * 0x3b9aca07)),
    [id, stage],
  );
  const leaves = useMemo(() => {
    const out: { azimuth: number; scale: number }[] = [];
    for (let i = 0; i < spec.leafCount; i++) {
      out.push({ azimuth: rnd() * Math.PI * 2, scale: 0.7 + rnd() * 0.5 });
    }
    return out;
  }, [rnd, spec.leafCount]);
  const berries = useMemo(() => {
    const out: { azimuth: number; r: number; ripe: boolean; size: number }[] =
      [];
    for (let i = 0; i < spec.fruitCount; i++) {
      out.push({
        azimuth: rnd() * Math.PI * 2,
        r: canopyR * (0.2 + rnd() * 0.55),
        ripe: rnd() < spec.ripeness,
        size: 0.012 + rnd() * 0.006,
      });
    }
    return out;
  }, [rnd, spec.fruitCount, canopyR, spec.ripeness]);
  return (
    <group>
      {leaves.map((l, i) => (
        <group
          key={`br-${i}`}
          position={[0, heightM * 0.2, 0]}
          rotation={[0, l.azimuth, 0]}
        >
          <group position={[canopyR * 0.45, 0, 0]} rotation={[0, 0, -1]}>
            <Leaf scale={l.scale} />
          </group>
        </group>
      ))}
      {berries.map((b, i) => {
        const x = Math.cos(b.azimuth) * b.r;
        const z = Math.sin(b.azimuth) * b.r;
        return (
          <mesh
            key={`be-${i}`}
            position={[x, heightM * 0.35, z]}
            castShadow
            scale={[1, 1.2, 1]}
          >
            <sphereGeometry args={[b.size, 10, 8]} />
            <meshStandardMaterial
              color={b.ripe ? fruitColor : "#86efac"}
              roughness={0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function SprawlPlant({
  id,
  stage,
  spec,
  fruitColor,
  heightM,
  canopyR,
}: KindRenderProps) {
  const rnd = useMemo(
    () => mulberry32(hashSeed(id) ^ (stage * 0x5d588b65)),
    [id, stage],
  );
  const leaves = useMemo(() => {
    const out: { azimuth: number; r: number; scale: number }[] = [];
    for (let i = 0; i < spec.leafCount; i++) {
      out.push({
        azimuth: rnd() * Math.PI * 2,
        r: canopyR * (0.3 + rnd() * 0.65),
        scale: 1.2 + rnd() * 0.6,
      });
    }
    return out;
  }, [rnd, spec.leafCount, canopyR]);
  const pumpkins = useMemo(() => {
    const out: { azimuth: number; r: number; size: number }[] = [];
    for (let i = 0; i < spec.fruitCount; i++) {
      out.push({
        azimuth: rnd() * Math.PI * 2,
        r: canopyR * (0.25 + rnd() * 0.5),
        size: 0.06 + rnd() * 0.04,
      });
    }
    return out;
  }, [rnd, spec.fruitCount, canopyR]);
  return (
    <group>
      {leaves.map((l, i) => {
        const x = Math.cos(l.azimuth) * l.r;
        const z = Math.sin(l.azimuth) * l.r;
        return (
          <group
            key={`sl-${i}`}
            position={[x, heightM * 0.25, z]}
            rotation={[0, l.azimuth, 0]}
          >
            <Leaf scale={l.scale} />
          </group>
        );
      })}
      {pumpkins.map((p, i) => {
        const x = Math.cos(p.azimuth) * p.r;
        const z = Math.sin(p.azimuth) * p.r;
        return (
          <mesh
            key={`pk-${i}`}
            position={[x, p.size * 0.85, z]}
            castShadow
            scale={[1, 0.75, 1]}
          >
            <sphereGeometry args={[p.size, 14, 12]} />
            <meshStandardMaterial color={fruitColor} roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

interface KindDispatchProps {
  plant: PlantItem;
  stage: PlantStage;
  spec: PlantStageSpec;
  fruitColor: string;
  heightM: number;
  canopyR: number;
}

function KindDispatch({
  plant,
  stage,
  spec,
  fruitColor,
  heightM,
  canopyR,
}: KindDispatchProps) {
  const kindSpec = PLANT_KIND_SPECS[plant.kind];
  const shared: KindRenderProps = {
    id: plant.id,
    stage,
    spec,
    fruitColor,
    heightM,
    canopyR,
  };
  switch (plant.kind) {
    case "pepper-red":
    case "pepper-green":
    case "pepper-yellow":
      return <BushyPlant {...shared} fruitShape="pepper" />;
    case "eggplant":
      return <BushyPlant {...shared} fruitShape="oval" />;
    case "beans":
    case "cucumber":
      return <VineClimbPlant {...shared} podShape="long" />;
    case "onion":
    case "garlic":
      return (
        <RootBulbPlant
          {...shared}
          bulbColor={fruitColor}
          bladeColor={kindSpec.foliageColor}
        />
      );
    case "lettuce":
      return <LeafRosettePlant {...shared} />;
    case "strawberry":
      return <BerryGroundPlant {...shared} />;
    case "pumpkin":
      return <SprawlPlant {...shared} />;
    default:
      return null;
  }
}

interface PlantMeshProps {
  plant: PlantItem;
  selected: boolean;
}

function PlantMeshImpl({ plant, selected }: PlantMeshProps) {
  const select = usePlannerStore((s) => s.select);
  const toggleSelection = usePlannerStore((s) => s.toggleSelection);
  const updatePlant = usePlannerStore((s) => s.updatePlant);
  const translateItems = usePlannerStore((s) => s.translateItems);
  const setDragging = usePlannerStore((s) => s.setDragging);
  const pauseHistory = usePlannerStore((s) => s.pauseHistory);
  const commitHistory = usePlannerStore((s) => s.commitHistory);
  const beds = usePlannerStore((s) => s.beds);
  const lockPlants = usePlannerStore((s) => s.lockPlants);
  const isLocked = plant.locked === true || lockPlants;

  const groupRef = useRef<Group>(null);
  const dragRef = useRef<{
    startPlant: PlantItem;
    startHit: { x: number; z: number };
    multiIds?: string[];
    lastDxCm: number;
    lastDyCm: number;
    lastX: number;
    lastY: number;
  } | null>(null);

  const spec = PLANT_KIND_SPECS[plant.kind];
  const baseY = bedTopAtPoint(beds, plant.x, plant.y);
  const stage: PlantStage = plant.stage ?? DEFAULT_PLANT_STAGE;
  const stageTable = PLANT_STAGE_SPECS[plant.kind];
  const stageSpec = stageTable ? stageTable[stage] : undefined;
  const tomato = useMemo(
    () => (plant.kind === "tomato" ? buildTomato(plant.id, stage) : null),
    [plant.id, plant.kind, stage],
  );
  const heightM = tomato
    ? tomato.heightM
    : stageSpec
      ? stageSpec.heightCm * CM_TO_M
      : 0;
  const canopyR = tomato
    ? tomato.canopyR
    : stageSpec
      ? (stageSpec.canopyCm / 2) * CM_TO_M
      : 0;

  const beginDrag = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.nativeEvent.shiftKey) {
      toggleSelection(plant.id);
      return;
    }
    select(plant.id);
    const s = usePlannerStore.getState();
    if (s.lockPlants || plant.locked) return;
    const hit = intersectGround(e);
    if (!hit) return;
    const ids = s.selectedIds.includes(plant.id) ? s.selectedIds : [plant.id];
    dragRef.current = {
      startPlant: { ...plant },
      startHit: { x: hit.x, z: hit.z },
      multiIds: ids.length > 1 ? ids : undefined,
      lastDxCm: 0,
      lastDyCm: 0,
      lastX: plant.x,
      lastY: plant.y,
    };
    pauseHistory();
    setDragging(true);
    setActiveDragTick(({ hit }) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dxM = hit.x - drag.startHit.x;
      const dzM = hit.z - drag.startHit.z;
      const dxCm = dxM / CM_TO_M;
      const dyCm = dzM / CM_TO_M;
      if (drag.multiIds) {
        const stepX = dxCm - drag.lastDxCm;
        const stepY = dyCm - drag.lastDyCm;
        drag.lastDxCm = dxCm;
        drag.lastDyCm = dyCm;
        if (stepX !== 0 || stepY !== 0) {
          translateItems(drag.multiIds, stepX, stepY);
        }
        return;
      }
      const state = usePlannerStore.getState();
      const clamped = clampPlantToPlot(
        {
          ...drag.startPlant,
          x: drag.startPlant.x + dxCm,
          y: drag.startPlant.y + dyCm,
        },
        state.plot,
      );
      drag.lastX = clamped.x;
      drag.lastY = clamped.y;
      if (groupRef.current) {
        groupRef.current.position.x = clamped.x * CM_TO_M;
        groupRef.current.position.z = clamped.y * CM_TO_M;
        groupRef.current.position.y = bedTopAtPoint(
          state.beds,
          clamped.x,
          clamped.y,
        );
      }
    });
  };

  useEffect(() => {
    const up = () => {
      const drag = dragRef.current;
      if (!drag) return;
      const wasSingleMove = !drag.multiIds;
      const finalX = drag.lastX;
      const finalY = drag.lastY;
      dragRef.current = null;
      setActiveDragTick(null);
      setDragging(false);
      if (
        wasSingleMove &&
        (finalX !== drag.startPlant.x || finalY !== drag.startPlant.y)
      ) {
        updatePlant(plant.id, { x: finalX, y: finalY });
      }
      commitHistory();
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [setDragging, commitHistory, updatePlant, plant.id]);

  if (!spec || !stageSpec) return null;

  return (
    <group
      ref={groupRef}
      position={[plant.x * CM_TO_M, baseY, plant.y * CM_TO_M]}
      onPointerDown={beginDrag}
    >
      {tomato ? (
        <TomatoPlant
          structure={tomato}
          stage={stage}
          hasStake={stageSpec.hasStake}
        />
      ) : (
        <KindDispatch
          plant={plant}
          stage={stage}
          spec={stageSpec}
          fruitColor={spec.fruitColor}
          heightM={heightM}
          canopyR={canopyR}
        />
      )}
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[canopyR * 0.9, canopyR, 32]} />
          <meshBasicMaterial
            color={isLocked ? "#fbbf24" : "#fb923c"}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}
    </group>
  );
}

const PlantMesh = memo(PlantMeshImpl);

export function Plants() {
  const plants = usePlannerStore((s) => s.plants);
  const selectedIds = usePlannerStore((s) => s.selectedIds);
  return (
    <>
      {plants.map((p) => (
        <PlantMesh key={p.id} plant={p} selected={selectedIds.includes(p.id)} />
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
