import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { useSiteConfig } from "@/config/ConfigProvider";
import { rgba } from "@/lib/site";
import { whatsappEnquiryHref } from "@/lib/booking";
import { cn } from "@/lib/utils";

export function Section({
  id,
  children,
  className,
  eyebrow,
  title,
  subtitle,
}: {
  id?: string | undefined;
  children?: ReactNode;
  className?: string | undefined;
  eyebrow?: string | undefined;
  title?: string | undefined;
  subtitle?: string | undefined;
}) {
  return (
    <section id={id} className={cn("relative px-5 py-20 md:px-10 md:py-28", className)}>
      <div className="mx-auto w-full max-w-6xl">
        {(eyebrow || title || subtitle) && (
          <header className="mb-12 max-w-2xl">
            {eyebrow && (
              <p
                className="mb-3 text-xs font-semibold uppercase tracking-[0.35em]"
                style={{ color: "var(--site-primary)" }}
              >
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-3xl font-bold uppercase leading-tight tracking-tight md:text-5xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-4 text-sm leading-relaxed md:text-base" style={{ color: "var(--site-muted)" }}>
                {subtitle}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

export function Card({
  children,
  className,
  glow,
}: {
  children: ReactNode;
  className?: string | undefined;
  glow?: boolean | undefined;
}) {
  return (
    <div
      className={cn("relative overflow-hidden border backdrop-blur-sm transition-all duration-300", className)}
      style={{
        background: "var(--site-card)",
        borderColor: "var(--site-border)",
        borderRadius: "var(--site-radius)",
        boxShadow: glow ? "var(--site-glow)" : undefined,
      }}
    >
      {children}
    </div>
  );
}

export function BookButton({
  context,
  label,
  className,
  variant = "primary",
  zone,
}: {
  context?: string | undefined;
  label?: string | undefined;
  className?: string | undefined;
  variant?: "primary" | "outline" | "accent" | undefined;
  /** Pre-selects a gaming zone on the booking page. */
  zone?: string | undefined;
}) {
  const { config } = useSiteConfig();
  const classes = cn(
    "inline-flex min-h-[48px] items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-transform duration-200 hover:-translate-y-0.5",
    className,
  );
  const style =
    variant === "outline"
      ? {
          borderRadius: "var(--site-btn-radius)",
          border: "1px solid var(--site-primary)",
          color: "var(--site-primary)",
          background: "transparent",
        }
      : {
          borderRadius: "var(--site-btn-radius)",
          background:
            variant === "accent"
              ? "var(--site-accent)"
              : "linear-gradient(120deg, var(--site-primary), var(--site-secondary))",
          color: variant === "accent" ? "var(--site-on-accent)" : "var(--site-on-primary)",
          boxShadow: variant === "accent" ? "var(--site-glow-accent)" : "var(--site-glow)",
        };
  const text = label ?? config.booking.label ?? "Book Now";

  // Booking always happens on the website — never through WhatsApp.
  if (zone) {
    return (
      <a href={`/book?zone=${encodeURIComponent(zone)}`} className={classes} style={style} data-context={context}>
        {text}
      </a>
    );
  }
  return (
    <Link to="/book" className={classes} style={style} data-context={context}>
      {text}
    </Link>
  );
}

/** WhatsApp is for enquiries only. */
export function WhatsAppEnquireButton({
  className,
  zone,
  label = "Enquire on WhatsApp",
}: {
  className?: string | undefined;
  zone?: string | undefined;
  label?: string | undefined;
}) {
  const { config } = useSiteConfig();
  return (
    <a
      href={whatsappEnquiryHref(config, { zone })}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex min-h-[48px] items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em]",
        className,
      )}
      style={{ border: "1px solid var(--site-border)", borderRadius: "var(--site-btn-radius)" }}
    >
      <MessageCircle size={14} /> {label}
    </a>
  );
}

export function Logo({ size = 40 }: { size?: number }) {
  const { config } = useSiteConfig();
  const { business } = config;
  const caption = (
    <span className="flex min-w-0 flex-col">
      <span className="truncate text-sm font-black uppercase tracking-[0.22em] md:text-base">{business.name}</span>
      <span
        className="truncate text-[9px] font-semibold uppercase tracking-[0.28em]"
        style={{ color: "var(--site-muted)" }}
      >
        Gaming Lounge
      </span>
    </span>
  );

  if (business.logo) {
    return (
      <span className="flex min-w-0 items-center gap-3">
        <img
          src={business.logo}
          alt={`${business.name} logo`}
          style={{ height: size, width: size }}
          className="shrink-0 rounded-full object-contain"
        />
        {caption}
      </span>
    );
  }
  const mark = (business.name || "?").trim().charAt(0).toUpperCase();
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span
        className="grid shrink-0 place-items-center font-black"
        style={{
          height: size,
          width: size,
          borderRadius: "var(--site-radius)",
          background: "linear-gradient(140deg, var(--site-primary), var(--site-accent))",
          color: "var(--site-on-primary)",
          boxShadow: "var(--site-glow)",
          fontSize: size * 0.5,
        }}
      >
        {mark}
      </span>
      {caption}
    </span>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  const { config } = useSiteConfig();
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
      style={{
        background: rgba(config.branding.primaryColor, 0.12),
        color: "var(--site-primary)",
        border: "1px solid var(--site-border)",
      }}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, note }: { title: string; note?: string | undefined }) {
  return (
    <Card className="p-12 text-center">
      <p className="text-lg font-semibold uppercase tracking-[0.15em]">{title}</p>
      {note && (
        <p className="mt-3 text-sm" style={{ color: "var(--site-muted)" }}>
          {note}
        </p>
      )}
    </Card>
  );
}
