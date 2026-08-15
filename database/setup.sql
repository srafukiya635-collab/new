-- ============================================================================
--  Gaming lounge template — database bootstrap
--  Run this ONCE in the Supabase SQL editor for each client installation.
--
--  It is fully idempotent and non-destructive:
--    * nothing is dropped, truncated or reset
--    * existing rows (client_sites config, users, roles, bookings) are kept
--    * an existing owner/admin is preserved and never replaced
--  Re-running it is safe; it only repairs missing pieces.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Roles
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t
                 JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'app_role' AND n.nspname = 'public') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Signed-in users may READ roles only. There is deliberately no INSERT/UPDATE/
-- DELETE grant or policy: every write happens through SECURITY DEFINER
-- functions below, so nobody can self-promote by crafting a REST request.
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL    ON public.user_roles TO service_role;
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated;
REVOKE ALL   ON public.user_roles FROM anon;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
CREATE POLICY "Admins can read all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- 2. Per-installation site configuration
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.client_sites TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_sites TO authenticated;
GRANT ALL ON public.client_sites TO service_role;
ALTER TABLE public.client_sites ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS client_sites_set_updated_at ON public.client_sites;
CREATE TRIGGER client_sites_set_updated_at
BEFORE UPDATE ON public.client_sites
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Public read (the website itself is public), admin-only writes.
DROP POLICY IF EXISTS "Anyone can view client sites" ON public.client_sites;
CREATE POLICY "Anyone can view client sites"
ON public.client_sites FOR SELECT TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can insert client sites" ON public.client_sites;
CREATE POLICY "Admins can insert client sites"
ON public.client_sites FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update client sites" ON public.client_sites;
CREATE POLICY "Admins can update client sites"
ON public.client_sites FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete client sites" ON public.client_sites;
CREATE POLICY "Admins can delete client sites"
ON public.client_sites FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Default row for a fresh installation. Never overwrites an existing config.
INSERT INTO public.client_sites (slug, name, config)
VALUES ('default', 'NEXUS ARENA', '{}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. Bookings (kept as-is; created only if missing)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
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

DROP POLICY IF EXISTS "Admins can view bookings" ON public.bookings;
CREATE POLICY "Admins can view bookings"
ON public.bookings FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS bookings_slot_idx
  ON public.bookings (site_slug, zone_id, booking_date, start_time);

DROP TRIGGER IF EXISTS bookings_set_updated_at ON public.bookings;
CREATE TRIGGER bookings_set_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Site owner — "first signed-in user becomes owner/admin"
-- ---------------------------------------------------------------------------
-- Single-row table. `singleton` is the primary key and is CHECKed to be true,
-- so at most ONE owner row can ever exist. That constraint is what makes the
-- first-admin claim atomic: if two people sign in at the same millisecond,
-- exactly one INSERT wins and the other hits ON CONFLICT DO NOTHING.
CREATE TABLE IF NOT EXISTS public.site_owner (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  user_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_owner TO authenticated;
GRANT ALL    ON public.site_owner TO service_role;
REVOKE INSERT, UPDATE, DELETE ON public.site_owner FROM authenticated;
REVOKE ALL   ON public.site_owner FROM anon;
ALTER TABLE public.site_owner ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read the owner record" ON public.site_owner;
CREATE POLICY "Authenticated users can read the owner record"
ON public.site_owner FOR SELECT TO authenticated USING (true);

-- Preserve an existing installation: if an admin already exists, the earliest
-- one is recorded as owner. Never replaces an owner row that already exists.
INSERT INTO public.site_owner (singleton, user_id)
SELECT true, ur.user_id
FROM public.user_roles ur
WHERE ur.role = 'admin'
ORDER BY ur.created_at ASC
LIMIT 1
ON CONFLICT (singleton) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.site_owner WHERE user_id = _user_id)
$$;

-- Called by the app right after sign-in. Returns true only for the account
-- that actually owns this installation.
CREATE OR REPLACE FUNCTION public.claim_ownership()
RETURNS boolean
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Atomic: only the very first caller can insert the singleton row.
  INSERT INTO public.site_owner (singleton, user_id)
  VALUES (true, uid)
  ON CONFLICT (singleton) DO NOTHING;

  IF EXISTS (SELECT 1 FROM public.site_owner WHERE user_id = uid) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN true;
  END IF;

  -- An owner already exists and it is not this user: no privileges granted.
  RETURN false;
END;
$$;

-- ---------------------------------------------------------------------------
-- 5. Admin management (admins only, enforced inside the functions)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.list_admins()
RETURNS TABLE (user_id uuid, email text, is_owner boolean, granted_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT ur.user_id,
         u.email::text,
         public.is_owner(ur.user_id),
         ur.created_at
  FROM public.user_roles ur
  JOIN auth.users u ON u.id = ur.user_id
  WHERE ur.role = 'admin'
  ORDER BY public.is_owner(ur.user_id) DESC, ur.created_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.grant_admin_by_email(_email text)
RETURNS uuid
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  target uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT id INTO target FROM auth.users WHERE lower(email) = lower(trim(_email)) LIMIT 1;
  IF target IS NULL THEN
    RAISE EXCEPTION 'No registered account with that email';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN target;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  -- The owner is permanent and can never be demoted, not even by themselves.
  IF public.is_owner(_user_id) THEN
    RAISE EXCEPTION 'The owner account cannot be removed';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'admin';
  RETURN true;
END;
$$;

-- ---------------------------------------------------------------------------
-- 6. Function execution privileges
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.set_updated_at()                       FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role)        FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_owner(uuid)                         FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_ownership()                      FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.list_admins()                          FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.grant_admin_by_email(text)             FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.revoke_admin(uuid)                     FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_owner(uuid)                  TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_ownership()               TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_admins()                   TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_admin_by_email(text)      TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_admin(uuid)              TO authenticated;

-- ---------------------------------------------------------------------------
-- 7. Verification (optional) — should return one row per object, all present
-- ---------------------------------------------------------------------------
-- SELECT (SELECT count(*) FROM public.site_owner)            AS owner_rows,
--        (SELECT count(*) FROM public.user_roles
--           WHERE role = 'admin')                            AS admin_count,
--        (SELECT count(*) FROM public.client_sites)          AS site_rows;
