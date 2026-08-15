import { Gamepad2, Sparkles } from "lucide-react";
import { useSiteConfig } from "@/config/ConfigProvider";
import { Hero3D } from "@/components/three/Stage3D";
import { BookButton, Pill, WhatsAppEnquireButton } from "./primitives";
import { rgba } from "@/lib/site";

export function Hero() {
  const { config } = useSiteConfig();
  const { business, hero, gamingZones, branding } = config;

  const title = hero.title || business.name;
  const subtitle = hero.subtitle || business.tagline;
  const description = hero.description || business.description;

  return (
    <section id="top" className="relative overflow-hidden px-5 pb-16 pt-10 md:px-10 md:pb-24 md:pt-16">
      {/* Ambient brand wash — purely decorative, never interactive. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 15% 10%, ${rgba(branding.primaryColor, 0.22)}, transparent 55%),
            radial-gradient(circle at 85% 25%, ${rgba(branding.accentColor, 0.18)}, transparent 55%)`,
        }}
        aria-hidden
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="min-w-0">
          {subtitle && <Pill>{subtitle}</Pill>}
          <h1 className="mt-5 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
            <span
              style={{
                background: "linear-gradient(120deg, var(--site-primary), var(--site-accent))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {title}
            </span>
          </h1>
          {description && (
            <p className="mt-5 max-w-xl text-sm leading-relaxed md:text-base" style={{ color: "var(--site-muted)" }}>
              {description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <BookButton label="Book Now" context="Hero" />
            <a
              href="#games"
              className="inline-flex min-h-[48px] items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em]"
              style={{
                border: "1px solid var(--site-border)",
                borderRadius: "var(--site-btn-radius)",
                color: "var(--site-fg)",
              }}
            >
              <Gamepad2 size={14} /> Explore Games
            </a>
            <WhatsAppEnquireButton className="px-5" label="Enquire" />
          </div>

          {gamingZones.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
              {gamingZones.slice(0, 6).map((zone) => (
                <span
                  key={zone.id}
                  className="text-[10px] font-semibold uppercase tracking-[0.25em]"
                  style={{ color: "var(--site-muted)" }}
                >
                  {zone.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* The 3D arena lives in its own bounded, rounded card so page
            scrolling is never captured by a fullscreen canvas. */}
        <div
          className="relative h-[280px] w-full overflow-hidden border sm:h-[340px] lg:h-[460px]"
          style={{
            borderColor: "var(--site-border)",
            borderRadius: "calc(var(--site-radius) + 12px)",
            background: `linear-gradient(160deg, ${rgba(branding.primaryColor, 0.1)}, ${rgba(
              branding.backgroundColor,
              0.9,
            )})`,
          }}
        >
          {hero.video ? (
            <video
              className="absolute inset-0 h-full w-full object-cover opacity-40"
              src={hero.video}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden
            />
          ) : hero.image ? (
            <img src={hero.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" aria-hidden />
          ) : null}
          <Hero3D />
          <span
            className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{
              border: "1px solid var(--site-border)",
              borderRadius: "var(--site-radius)",
              color: "var(--site-primary)",
            }}
          >
            <Sparkles size={11} /> Live 3D arena
          </span>
        </div>
      </div>
    </section>
  );
}
