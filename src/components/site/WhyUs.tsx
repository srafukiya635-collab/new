import {
  Cpu,
  Trophy,
  Moon,
  Users,
  Wifi,
  Gamepad2,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useSiteConfig } from "@/config/ConfigProvider";
import { Card, Section } from "./primitives";
import { Reveal } from "./Reveal";
import { rgba } from "@/lib/site";

const ICONS: Record<string, LucideIcon> = {
  cpu: Cpu,
  trophy: Trophy,
  moon: Moon,
  users: Users,
  wifi: Wifi,
  gamepad: Gamepad2,
  shield: ShieldCheck,
  sparkles: Sparkles,
};

export function WhyUs() {
  const { config } = useSiteConfig();
  const items = config.whyUs;
  if (!items.length) return null;

  return (
    <Section id="why" eyebrow="Why Choose Us" title="Built for players, not tourists">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => {
          const Icon = ICONS[item.icon] ?? Sparkles;
          return (
            <Reveal key={item.title} delay={i * 70}>
              <Card className="h-full p-6">
                <span
                  className="grid h-11 w-11 place-items-center"
                  style={{
                    borderRadius: "var(--site-radius)",
                    background: rgba(config.branding.primaryColor, 0.14),
                    color: "var(--site-primary)",
                  }}
                >
                  <Icon size={20} />
                </span>
                <h3 className="mt-5 text-sm font-bold uppercase tracking-[0.16em]">{item.title}</h3>
                <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--site-muted)" }}>
                  {item.description}
                </p>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
