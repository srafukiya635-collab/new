import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import defaultConfig from "./siteConfig";
import type { SiteConfig } from "./types";
import { getClientSite, saveClientSite } from "@/lib/site-config.functions";

// Each client installation points at its own Supabase project, so "default" is
// correct out of the box. VITE_SITE_SLUG only exists for the rarer case of
// several client sites sharing one backend.
export const DEFAULT_SITE_SLUG = import.meta.env["VITE_SITE_SLUG"] || "default";


/**
 * Single source of truth for client data.
 * Defaults come from src/config/siteConfig.ts; per-client overrides are stored
 * in Lovable Cloud (`client_sites.config`) so edits made in /admin are shared
 * across devices and visible to every visitor.
 */
interface ConfigContextValue {
  config: SiteConfig;
  slug: string;
  siteName: string;
  setConfig: (next: SiteConfig) => void;
  update: (updater: (draft: SiteConfig) => void) => void;
  reset: () => void;
  /** Persist the current config to Lovable Cloud (admins only). */
  publish: (options?: { name?: string }) => Promise<{ ok: boolean; error: string | null }>;
  reload: () => Promise<void>;
  isCustomized: boolean;
  isLoading: boolean;
  isSaving: boolean;
  loadError: string | null;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function mergeConfig(base: SiteConfig, stored: Partial<SiteConfig>): SiteConfig {
  return {
    ...base,
    ...stored,
    business: { ...base.business, ...stored.business },
    hero: { ...base.hero, ...stored.hero },
    contact: { ...base.contact, ...stored.contact },
    social: { ...base.social, ...stored.social },
    branding: { ...base.branding, ...stored.branding },
    booking: { ...base.booking, ...stored.booking },
    sections: { ...base.sections, ...stored.sections },
  };
}

export function ConfigProvider({
  children,
  slug = DEFAULT_SITE_SLUG,
}: {
  children: ReactNode;
  slug?: string;
}) {
  const [config, setConfigState] = useState<SiteConfig>(() => clone(defaultConfig));
  const [siteName, setSiteName] = useState<string>(defaultConfig.business.name);
  const [isCustomized, setIsCustomized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const configRef = useRef(config);
  configRef.current = config;

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getClientSite({ data: { slug } });
      if (result.error) {
        setLoadError(result.error);
      } else {
        setLoadError(null);
        const stored = (result.site?.config ?? {}) as Partial<SiteConfig>;
        const hasOverrides = Object.keys(stored).length > 0;
        setConfigState(mergeConfig(clone(defaultConfig), stored));
        setIsCustomized(hasOverrides);
        if (result.site?.name) setSiteName(result.site.name);
      }
    } catch {
      setLoadError("Unable to load site configuration");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  // Load overrides after hydration so server and client markup match.
  useEffect(() => {
    void load();
  }, [load]);

  const setConfig = useCallback((next: SiteConfig) => {
    setConfigState(next);
    setIsCustomized(true);
  }, []);

  const update = useCallback((updater: (draft: SiteConfig) => void) => {
    setConfigState((current) => {
      const draft = clone(current);
      updater(draft);
      return draft;
    });
    setIsCustomized(true);
  }, []);

  const reset = useCallback(() => {
    setConfigState(clone(defaultConfig));
    setIsCustomized(false);
  }, []);

  const publish = useCallback(
    async (options?: { name?: string }) => {
      setIsSaving(true);
      try {
        const current = configRef.current;
        const name = options?.name ?? current.business.name ?? siteName;
        const result = await saveClientSite({
          data: {
            slug,
            name,
            config: current as unknown as Record<string, unknown>,
          },
        });
        if (result.ok) {
          setSiteName(name);
          setIsCustomized(true);
        }
        return { ok: result.ok, error: result.error ?? null };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Save failed";
        return { ok: false, error: message };
      } finally {
        setIsSaving(false);
      }
    },
    [slug, siteName],
  );

  const value = useMemo(
    () => ({
      config,
      slug,
      siteName,
      setConfig,
      update,
      reset,
      publish,
      reload: load,
      isCustomized,
      isLoading,
      isSaving,
      loadError,
    }),
    [
      config,
      slug,
      siteName,
      setConfig,
      update,
      reset,
      publish,
      load,
      isCustomized,
      isLoading,
      isSaving,
      loadError,
    ],
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useSiteConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useSiteConfig must be used inside <ConfigProvider>");
  return ctx;
}
