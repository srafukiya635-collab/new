import type { ListSpec } from "./ListEditor";

export type ListKey =
  | "hours"
  | "gamingZones"
  | "games"
  | "pricing"
  | "whyUs"
  | "tournaments"
  | "testimonials"
  | "gallery"
  | "faq";

const id = () => Math.random().toString(36).slice(2, 10);

export const LIST_SPECS: Record<ListKey, ListSpec> = {
  hours: {
    label: "Opening hours",
    description: "Days and times shown in the location and footer sections.",
    titleField: "day",
    fields: [
      { key: "day", label: "Day(s)", placeholder: "Mon – Thu" },
      { key: "open", label: "Hours", placeholder: "11:00 AM – 12:00 AM" },
    ],
    newItem: () => ({ day: "", open: "" }),
  },
  gamingZones: {
    label: "Gaming zone",
    description: "PC, console, VR, racing and arena areas with their own 3D model and pricing.",
    titleField: "name",
    fields: [
      { key: "name", label: "Zone name" },
      { key: "price", label: "Price" },
      { key: "players", label: "Players" },
      { key: "cta", label: "Button label" },
      {
        key: "model",
        label: "3D model",
        type: "select",
        options: ["pc", "console", "racing", "vr", "arcade", "pool", "arena"],
      },
      { key: "available", label: "Available", type: "boolean" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "features", label: "Features", type: "list" },
      { key: "equipment", label: "Equipment / specifications", type: "list" },
      { key: "image", label: "Zone image", type: "image" },
    ],
    newItem: () => ({
      id: id(),
      name: "New zone",
      description: "",
      image: "",
      model: "pc",
      price: "",
      features: [],
      equipment: [],
      players: "",
      cta: "Book now",
      available: true,
    }),
  },
  games: {
    label: "Game",
    description: "Titles available at the lounge.",
    titleField: "name",
    fields: [
      { key: "name", label: "Game name" },
      { key: "category", label: "Category" },
      { key: "platform", label: "Platform" },
      { key: "featured", label: "Featured", type: "boolean" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Cover image", type: "image" },
    ],
    newItem: () => ({
      id: id(),
      name: "New game",
      image: "",
      category: "",
      platform: "",
      description: "",
      featured: false,
    }),
  },
  pricing: {
    label: "Pricing plan",
    description: "Hourly rates, passes and packages.",
    titleField: "name",
    fields: [
      { key: "name", label: "Plan name" },
      { key: "price", label: "Price" },
      { key: "unit", label: "Unit / duration" },
      { key: "highlight", label: "Highlight this plan", type: "boolean" },
      { key: "features", label: "Included", type: "list" },
    ],
    newItem: () => ({ id: id(), name: "New plan", price: "", unit: "", features: [], highlight: false }),
  },
  whyUs: {
    label: "Feature",
    description: "Reasons customers should choose this lounge.",
    titleField: "title",
    fields: [
      { key: "title", label: "Title" },
      {
        key: "icon",
        label: "Icon",
        type: "select",
        options: ["cpu", "trophy", "moon", "users", "zap", "shield", "gamepad", "star"],
      },
      { key: "description", label: "Description", type: "textarea" },
    ],
    newItem: () => ({ title: "New feature", description: "", icon: "zap" }),
  },
  tournaments: {
    label: "Tournament",
    description: "Upcoming competitions and events.",
    titleField: "name",
    fields: [
      { key: "name", label: "Tournament name" },
      { key: "game", label: "Game" },
      { key: "date", label: "Date (YYYY-MM-DD)" },
      { key: "time", label: "Time" },
      { key: "prizePool", label: "Prize pool" },
      { key: "entryFee", label: "Entry fee" },
      { key: "maxPlayers", label: "Slots" },
      { key: "registrationUrl", label: "Registration link" },
      { key: "banner", label: "Banner image", type: "image" },
    ],
    newItem: () => ({
      id: id(),
      name: "New tournament",
      game: "",
      date: "",
      time: "",
      prizePool: "",
      entryFee: "",
      maxPlayers: "",
      registrationUrl: "",
      banner: "",
    }),
  },
  testimonials: {
    label: "Testimonial",
    description: "Customer reviews shown on the public site.",
    titleField: "name",
    fields: [
      { key: "name", label: "Customer name" },
      { key: "rating", label: "Rating (1–5)", type: "number" },
      { key: "review", label: "Review", type: "textarea" },
      { key: "image", label: "Photo", type: "image" },
    ],
    newItem: () => ({ id: id(), name: "", review: "", rating: 5, image: "" }),
  },
  gallery: {
    label: "Gallery image",
    description: "Photos of the venue shown in the gallery grid.",
    stringAsImage: true,
    newItem: () => "",
  },
  faq: {
    label: "Question",
    description: "Frequently asked questions and answers.",
    titleField: "question",
    fields: [
      { key: "question", label: "Question" },
      { key: "answer", label: "Answer", type: "textarea" },
    ],
    newItem: () => ({ question: "", answer: "" }),
  },
};

export const LIST_ORDER: ListKey[] = [
  "gamingZones",
  "games",
  "pricing",
  "whyUs",
  "tournaments",
  "gallery",
  "testimonials",
  "faq",
  "hours",
];
