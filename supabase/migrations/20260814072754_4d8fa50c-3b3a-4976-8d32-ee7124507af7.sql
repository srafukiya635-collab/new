CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref text NOT NULL UNIQUE,
  site_slug text NOT NULL DEFAULT 'default',
  zone_id text NOT NULL,
  zone_name text NOT NULL,
  booking_date date NOT NULL,
  start_time time NOT NULL,
  duration_hours numeric NOT NULL DEFAULT 1,
  players integer NOT NULL DEFAULT 1,
  offer_type text NOT NULL DEFAULT 'hourly',
  amount_inr integer NOT NULL DEFAULT 0,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_provider text NOT NULL DEFAULT 'razorpay',
  provider_order_id text,
  provider_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.bookings TO service_role;
GRANT SELECT ON public.bookings TO authenticated;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX bookings_slot_idx ON public.bookings (site_slug, zone_id, booking_date, start_time);

CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();