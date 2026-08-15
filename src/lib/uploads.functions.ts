import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const ASSET_BUCKET = "site-assets";

const uploadSchema = z.object({
  slug: z.string().min(1).max(64),
  fileName: z.string().min(1).max(200),
  contentType: z.string().min(1).max(120),
  /** Base64 (no data: prefix). Max ~6MB decoded. */
  dataBase64: z.string().min(8).max(9_000_000),
});

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-").replace(/-+/g, "-").slice(-80);
}

/** Admin only: upload an image to persistent cloud storage. */
export const uploadSiteAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => uploadSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (isAdmin !== true) return { ok: false as const, url: null, error: "Forbidden" };

    if (!data.contentType.startsWith("image/") && !data.contentType.startsWith("video/")) {
      return { ok: false as const, url: null, error: "Only image or video files are allowed" };
    }

    const bytes = decodeBase64(data.dataBase64);
    if (bytes.byteLength > 6 * 1024 * 1024) {
      return { ok: false as const, url: null, error: "File is larger than 6MB" };
    }

    const path = `${data.slug}/${Date.now()}-${safeName(data.fileName)}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage
      .from(ASSET_BUCKET)
      .upload(path, bytes, { contentType: data.contentType, upsert: true });

    if (error) return { ok: false as const, url: null, error: error.message };
    return { ok: true as const, url: `/api/public/asset/${path}`, error: null };
  });
