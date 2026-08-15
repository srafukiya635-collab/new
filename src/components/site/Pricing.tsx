import { Check } from "lucide-react";
import { useSiteConfig } from "@/config/ConfigProvider";
import { BookButton, Card, Section } from "./primitives";
import { Reveal } from "./Reveal";

export function Pricing() {
  const { config } = useSiteConfig();
  const plans = config.pricing;
  if (!plans.length) return null;

  return (
    <Section
      id="offers"
      eyebrow="Offers & Passes"
      title="Simple rates, no surprises"
      subtitle="Pay by the hour or grab a pass. Student and squad discounts at the desk."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan, i) => (
          <Reveal key={plan.id} delay={i * 70}>
            <Card glow={plan.highlight} className="flex h-full flex-col p-6">
              {plan.highlight && (
                <span
                  className="mb-4 self-start px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{
                    background: "var(--site-accent)",
                    color: "var(--site-on-accent)",
                    borderRadius: "var(--site-radius)",
                  }}
                >
                  Most popular
                </span>
              )}
              <h3 className="text-sm font-bold uppercase tracking-[0.2em]">{plan.name}</h3>
              <p className="mt-4 text-4xl font-black" style={{ color: "var(--site-primary)" }}>
                {plan.price}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--site-muted)" }}>
                {plan.unit}
              </p>
              <ul className="mt-6 grid flex-1 gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs" style={{ color: "var(--site-muted)" }}>
                    <Check size={14} style={{ color: "var(--site-primary)", flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <BookButton
                context={plan.name}
                variant={plan.highlight ? "primary" : "outline"}
                className="mt-6 w-full"
              />
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
