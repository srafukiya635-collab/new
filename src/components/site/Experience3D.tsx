import { useSiteConfig } from "@/config/ConfigProvider";
import { Zone3D } from "@/components/three/Stage3D";
import { BookButton, Section } from "./primitives";
import { Reveal } from "./Reveal";
import { rgba } from "@/lib/site";

export function Experience3D() {
  const { config } = useSiteConfig();
  const zones = config.gamingZones;
  if (!zones.length) return null;

  return (
    <Section
      id="experience"
      eyebrow="3D Experience"
      title="Step through the arena"
      subtitle="Every zone the client offers gets its own interactive 3D presentation — scroll to move through them."
    >
      <div className="grid gap-8">
        {zones.map((zone, i) => (
          <Reveal key={zone.id}>
            <div
              className={`grid items-center gap-8 overflow-hidden border p-6 md:p-10 lg:grid-cols-2 ${
                i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
              }`}
              style={{
                borderColor: "var(--site-border)",
                borderRadius: "var(--site-radius)",
                background: `linear-gradient(120deg, ${rgba(
                  config.branding.primaryColor,
                  0.06,
                )}, ${rgba(config.branding.accentColor, 0.05)})`,
              }}
            >
              {/* Taller on mobile so the model is fully visible and easy to
                  grab with a finger; large and detailed on desktop. */}
              <div className="relative h-[340px] w-full sm:h-[400px] md:h-[440px] lg:h-[520px]">
                <Zone3D kind={zone.model} />
              </div>
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.35em]"
                  style={{ color: "var(--site-accent)" }}
                >
                  Zone {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-2xl font-bold uppercase tracking-tight md:text-4xl">{zone.name}</h3>
                {zone.description && (
                  <p className="mt-4 text-sm leading-relaxed md:text-base" style={{ color: "var(--site-muted)" }}>
                    {zone.description}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  {zone.price && (
                    <span className="text-lg font-bold" style={{ color: "var(--site-primary)" }}>
                      {zone.price}
                    </span>
                  )}
                  <BookButton zone={zone.id} context={zone.name} label={zone.cta || undefined} className="px-5 py-2.5" />
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
