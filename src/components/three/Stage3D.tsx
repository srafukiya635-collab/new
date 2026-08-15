import { Suspense, lazy, useRef, type ReactNode } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Move3d } from "lucide-react";
import { usePrefersReducedMotion, useQuality, useVisible, useWebGLSupported } from "@/hooks/use-3d";
import { useSiteConfig } from "@/config/ConfigProvider";
import type { ZoneModelKind } from "@/config/types";

const HeroScene = lazy(() => import("./HeroScene"));
const ZoneScene = lazy(() => import("./ZoneScene"));

/**
 * Mounts a WebGL canvas only while its container is near the viewport and
 * unmounts it once it scrolls away, so we never exceed the browser's WebGL
 * context budget (the usual cause of black / empty 3D panels on mobile).
 * `touchAction: none` is required for one-finger drag + pinch to reach the
 * canvas instead of scrolling the page.
 */
function Shell({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useVisible(ref);
  const webgl = useWebGLSupported();
  const show = webgl !== false && visible;
  return (
    <div ref={ref} className="absolute inset-0" style={{ touchAction: "pan-y" }}>
      {fallback}
      {show && <Suspense fallback={null}>{children}</Suspense>}
    </div>
  );
}

function GradientFallback() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(circle at 30% 30%, var(--site-primary), transparent 55%), radial-gradient(circle at 70% 70%, var(--site-accent), transparent 55%)",
        opacity: 0.35,
      }}
      aria-hidden
    />
  );
}

/** Small affordance so visitors know the model can be grabbed. */
function DragHint() {
  return (
    <div
      className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm"
      style={{
        border: "1px solid var(--site-border)",
        borderRadius: "var(--site-radius)",
        color: "var(--site-muted)",
      }}
      aria-hidden
    >
      <Move3d size={12} style={{ color: "var(--site-primary)" }} />
      Drag to rotate · pinch / scroll to zoom
    </div>
  );
}

export function Hero3D() {
  const { config } = useSiteConfig();
  const quality = useQuality();
  const reduced = usePrefersReducedMotion();
  const kinds = config.gamingZones.map((z) => z.model);

  return (
    <ClientOnly fallback={<GradientFallback />}>
      <Shell fallback={<GradientFallback />}>
        <HeroScene
          primary={config.branding.primaryColor}
          secondary={config.branding.secondaryColor}
          accent={config.branding.accentColor}
          background={config.branding.backgroundColor}
          zoneKinds={kinds.length ? kinds : ["pc"]}
          quality={quality}
          reducedMotion={reduced}
        />
      </Shell>
    </ClientOnly>
  );
}

export function Zone3D({ kind }: { kind: ZoneModelKind }) {
  const { config } = useSiteConfig();
  const quality = useQuality();
  const reduced = usePrefersReducedMotion();
  return (
    <ClientOnly fallback={<GradientFallback />}>
      <Shell fallback={<GradientFallback />}>
        <ZoneScene
          kind={kind}
          primary={config.branding.primaryColor}
          accent={config.branding.accentColor}
          reducedMotion={reduced}
          quality={quality}
        />
        <DragHint />
      </Shell>
    </ClientOnly>
  );
}
