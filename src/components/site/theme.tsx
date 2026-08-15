import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Mode = "dark" | "light";

interface ThemeValue {
  mode: Mode;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeValue>({ mode: "dark", toggle: () => {} });

const STORAGE_KEY = "site-theme-mode";

/**
 * Light/dark preference for the public site. It only flips the neutral
 * background/foreground/card tokens — the client's brand colors stay intact.
 */
export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") setMode(stored);
  }, []);

  const toggle = useCallback(() => {
    setMode((current) => {
      const next = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ mode, toggle }), [mode, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useSiteTheme() {
  return useContext(ThemeContext);
}

/** Applies the light-mode neutrals on top of the configured branding. */
export function applyMode<T extends { backgroundColor: string; foregroundColor: string; cardColor: string }>(
  branding: T,
  mode: Mode,
): T {
  if (mode === "dark") return branding;
  return {
    ...branding,
    backgroundColor: "#F5F7FB",
    foregroundColor: "#0A0C14",
    cardColor: "#FFFFFF",
  };
}
