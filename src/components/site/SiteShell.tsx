import { useEffect } from "react";
import { useSiteConfig } from "@/config/ConfigProvider";
import { themeVars } from "@/lib/site";
import { BottomNav } from "./BottomNav";
import { SiteThemeProvider, applyMode, useSiteTheme } from "./theme";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Zones } from "./Zones";
import { Experience3D } from "./Experience3D";
import { Games } from "./Games";
import { Pricing } from "./Pricing";
import { WhyUs } from "./WhyUs";
import { Tournaments } from "./Tournaments";
import { Gallery } from "./Gallery";
import { Testimonials } from "./Testimonials";
import { Booking } from "./Booking";
import { Location } from "./Location";
import { Faq } from "./Faq";
import { FinalCta } from "./FinalCta";
import { Footer } from "./Footer";

/**
 * The whole client website. Section order is fixed; visibility, content and
 * branding come from configuration only.
 */
export function SiteShell({ isPreview = false }: { isPreview?: boolean }) {
  return (
    <SiteThemeProvider>
      <SiteBody isPreview={isPreview} />
    </SiteThemeProvider>
  );
}

function SiteBody({ isPreview = false }: { isPreview?: boolean }) {
  const { config } = useSiteConfig();
  const { mode } = useSiteTheme();
  const themed = { ...config, branding: applyMode(config.branding, mode) };
  const s = config.sections;

  // Keep document metadata in sync with the live configuration.
  useEffect(() => {
    if (isPreview) return;
    document.title = `${config.business.name} — Gaming Lounge & Esports Arena`;
    const setMeta = (selector: string, attr: string, name: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta('meta[name="description"]', "name", "description", config.business.description);
    setMeta('meta[property="og:title"]', "property", "og:title", `${config.business.name} — Gaming Lounge`);
    setMeta('meta[property="og:description"]', "property", "og:description", config.business.description);
    if (config.business.ogImage) {
      setMeta('meta[property="og:image"]', "property", "og:image", config.business.ogImage);
      setMeta('meta[name="twitter:image"]', "name", "twitter:image", config.business.ogImage);
    }
    if (config.business.favicon) {
      let icon = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!icon) {
        icon = document.createElement("link");
        icon.rel = "icon";
        document.head.appendChild(icon);
      }
      icon.href = config.business.favicon;
    }
    if (config.business.canonicalUrl) {
      let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = config.business.canonicalUrl;
    }
  }, [config, isPreview]);

  return (
    <div style={themeVars(themed)} className="min-h-screen overflow-x-hidden pb-24 md:pb-0">
      <Navbar />
      <main>
        {s.hero && <Hero />}
        {s.gamingZones && <Zones />}
        {s.experience3d && <Experience3D />}
        {s.games && <Games />}
        {s.pricing && <Pricing />}
        {s.whyUs && <WhyUs />}
        {s.tournaments && <Tournaments />}
        {s.gallery && <Gallery />}
        {s.testimonials && <Testimonials />}
        {s.booking && <Booking />}
        {s.location && <Location />}
        {s.faq && <Faq />}
        {s.finalCta && <FinalCta />}
      </main>
      <Footer />
      <div className="md:hidden">
        <BottomNav active="home" />
      </div>
    </div>
  );
}
