export type SectionKey =
  | "hero"
  | "gamingZones"
  | "experience3d"
  | "games"
  | "pricing"
  | "whyUs"
  | "tournaments"
  | "gallery"
  | "testimonials"
  | "booking"
  | "location"
  | "faq"
  | "finalCta";

export type ZoneModelKind =
  | "pc"
  | "console"
  | "racing"
  | "vr"
  | "arcade"
  | "pool"
  | "arena";

export interface SiteConfig {
  business: {
    name: string;
    tagline: string;
    description: string;
    logo: string;
    favicon: string;
    canonicalUrl: string;
    ogImage: string;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    video: string;
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    googleMapsUrl: string;
    mapEmbedUrl: string;
  };
  social: { instagram: string; facebook: string; youtube: string; twitch: string; discord: string };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    foregroundColor: string;
    cardColor: string;
    font: string;
    buttonStyle: "pill" | "sharp" | "rounded";
    borderRadius: number;
    glowIntensity: number;
  };
  booking: {
    type: "whatsapp" | "phone" | "url" | "form";
    label: string;
    whatsappNumber: string;
    message: string;
    url: string;
  };
  hours: { day: string; open: string }[];
  gamingZones: {
    id: string;
    name: string;
    description: string;
    image: string;
    model: ZoneModelKind;
    price: string;
    features: string[];
    equipment: string[];
    players: string;
    cta: string;
    available: boolean;
  }[];
  games: {
    id: string;
    name: string;
    image: string;
    category: string;
    platform: string;
    description: string;
    featured: boolean;
  }[];
  pricing: {
    id: string;
    name: string;
    price: string;
    unit: string;
    features: string[];
    highlight: boolean;
  }[];
  whyUs: { title: string; description: string; icon: string }[];
  tournaments: {
    id: string;
    name: string;
    game: string;
    date: string;
    time: string;
    prizePool: string;
    entryFee: string;
    maxPlayers: string;
    registrationUrl: string;
    banner: string;
  }[];
  testimonials: { id: string; name: string; review: string; rating: number; image: string }[];
  gallery: string[];
  faq: { question: string; answer: string }[];
  sections: Record<SectionKey, boolean>;
}
