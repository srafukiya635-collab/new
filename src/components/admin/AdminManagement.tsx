import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { grantAdmin, listAdmins, revokeAdmin } from "@/lib/site-config.functions";

interface AdminRow {
  user_id: string;
  email: string;
  is_owner: boolean;
  granted_at: string;
}

export function AdminManagement({ currentUserId }: { currentUserId: string | null }) {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await listAdmins();
    setRows((result.admins ?? []) as AdminRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleGrant(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const result = await grantAdmin({ data: { email: email.trim() } });
    setBusy(false);
    if (result.ok) {
      toast.success(`${email.trim()} is now an administrator`);
      setEmail("");
      await load();
    } else {
      toast.error(result.error ?? "Could not grant admin access");
    }
  }

  async function handleRevoke(row: AdminRow) {
    setBusy(true);
    const result = await revokeAdmin({ data: { userId: row.user_id } });
    setBusy(false);
    if (result.ok) {
      toast.success(`Admin access removed for ${row.email}`);
      await load();
    } else {
      toast.error(result.error ?? "Could not revoke admin access");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Admin management</CardTitle>
        <CardDescription>
          The owner account is permanent and cannot be removed. Grant admin access only to accounts
          that have already signed up.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleGrant}>
          <div className="flex-1 space-y-2">
            <Label htmlFor="grant-email">Registered account email</Label>
            <Input
              id="grant-email"
              type="email"
              required
              placeholder="teammate@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button type="submit" disabled={busy}>
            Grant admin
          </Button>
        </form>

        <div className="space-y-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading administrators…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No administrators yet.</p>
          ) : (
            rows.map((row) => (
              <div
                key={row.user_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.is_owner ? "Owner · permanent" : "Administrator"}
                    {row.user_id === currentUserId ? " · you" : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy || row.is_owner}
                  onClick={() => void handleRevoke(row)}
                >
                  {row.is_owner ? "Protected" : "Revoke"}
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
