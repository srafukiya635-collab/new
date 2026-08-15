import { useCallback, useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteConfig } from "@/config/ConfigProvider";
import { Section } from "./primitives";
import { Reveal } from "./Reveal";
import { usePrefersReducedMotion } from "@/hooks/use-3d";
import { rgba } from "@/lib/site";

export function Gallery() {
  const { config } = useSiteConfig();
  const images = config.gallery.filter(Boolean);
  const [active, setActive] = useState<number | null>(null);
  const reduced = usePrefersReducedMotion();

  const step = useCallback(
    (dir: number) =>
      setActive((current) =>
        current === null ? null : (current + dir + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, step]);

  if (!images.length) return null;

  return (
    <Section id="gallery" eyebrow="Gallery" title="Inside the lounge">
      <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
        {images.map((src, i) => (
          <Reveal key={`${src}-${i}`} delay={(i % 6) * 50}>
            <button
              type="button"
              onClick={() => setActive(i)}
              className="group block w-full overflow-hidden border"
              style={{
                borderColor: "var(--site-border)",
                borderRadius: "var(--site-radius)",
                perspective: 900,
              }}
            >
              <img
                src={src}
                alt={`${config.business.name} gallery image ${i + 1}`}
                loading="lazy"
                className="w-full object-cover transition-transform duration-500"
                style={{ transformStyle: "preserve-3d" }}
                onMouseMove={
                  reduced
                    ? undefined
                    : (e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = (e.clientX - rect.left) / rect.width - 0.5;
                        const y = (e.clientY - rect.top) / rect.height - 0.5;
                        e.currentTarget.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.04)`;
                      }
                }
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                }}
              />
            </button>
          </Reveal>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center p-4"
          style={{ background: rgba(config.branding.backgroundColor, 0.94) }}
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center border"
            style={{ borderColor: "var(--site-border)", borderRadius: "var(--site-radius)" }}
            onClick={() => setActive(null)}
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <button
            className="absolute left-4 grid h-11 w-11 place-items-center border"
            style={{ borderColor: "var(--site-border)", borderRadius: "var(--site-radius)" }}
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <img
            src={images[active]}
            alt={`${config.business.name} gallery image ${active + 1}`}
            className="max-h-[85vh] max-w-full object-contain"
            style={{ borderRadius: "var(--site-radius)", boxShadow: "var(--site-glow)" }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 grid h-11 w-11 place-items-center border"
            style={{ borderColor: "var(--site-border)", borderRadius: "var(--site-radius)" }}
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </Section>
  );
}
