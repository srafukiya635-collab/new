import { Star } from "lucide-react";
import { useSiteConfig } from "@/config/ConfigProvider";
import { Card, Section } from "./primitives";
import { Reveal } from "./Reveal";
import { SafeImage } from "./SafeImage";


export function Games() {
  const { config } = useSiteConfig();
  const games = config.games;
  if (!games.length) return null;

  return (
    <Section
      id="games"
      eyebrow="Game Library"
      title="Titles on rotation"
      subtitle="Installed, patched and ready — plus anything else you ask for at the desk."
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {games.map((game, i) => (
          <Reveal key={game.id} delay={i * 40}>
            <Card className="group h-full">
              <div className="relative aspect-[3/4] overflow-hidden">
                <SafeImage
                  src={game.image}
                  alt={game.name}
                  label={game.name}
                  className="transition-transform duration-700 group-hover:scale-110"
                />

                {game.featured && (
                  <span
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full"
                    style={{ background: "var(--site-accent)", color: "var(--site-on-accent)" }}
                    title="Featured"
                  >
                    <Star size={13} />
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-bold uppercase tracking-wide">{game.name}</p>
                <p className="mt-1 truncate text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--site-muted)" }}>
                  {[game.category, game.platform].filter(Boolean).join(" · ")}
                </p>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
