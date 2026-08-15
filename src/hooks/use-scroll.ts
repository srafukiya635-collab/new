import { useEffect, useRef, useState } from "react";

/**
 * Scroll-linked helpers. All of them are rAF-throttled and passive so the
 * website stays smooth on mobile browsers.
 */

function onScroll(handler: () => void) {
  let frame = 0;
  const run = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      handler();
    });
  };
  handler();
  window.addEventListener("scroll", run, { passive: true });
  window.addEventListener("resize", run);
  return () => {
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener("scroll", run);
    window.removeEventListener("resize", run);
  };
}

/** 0 → 1 progress of the whole document. */
export function usePageProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(
    () =>
      onScroll(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
      }),
    [],
  );
  return progress;
}

/**
 * 0 → 1 progress of an element travelling through the viewport.
 * 0 = element top at viewport bottom, 1 = element bottom at viewport top.
 */
export function useElementProgress<T extends HTMLElement>(ref: React.RefObject<T | null>) {
  const [progress, setProgress] = useState(0);
  useEffect(
    () =>
      onScroll(() => {
        const node = ref.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const total = window.innerHeight + rect.height;
        const travelled = window.innerHeight - rect.top;
        setProgress(Math.min(1, Math.max(0, travelled / total)));
      }),
    [ref],
  );
  return progress;
}

/** Pointer-driven tilt values (-1 → 1) for 3D cards; no-op for touch. */
export function useTilt<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const move = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      setTilt({
        x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
        active: true,
      });
    };
    const leave = () => setTilt({ x: 0, y: 0, active: false });

    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    return () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
    };
  }, [enabled]);

  return { ref, tilt };
}
