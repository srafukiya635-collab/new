import { useEffect, useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteConfig } from "@/config/ConfigProvider";
import { Card, Section } from "./primitives";
import { initials, rgba } from "@/lib/site";
import { usePrefersReducedMotion } from "@/hooks/use-3d";

export function Testimonials() {
  const { config } = useSiteConfig();
  const reviews = config.testimonials;
  const [index, setIndex] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || reviews.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % reviews.length), 6000);
    return () => window.clearInterval(id);
  }, [reduced, reviews.length]);

  useEffect(() => {
    setIndex(0);
  }, [reviews.length]);

  if (!reviews.length) return null;
  const active = reviews[Math.min(index, reviews.length - 1)]!;

  return (
    <Section id="reviews" eyebrow="Testimonials" title="What players say">
      <Card className="p-8 md:p-12" glow>
        <div className="flex flex-col gap-6">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                style={{
                  color: i < active.rating ? "var(--site-accent)" : "var(--site-border)",
                  fill: i < active.rating ? "var(--site-accent)" : "transparent",
                }}
              />
            ))}
          </div>
          <blockquote className="text-lg leading-relaxed md:text-2xl">“{active.review}”</blockquote>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {active.image ? (
                <img src={active.image} alt={active.name} loading="lazy" className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <span
                  className="grid h-11 w-11 place-items-center rounded-full text-xs font-bold"
                  style={{
                    background: rgba(config.branding.primaryColor, 0.18),
                    color: "var(--site-primary)",
                  }}
                >
                  {initials(active.name)}
                </span>
              )}
              <span className="text-sm font-semibold uppercase tracking-[0.16em]">{active.name}</span>
            </div>

            {reviews.length > 1 && (
              <div className="flex gap-2">
                <button
                  className="grid h-10 w-10 place-items-center border"
                  style={{ borderColor: "var(--site-border)", borderRadius: "var(--site-radius)" }}
                  onClick={() => setIndex((i) => (i - 1 + reviews.length) % reviews.length)}
                  aria-label="Previous review"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  className="grid h-10 w-10 place-items-center border"
                  style={{ borderColor: "var(--site-border)", borderRadius: "var(--site-radius)" }}
                  onClick={() => setIndex((i) => (i + 1) % reviews.length)}
                  aria-label="Next review"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {reviews.length > 1 && (
            <div className="flex gap-2">
              {reviews.map((r, i) => (
                <button
                  key={r.id}
                  aria-label={`Review ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className="h-1 flex-1 transition-all"
                  style={{
                    background: i === index ? "var(--site-primary)" : "var(--site-border)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    </Section>
  );
}
