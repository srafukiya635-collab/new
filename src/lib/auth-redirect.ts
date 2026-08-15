/**
 * Redirect helpers for authentication.
 *
 * Everything is derived from `window.location.origin` at runtime so the same
 * build works on localhost, on a Lovable preview, and on any Vercel domain
 * (preview deployments included) without hardcoding a URL anywhere.
 */

/** Absolute URL of the app's OAuth / email-link landing route. */
export function authCallbackUrl(next = "/admin"): string {
  const url = new URL("/auth/callback", window.location.origin);
  url.searchParams.set("next", next);
  return url.toString();
}

/**
 * True when the app runs inside a Lovable preview/published host, where the
 * managed Lovable auth broker is the iframe-safe way to do Google sign-in.
 * Anywhere else (Vercel, custom domain, localhost) we use Supabase's own
 * OAuth flow against the project's configured Google provider.
 */
export function isLovableHost(): boolean {
  const host = window.location.hostname;
  return (
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovable.dev") ||
    host.endsWith(".lovableproject.com")
  );
}
