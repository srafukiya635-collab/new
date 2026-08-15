import { CalendarDays, Clock, Coins, Trophy, Users } from "lucide-react";
import { useSiteConfig } from "@/config/ConfigProvider";
import { BookButton, Card, EmptyState, Section } from "./primitives";
import { Reveal } from "./Reveal";
import { formatDate, rgba } from "@/lib/site";

export function Tournaments() {
  const { config } = useSiteConfig();
  const events = config.tournaments;

  return (
    <Section
      id="events"
      eyebrow="Events & Tournaments"
      title="Compete for the pot"
      subtitle="Brackets run in-house with live casting. Registration closes when seats fill."
    >
      {events.length === 0 ? (
        <EmptyState
          title="No upcoming events"
          note="New brackets are announced every few weeks — follow along on social or ask us to ping you."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, i) => (
            <Reveal key={event.id} delay={i * 70}>
              <Card className="flex h-full flex-col">
                <div className="relative aspect-[16/9] overflow-hidden">
                  {event.banner ? (
                    <img src={event.banner} alt={event.name} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div
                      className="grid h-full w-full place-items-center"
                      style={{
                        background: `linear-gradient(135deg, ${rgba(
                          config.branding.accentColor,
                          0.4,
                        )}, ${rgba(config.branding.secondaryColor, 0.4)})`,
                      }}
                    >
                      <Trophy size={34} style={{ color: "var(--site-fg)", opacity: 0.85 }} />
                    </div>
                  )}
                  {event.game && (
                    <span
                      className="absolute left-3 top-3 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                      style={{
                        background: rgba(config.branding.backgroundColor, 0.8),
                        borderRadius: "var(--site-radius)",
                        color: "var(--site-primary)",
                      }}
                    >
                      {event.game}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-base font-bold uppercase tracking-wide">{event.name}</h3>
                  <dl className="mt-4 grid flex-1 gap-2 text-xs" style={{ color: "var(--site-muted)" }}>
                    {event.date && (
                      <div className="flex items-center gap-2">
                        <CalendarDays size={13} /> {formatDate(event.date)}
                      </div>
                    )}
                    {event.time && (
                      <div className="flex items-center gap-2">
                        <Clock size={13} /> {event.time}
                      </div>
                    )}
                    {event.prizePool && (
                      <div className="flex items-center gap-2">
                        <Trophy size={13} /> Prize pool {event.prizePool}
                      </div>
                    )}
                    {event.entryFee && (
                      <div className="flex items-center gap-2">
                        <Coins size={13} /> Entry {event.entryFee}
                      </div>
                    )}
                    {event.maxPlayers && (
                      <div className="flex items-center gap-2">
                        <Users size={13} /> {event.maxPlayers}
                      </div>
                    )}
                  </dl>

                  {event.registrationUrl ? (
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 inline-flex w-full items-center justify-center px-5 py-3 text-xs font-bold uppercase tracking-[0.2em]"
                      style={{
                        background: "linear-gradient(120deg, var(--site-primary), var(--site-secondary))",
                        color: "var(--site-on-primary)",
                        borderRadius: "var(--site-btn-radius)",
                      }}
                    >
                      Register
                    </a>
                  ) : (
                    <BookButton context={`Register: ${event.name}`} label="Register" className="mt-6 w-full" />
                  )}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}
