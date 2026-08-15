import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

/**
 * OAuth / email-link landing route.
 *
 * Supabase redirects back here with either a PKCE `?code=` query param or a
 * legacy `#access_token=` hash. This route exists so production deployments
 * (Vercel) always have a real, refreshable URL to return to instead of a 404.
 *
 * The file is named `auth_.callback.tsx` so it is a sibling of `/auth`
 * (not nested inside it).
 */
export const Route = createFileRoute("/auth_/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Signing you in — Gaming Lounge Template" },
      { name: "description", content: "Completing secure sign-in for the client admin panel." },
      { property: "og:title", content: "Signing you in — Gaming Lounge Template" },
      { property: "og:description", content: "Completing secure sign-in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthCallback,
});

/** Only ever allow same-origin relative paths as a post-login destination. */
function safeNext(value: string | null): string {
  if (!value) return "/admin";
  if (!value.startsWith("/") || value.startsWith("//")) return "/admin";
  return value;
}

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const url = new URL(window.location.href);
      const next = safeNext(url.searchParams.get("next"));

      const providerError =
        url.searchParams.get("error_description") ?? url.searchParams.get("error");
      if (providerError) {
        setError(providerError);
        return;
      }

      const code = url.searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        // `detectSessionInUrl` may already have consumed the code — in that
        // case the exchange fails but a valid session exists, so re-check
        // before surfacing an error.
        if (exchangeError) {
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            setError(exchangeError.message);
            return;
          }
        }
      } else {
        // Implicit flow: the SDK parses the hash on load. Give it a moment.
        for (let attempt = 0; attempt < 20; attempt += 1) {
          const { data } = await supabase.auth.getSession();
          if (data.session) break;
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!data.session) {
        setError("We could not complete sign-in. Please try again.");
        return;
      }

      window.history.replaceState({}, "", window.location.pathname);
      await navigate({ to: next, replace: true });
    }

    void finish();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div className="max-w-sm space-y-3">
        <h1 className="text-xl font-semibold text-foreground">
          {error ? "Sign-in failed" : "Signing you in…"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {error ?? "Hold on while we finish setting up your session."}
        </p>
        {error ? (
          <a
            href="/auth"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Back to sign in
          </a>
        ) : null}
      </div>
    </main>
  );
}
