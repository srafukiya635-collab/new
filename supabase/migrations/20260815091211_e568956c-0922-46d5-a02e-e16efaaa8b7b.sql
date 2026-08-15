-- Single-row table: the permanent owner of this site
CREATE TABLE IF NOT EXISTS public.site_owner (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  user_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_owner TO authenticated;
GRANT ALL ON public.site_owner TO service_role;

ALTER TABLE public.site_owner ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read the owner record"
ON public.site_owner FOR SELECT TO authenticated USING (true);

-- Backfill: if an admin already exists, the earliest one becomes owner
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

-- First signed-in user claims ownership; atomic thanks to the single-row primary key
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

  INSERT INTO public.site_owner (singleton, user_id)
  VALUES (true, uid)
  ON CONFLICT (singleton) DO NOTHING;

  IF EXISTS (SELECT 1 FROM public.site_owner WHERE user_id = uid) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- List administrators (admins only)
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

-- Grant admin access to an existing registered user, by email (admins only)
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

-- Revoke admin access (admins only; the owner can never be revoked)
CREATE OR REPLACE FUNCTION public.revoke_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF public.is_owner(_user_id) THEN
    RAISE EXCEPTION 'The owner account cannot be removed';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'admin';
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_ownership() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_admins() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.grant_admin_by_email(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.revoke_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_owner(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.claim_ownership() TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_admins() TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_admin_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_owner(uuid) TO authenticated;