"use client";

import {
  OrthographicCamera,
  PerspectiveCamera,
  OrbitControls,
} from "@react-three/drei";
import { usePlannerStore } from "./store";

export function PlannerCameras() {
  const camera = usePlannerStore((s) => s.camera);
  const plot = usePlannerStore((s) => s.plot);
  const isDragging = usePlannerStore((s) => s.isDragging);
  const size = Math.max(plot.widthCm, plot.depthCm) * 0.01;

  if (camera === "2d") {
    return (
      <>
        <OrthographicCamera
          makeDefault
          position={[0, 20, 0]}
          zoom={Math.min(80, 600 / size)}
          near={0.1}
          far={100}
        />
        <OrbitControls
          makeDefault
          enableRotate={false}
          enablePan={!isDragging}
          enableZoom
          mouseButtons={{
            LEFT: 2,
            MIDDLE: 1,
            RIGHT: 2,
          }}
          screenSpacePanning
        />
      </>
    );
  }

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[size * 1.2, size * 1.1, size * 1.2]}
        fov={45}
        near={0.1}
        far={200}
      />
      <OrbitControls
        makeDefault
        enablePan={!isDragging}
        enableZoom
        enableRotate={!isDragging}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={1}
        maxDistance={50}
      />
    </>
  );
}
