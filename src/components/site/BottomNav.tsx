import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarPlus, Home, LogIn, Menu, Star, X } from "lucide-react";

import { useSiteConfig } from "@/config/ConfigProvider";
import { rgba } from "@/lib/site";
import type { SectionKey } from "@/config/types";

const MENU_ITEMS: { key: SectionKey; label: string; href: string }[] = [
  { key: "gamingZones", label: "Gaming zones", href: "/#zones" },
  { key: "games", label: "Games", href: "/#games" },
  { key: "pricing", label: "Offers & passes", href: "/#offers" },
  { key: "tournaments", label: "Tournaments", href: "/#events" },
  { key: "gallery", label: "Gallery", href: "/#gallery" },
  { key: "testimonials", label: "Reviews", href: "/#reviews" },
  { key: "location", label: "Contact & visit", href: "/#location" },
  { key: "faq", label: "FAQ", href: "/#faq" },
];

/**
 * App-style bottom navigation. It is fixed, but never captures scroll — only
 * the buttons themselves are interactive, and pages add bottom padding so no
 * content hides behind it.
 */
export function BottomNav({ active }: { active?: "home" | "membership" | "book" | "menu" | "login" }) {
  const { config } = useSiteConfig();
  const [open, setOpen] = useState(false);
  const items = MENU_ITEMS.filter((item) => config.sections[item.key]);

  const itemStyle = (key: string) => ({
    color: active === key ? "var(--site-primary)" : "var(--site-muted)",
  });

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end"
          style={{ background: rgba("#000000", 0.6) }}
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[70vh] w-full overflow-y-auto border-t p-6 pb-28"
            style={{ background: "var(--site-card)", borderColor: "var(--site-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.25em]">Menu</p>
              <button aria-label="Close menu" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-1">
              {items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="min-h-[52px] px-3 py-3 text-sm font-semibold uppercase tracking-[0.16em]"
                  style={{ borderRadius: "var(--site-radius)" }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-xl"
        style={{
          borderColor: "var(--site-border)",
          background: rgba(config.branding.backgroundColor, 0.92),
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-2 pt-2">
          <Link to="/" className="flex flex-col items-center gap-1 py-2" style={itemStyle("home")}>
            <Home size={20} />
            <span className="text-[9px] font-bold uppercase tracking-[0.12em]">Home</span>
          </Link>
          <a href="/#offers" className="flex flex-col items-center gap-1 py-2" style={itemStyle("membership")}>
            <Star size={20} />
            <span className="text-[9px] font-bold uppercase tracking-[0.12em]">Member</span>
          </a>
          <Link to="/book" className="flex flex-col items-center" aria-label="Book a session">
            <span
              className="-mt-7 grid h-14 w-14 place-items-center rounded-full"
              style={{
                background: "linear-gradient(140deg, var(--site-primary), var(--site-accent))",
                color: "var(--site-on-primary)",
                boxShadow: "var(--site-glow)",
              }}
            >
              <CalendarPlus size={24} />
            </span>
            <span
              className="mt-1 text-[9px] font-black uppercase tracking-[0.12em]"
              style={{ color: "var(--site-primary)" }}
            >
              Book
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex flex-col items-center gap-1 py-2"
            style={itemStyle("menu")}
          >
            <Menu size={20} />
            <span className="text-[9px] font-bold uppercase tracking-[0.12em]">Menu</span>
          </button>
          <Link to="/auth" className="flex flex-col items-center gap-1 py-2" style={itemStyle("login")}>
            <LogIn size={20} />
            <span className="text-[9px] font-bold uppercase tracking-[0.12em]">Login</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
