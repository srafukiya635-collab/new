import { CalendarDays, Clock, CreditCard, ShieldCheck } from "lucide-react";
import { useSiteConfig } from "@/config/ConfigProvider";
import { BookButton, Card, Section, WhatsAppEnquireButton } from "./primitives";
import { DAY_OFFER } from "@/lib/booking";

/**
 * Booking entry point on the home page. Booking and payment happen on the
 * dedicated /book page — WhatsApp is offered for enquiries only.
 */
export function Booking() {
  const { config } = useSiteConfig();
  const { hours, gamingZones } = config;

  const steps = [
    { icon: CalendarDays, title: "Pick a date & zone", text: "Live availability for every station in the lounge." },
    { icon: Clock, title: "Choose time & duration", text: "Hourly slots or a discounted day offer." },
    { icon: CreditCard, title: "Pay online", text: "UPI, cards, net banking and wallets — instantly confirmed." },
  ];

  return (
    <Section
      id="booking"
      eyebrow="Booking"
      title="Reserve your station"
      subtitle="Book and pay directly on the website — no phone tag, no waiting."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-8">
          <div className="grid gap-6">
            {steps.map((step) => (
              <div key={step.title} className="flex items-start gap-4">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center"
                  style={{
                    borderRadius: "var(--site-radius)",
                    background: "linear-gradient(140deg, var(--site-primary), var(--site-secondary))",
                    color: "var(--site-on-primary)",
                  }}
                >
                  <step.icon size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold uppercase tracking-[0.16em]">{step.title}</p>
                  <p className="mt-1 text-sm" style={{ color: "var(--site-muted)" }}>
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton label="Book Now" context="Booking section" />
            <WhatsAppEnquireButton />
          </div>
          <p className="mt-4 flex items-center gap-2 text-[11px]" style={{ color: "var(--site-muted)" }}>
            <ShieldCheck size={12} /> Secure online payment · Day offer saves{" "}
            {Math.round(DAY_OFFER.discount * 100)}%
          </p>
        </Card>

        <Card className="p-8">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Bookable zones</h3>
          <ul className="mt-5 grid gap-3 text-sm">
            {gamingZones
              .filter((z) => z.available)
              .map((zone) => (
                <li key={zone.id} className="flex items-center justify-between gap-3">
                  <span className="truncate">{zone.name}</span>
                  <span className="whitespace-nowrap font-bold" style={{ color: "var(--site-primary)" }}>
                    {zone.price}
                  </span>
                </li>
              ))}
          </ul>

          {hours.length > 0 && (
            <div className="mt-8 grid gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">Opening hours</p>
              {hours.map((h) => (
                <div key={h.day} className="flex justify-between text-xs" style={{ color: "var(--site-muted)" }}>
                  <span>{h.day}</span>
                  <span>{h.open}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Section>
  );
}
