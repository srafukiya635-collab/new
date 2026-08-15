import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Booking + payment server API.
 *
 * All database access happens here (service role, inside the handler only) so
 * booking rows are never publicly readable or writable. Payment verification
 * is done server-side with the Razorpay secret — the secret never reaches the
 * browser. If Razorpay credentials are not configured yet the flow still works
 * end to end and reports `paymentReady: false` instead of breaking the site.
 */

const availabilitySchema = z.object({
  slug: z.string().min(1).max(64).default("default"),
  zoneId: z.string().min(1).max(64),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const bookingSchema = z.object({
  slug: z.string().min(1).max(64).default("default"),
  zoneId: z.string().min(1).max(64),
  zoneName: z.string().min(1).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  durationHours: z.number().min(0.5).max(12),
  players: z.number().int().min(1).max(50),
  offer: z.enum(["hourly", "day"]),
  amount: z.number().int().min(1).max(1_000_000),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(20),
  email: z.string().trim().email().max(160),
});

const verifySchema = z.object({
  bookingRef: z.string().min(4).max(40),
  razorpayOrderId: z.string().min(4).max(80),
  razorpayPaymentId: z.string().min(4).max(80),
  razorpaySignature: z.string().min(8).max(256),
});

function hourOf(value: string) {
  const [h, m] = value.split(":");
  return Number(h ?? 0) + Number(m ?? 0) / 60;
}

function bookingRef() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `PS-${stamp}${rand}`;
}

/** Booked ranges for a zone on a date — used to grey out unavailable slots. */
export const getAvailability = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => availabilitySchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("bookings")
      .select("start_time, duration_hours, status")
      .eq("site_slug", data.slug)
      .eq("zone_id", data.zoneId)
      .eq("booking_date", data.date)
      .in("status", ["pending", "paid"]);
    if (error) return { booked: [], error: "Unable to load availability" };
    const booked = (rows ?? []).map((row) => {
      const start = hourOf(String(row.start_time).slice(0, 5));
      return { start, end: start + Number(row.duration_hours) };
    });
    return { booked, error: null };
  });

/**
 * Creates the booking row (status `pending`) and, when Razorpay credentials
 * exist, the matching payment order.
 */
export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => bookingSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const start = hourOf(data.startTime);
    const end = start + data.durationHours;

    const { data: existing } = await supabaseAdmin
      .from("bookings")
      .select("start_time, duration_hours")
      .eq("site_slug", data.slug)
      .eq("zone_id", data.zoneId)
      .eq("booking_date", data.date)
      .in("status", ["pending", "paid"]);

    const clash = (existing ?? []).some((row) => {
      const s = hourOf(String(row.start_time).slice(0, 5));
      return start < s + Number(row.duration_hours) && end > s;
    });
    if (clash) {
      return {
        ok: false as const,
        error: "That slot was just booked. Please pick another time.",
        booking: null,
        payment: null,
      };
    }

    const ref = bookingRef();
    const { data: inserted, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        booking_ref: ref,
        site_slug: data.slug,
        zone_id: data.zoneId,
        zone_name: data.zoneName,
        booking_date: data.date,
        start_time: `${data.startTime}:00`,
        duration_hours: data.durationHours,
        players: data.players,
        offer_type: data.offer,
        amount_inr: data.amount,
        customer_name: data.name,
        customer_phone: data.phone,
        customer_email: data.email,
        status: "pending",
      })
      .select("booking_ref, status")
      .single();

    if (error || !inserted) {
      return { ok: false as const, error: "Could not create the booking", booking: null, payment: null };
    }

    const keyId = process.env["RAZORPAY_KEY_ID"];
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];

    if (!keyId || !keySecret) {
      return {
        ok: true as const,
        error: null,
        booking: { ref, status: "pending" },
        payment: {
          paymentReady: false as const,
          keyId: null,
          orderId: null,
          amount: data.amount,
        },
      };
    }

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      },
      body: JSON.stringify({
        amount: data.amount * 100,
        currency: "INR",
        receipt: ref,
        notes: { zone: data.zoneName, date: data.date, time: data.startTime },
      }),
    });

    if (!response.ok) {
      return {
        ok: true as const,
        error: "Payment gateway unavailable — our team will confirm your slot.",
        booking: { ref, status: "pending" },
        payment: { paymentReady: false as const, keyId: null, orderId: null, amount: data.amount },
      };
    }

    const order = (await response.json()) as { id: string };
    await supabaseAdmin
      .from("bookings")
      .update({ provider_order_id: order.id })
      .eq("booking_ref", ref);

    return {
      ok: true as const,
      error: null,
      booking: { ref, status: "pending" },
      payment: {
        paymentReady: true as const,
        keyId,
        orderId: order.id,
        amount: data.amount,
      },
    };
  });

/** Server-side signature verification — the only way a booking becomes paid. */
export const verifyBookingPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => verifySchema.parse(input))
  .handler(async ({ data }) => {
    const secret = process.env["RAZORPAY_KEY_SECRET"];
    if (!secret) return { ok: false as const, error: "Payments are not configured" };

    const { createHmac, timingSafeEqual } = await import("crypto");
    const expected = createHmac("sha256", secret)
      .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
      .digest("hex");
    const given = Buffer.from(data.razorpaySignature);
    const exp = Buffer.from(expected);
    if (given.length !== exp.length || !timingSafeEqual(given, exp)) {
      return { ok: false as const, error: "Payment signature verification failed" };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({
        status: "paid",
        provider_payment_id: data.razorpayPaymentId,
      })
      .eq("booking_ref", data.bookingRef)
      .eq("provider_order_id", data.razorpayOrderId);

    if (error) return { ok: false as const, error: "Could not update the booking" };
    return { ok: true as const, error: null };
  });
