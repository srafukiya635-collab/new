import type { SiteConfig } from "@/config/types";

export function hexToRgb(hex: string): [number, number, number] {
  const clean = (hex || "#000000").replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0").slice(0, 6);
  const int = parseInt(full, 16);
  if (Number.isNaN(int)) return [0, 0, 0];
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

export function rgba(hex: string, alpha: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Readable text color on top of an arbitrary brand color. */
export function contrastOn(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#05060B" : "#FFFFFF";
}

/** CSS custom properties derived entirely from the client's branding config. */
export function themeVars(config: SiteConfig): React.CSSProperties {
  const b = config.branding;
  const radius =
    b.buttonStyle === "pill" ? 999 : b.buttonStyle === "sharp" ? 2 : b.borderRadius;
  return {
    ["--site-primary" as string]: b.primaryColor,
    ["--site-secondary" as string]: b.secondaryColor,
    ["--site-accent" as string]: b.accentColor,
    ["--site-bg" as string]: b.backgroundColor,
    ["--site-fg" as string]: b.foregroundColor,
    ["--site-card" as string]: b.cardColor,
    ["--site-muted" as string]: rgba(b.foregroundColor, 0.62),
    ["--site-border" as string]: rgba(b.primaryColor, 0.22),
    ["--site-radius" as string]: `${b.borderRadius}px`,
    ["--site-btn-radius" as string]: `${radius}px`,
    ["--site-on-primary" as string]: contrastOn(b.primaryColor),
    ["--site-on-accent" as string]: contrastOn(b.accentColor),
    ["--site-glow" as string]: `0 0 ${18 + b.glowIntensity * 42}px ${rgba(
      b.primaryColor,
      0.18 + b.glowIntensity * 0.5,
    )}`,
    ["--site-glow-accent" as string]: `0 0 ${16 + b.glowIntensity * 38}px ${rgba(
      b.accentColor,
      0.16 + b.glowIntensity * 0.5,
    )}`,
    ["--site-font" as string]: `"${b.font}", system-ui, sans-serif`,
    color: "var(--site-fg)",
    backgroundColor: "var(--site-bg)",
    fontFamily: "var(--site-font)",
  } as React.CSSProperties;
}

/** Resolves the client's chosen booking channel into a single href. */
export function bookingHref(config: SiteConfig, context?: string) {
  const { booking, contact } = config;
  const message = encodeURIComponent(
    context ? `${booking.message} (${context})` : booking.message,
  );
  switch (booking.type) {
    case "whatsapp": {
      const number = (booking.whatsappNumber || contact.whatsapp || "").replace(/\D/g, "");
      return number ? `https://wa.me/${number}?text=${message}` : "#booking";
    }
    case "phone":
      return contact.phone ? `tel:${contact.phone.replace(/[^\d+]/g, "")}` : "#booking";
    case "url":
      return booking.url || "#booking";
    default:
      return "#booking";
  }
}

export function bookingIsExternal(config: SiteConfig) {
  return config.booking.type === "whatsapp" || config.booking.type === "url";
}

export function initials(name: string) {
  return (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}
