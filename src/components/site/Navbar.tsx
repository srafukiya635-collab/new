import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Moon, Sun, User, X } from "lucide-react";
import { useSiteConfig } from "@/config/ConfigProvider";
import { BookButton, Logo } from "./primitives";
import { useSiteTheme } from "./theme";
import { rgba } from "@/lib/site";
import type { SectionKey } from "@/config/types";

const NAV_ITEMS: { key: SectionKey; label: string; href: string }[] = [
  { key: "gamingZones", label: "Zones", href: "#zones" },
  { key: "games", label: "Games", href: "#games" },
  { key: "pricing", label: "Offers", href: "#offers" },
  { key: "tournaments", label: "Events", href: "#events" },
  { key: "gallery", label: "Gallery", href: "#gallery" },
  { key: "location", label: "Visit", href: "#location" },
  { key: "faq", label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const { config } = useSiteConfig();
  const { mode, toggle } = useSiteTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = NAV_ITEMS.filter((item) => config.sections[item.key]);
  const iconButton = {
    borderColor: "var(--site-border)",
    borderRadius: "var(--site-btn-radius)",
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b transition-all duration-300"
      style={{
        borderColor: "var(--site-border)",
        background: rgba(config.branding.backgroundColor, scrolled ? 0.9 : 0.75),
        backdropFilter: "blur(14px)",
      }}
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:px-10 md:py-4">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <Logo size={40} />
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <nav className="mr-3 hidden items-center gap-6 lg:flex">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors"
                style={{ color: "var(--site-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--site-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--site-muted)")}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Link
            to="/auth"
            aria-label="Profile / login"
            className="grid h-10 w-10 place-items-center border"
            style={iconButton}
          >
            <User size={17} />
          </Link>
          <button
            type="button"
            aria-label="Toggle light or dark theme"
            onClick={toggle}
            className="grid h-10 w-10 place-items-center border"
            style={iconButton}
          >
            {mode === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <div className="hidden md:block">
            <BookButton className="px-5 py-2.5" label="Book Now" />
          </div>
          <button
            aria-label="Toggle menu"
            className="grid h-10 w-10 place-items-center border lg:hidden"
            style={iconButton}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="border-t px-5 py-4 lg:hidden"
          style={{ borderColor: "var(--site-border)", background: config.branding.cardColor }}
        >
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-xs font-semibold uppercase tracking-[0.22em]"
              >
                {item.label}
              </a>
            ))}
            <BookButton className="mt-2 w-full" label="Book Now" />
          </div>
        </div>
      )}
    </header>
  );
}
