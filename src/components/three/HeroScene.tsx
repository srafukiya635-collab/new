import { useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Grid, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import ZoneModel from "./ZoneModel";
import type { ZoneModelKind } from "@/config/types";

interface SceneProps {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  zoneKinds: ZoneModelKind[];
  quality: "low" | "medium" | "high";
  reducedMotion: boolean;
}

function useScrollProgress() {
  const ref = useRef(0);
  useFrame(() => {
    if (typeof window === "undefined") return;
    const max = window.innerHeight * 2.2;
    ref.current = Math.min(1, window.scrollY / max);
  });
  return ref;
}

function Particles({ color, count }: { color: string; count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 18,
        y: (Math.random() - 0.5) * 10,
        z: (Math.random() - 0.5) * 14,
        s: 0.02 + Math.random() * 0.05,
        speed: 0.2 + Math.random() * 0.7,
      })),
    [count],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const mi = mesh.current;
    if (!mi) return;
    const t = state.clock.elapsedTime;
    seeds.forEach((p, i) => {
      const y = ((p.y + t * p.speed * 0.6 + 5) % 10) - 5;
      dummy.position.set(p.x, y, p.z);
      dummy.scale.setScalar(p.s);
      dummy.updateMatrix();
      mi.setMatrixAt(i, dummy.matrix);
    });
    mi.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.75} toneMapped={false} />
    </instancedMesh>
  );
}

/**
 * Scroll-driven camera flight. It hands full control to OrbitControls as soon
 * as the visitor grabs the scene (`engaged`), so drag/pinch is never fought by
 * the automatic rig.
 */
function Rig({ reducedMotion, engaged }: { reducedMotion: boolean; engaged: boolean }) {
  const progress = useScrollProgress();
  useFrame((state) => {
    if (engaged) return;
    const cam = state.camera as THREE.PerspectiveCamera;
    // Pull the camera back on narrow/portrait viewports so the whole ring fits.
    const aspect = state.viewport.aspect || 1;
    const zBase = aspect < 1 ? 10.5 : aspect < 1.4 ? 8.5 : 7;
    if (reducedMotion) {
      cam.position.set(0, 0.4, zBase);
      cam.lookAt(0, 0, 0);
      return;
    }
    const p = progress.current;
    cam.position.z = zBase - p * 3.2;
    cam.position.y = 0.4 + Math.sin(p * Math.PI) * 1.1;
    cam.position.x = Math.sin(p * Math.PI * 1.4) * 1.6;
    cam.lookAt(0, p * 0.4, 0);
  });
  return null;
}


function ZoneRing({
  zoneKinds,
  primary,
  accent,
  reducedMotion,
}: {
  zoneKinds: ZoneModelKind[];
  primary: string;
  accent: string;
  reducedMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const progress = useScrollProgress();
  const radius = Math.max(3.2, zoneKinds.length * 0.75);

  useFrame((state) => {
    if (!group.current) return;
    const base = reducedMotion ? 0 : state.clock.elapsedTime * 0.08;
    group.current.rotation.y = base + progress.current * Math.PI * 1.2;
  });

  return (
    <group ref={group} position={[0, 0, -2.5]} scale={0.9}>
      {zoneKinds.map((kind, i) => {
        const angle = (i / Math.max(1, zoneKinds.length)) * Math.PI * 2;
        return (
          <group
            key={`${kind}-${i}`}
            position={[Math.sin(angle) * radius, Math.cos(angle * 1.7) * 0.7, Math.cos(angle) * radius]}
            scale={0.5}
          >
            <Float speed={reducedMotion ? 0 : 1.2} floatIntensity={0.6} rotationIntensity={0.4}>
              <ZoneModel kind={kind} primary={primary} accent={accent} />
            </Float>
          </group>
        );
      })}
    </group>
  );
}


function Core({ primary, secondary }: { primary: string; secondary: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.25;
    ref.current.rotation.x = state.clock.elapsedTime * 0.12;
  });
  return (
    <group>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.35, 1]} />
        <meshStandardMaterial
          color={secondary}
          emissive={primary}
          emissiveIntensity={0.55}
          wireframe
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.75, 1]} />
        <meshStandardMaterial color={primary} emissive={primary} emissiveIntensity={1.1} toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * Keeps the hero arena fully in frame and out from behind the headline on
 * narrow/portrait viewports, and scales it down so nothing gets cropped.
 */
function HeroFraming({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const aspect = state.viewport.aspect || 1;
    const portrait = aspect < 1;
    const y = portrait ? -2.8 : aspect < 1.4 ? -0.8 : 0;
    const s = portrait ? 0.62 : aspect < 1.4 ? 0.85 : 1;
    group.current.position.y += (y - group.current.position.y) * 0.1;
    group.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
  });
  return <group ref={group}>{children}</group>;
}

export default function HeroScene({
  primary,
  secondary,
  accent,
  background,
  zoneKinds,
  quality,
  reducedMotion,
}: SceneProps) {
  const particleCount = quality === "low" ? 60 : quality === "medium" ? 140 : 260;
  const kinds = quality === "low" ? zoneKinds.slice(0, 3) : zoneKinds;
  const [engaged, setEngaged] = useState(false);

  return (
    <Canvas
      dpr={quality === "high" ? [1, 1.75] : [1, 1.25]}
      camera={{ position: [0, 0.4, 7], fov: 55 }}
      gl={{ antialias: quality !== "low", alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent", touchAction: "pan-y", width: "100%", height: "100%" }}
      resize={{ scroll: false, debounce: 100 }}
      onCreated={({ scene, gl }) => {
        scene.fog = new THREE.Fog(background, 14, 38);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
      }}
    >
      <ambientLight intensity={0.8} />
      <hemisphereLight args={["#ffffff", "#0b0d14", 0.6]} />
      <directionalLight position={[3, 5, 5]} intensity={0.9} />
      <pointLight position={[4, 4, 4]} intensity={40} color={primary} distance={26} decay={2} />
      <pointLight position={[-5, -2, 2]} intensity={32} color={accent} distance={26} decay={2} />
      {/* Drops the arena below the headline on portrait/mobile viewports. */}
      <HeroFraming>
        <Core primary={primary} secondary={secondary} />
        <ZoneRing zoneKinds={kinds} primary={primary} accent={accent} reducedMotion={reducedMotion} />
      </HeroFraming>
      <Particles color={primary} count={particleCount} />
      {quality !== "low" && (
        <Grid
          position={[0, -2.6, 0]}
          args={[30, 30]}
          cellSize={0.7}
          cellThickness={0.6}
          sectionSize={3}
          sectionThickness={1.1}
          cellColor={secondary}
          sectionColor={primary}
          fadeDistance={26}
          fadeStrength={1.4}
          infiniteGrid
        />
      )}
      <Rig reducedMotion={reducedMotion} engaged={engaged} />
      {/* Drag / pinch / wheel to inspect the arena from any angle. */}
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.85}
        zoomSpeed={0.7}
        minDistance={3.5}
        maxDistance={16}
        minPolarAngle={0.08}
        maxPolarAngle={Math.PI - 0.08}
        target={[0, 0, -0.5]}
        onStart={() => setEngaged(true)}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }}
      />
    </Canvas>
  );
}

