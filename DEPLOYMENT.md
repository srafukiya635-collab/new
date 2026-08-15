# Deploying this template for a client

Each client gets **their own Supabase project** and **their own Vercel project**.
Nothing in the code is tied to a specific client, admin email, user ID or URL.

---

## 1. Supabase (one project per client)

1. Create a new Supabase project (or use the client's existing one).
2. Open **SQL Editor** and run the whole of `database/setup.sql`.
   It is idempotent and non-destructive — safe to run on a brand new project
   *and* on an existing one (no table, row, user or config is ever dropped).
3. **Authentication → Providers → Google**: enable it and paste the Google
   OAuth client ID + secret.
4. **Authentication → URL Configuration**:

   | Setting | Value |
   | --- | --- |
   | Site URL | `https://<client-domain>` (the production domain) |
   | Redirect URLs | `https://<client-domain>/auth/callback`<br>`https://<client-domain>/**`<br>`https://<project>.vercel.app/auth/callback`<br>`https://<project>-*.vercel.app/auth/callback` (preview deploys)<br>`http://localhost:8080/auth/callback` (local dev) |

## 2. Google Cloud Console

In **APIs & Services → Credentials → your OAuth 2.0 Client → Authorized
redirect URIs**, add the Supabase callback (Google talks to Supabase, not to
your site):

```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

Authorized JavaScript origins: `https://<client-domain>` and the
`*.vercel.app` domain.

## 3. Vercel

Import the GitHub repository as a new project. No `vercel.json` is needed —
the build auto-detects Vercel and emits the Build Output API bundle, so
server rendering, deep links and hard refreshes all work.

Environment variables (Production + Preview + Development):

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | the project's publishable / anon key |
| `VITE_SUPABASE_PROJECT_ID` | `<project-ref>` |
| `SUPABASE_URL` | same as `VITE_SUPABASE_URL` (server side) |
| `SUPABASE_PUBLISHABLE_KEY` | same as the publishable key (server side) |
| `SUPABASE_PROJECT_ID` | `<project-ref>` |

Optional: `VITE_SITE_SLUG` — only if several sites share one Supabase project.

Never set `SUPABASE_SERVICE_ROLE_KEY` in Vercel unless a feature needs it; the
app does not require it.

## 4. First login = owner

1. Open the production URL and go to `/auth`.
2. Sign in with Google (or email/password).
3. Google returns to `/auth/callback`, which finishes the session and sends the
   user to `/admin` — never a 404.
4. On `/admin`, the app calls the `claim_ownership()` database function. The
   **first** account to do so becomes owner + admin. The claim is atomic: the
   `site_owner` table has a single-row primary key, so if two people sign in at
   the same moment exactly one wins.
5. Every later account is read-only until an admin grants them access from the
   **Admins** tab (grant by the email they registered with).

The owner can never be demoted, not even by another admin.

## 5. Security model

- All privilege writes happen in `SECURITY DEFINER` database functions
  (`claim_ownership`, `grant_admin_by_email`, `revoke_admin`). `authenticated`
  has **no** INSERT/UPDATE/DELETE grant on `user_roles` or `site_owner`, so a
  forged REST request cannot self-promote.
- `client_sites` writes are gated by RLS: `has_role(auth.uid(), 'admin')`.
  Tampering with the frontend changes nothing — Postgres rejects the write.
- Reads of the site config are public on purpose (the website is public).
