-- Superseded: this file was an exact duplicate of the initial migration
-- (20260813160951) and made a fresh clone fail with "type app_role already
-- exists". The initial migration is now idempotent and is the single source
-- of truth. Intentionally left as a no-op so applied migration history stays
-- valid for existing installations.
SELECT 1;
