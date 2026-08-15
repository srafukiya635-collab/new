import { useSiteConfig } from "@/config/ConfigProvider";
import { BookButton } from "./primitives";
import { rgba } from "@/lib/site";

export function FinalCta() {
  const { config } = useSiteConfig();
  const { business, branding } = config;

  return (
    <section className="relative px-5 py-24 md:px-10 md:py-32">
      <div
        className="mx-auto w-full max-w-6xl overflow-hidden border px-6 py-16 text-center md:px-16"
        style={{
          borderColor: "var(--site-border)",
          borderRadius: "var(--site-radius)",
          background: `radial-gradient(circle at 50% 0%, ${rgba(branding.primaryColor, 0.22)}, transparent 70%), ${branding.cardColor}`,
          boxShadow: "var(--site-glow)",
        }}
      >
        <h2 className="text-3xl font-black uppercase leading-tight tracking-tight md:text-6xl">
          Ready to queue up?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm md:text-base" style={{ color: "var(--site-muted)" }}>
          {business.tagline || `Book your session at ${business.name} today.`}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <BookButton context="Final CTA" />
          {config.contact.phone && (
            <a
              href={`tel:${config.contact.phone.replace(/[^\d+]/g, "")}`}
              className="inline-flex items-center px-6 py-3 text-xs font-bold uppercase tracking-[0.2em]"
              style={{ border: "1px solid var(--site-border)", borderRadius: "var(--site-btn-radius)" }}
            >
              {config.contact.phone}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
