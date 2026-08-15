import { useEffect, useState } from "react";

export type Quality = "low" | "medium" | "high";

/** Desktop = full cinematic, tablet = reduced, mobile = optimized. */
export function useQuality(): Quality {
  const [quality, setQuality] = useState<Quality>("medium");
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const cores = navigator.hardwareConcurrency ?? 4;
      if (w < 768 || cores <= 4) return setQuality("low");
      if (w < 1280) return setQuality("medium");
      setQuality("high");
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return quality;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function useWebGLSupported() {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      setSupported(Boolean(ctx));
    } catch {
      setSupported(false);
    }
  }, []);
  return supported;
}

/** Fires once the element enters the viewport — used to defer 3D mounting. */
export function useInView<T extends HTMLElement>(ref: React.RefObject<T | null>, margin = "200px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && setInView(true),
      { rootMargin: margin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, margin, inView]);
  return inView;
}

/**
 * Tracks viewport visibility continuously so heavy WebGL canvases can be
 * unmounted when scrolled away. Browsers (especially Android) cap the number
 * of live WebGL contexts — keeping every zone canvas alive silently kills the
 * earlier ones, which is what makes scenes turn black.
 */
export function useVisible<T extends HTMLElement>(ref: React.RefObject<T | null>, margin = "300px") {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => setVisible(Boolean(entries[0]?.isIntersecting)),
      { rootMargin: margin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, margin]);
  return visible;
}

