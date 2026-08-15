import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useSiteConfig } from "@/config/ConfigProvider";
import { claimFirstAdmin, getAdminStatus } from "@/lib/site-config.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { ImageField } from "@/components/admin/ImageField";
import { ListEditor } from "@/components/admin/ListEditor";
import { LIST_ORDER, LIST_SPECS, type ListKey } from "@/components/admin/listSpecs";
import { AdminManagement } from "@/components/admin/AdminManagement";
import type { SectionKey, SiteConfig } from "@/config/types";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Client Customization — Gaming Lounge Template" },
      {
        name: "description",
        content:
          "Edit business details, contact info, branding colors, booking behaviour and page sections for this gaming lounge client site.",
      },
      { property: "og:title", content: "Client Customization — Gaming Lounge Template" },
      {
        property: "og:description",
        content: "Visual editor for gaming lounge client website details.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const SECTION_LABELS: Record<SectionKey, string> = {
  hero: "Hero",
  gamingZones: "Gaming zones",
  experience3d: "3D experience",
  games: "Games",
  pricing: "Pricing",
  whyUs: "Why us",
  tournaments: "Tournaments",
  gallery: "Gallery",
  testimonials: "Testimonials",
  booking: "Booking",
  location: "Location",
  faq: "FAQ",
  finalCta: "Final CTA",
};


function AdminPage() {
  const navigate = useNavigate();
  const { config, update, reset, publish, reload, isLoading, isSaving, slug } = useSiteConfig();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [listKey, setListKey] = useState<ListKey>("gamingZones");

  useEffect(() => {
    let cancelled = false;
    async function check() {
      let status = await getAdminStatus();
      if (!status.isAdmin) {
        const claim = await claimFirstAdmin();
        if (claim.claimed) status = await getAdminStatus();
      }
      if (!cancelled) {
        setIsAdmin(status.isAdmin);
        setIsOwner(status.isOwner);
        setUserId(status.userId);
      }
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  function setField<S extends keyof SiteConfig>(section: S, field: string, value: unknown) {
    update((draft) => {
      (draft[section] as Record<string, unknown>)[field] = value;
    });
  }

  async function handlePublish() {
    const result = await publish();
    if (result.ok) toast.success("Client details saved");
    else toast.error(result.error ?? "Could not save");
  }


  async function handleSignOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth" });
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <Toaster />
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Client customization</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Editing site <span className="font-mono">{slug}</span>. Changes are saved to your
              backend and served to every visitor.
              {isOwner ? " You are the owner of this site." : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/">View site</Link>
            </Button>
            <Button variant="outline" onClick={() => void reload()} disabled={isLoading}>
              Reload
            </Button>
            <Button variant="ghost" onClick={() => void handleSignOut()}>
              Sign out
            </Button>
            <Button onClick={() => void handlePublish()} disabled={isSaving || isAdmin === false}>
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </header>

        {isAdmin === false ? (
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-lg">Read-only access</CardTitle>
              <CardDescription>
                Your account is not an administrator for this template, so saving is disabled. Ask
                an existing admin to grant you access.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <Tabs defaultValue="business">
          <TabsList className="flex-wrap">
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="booking">Booking</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            {isAdmin ? <TabsTrigger value="admins">Admins</TabsTrigger> : null}
          </TabsList>

          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business details</CardTitle>
                <CardDescription>Name, tagline and SEO basics.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["name", "Business name"],
                    ["tagline", "Tagline"],
                    ["canonicalUrl", "Website URL"],
                  ] as const
                ).map(([field, label]) => (
                  <div className="space-y-2" key={field}>
                    <Label htmlFor={`business-${field}`}>{label}</Label>
                    <Input
                      id={`business-${field}`}
                      value={config.business[field]}
                      onChange={(event) => setField("business", field, event.target.value)}
                    />
                  </div>
                ))}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="business-description">Description</Label>
                  <Textarea
                    id="business-description"
                    rows={4}
                    value={config.business.description}
                    onChange={(event) => setField("business", "description", event.target.value)}
                  />
                </div>
                <ImageField
                  label="Logo"
                  slug={slug}
                  value={config.business.logo}
                  onChange={(url) => setField("business", "logo", url)}
                  hint="Transparent PNG or SVG works best."
                />
                <ImageField
                  label="Favicon"
                  slug={slug}
                  value={config.business.favicon}
                  onChange={(url) => setField("business", "favicon", url)}
                  accept="image/png,image/x-icon,image/svg+xml"
                />
                <ImageField
                  label="Social share image"
                  slug={slug}
                  value={config.business.ogImage}
                  onChange={(url) => setField("business", "ogImage", url)}
                  hint="Shown when the site is shared on social apps."
                />
                <Separator className="sm:col-span-2" />
                <div className="space-y-2 sm:col-span-2">
                  <h3 className="text-sm font-semibold">Hero section</h3>
                  <p className="text-xs text-muted-foreground">
                    Leave blank to fall back to the business name, tagline and description.
                  </p>
                </div>
                {(
                  [
                    ["title", "Hero title"],
                    ["subtitle", "Hero subtitle"],
                  ] as const
                ).map(([field, label]) => (
                  <div className="space-y-2" key={field}>
                    <Label htmlFor={`hero-${field}`}>{label}</Label>
                    <Input
                      id={`hero-${field}`}
                      value={config.hero[field]}
                      onChange={(event) => setField("hero", field, event.target.value)}
                    />
                  </div>
                ))}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="hero-description">Hero description</Label>
                  <Textarea
                    id="hero-description"
                    rows={3}
                    value={config.hero.description}
                    onChange={(event) => setField("hero", "description", event.target.value)}
                  />
                </div>
                <ImageField
                  label="Hero background image"
                  slug={slug}
                  value={config.hero.image}
                  onChange={(url) => setField("hero", "image", url)}
                  hint="Optional — sits behind the 3D scene."
                />
                <ImageField
                  label="Hero background video"
                  slug={slug}
                  accept="video/*"
                  value={config.hero.video}
                  onChange={(url) => setField("hero", "video", url)}
                  hint="Optional MP4 loop."
                />

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact & social</CardTitle>
                <CardDescription>How customers reach this lounge.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["phone", "Phone"],
                    ["whatsapp", "WhatsApp number"],
                    ["email", "Email"],
                    ["address", "Address"],
                    ["googleMapsUrl", "Google Maps link"],
                    ["mapEmbedUrl", "Map embed URL"],
                  ] as const
                ).map(([field, label]) => (
                  <div className="space-y-2" key={field}>
                    <Label htmlFor={`contact-${field}`}>{label}</Label>
                    <Input
                      id={`contact-${field}`}
                      value={config.contact[field]}
                      onChange={(event) => setField("contact", field, event.target.value)}
                    />
                  </div>
                ))}
                <Separator className="sm:col-span-2" />
                {(
                  ["instagram", "facebook", "youtube", "twitch", "discord"] as const
                ).map((field) => (
                  <div className="space-y-2" key={field}>
                    <Label className="capitalize" htmlFor={`social-${field}`}>
                      {field}
                    </Label>
                    <Input
                      id={`social-${field}`}
                      value={config.social[field]}
                      onChange={(event) => setField("social", field, event.target.value)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Branding</CardTitle>
                <CardDescription>Colors, font and glow strength.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["primaryColor", "Primary"],
                    ["secondaryColor", "Secondary"],
                    ["accentColor", "Accent"],
                    ["backgroundColor", "Background"],
                    ["foregroundColor", "Text"],
                    ["cardColor", "Card"],
                  ] as const
                ).map(([field, label]) => (
                  <div className="space-y-2" key={field}>
                    <Label htmlFor={`brand-${field}`}>{label}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        aria-label={`${label} color`}
                        type="color"
                        className="h-9 w-12 cursor-pointer rounded border border-input bg-transparent"
                        value={config.branding[field]}
                        onChange={(event) => setField("branding", field, event.target.value)}
                      />
                      <Input
                        id={`brand-${field}`}
                        value={config.branding[field]}
                        onChange={(event) => setField("branding", field, event.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <div className="space-y-2">
                  <Label htmlFor="brand-font">Font family</Label>
                  <Input
                    id="brand-font"
                    value={config.branding.font}
                    onChange={(event) => setField("branding", "font", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand-radius">Corner radius (px)</Label>
                  <Input
                    id="brand-radius"
                    type="number"
                    min={0}
                    max={40}
                    value={config.branding.borderRadius}
                    onChange={(event) =>
                      setField("branding", "borderRadius", Number(event.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand-glow">Glow intensity (0–1)</Label>
                  <Input
                    id="brand-glow"
                    type="number"
                    step="0.05"
                    min={0}
                    max={1}
                    value={config.branding.glowIntensity}
                    onChange={(event) =>
                      setField("branding", "glowIntensity", Number(event.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand-button">Button style</Label>
                  <select
                    id="brand-button"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={config.branding.buttonStyle}
                    onChange={(event) => setField("branding", "buttonStyle", event.target.value)}
                  >
                    <option value="pill">Pill</option>
                    <option value="rounded">Rounded</option>
                    <option value="sharp">Sharp</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="booking">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking action</CardTitle>
                <CardDescription>What the main call-to-action does.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="booking-type">Type</Label>
                  <select
                    id="booking-type"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={config.booking.type}
                    onChange={(event) => setField("booking", "type", event.target.value)}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Phone call</option>
                    <option value="url">External link</option>
                    <option value="form">On-page form</option>
                  </select>
                </div>
                {(
                  [
                    ["label", "Button label"],
                    ["whatsappNumber", "WhatsApp number"],
                    ["message", "Prefilled message"],
                    ["url", "Booking URL"],
                  ] as const
                ).map(([field, label]) => (
                  <div className="space-y-2" key={field}>
                    <Label htmlFor={`booking-${field}`}>{label}</Label>
                    <Input
                      id={`booking-${field}`}
                      value={config.booking[field]}
                      onChange={(event) => setField("booking", field, event.target.value)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Page sections</CardTitle>
                <CardDescription>Toggle sections on or off per client.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(SECTION_LABELS) as SectionKey[]).map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2"
                  >
                    <Label htmlFor={`section-${key}`}>{SECTION_LABELS[key]}</Label>
                    <Switch
                      id={`section-${key}`}
                      checked={config.sections[key]}
                      onCheckedChange={(checked) => setField("sections", key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content lists</CardTitle>
                <CardDescription>
                  Add, edit, reorder or delete repeating content — no code or JSON required.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {LIST_ORDER.map((key) => (
                    <Button
                      key={key}
                      size="sm"
                      variant={key === listKey ? "default" : "outline"}
                      onClick={() => setListKey(key)}
                    >
                      {LIST_SPECS[key].label}
                    </Button>
                  ))}
                </div>
                <Separator />
                <ListEditor
                  spec={LIST_SPECS[listKey]}
                  slug={slug}
                  items={config[listKey] as unknown as unknown[]}
                  onChange={(next) =>
                    update((draft) => {
                      (draft as unknown as Record<string, unknown>)[listKey] = next;
                    })
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          {isAdmin ? (
            <TabsContent value="admins">
              <AdminManagement currentUserId={userId} />
            </TabsContent>
          ) : null}

        </Tabs>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/60 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Reset restores the built-in template defaults (save afterwards to publish them).
          </p>
          <Button variant="outline" onClick={reset}>
            Reset to defaults
          </Button>
        </div>
      </div>
    </main>
  );
}
