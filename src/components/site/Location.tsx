import { MapPin, Phone, Mail, Clock, Navigation } from "lucide-react";
import { useSiteConfig } from "@/config/ConfigProvider";
import { Card, Section } from "./primitives";

export function Location() {
  const { config } = useSiteConfig();
  const { contact, hours } = config;
  const hasAny = contact.address || contact.phone || contact.email || contact.mapEmbedUrl;
  if (!hasAny) return null;

  return (
    <Section id="location" eyebrow="Contact & Location" title="Visit the lounge">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-8">
          <div className="grid gap-5 text-sm">
            {contact.address && (
              <div className="flex items-start gap-3">
                <MapPin size={16} style={{ color: "var(--site-primary)", flexShrink: 0 }} />
                <span style={{ color: "var(--site-muted)" }}>{contact.address}</span>
              </div>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-3">
                <Phone size={16} style={{ color: "var(--site-primary)" }} />
                <span style={{ color: "var(--site-muted)" }}>{contact.phone}</span>
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-3">
                <Mail size={16} style={{ color: "var(--site-primary)" }} />
                <span style={{ color: "var(--site-muted)" }}>{contact.email}</span>
              </a>
            )}
            {hours.length > 0 && (
              <div className="flex items-start gap-3">
                <Clock size={16} style={{ color: "var(--site-primary)", flexShrink: 0 }} />
                <div className="grid gap-1">
                  {hours.map((h) => (
                    <span key={h.day} style={{ color: "var(--site-muted)" }}>
                      {h.day}: {h.open}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {contact.googleMapsUrl && (
              <a
                href={contact.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex w-fit items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em]"
                style={{
                  border: "1px solid var(--site-primary)",
                  color: "var(--site-primary)",
                  borderRadius: "var(--site-btn-radius)",
                }}
              >
                <Navigation size={14} /> Get directions
              </a>
            )}
          </div>
        </Card>

        {contact.mapEmbedUrl && (
          <Card className="min-h-[320px] overflow-hidden">
            <iframe
              title={`${config.business.name} location map`}
              src={contact.mapEmbedUrl}
              loading="lazy"
              className="h-full min-h-[320px] w-full border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Card>
        )}
      </div>
    </Section>
  );
}
