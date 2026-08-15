import { Instagram, Facebook, Youtube, Twitch, MessageCircle, MapPin, Phone, Mail } from "lucide-react";
import { useSiteConfig } from "@/config/ConfigProvider";
import { Logo } from "./primitives";

export function Footer() {
  const { config } = useSiteConfig();
  const { business, contact, social, hours } = config;

  const socials = [
    { href: social.instagram, Icon: Instagram, label: "Instagram" },
    { href: social.facebook, Icon: Facebook, label: "Facebook" },
    { href: social.youtube, Icon: Youtube, label: "YouTube" },
    { href: social.twitch, Icon: Twitch, label: "Twitch" },
    { href: social.discord, Icon: MessageCircle, label: "Discord" },
  ].filter((s) => Boolean(s.href));

  return (
    <footer className="border-t px-5 py-14 md:px-10" style={{ borderColor: "var(--site-border)" }}>
      <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-3">
        <div>
          <Logo size={38} />
          {business.description && (
            <p className="mt-5 max-w-sm text-xs leading-relaxed" style={{ color: "var(--site-muted)" }}>
              {business.description}
            </p>
          )}
          {socials.length > 0 && (
            <div className="mt-6 flex gap-3">
              {socials.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center border transition-colors"
                  style={{
                    borderColor: "var(--site-border)",
                    borderRadius: "var(--site-radius)",
                    color: "var(--site-primary)",
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-3 text-xs" style={{ color: "var(--site-muted)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--site-fg)" }}>
            Contact
          </p>
          {contact.address && (
            <span className="flex items-start gap-2">
              <MapPin size={14} style={{ color: "var(--site-primary)", flexShrink: 0 }} /> {contact.address}
            </span>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2">
              <Phone size={14} style={{ color: "var(--site-primary)" }} /> {contact.phone}
            </a>
          )}
          {contact.whatsapp && (
            <a
              href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2"
            >
              <MessageCircle size={14} style={{ color: "var(--site-primary)" }} /> WhatsApp
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="flex items-center gap-2">
              <Mail size={14} style={{ color: "var(--site-primary)" }} /> {contact.email}
            </a>
          )}
        </div>

        {hours.length > 0 && (
          <div className="grid gap-3 text-xs" style={{ color: "var(--site-muted)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--site-fg)" }}>
              Opening hours
            </p>
            {hours.map((h) => (
              <div key={h.day} className="flex justify-between gap-4">
                <span>{h.day}</span>
                <span>{h.open}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="mx-auto mt-12 w-full max-w-6xl border-t pt-6 text-[11px]"
        style={{ borderColor: "var(--site-border)", color: "var(--site-muted)" }}
      >
        © {new Date().getFullYear()} {business.name}. All rights reserved.
      </div>
    </footer>
  );
}
