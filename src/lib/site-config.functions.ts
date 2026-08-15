import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const slugSchema = z.object({ slug: z.string().min(1).max(64).default("default") });

function serverPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/** Public: fetch a client site's saved configuration overrides. */
export const getClientSite = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => slugSchema.parse(input ?? {}))
  .handler(async ({ data }) => {
    const supabase = serverPublicClient();
    const { data: row, error } = await supabase
      .from("client_sites")
      .select("slug, name, config, updated_at")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) return { site: null, error: "Unable to load site configuration" };
    return { site: row ?? null, error: null };
  });

/** Public: list available client sites (slug + name only). */
export const listClientSites = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverPublicClient();
  const { data, error } = await supabase
    .from("client_sites")
    .select("slug, name, updated_at")
    .order("name", { ascending: true });
  if (error) return { sites: [] as { slug: string; name: string; updated_at: string }[] };
  return { sites: data ?? [] };
});

/** Signed-in: is the caller an admin / the owner? */
export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    const { data: owner } = await context.supabase.rpc("is_owner", {
      _user_id: context.userId,
    });
    return { isAdmin: data === true, isOwner: owner === true, userId: context.userId };
  });

/**
 * Signed-in: claim permanent ownership of this site.
 * The database enforces a single owner row, so only the first caller wins even
 * if several accounts sign up at the same moment. Later callers are no-ops.
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_ownership");
    if (error) return { claimed: false, reason: error.message };
    return { claimed: data === true, reason: null };
  });


/** Admin only: list current administrators (the DB function enforces the check). */
export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("list_admins");
    if (error) return { admins: [], error: "Not allowed to list administrators" };
    return { admins: data ?? [], error: null };
  });

/** Admin only: grant admin access to an already-registered account, by email. */
export const grantAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ email: z.string().email() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("grant_admin_by_email", { _email: data.email });
    if (error) return { ok: false, error: error.message };
    return { ok: true, error: null };
  });

/** Admin only: revoke admin access. The owner can never be revoked. */
export const revokeAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("revoke_admin", { _user_id: data.userId });
    if (error) return { ok: false, error: error.message };
    return { ok: true, error: null };
  });


const saveSchema = z.object({
  slug: z.string().min(1).max(64),
  name: z.string().min(1).max(120),
  config: z.record(z.string(), z.unknown()),
});

/** Admin only: create or update a client site configuration. */
export const saveClientSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => saveSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (isAdmin !== true) throw new Error("Forbidden");

    const { error } = await context.supabase
      .from("client_sites")
      .upsert(
        { slug: data.slug, name: data.name, config: data.config as never },
        { onConflict: "slug" },
      );
    if (error) return { ok: false, error: error.message };
    return { ok: true, error: null };
  });
