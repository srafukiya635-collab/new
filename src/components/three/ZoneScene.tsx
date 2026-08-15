import { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import ZoneModel from "./ZoneModel";
import type { ZoneModelKind } from "@/config/types";

/**
 * Per-model framing. `distance` is the base orbit radius on a wide viewport and
 * `target` lifts the orbit pivot to the visual centre of each model so nothing
 * is cropped at any rotation.
 */
const FRAMING: Record<ZoneModelKind, { distance: number; target: [number, number, number] }> = {
  pc: { distance: 5.2, target: [0, 0.05, 0.2] },
  console: { distance: 4.6, target: [0, 0.1, 0] },
  racing: { distance: 5.0, target: [0, 0.0, 0.1] },
  vr: { distance: 4.0, target: [0, 0.0, 0] },
  arcade: { distance: 5.0, target: [0, -0.05, 0] },
  pool: { distance: 5.0, target: [0, 0.1, 0] },
  arena: { distance: 5.4, target: [0, 0.15, -0.1] },
};

/**
 * Keeps the whole model in frame on every screen size: portrait/narrow
 * viewports orbit from further out, and the camera aspect is refreshed on every
 * resize so the model is never squashed or clipped.
 */
function ResponsiveCamera({
  base,
  controls,
}: {
  base: number;
  controls: React.RefObject<{ minDistance: number; maxDistance: number; update: () => void } | null>;
}) {
  const { camera, size } = useThree();

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    // Narrower/shorter viewports need more distance to fit the same object.
    const fit = aspect < 0.85 ? 1.55 : aspect < 1.2 ? 1.3 : aspect < 1.7 ? 1.1 : 1;
    const distance = base * fit;
    const dir = cam.position.length() > 0.001 ? cam.position.clone().normalize() : new THREE.Vector3(0.5, 0.28, 1).normalize();
    cam.position.copy(dir.multiplyScalar(distance));
    cam.fov = aspect < 0.85 ? 52 : 45;
    cam.near = 0.1;
    cam.far = 100;
    cam.aspect = aspect;
    cam.updateProjectionMatrix();
    if (controls.current) {
      controls.current.minDistance = distance * 0.45;
      controls.current.maxDistance = distance * 2.1;
      controls.current.update();
    }
  }, [base, camera, size.width, size.height, controls]);

  return null;
}

export default function ZoneScene({
  kind,
  primary,
  accent,
  reducedMotion,
  quality,
}: {
  kind: ZoneModelKind;
  primary: string;
  accent: string;
  reducedMotion: boolean;
  quality: "low" | "medium" | "high";
}) {
  const framing = FRAMING[kind] ?? FRAMING.pc;
  const controls = useRef<any>(null);
  const [engaged, setEngaged] = useState(false);

  return (
    <div className="absolute inset-0" style={{ touchAction: "pan-y" }}>
      <Canvas
        dpr={quality === "high" ? [1, 1.75] : [1, 1.4]}
        camera={{ position: [framing.distance * 0.45, framing.distance * 0.26, framing.distance * 0.86], fov: 45 }}
        gl={{ antialias: quality !== "low", alpha: true, powerPreference: "high-performance" }}
        shadows={quality !== "low"}
        style={{ background: "transparent", touchAction: "pan-y", width: "100%", height: "100%" }}
        resize={{ scroll: false, debounce: 80 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
        }}
      >
        {/* Base fill so materials are never pure black from any angle */}
        <ambientLight intensity={0.9} />
        <hemisphereLight args={["#ffffff", "#1a1c26", 0.85]} />
        <directionalLight
          position={[3, 5, 4]}
          intensity={1.5}
          castShadow={quality !== "low"}
          shadow-mapSize={[1024, 1024]}
        />
        {/* Rim light from behind keeps back-facing views readable */}
        <directionalLight position={[-3, 2, -5]} intensity={0.8} color={accent} />
        <pointLight position={[3, 3, 3]} intensity={34} color={primary} distance={18} decay={2} />
        <pointLight position={[-3, -1, 2]} intensity={26} color={accent} distance={18} decay={2} />

        <group position={[0, 0, 0]}>
          <ZoneModel kind={kind} primary={primary} accent={accent} spin={0} />
        </group>

        {quality !== "low" && (
          <ContactShadows
            position={[0, -1.15, 0]}
            opacity={0.5}
            scale={9}
            blur={2.6}
            far={4}
            color="#000000"
          />
        )}

        <ResponsiveCamera base={framing.distance} controls={controls} />
        <OrbitControls
          ref={controls}
          target={framing.target}
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.9}
          zoomSpeed={0.8}
          enableZoom
          // Full 360° horizontally, and free vertical inspection top-to-bottom.
          minPolarAngle={0.05}
          maxPolarAngle={Math.PI - 0.05}
          // Gentle idle showcase that stops the moment the visitor takes over.
          autoRotate={!reducedMotion && !engaged}
          autoRotateSpeed={0.7}
          onStart={() => setEngaged(true)}
          touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }}
        />
      </Canvas>
    </div>
  );
}
