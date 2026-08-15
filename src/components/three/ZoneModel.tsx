import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Group, Texture } from "three";
import type { ZoneModelKind } from "@/config/types";

interface Props {
  kind: ZoneModelKind;
  primary: string;
  accent: string;
  spin?: number;
}

const GAME_TEXTURES = {
  valorant: "/images/games/valorant.jpg",
  cs2: "/images/games/cs2.jpg",
  gtav: "/images/games/gtav.jpg",
  eafc: "/images/games/eafc.jpg",
  f1: "/images/games/f1.jpg",
  fortnite: "/images/games/fortnite.jpg",
  mk: "/images/games/mk.jpg",
} as const;

function Screen({
  url,
  position,
  size,
  rotation = [0, 0, 0],
  radius = 0.035,
}: {
  url: string;
  position: [number, number, number];
  size: [number, number];
  rotation?: [number, number, number];
  radius?: number;
}) {
  const texture = useTexture(url) as Texture;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return (
    <RoundedBox args={[size[0], size[1], 0.018]} radius={radius} smoothness={5} position={position} rotation={rotation}>
      <meshBasicMaterial map={texture} toneMapped={false} />
    </RoundedBox>
  );
}

function NeonStrip({
  color,
  position,
  size,
  rotation = [0, 0, 0],
}: {
  color: string;
  position: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.4} toneMapped={false} />
    </mesh>
  );
}

function Material({ color, metalness = 0.55, roughness = 0.32 }: { color: string; metalness?: number; roughness?: number }) {
  return <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />;
}

function PcRig({ primary, accent }: Omit<Props, "kind">) {
  const keycaps = useMemo(
    () => Array.from({ length: 48 }, (_, i) => ({ x: -0.68 + (i % 12) * 0.125, z: -0.15 + Math.floor(i / 12) * 0.095 })),
    [],
  );
  return (
    <group scale={0.95}>
      <RoundedBox args={[2.55, 0.09, 1.2]} radius={0.035} smoothness={5} position={[0, -0.72, 0.18]} receiveShadow>
        <Material color="#11151e" metalness={0.65} roughness={0.28} />
      </RoundedBox>
      <NeonStrip color={accent} position={[0, -0.765, 0.18]} size={[2.35, 0.012, 1.02]} />

      <RoundedBox args={[2.08, 1.18, 0.09]} radius={0.045} smoothness={7} position={[0, 0.45, -0.08]} castShadow>
        <Material color="#151922" metalness={0.65} roughness={0.22} />
      </RoundedBox>
      <Screen url={GAME_TEXTURES.valorant} position={[0, 0.45, -0.028]} size={[1.9, 1.0]} />
      <NeonStrip color={primary} position={[-0.98, 0.45, -0.018]} size={[0.018, 0.88, 0.012]} />
      <NeonStrip color={accent} position={[0.98, 0.45, -0.018]} size={[0.018, 0.88, 0.012]} />
      <mesh position={[0, -0.22, -0.02]} castShadow><cylinderGeometry args={[0.065, 0.09, 0.48, 24]} /><Material color="#70798a" metalness={0.95} roughness={0.18} /></mesh>
      <RoundedBox args={[0.72, 0.07, 0.42]} radius={0.025} smoothness={4} position={[0, -0.48, -0.02]} castShadow><Material color="#171b25" metalness={0.8} roughness={0.22} /></RoundedBox>

      <RoundedBox args={[1.58, 0.065, 0.47]} radius={0.025} smoothness={4} position={[0, -0.55, 0.5]} rotation={[-0.08, 0, 0]} castShadow><Material color="#090b10" metalness={0.55} roughness={0.34} /></RoundedBox>
      {keycaps.map((k, i) => (
        <RoundedBox key={i} args={[0.09, 0.025, 0.065]} radius={0.008} smoothness={2} position={[k.x, -0.505, 0.5 + k.z]}>
          <meshStandardMaterial color={i % 7 === 0 ? primary : "#454b59"} emissive={i % 7 === 0 ? primary : "#000000"} emissiveIntensity={0.65} roughness={0.6} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.34, 0.025, 0.26]} radius={0.035} smoothness={5} position={[0.95, -0.55, 0.5]}><Material color="#141821" metalness={0.4} roughness={0.4} /></RoundedBox>
      <mesh position={[0.95, -0.53, 0.37]}><boxGeometry args={[0.025, 0.02, 0.07]} /><meshStandardMaterial color={primary} emissive={primary} emissiveIntensity={2} /></mesh>

      <RoundedBox args={[0.55, 1.0, 0.72]} radius={0.05} smoothness={6} position={[-1.34, -0.2, 0.18]} castShadow>
        <Material color="#1b202b" metalness={0.72} roughness={0.25} />
      </RoundedBox>
      <RoundedBox args={[0.47, 0.82, 0.66]} radius={0.04} smoothness={5} position={[-1.02, -0.2, 0.18]} rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial color={primary} transparent opacity={0.16} metalness={0.9} roughness={0.08} />
      </RoundedBox>
      {([[-1.02, -0.45, 0.18], [-1.02, -0.18, 0.18], [-1.02, 0.09, 0.18]] as [number, number, number][]).map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.105, 0.018, 12, 32]} /><meshStandardMaterial color={i % 2 ? accent : primary} emissive={i % 2 ? accent : primary} emissiveIntensity={1.8} /></mesh>
      ))}

      <RoundedBox args={[0.88, 1.18, 0.2]} radius={0.08} smoothness={6} position={[0, -0.05, 1.05]} rotation={[0.12, 0, 0]} castShadow><Material color="#161a22" metalness={0.2} roughness={0.82} /></RoundedBox>
      <RoundedBox args={[0.72, 0.16, 0.68]} radius={0.08} smoothness={6} position={[0, -0.56, 0.92]} castShadow><Material color="#11141c" metalness={0.2} roughness={0.86} /></RoundedBox>
    </group>
  );
}

function Controller({ primary, accent, x }: { primary: string; accent: string; x: number }) {
  return (
    <group position={[x, -0.3, 0.48]} rotation={[0.04, x > 0 ? -0.18 : 0.18, x > 0 ? -0.08 : 0.08]}>
      <RoundedBox args={[0.62, 0.13, 0.38]} radius={0.12} smoothness={7} castShadow><Material color="#141821" metalness={0.28} roughness={0.44} /></RoundedBox>
      {[-0.22, 0.22].map((sx) => <mesh key={sx} position={[sx, 0.075, 0.02]}><cylinderGeometry args={[0.06, 0.07, 0.05, 20]} /><Material color="#303746" metalness={0.25} roughness={0.7} /></mesh>)}
      <mesh position={[-0.12, 0.078, -0.1]}><boxGeometry args={[0.14, 0.025, 0.035]} /><meshStandardMaterial color={primary} emissive={primary} emissiveIntensity={1.5} /></mesh>
      <mesh position={[0.12, 0.078, 0.12]}><sphereGeometry args={[0.035, 16, 16]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.8} /></mesh>
      <NeonStrip color={accent} position={[0, 0.075, 0.17]} size={[0.26, 0.012, 0.012]} />
    </group>
  );
}

function ConsoleRig({ primary, accent }: Omit<Props, "kind">) {
  return (
    <group scale={1.0}>
      <RoundedBox args={[2.35, 0.95, 0.7]} radius={0.12} smoothness={8} position={[0, -0.35, 0.55]} castShadow>
        <Material color="#151922" metalness={0.5} roughness={0.34} />
      </RoundedBox>
      <RoundedBox args={[2.16, 0.74, 0.56]} radius={0.09} smoothness={7} position={[0, -0.35, 0.9]}>
        <meshStandardMaterial color="#11151e" metalness={0.45} roughness={0.36} />
      </RoundedBox>
      <Screen url={GAME_TEXTURES.gtav} position={[0, 0.78, -0.48]} size={[2.35, 1.3]} />
      <RoundedBox args={[2.58, 1.54, 0.09]} radius={0.06} smoothness={6} position={[0, 0.78, -0.55]} castShadow><Material color="#0c1017" metalness={0.72} roughness={0.2} /></RoundedBox>
      <Screen url={GAME_TEXTURES.eafc} position={[0, 0.78, -0.495]} size={[2.35, 1.3]} />
      <NeonStrip color={primary} position={[-1.22, 0.78, -0.47]} size={[0.018, 1.16, 0.012]} />
      <NeonStrip color={accent} position={[1.22, 0.78, -0.47]} size={[0.018, 1.16, 0.012]} />
      <Controller primary={primary} accent={accent} x={-0.72} />
      <Controller primary={primary} accent={accent} x={0.72} />
      <RoundedBox args={[1.7, 0.18, 0.75]} radius={0.08} smoothness={5} position={[0, -0.88, 1.15]} castShadow><Material color="#202530" metalness={0.1} roughness={0.9} /></RoundedBox>
      <RoundedBox args={[0.85, 0.8, 0.75]} radius={0.12} smoothness={7} position={[-0.9, -0.5, 1.35]} castShadow><Material color="#171b24" metalness={0.1} roughness={0.9} /></RoundedBox>
      <RoundedBox args={[0.85, 0.8, 0.75]} radius={0.12} smoothness={7} position={[0.9, -0.5, 1.35]} castShadow><Material color="#171b24" metalness={0.1} roughness={0.9} /></RoundedBox>
    </group>
  );
}

function RacingRig({ primary, accent }: Omit<Props, "kind">) {
  return (
    <group scale={0.92}>
      <mesh position={[0, -0.85, 0]} castShadow><boxGeometry args={[2.7, 0.12, 2.0]} /><Material color="#0e1218" metalness={0.8} roughness={0.28} /></mesh>
      {[-0.95, 0.95].map((x) => <mesh key={x} position={[x, -0.68, 0]} castShadow><boxGeometry args={[0.12, 0.22, 1.8]} /><Material color="#747d8d" metalness={0.92} roughness={0.16} /></mesh>)}
      <RoundedBox args={[0.9, 0.18, 0.95]} radius={0.12} smoothness={7} position={[0, -0.62, -0.48]} castShadow><Material color={accent} metalness={0.35} roughness={0.5} /></RoundedBox>
      <RoundedBox args={[0.9, 1.25, 0.2]} radius={0.12} smoothness={7} position={[0, 0.02, -0.82]} rotation={[-0.22, 0, 0]} castShadow><Material color={accent} metalness={0.28} roughness={0.5} /></RoundedBox>
      <group position={[0, 0.42, 0.08]} rotation={[0.5, 0, 0]}>
        <mesh castShadow><torusGeometry args={[0.47, 0.085, 20, 48]} /><Material color="#10141b" metalness={0.35} roughness={0.5} /></mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.14, 0.14, 0.1, 24]} /><Material color="#596273" metalness={0.92} roughness={0.15} /></mesh>
        {[-1, 1].map((x) => <mesh key={x} position={[x * 0.23, 0, 0]} rotation={[0, 0, x * 0.15]}><boxGeometry args={[0.07, 0.46, 0.06]} /><Material color="#343b49" metalness={0.6} roughness={0.3} /></mesh>)}
        <NeonStrip color={primary} position={[0, 0.19, 0.065]} size={[0.24, 0.025, 0.02]} />
      </group>
      <mesh position={[0, -0.58, 0.76]} rotation={[0.28, 0, 0]} castShadow><boxGeometry args={[0.72, 0.08, 0.5]} /><Material color="#11151d" metalness={0.5} roughness={0.34} /></mesh>
      {[-0.16, 0.16].map((x) => <mesh key={x} position={[x, -0.45, 0.86]} rotation={[0.28, 0, 0]} castShadow><boxGeometry args={[0.13, 0.28, 0.06]} /><Material color="#aeb6c5" metalness={0.95} roughness={0.16} /></mesh>)}
      {[-1.05, 0, 1.05].map((x, i) => (
        <group key={x} position={[x, 0.98, 0.48]} rotation={[0, -x * 0.13, 0]}>
          <RoundedBox args={[1.02, 0.66, 0.07]} radius={0.045} smoothness={6} castShadow><Material color="#0b0f16" metalness={0.7} roughness={0.2} /></RoundedBox>
          <Screen url={GAME_TEXTURES.f1} position={[0, 0, 0.042]} size={[0.91, 0.54]} />
          <NeonStrip color={i === 1 ? accent : primary} position={[-0.47, 0, 0.05]} size={[0.012, 0.48, 0.012]} />
        </group>
      ))}
      <RoundedBox args={[0.2, 0.18, 0.28]} radius={0.05} smoothness={5} position={[0.72, -0.28, 0.05]} castShadow><Material color="#171b24" metalness={0.55} roughness={0.32} /></RoundedBox>
      <mesh position={[0.72, -0.12, 0.05]}><cylinderGeometry args={[0.025, 0.025, 0.26, 14]} /><Material color="#8d97a8" metalness={0.95} roughness={0.15} /></mesh>
      <mesh position={[0.72, 0.02, 0.05]}><sphereGeometry args={[0.065, 20, 20]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.8} /></mesh>
    </group>
  );
}

function VrRig({ primary, accent }: Omit<Props, "kind">) {
  return (
    <group scale={1.05}>
      <RoundedBox args={[1.35, 0.62, 0.55]} radius={0.16} smoothness={8} position={[0, 0.2, 0]} castShadow><Material color="#171b24" metalness={0.25} roughness={0.38} /></RoundedBox>
      <RoundedBox args={[1.18, 0.48, 0.08]} radius={0.12} smoothness={7} position={[0, 0.2, 0.3]}><Material color="#0c1017" metalness={0.72} roughness={0.18} /></RoundedBox>
      {[-0.28, 0.28].map((x) => <mesh key={x} position={[x, 0.2, 0.345]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.17, 0.17, 0.045, 32]} /><meshStandardMaterial color="#05070b" metalness={0.95} roughness={0.08} /></mesh>)}
      <NeonStrip color={primary} position={[0, 0.2, 0.35]} size={[0.85, 0.025, 0.012]} />
      <mesh position={[0, 0.02, -0.42]}><torusGeometry args={[0.6, 0.065, 16, 48, Math.PI * 1.55]} /><Material color={accent} metalness={0.4} roughness={0.45} /></mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 1.0, -0.42, 0.1]} rotation={[0.2, 0, s * 0.35]}>
          <RoundedBox args={[0.18, 0.42, 0.18]} radius={0.08} smoothness={7} castShadow><Material color="#161a22" metalness={0.35} roughness={0.42} /></RoundedBox>
          <mesh position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.14, 0.028, 12, 28]} /><meshStandardMaterial color={s < 0 ? primary : accent} emissive={s < 0 ? primary : accent} emissiveIntensity={1.8} /></mesh>
        </group>
      ))}
    </group>
  );
}

function ArcadeRig({ primary, accent }: Omit<Props, "kind">) {
  return (
    <group scale={0.95}>
      <RoundedBox args={[1.25, 2.0, 0.88]} radius={0.09} smoothness={6} position={[0, -0.05, 0]} castShadow><Material color="#151a23" metalness={0.45} roughness={0.36} /></RoundedBox>
      <Screen url={GAME_TEXTURES.mk} position={[0, 0.48, 0.47]} size={[0.95, 0.72]} rotation={[-0.12, 0, 0]} />
      <NeonStrip color={primary} position={[-0.63, -0.05, 0.02]} size={[0.018, 1.72, 0.68]} />
      <NeonStrip color={accent} position={[0.63, -0.05, 0.02]} size={[0.018, 1.72, 0.68]} />
      <RoundedBox args={[1.28, 0.25, 0.18]} radius={0.04} smoothness={5} position={[0, 0.95, 0.34]} rotation={[0.1, 0, 0]}><Material color="#0d1118" metalness={0.5} roughness={0.28} /></RoundedBox>
      <RoundedBox args={[1.22, 0.12, 0.58]} radius={0.04} smoothness={4} position={[0, -0.16, 0.5]} rotation={[0.3, 0, 0]}><Material color="#0b0e14" metalness={0.4} roughness={0.42} /></RoundedBox>
      {[-0.3, 0.3].map((x) => <group key={x} position={[x, -0.02, 0.48]}><mesh><cylinderGeometry args={[0.025, 0.025, 0.2, 14]} /><Material color="#9099aa" metalness={0.95} roughness={0.15} /></mesh><mesh position={[0, 0.13, 0]}><sphereGeometry args={[0.07, 20, 20]} /><meshStandardMaterial color={x < 0 ? primary : accent} emissive={x < 0 ? primary : accent} emissiveIntensity={1.7} /></mesh></group>)}
      {[-0.08, 0.04, 0.16].map((z) => <mesh key={z} position={[0.48, -0.01, 0.5 + z]} rotation={[0.3, 0, 0]}><cylinderGeometry args={[0.035, 0.035, 0.04, 16]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.6} /></mesh>)}
      <RoundedBox args={[0.42, 0.22, 0.04]} radius={0.02} smoothness={3} position={[0, -0.72, 0.45]}><Material color="#596273" metalness={0.85} roughness={0.2} /></RoundedBox>
    </group>
  );
}

function PoolRig({ primary }: { primary: string }) {
  const balls = useMemo(() => [
    [-0.6, 0.12, -0.25], [0.6, 0.12, 0.2], [0.45, 0.12, -0.15], [0.3, 0.12, -0.32], [0.15, 0.12, -0.46], [0, 0.12, -0.6],
  ] as [number, number, number][], []);
  return (
    <group scale={0.95}>
      <RoundedBox args={[2.3, 0.18, 1.35]} radius={0.08} smoothness={5} position={[0, 0, 0]} castShadow><Material color="#3a2417" metalness={0.18} roughness={0.56} /></RoundedBox>
      <RoundedBox args={[2.12, 0.08, 1.18]} radius={0.05} smoothness={4} position={[0, 0.1, 0]}><meshStandardMaterial color={primary} roughness={0.76} /></RoundedBox>
      {balls.map(([x, y, z], i) => <mesh key={i} position={[x, y + 0.08, z]} castShadow><sphereGeometry args={[0.065, 20, 20]} /><meshStandardMaterial color={i === 0 ? "#ffffff" : i % 2 ? "#e51d3e" : "#f4b41a"} metalness={0.1} roughness={0.22} /></mesh>)}
      <mesh position={[-0.95, 0.35, 0.9]} rotation={[0.2, 0, 0]}><cylinderGeometry args={[0.018, 0.018, 2.1, 12]} /><Material color="#b9c1ce" metalness={0.9} roughness={0.18} /></mesh>
      {[-0.75, 0.75].map((x) => <mesh key={x} position={[x, -0.58, 0]} castShadow><cylinderGeometry args={[0.1, 0.12, 1.05, 20]} /><Material color="#4a2d1d" metalness={0.2} roughness={0.62} /></mesh>)}
    </group>
  );
}

function ArenaRig({ primary, accent }: Omit<Props, "kind">) {
  return (
    <group scale={0.9}>
      <RoundedBox args={[3.0, 0.12, 1.7]} radius={0.06} smoothness={5} position={[0, -0.78, 0]}><Material color="#10141c" metalness={0.7} roughness={0.28} /></RoundedBox>
      <RoundedBox args={[2.8, 1.3, 0.08]} radius={0.05} smoothness={5} position={[0, 0.25, -0.85]}><Material color="#0b0f16" metalness={0.72} roughness={0.2} /></RoundedBox>
      <Screen url={GAME_TEXTURES.valorant} position={[0, 0.25, -0.8]} size={[2.58, 1.08]} />
      <NeonStrip color={primary} position={[-1.37, 0.25, -0.78]} size={[0.02, 1.08, 0.015]} />
      <NeonStrip color={accent} position={[1.37, 0.25, -0.78]} size={[0.02, 1.08, 0.015]} />
      {[-1.1, -0.36, 0.36, 1.1].map((x, i) => <group key={x} position={[x, -0.45, 0.15]}><RoundedBox args={[0.52, 0.6, 0.46]} radius={0.05} smoothness={5} castShadow><Material color="#171b24" metalness={0.6} roughness={0.3} /></RoundedBox><mesh position={[0, -0.08, 0.25]}><boxGeometry args={[0.36, 0.02, 0.28]} /><meshStandardMaterial color={i % 2 ? accent : primary} emissive={i % 2 ? accent : primary} emissiveIntensity={1.2} /></mesh></group>)}
      <RoundedBox args={[0.85, 0.7, 0.45]} radius={0.08} smoothness={6} position={[1.55, -0.2, 0.55]}><Material color="#1b202b" metalness={0.5} roughness={0.35} /></RoundedBox>
    </group>
  );
}

export function ZoneModel({ kind, primary, accent, spin = 0 }: Props) {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (!group.current || !spin) return;
    group.current.rotation.y += spin * 0.01;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.035;
  });

  return (
    <group ref={group}>
      {kind === "pc" && <PcRig primary={primary} accent={accent} />}
      {kind === "console" && <ConsoleRig primary={primary} accent={accent} />}
      {kind === "racing" && <RacingRig primary={primary} accent={accent} />}
      {kind === "vr" && <VrRig primary={primary} accent={accent} />}
      {kind === "arcade" && <ArcadeRig primary={primary} accent={accent} />}
      {kind === "pool" && <PoolRig primary={primary} />}
      {kind === "arena" && <ArenaRig primary={primary} accent={accent} />}
    </group>
  );
}

export default ZoneModel;
