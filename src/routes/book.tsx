import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock,
  CircleCheck,
  Loader2,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";

import { useSiteConfig } from "@/config/ConfigProvider";
import { Calendar } from "@/components/ui/calendar";
import { createBooking, getAvailability, verifyBookingPayment } from "@/lib/booking.functions";
import {
  DAY_OFFER,
  bookableZones,
  quoteBooking,
  formatDateLong,
  formatINR,
  formatTime,
  slotIsFree,
  toISODate,
  whatsappEnquiryHref,
  type BookedRange,
  type OfferType,
} from "@/lib/booking";
import { themeVars } from "@/lib/site";
import { BottomNav } from "@/components/site/BottomNav";
import { SiteThemeProvider } from "@/components/site/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Gaming Session — Playsole Gaming Lounge" },
      {
        name: "description",
        content:
          "Reserve a PC battle station, console lounge, racing simulator or VR arena. Pick your date, time and duration, then pay securely online.",
      },
      { property: "og:title", content: "Book a Gaming Session" },
      {
        property: "og:description",
        content: "Choose your zone, slot and duration, then confirm and pay online in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookPage,
});

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type Confirmation = {
  ref: string;
  status: "paid" | "pending";
  zone: string;
  date: string;
  time: string;
  duration: number;
  players: number;
  amount: number;
  note?: string;
};

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("border p-5", className)}
      style={{
        background: "var(--site-card)",
        borderColor: "var(--site-border)",
        borderRadius: "calc(var(--site-radius) + 8px)",
      }}
    >
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: "var(--site-muted)" }}>
      {children}
    </p>
  );
}

function Chip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="min-h-[48px] px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] transition-all disabled:cursor-not-allowed disabled:opacity-35"
      style={{
        borderRadius: "var(--site-btn-radius)",
        border: `1px solid ${active ? "var(--site-primary)" : "var(--site-border)"}`,
        background: active ? "var(--site-primary)" : "transparent",
        color: active ? "var(--site-on-primary)" : "var(--site-fg)",
        boxShadow: active ? "var(--site-glow)" : undefined,
      }}
    >
      {children}
    </button>
  );
}

function Stepper({
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix: string;
  onChange: (next: number) => void;
}) {
  const button = (icon: React.ReactNode, next: number, disabled: boolean) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(next)}
      className="grid h-12 w-12 place-items-center disabled:opacity-30"
      style={{
        borderRadius: "var(--site-btn-radius)",
        border: "1px solid var(--site-border)",
      }}
    >
      {icon}
    </button>
  );
  return (
    <div className="flex items-center gap-4">
      {button(<Minus size={16} />, Math.max(min, value - step), value <= min)}
      <span className="min-w-[110px] text-center text-lg font-black">
        {value} {suffix}
      </span>
      {button(<Plus size={16} />, Math.min(max, value + step), value >= max)}
    </div>
  );
}

function BookPage() {
  return (
    <SiteThemeProvider>
      <BookingFlow />
    </SiteThemeProvider>
  );
}

function BookingFlow() {
  const { config, slug } = useSiteConfig();
  const zones = useMemo(() => bookableZones(config), [config]);
  const [zoneParam, setZoneParam] = useState<string>("");
  useEffect(() => {
    setZoneParam(new URLSearchParams(window.location.search).get("zone") ?? "");
  }, []);

  const [offer, setOffer] = useState<OfferType>("hourly");
  const [date, setDate] = useState<Date>(() => new Date());
  const [zoneId, setZoneId] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [timeHour, setTimeHour] = useState(12);
  const [timeMinute, setTimeMinute] = useState(0);
  const [timePeriod, setTimePeriod] = useState<"AM" | "PM">("PM");
  const [duration, setDuration] = useState(1);
  const [players, setPlayers] = useState(1);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [booked, setBooked] = useState<BookedRange[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const fetchAvailability = useServerFn(getAvailability);
  const submitBooking = useServerFn(createBooking);
  const verifyPayment = useServerFn(verifyBookingPayment);

  // Default zone from ?zone= or the first bookable zone.
  useEffect(() => {
    if (zoneId || !zones.length) return;
    const preferred = zones.find((z) => z.id === zoneParam);
    setZoneId(preferred?.id ?? zones[0]!.id);
  }, [zones, zoneId, zoneParam]);

  const zone = zones.find((z) => z.id === zoneId) ?? zones[0];
  const isoDate = toISODate(date);

  useEffect(() => {
    // Keep the customer's selected duration when switching offer tabs.
    // The day offer is a percentage discount, not a forced 8-hour session.
    if (offer === "hourly" && duration > 12) setDuration(12);
  }, [offer, duration]);

  useEffect(() => {
    let cancelled = false;
    if (!zone) return;
    void fetchAvailability({ data: { slug, zoneId: zone.id, date: isoDate } }).then((result) => {
      if (!cancelled) setBooked(result.booked as BookedRange[]);
    });
    return () => {
      cancelled = true;
    };
  }, [zone, isoDate, slug, fetchAvailability]);

  const minuteOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const hourOptions = Array.from({ length: 12 }, (_, index) => index + 1);

  const to24Hour = (hour12: number, period: "AM" | "PM") => {
    if (period === "AM") return hour12 === 12 ? 0 : hour12;
    return hour12 === 12 ? 12 : hour12 + 12;
  };

  const makeTime = (hour12: number, minute: number, period: "AM" | "PM") =>
    `${String(to24Hour(hour12, period)).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  const selectedTime = makeTime(timeHour, timeMinute, timePeriod);
  const selectedTimeFree = slotIsFree(selectedTime, duration, booked);

  const setTime = (hour12: number, minute: number, period: "AM" | "PM") => {
    setTimeHour(hour12);
    setTimeMinute(minute);
    setTimePeriod(period);
    const next = makeTime(hour12, minute, period);
    setStartTime(slotIsFree(next, duration, booked) ? next : "");
  };

  const hasFreeMinute = (hour12: number, period: "AM" | "PM") =>
    minuteOptions.some((minute) => slotIsFree(makeTime(hour12, minute, period), duration, booked));

  // SINGLE source of truth for money: summary, total, payment and confirmation
  // all read from this one quote.
  const quote = useMemo(
    () =>
      quoteBooking({
        price: zone?.price ?? "",
        durationHours: duration,
        players,
        discountPercent: offer === "day" ? DAY_OFFER.discount * 100 : 0,
      }),
    [zone?.price, duration, players, offer],
  );
  const total = quote.total;

  // Keep the selected minute slot valid when duration/zone/date changes.
  useEffect(() => {
    const next = makeTime(timeHour, timeMinute, timePeriod);
    if (slotIsFree(next, duration, booked)) {
      if (startTime !== next) setStartTime(next);
      return;
    }
    if (startTime) setStartTime("");
  }, [duration, booked, timeHour, timeMinute, timePeriod, startTime]);

  const detailsValid =
    customer.name.trim().length >= 2 &&
    customer.phone.replace(/\D/g, "").length >= 8 &&
    /.+@.+\..+/.test(customer.email.trim());
  const canSubmit = Boolean(zone) && Boolean(startTime) && detailsValid && total > 0 && !busy;

  const proceed = useCallback(async () => {
    if (!zone || !startTime) return;
    setBusy(true);
    setError(null);
    try {
      const result = await submitBooking({
        data: {
          slug,
          zoneId: zone.id,
          zoneName: zone.name,
          date: isoDate,
          startTime,
          durationHours: duration,
          players,
          offer,
          amount: total,
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          email: customer.email.trim(),
        },
      });

      if (!result.ok || !result.booking) {
        setError(result.error ?? "Could not create the booking");
        return;
      }

      const base: Confirmation = {
        ref: result.booking.ref,
        status: "pending",
        zone: zone.name,
        date: isoDate,
        time: startTime,
        duration,
        players,
        amount: total,
      };

      if (!result.payment?.paymentReady) {
        setConfirmation({
          ...base,
          note:
            "Your slot is held. Online payment is being activated — our team will confirm and share the payment link shortly.",
        });
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        setConfirmation({ ...base, note: "Slot held — the payment window could not open. Please retry payment." });
        return;
      }

      const checkout = new window.Razorpay({
        key: result.payment.keyId,
        order_id: result.payment.orderId,
        amount: result.payment.amount * 100,
        currency: "INR",
        name: config.business.name,
        description: `${zone.name} · ${formatDateLong(isoDate)} · ${formatTime(startTime)}`,
        prefill: { name: customer.name, contact: customer.phone, email: customer.email },
        theme: { color: config.branding.primaryColor },
        handler: async (response: Record<string, string>) => {
          const verified = await verifyPayment({
            data: {
              bookingRef: base.ref,
              razorpayOrderId: response["razorpay_order_id"] ?? "",
              razorpayPaymentId: response["razorpay_payment_id"] ?? "",
              razorpaySignature: response["razorpay_signature"] ?? "",
            },
          });
          setConfirmation({
            ...base,
            status: verified.ok ? "paid" : "pending",
            ...(verified.ok ? {} : { note: verified.error ?? "Payment could not be verified" }),
          });
        },
        modal: {
          ondismiss: () =>
            setConfirmation({ ...base, note: "Payment was cancelled. Your slot is held for a short while." }),
        },
      } as unknown as Record<string, unknown>);
      checkout.open();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [
    zone,
    startTime,
    submitBooking,
    slug,
    isoDate,
    duration,
    players,
    offer,
    total,
    customer,
    config.business.name,
    config.branding.primaryColor,
    verifyPayment,
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div style={themeVars(config)} className="min-h-screen overflow-x-hidden">
      <header
        className="sticky top-0 z-40 border-b px-4 py-4 backdrop-blur-md"
        style={{ borderColor: "var(--site-border)", background: "var(--site-bg)" }}
      >
        <div className="mx-auto grid w-full max-w-3xl grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <Link
            to="/"
            className="grid h-10 w-10 shrink-0 place-items-center border"
            style={{ borderColor: "var(--site-border)", borderRadius: "var(--site-btn-radius)" }}
            aria-label="Back to home"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-base font-black uppercase tracking-[0.18em]">Book a session</h1>
            <p className="truncate text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--site-muted)" }}>
              {config.business.name} · Gaming Lounge
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-6">
        {confirmation ? (
          <Panel className="text-center">
            <span
              className="mx-auto grid h-16 w-16 place-items-center rounded-full"
              style={{
                background: confirmation.status === "paid" ? "var(--site-primary)" : "var(--site-accent)",
                color: confirmation.status === "paid" ? "var(--site-on-primary)" : "var(--site-on-accent)",
              }}
            >
              <BadgeCheck size={28} />
            </span>
            <h2 className="mt-5 text-2xl font-black uppercase tracking-tight">
              {confirmation.status === "paid" ? "Booking confirmed" : "Slot reserved"}
            </h2>
            <p className="mt-2 text-xs uppercase tracking-[0.24em]" style={{ color: "var(--site-primary)" }}>
              Booking ID {confirmation.ref}
            </p>
            {confirmation.note && (
              <p className="mx-auto mt-4 max-w-md text-sm" style={{ color: "var(--site-muted)" }}>
                {confirmation.note}
              </p>
            )}
            <div className="mt-6 grid gap-2 text-left text-sm">
              {[
                ["Zone", confirmation.zone],
                ["Date", formatDateLong(confirmation.date)],
                ["Time", `${formatTime(confirmation.time)} · ${confirmation.duration}h`],
                ["Players", String(confirmation.players)],
                ["Total", formatINR(confirmation.amount)],
                ["Payment", confirmation.status === "paid" ? "Paid online" : "Pending"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between border-b pb-2"
                  style={{ borderColor: "var(--site-border)" }}
                >
                  <span style={{ color: "var(--site-muted)" }}>{k}</span>
                  <span className="font-bold">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/"
                className="min-h-[48px] px-6 py-3 text-xs font-bold uppercase tracking-[0.2em]"
                style={{
                  borderRadius: "var(--site-btn-radius)",
                  background: "linear-gradient(120deg, var(--site-primary), var(--site-secondary))",
                  color: "var(--site-on-primary)",
                }}
              >
                Back to home
              </Link>
              <a
                href={whatsappEnquiryHref(config, {
                  zone: confirmation.zone,
                  date: confirmation.date,
                  time: formatTime(confirmation.time),
                  players: confirmation.players,
                })}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[48px] items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em]"
                style={{ border: "1px solid var(--site-border)", borderRadius: "var(--site-btn-radius)" }}
              >
                <MessageCircle size={14} /> Enquire on WhatsApp
              </a>
            </div>
          </Panel>
        ) : (
          <div className="grid gap-5">
            {/* Offer tabs */}
            <div
              className="grid grid-cols-2 gap-2 p-2"
              style={{
                background: "var(--site-card)",
                border: "1px solid var(--site-border)",
                borderRadius: "calc(var(--site-radius) + 8px)",
              }}
            >
              <Chip active={offer === "hourly"} onClick={() => setOffer("hourly")}>
                Hourly booking
              </Chip>
              <Chip active={offer === "day"} onClick={() => setOffer("day")}>
                Day offer · -{Math.round(DAY_OFFER.discount * 100)}%
              </Chip>
            </div>

            <Panel>
              <Label>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={13} /> Choose a date
                </span>
              </Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(next) => next && setDate(next)}
                disabled={{ before: today }}
                className="pointer-events-auto mx-auto !bg-transparent [--cell-size:2.6rem]"
                style={{ color: "var(--site-fg)" }}
              />
              <p className="mt-2 text-center text-xs" style={{ color: "var(--site-muted)" }}>
                {formatDateLong(isoDate)}
              </p>
            </Panel>

            <Panel>
              <Label>Gaming zone</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {zones.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setZoneId(z.id)}
                    className="min-h-[64px] px-4 py-3 text-left transition-all"
                    style={{
                      borderRadius: "var(--site-btn-radius)",
                      border: `1px solid ${z.id === zoneId ? "var(--site-primary)" : "var(--site-border)"}`,
                      boxShadow: z.id === zoneId ? "var(--site-glow)" : undefined,
                    }}
                  >
                    <span className="block text-sm font-bold uppercase tracking-wide">{z.name}</span>
                    <span className="block text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--site-primary)" }}>
                      {z.price}
                    </span>
                  </button>
                ))}
              </div>
              {zones.length === 0 && (
                <p className="text-sm" style={{ color: "var(--site-muted)" }}>
                  No bookable zones configured yet.
                </p>
              )}
            </Panel>

            <Panel className="overflow-hidden p-0">
              <div className="border-b px-5 py-5" style={{ borderColor: "var(--site-border)" }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: "var(--site-muted)" }}>
                      <span className="inline-flex items-center gap-2"><Clock size={13} /> Choose start time</span>
                    </p>
                    <p className="mt-1 text-sm" style={{ color: "var(--site-muted)" }}>
                      Pick the hour, then fine-tune the minutes.
                    </p>
                  </div>
                  <div className="rounded-2xl px-4 py-3 text-right" style={{ background: "var(--site-bg)", border: "1px solid var(--site-border)" }}>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--site-muted)" }}>Selected</span>
                    <strong className="text-lg" style={{ color: "var(--site-primary)" }}>{startTime ? formatTime(startTime) : "Select a time"}</strong>
                  </div>
                </div>
              </div>

              <div className="px-5 py-5">
                <div className="mb-4 flex items-center gap-2 rounded-2xl p-2" style={{ background: "var(--site-bg)", border: "1px solid var(--site-border)" }}>
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      aria-label="Selected hour"
                      inputMode="numeric"
                      value={timeHour}
                      onChange={(e) => {
                        const next = Math.min(12, Math.max(1, Number(e.target.value) || 1));
                        setTimeHour(next);
                        setStartTime("");
                      }}
                      className="w-16 rounded-xl bg-transparent px-2 py-2 text-center text-2xl font-black outline-none"
                    />
                    <span className="text-2xl font-black">:</span>
                    <input
                      aria-label="Selected minute"
                      inputMode="numeric"
                      value={String(timeMinute).padStart(2, "0")}
                      onChange={(e) => {
                        const raw = Math.min(59, Math.max(0, Number(e.target.value) || 0));
                        const next = Math.floor(raw / 5) * 5;
                        setTimeMinute(next);
                        setStartTime("");
                      }}
                      className="w-16 rounded-xl bg-transparent px-2 py-2 text-center text-2xl font-black outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1 rounded-xl p-1" style={{ border: "1px solid var(--site-border)" }}>
                    {(["AM", "PM"] as const).map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => {
                          setTimePeriod(period);
                          setStartTime("");
                        }}
                        className="min-w-[58px] rounded-lg px-3 py-2 text-xs font-bold"
                        style={{
                          background: timePeriod === period ? "var(--site-primary)" : "transparent",
                          color: timePeriod === period ? "var(--site-on-primary)" : "var(--site-muted)",
                        }}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--site-muted)" }}>Hour</p>
                <div className="grid grid-cols-4 gap-2">
                  {hourOptions.map((hour) => {
                    const active = timeHour === hour;
                    const available = hasFreeMinute(hour, timePeriod);
                    return (
                      <button
                        key={hour}
                        type="button"
                        disabled={!available}
                        onClick={() => setTime(hour, timeMinute, timePeriod)}
                        className="min-h-14 rounded-xl text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-30"
                        style={{
                          border: `1px solid ${active ? "var(--site-primary)" : "var(--site-border)"}`,
                          background: active ? "var(--site-primary)" : "transparent",
                          color: active ? "var(--site-on-primary)" : "var(--site-fg)",
                          boxShadow: active ? "var(--site-glow)" : undefined,
                        }}
                      >
                        {hour}
                      </button>
                    );
                  })}
                </div>

                <p className="mb-3 mt-6 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--site-muted)" }}>Quick minutes</p>
                <div className="grid grid-cols-4 gap-2">
                  {minuteOptions.map((minute) => {
                    const active = timeMinute === minute;
                    const candidate = makeTime(timeHour, minute, timePeriod);
                    const available = slotIsFree(candidate, duration, booked);
                    return (
                      <button
                        key={minute}
                        type="button"
                        disabled={!available}
                        onClick={() => setTime(timeHour, minute, timePeriod)}
                        className="min-h-12 rounded-xl text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-30"
                        style={{
                          border: `1px solid ${active ? "var(--site-primary)" : "var(--site-border)"}`,
                          background: active ? "var(--site-primary)" : "transparent",
                          color: active ? "var(--site-on-primary)" : "var(--site-fg)",
                        }}
                      >
                        {String(minute).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={!selectedTimeFree}
                  onClick={() => setStartTime(selectedTime)}
                  className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl text-sm font-black uppercase tracking-[0.16em] disabled:opacity-40"
                  style={{
                    background: "linear-gradient(120deg, var(--site-primary), var(--site-secondary))",
                    color: "var(--site-on-primary)",
                    boxShadow: "var(--site-glow)",
                  }}
                >
                  <CircleCheck size={17} /> {selectedTimeFree ? `Confirm ${formatTime(selectedTime)}` : "Choose an available time"}
                </button>

                <p className="mt-3 text-center text-[11px]" style={{ color: "var(--site-muted)" }}>
                  5-minute intervals · unavailable times are automatically disabled.
                </p>
              </div>
            </Panel>

            <div className="grid gap-5 sm:grid-cols-2">
              <Panel>
                <Label>Duration</Label>
                {offer === "day" && (
                  <p className="mb-3 text-[11px]" style={{ color: "var(--site-primary)" }}>
                    30% off your selected duration — choose the hours below.
                  </p>
                )}
                <Stepper
                  value={duration}
                  min={1}
                  max={12}
                  suffix={duration === 1 ? "hour" : "hours"}
                  onChange={setDuration}
                />
              </Panel>
              <Panel>
                <Label>
                  <span className="inline-flex items-center gap-2">
                    <Users size={13} /> Players
                  </span>
                </Label>
                <Stepper value={players} min={1} max={20} suffix={players === 1 ? "player" : "players"} onChange={setPlayers} />
              </Panel>
            </div>

            <Panel>
              <Label>Your details</Label>
              <div className="grid gap-3">
                {(
                  [
                    ["name", "Full name", "text", "Your name"],
                    ["phone", "Mobile number", "tel", "+91 00000 00000"],
                    ["email", "Email", "email", "you@email.com"],
                  ] as const
                ).map(([key, label, type, placeholder]) => (
                  <label key={key} className="grid gap-2 text-[11px] uppercase tracking-[0.18em]">
                    {label}
                    <input
                      type={type}
                      value={customer[key]}
                      maxLength={key === "email" ? 160 : 80}
                      placeholder={placeholder}
                      onChange={(e) => setCustomer({ ...customer, [key]: e.target.value })}
                      className="min-h-[52px] px-4 py-3 text-sm outline-none"
                      style={{
                        background: "transparent",
                        border: "1px solid var(--site-border)",
                        borderRadius: "var(--site-btn-radius)",
                        color: "var(--site-fg)",
                      }}
                    />
                  </label>
                ))}
              </div>
            </Panel>

            <Panel>
              <Label>Booking summary</Label>
              <div className="grid gap-2 text-sm">
                {[
                  ["Zone", zone?.name ?? "—"],
                  ["Date", formatDateLong(isoDate)],
                  ["Time", startTime ? formatTime(startTime) : "Select a slot"],
                  ["Duration", `${duration} ${duration === 1 ? "hour" : "hours"}`],
                  ["Players", String(players)],
                  ["Offer", offer === "day" ? `Day offer (-${Math.round(DAY_OFFER.discount * 100)}%)` : "Hourly"],
                  [
                    "Rate",
                    quote.rate
                      ? `${formatINR(quote.rate)} / ${quote.unitLabel} × ${quote.units} ${quote.unitLabel}${quote.units === 1 ? "" : "s"} × ${players} ${players === 1 ? "player" : "players"}`
                      : "—",
                  ],
                  ["Subtotal", formatINR(quote.subtotal)],
                  ...(quote.discountAmount
                    ? [["Discount", `− ${formatINR(quote.discountAmount)}`] as [string, string]]
                    : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3">
                    <span style={{ color: "var(--site-muted)" }}>{k}</span>
                    <span className="text-right font-semibold">{v}</span>
                  </div>
                ))}
              </div>
              <div
                className="mt-4 flex items-center justify-between border-t pt-4"
                style={{ borderColor: "var(--site-border)" }}
              >
                <span className="text-xs font-bold uppercase tracking-[0.22em]">Total</span>
                <span className="text-2xl font-black" style={{ color: "var(--site-primary)" }}>
                  {formatINR(total)}
                </span>
              </div>
            </Panel>

            {error && (
              <p className="text-sm font-semibold" style={{ color: "var(--site-accent)" }}>
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => void proceed()}
              className="inline-flex min-h-[58px] items-center justify-center gap-2 px-6 text-sm font-black uppercase tracking-[0.2em] transition-transform disabled:opacity-40"
              style={{
                borderRadius: "var(--site-btn-radius)",
                background: "linear-gradient(120deg, var(--site-primary), var(--site-secondary))",
                color: "var(--site-on-primary)",
                boxShadow: "var(--site-glow)",
              }}
            >
              {busy ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
              Proceed to payment
            </button>
            <p className="flex items-center justify-center gap-2 text-[11px]" style={{ color: "var(--site-muted)" }}>
              <ShieldCheck size={12} /> Secure UPI · Cards · Net banking · Wallets
            </p>

            <a
              href={whatsappEnquiryHref(config, {
                zone: zone?.name,
                date: isoDate,
                time: startTime ? formatTime(startTime) : "",
                players,
              })}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[50px] items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em]"
              style={{ border: "1px solid var(--site-border)", borderRadius: "var(--site-btn-radius)" }}
            >
              <MessageCircle size={14} /> Enquire on WhatsApp instead
            </a>
          </div>
        )}
      </main>

      <BottomNav active="book" />
    </div>
  );
}
