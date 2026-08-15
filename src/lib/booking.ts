import type { SiteConfig } from "@/config/types";

/** Bookable window (24h clock). Slots are hourly. */
export const SLOT_START = 10;
export const SLOT_END = 23;

/** Day-offer preset: a long session at a discount. */
export const DAY_OFFER = { hours: 8, discount: 0.3 };

export type OfferType = "hourly" | "day";

export interface Slot {
  value: string;
  label: string;
}

export function slotTimes(): Slot[] {
  const slots: Slot[] = [];
  for (let h = SLOT_START; h <= SLOT_END; h += 1) {
    const value = `${String(h).padStart(2, "0")}:00`;
    slots.push({ value, label: formatTime(value) });
  }
  return slots;
}

export function formatTime(value: string) {
  const [hRaw, mRaw] = value.split(":");
  const h = Number(hRaw ?? 0);
  const m = mRaw ?? "00";
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m} ${suffix}`;
}

export function hourOf(value: string) {
  return Number((value.split(":")[0] ?? "0")) + Number(value.split(":")[1] ?? 0) / 60;
}

export interface Rate {
  amount: number;
  /** "hour" = per hour, "block" = per fixed block of minutes, "session" = flat per booking */
  per: "hour" | "block" | "session" | "unknown";
  /** Length of one block in minutes (only meaningful when per === "block"). */
  blockMinutes: number;
}

/** Reads "₹100 / hour", "₹250 / 30 min", "₹300 / session" or "On request". */
export function parseRate(price: string): Rate {
  const lower = (price || "").toLowerCase();
  const amountMatch = lower.match(/(\d[\d,]*(?:\.\d+)?)\s*(?:\/|per|$)/) ?? lower.match(/(\d[\d,]*(?:\.\d+)?)/);
  const amount = amountMatch ? Math.round(Number((amountMatch[1] ?? "0").replace(/,/g, ""))) : 0;

  // "₹250 / 30 min" -> block pricing of 30 minutes.
  const blockMatch = lower.split("/").slice(1).join("/").match(/(\d+)\s*min/);
  if (blockMatch) return { amount, per: "block", blockMinutes: Math.max(1, Number(blockMatch[1])) };
  if (lower.includes("hour") || lower.includes("/ hr") || lower.includes("hr")) {
    return { amount, per: "hour", blockMinutes: 60 };
  }
  if (lower.includes("session") || lower.includes("game") || lower.includes("race")) {
    return { amount, per: "session", blockMinutes: 60 };
  }
  return { amount, per: "unknown", blockMinutes: 60 };
}

export function bookableZones(config: SiteConfig) {
  return config.gamingZones.filter((zone) => zone.available && parseRate(zone.price).amount > 0);
}

export interface Quote {
  rate: number;
  /** Chargeable units (hours, blocks or sessions) for a single player. */
  units: number;
  unitLabel: string;
  players: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
}

/**
 * THE single source of truth for booking money. Every surface — summary,
 * total, payment payload, confirmation — must read from this function.
 *
 * hourly zone: rate × hours × players, then the discount percentage.
 * block zone (e.g. ₹250 / 30 min): rate × ceil(minutes / blockMinutes) × players.
 * session zone: rate × ceil(hours) × players.
 */
export function quoteBooking(input: {
  price: string;
  durationHours: number;
  players: number;
  discountPercent?: number;
}): Quote {
  const rate = parseRate(input.price);
  const hours = Math.max(1, Number.isFinite(input.durationHours) ? input.durationHours : 1);
  const players = Math.max(1, Math.floor(Number.isFinite(input.players) ? input.players : 1));
  const discountPercent = Math.min(100, Math.max(0, input.discountPercent ?? 0));

  let units = hours;
  let unitLabel = "hour";
  if (rate.per === "block") {
    units = Math.ceil((hours * 60) / rate.blockMinutes);
    unitLabel = `${rate.blockMinutes} min`;
  } else if (rate.per === "session") {
    units = Math.ceil(hours);
    unitLabel = "session";
  }

  const subtotal = Math.round(rate.amount * units * players);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = Math.max(0, subtotal - discountAmount);

  return { rate: rate.amount, units, unitLabel, players, subtotal, discountPercent, discountAmount, total };
}

/** Backwards-compatible helper; delegates to quoteBooking. */
export function computeTotal(price: string, durationHours: number, offer: OfferType, players = 1) {
  return quoteBooking({
    price,
    durationHours,
    players,
    discountPercent: offer === "day" ? DAY_OFFER.discount * 100 : 0,
  }).total;
}


export function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDateLong(date: string) {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** WhatsApp is inquiry-only — never a payment or booking channel. */
export function whatsappEnquiryHref(
  config: SiteConfig,
  details?: {
    zone?: string | undefined;
    date?: string | undefined;
    time?: string | undefined;
    players?: string | number | undefined;
  },
) {
  const number = (config.contact.whatsapp || config.booking.whatsappNumber || "").replace(/\D/g, "");
  const message = [
    `Hi, I want to enquire about ${config.business.name}.`,
    "",
    `Game/Zone: ${details?.zone ?? ""}`,
    `Date: ${details?.date ?? ""}`,
    `Preferred Time: ${details?.time ?? ""}`,
    `Number of Players: ${details?.players ?? ""}`,
    "",
    "Please share availability and details.",
  ].join("\n");
  if (!number) return `mailto:${config.contact.email}?subject=Enquiry&body=${encodeURIComponent(message)}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export interface BookedRange {
  start: number;
  end: number;
}

export function slotIsFree(slot: string, durationHours: number, booked: BookedRange[]) {
  const start = hourOf(slot);
  const end = start + durationHours;
  // Booking starts must stay inside the lounge's opening window. The final
  // session may finish at midnight, so SLOT_END + 1 is the latest end.
  if (start < SLOT_START || end > SLOT_END + 1 || durationHours <= 0) return false;
  return !booked.some((range) => start < range.end && end > range.start);
}
