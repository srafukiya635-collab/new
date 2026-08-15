import { Users, Check } from "lucide-react";
import { useSiteConfig } from "@/config/ConfigProvider";
import { BookButton, Card, Pill, Section } from "./primitives";
import { Reveal } from "./Reveal";
import { SafeImage } from "./SafeImage";


export function Zones() {
  const { config } = useSiteConfig();
  const zones = config.gamingZones;
  if (!zones.length) return null;

  return (
    <Section
      id="zones"
      eyebrow="Gaming Zones"
      title="Pick your battleground"
      subtitle={`${zones.length} dedicated zones, each tuned for a different kind of player.`}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {zones.map((zone, i) => (
          <Reveal key={zone.id} delay={i * 70}>
            <Card className="group h-full">
              <div className="relative aspect-[16/10] overflow-hidden">
                <SafeImage
                  src={zone.image}
                  alt={zone.name}
                  label={zone.name}
                  className="transition-transform duration-700 group-hover:scale-105"
                />

                <div
                  className="absolute inset-x-0 bottom-0 h-24"
                  style={{
                    background: `linear-gradient(to top, ${config.branding.cardColor}, transparent)`,
                  }}
                />
                <div className="absolute left-4 top-4 flex gap-2">
                  {!zone.available && <Pill>Coming soon</Pill>}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold uppercase tracking-wide">{zone.name}</h3>
                  {zone.price && (
                    <span className="whitespace-nowrap text-sm font-bold" style={{ color: "var(--site-primary)" }}>
                      {zone.price}
                    </span>
                  )}
                </div>

                {zone.description && (
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>
                    {zone.description}
                  </p>
                )}

                {zone.features.length > 0 && (
                  <ul className="mt-4 grid gap-2">
                    {zone.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs" style={{ color: "var(--site-muted)" }}>
                        <Check size={13} style={{ color: "var(--site-primary)" }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                {zone.equipment.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {zone.equipment.map((e) => (
                      <span
                        key={e}
                        className="px-2 py-1 text-[10px] uppercase tracking-[0.14em]"
                        style={{
                          border: "1px solid var(--site-border)",
                          borderRadius: "var(--site-radius)",
                          color: "var(--site-muted)",
                        }}
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between gap-3">
                  {zone.players && (
                    <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--site-muted)" }}>
                      <Users size={13} /> {zone.players}
                    </span>
                  )}
                  {zone.available && (
                    <BookButton
                      zone={zone.id}
                      context={zone.name}
                      label={zone.cta || config.booking.label}
                      variant="outline"
                      className="px-4 py-2"
                    />
                  )}
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
