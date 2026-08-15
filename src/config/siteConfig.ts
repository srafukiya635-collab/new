import type { SiteConfig } from "./types";

/**
 * ============================================================
 *  CENTRAL CLIENT CONFIGURATION
 * ------------------------------------------------------------
 *  This is the ONLY file you need to edit to launch the
 *  template for a new client (or use the /admin editor, which
 *  writes the same shape to local storage and can be exported).
 *  No component may hardcode client data.
 * ============================================================
 */
export const siteConfig: SiteConfig = {
  business: {
    name: "NEXUS ARENA",
    tagline: "Where Legends Respawn",
    description:
      "A next-generation gaming lounge and esports arena with pro-grade rigs, console suites, racing simulators and VR — open late, every night.",
    logo: "",
    favicon: "/favicon.ico",
    canonicalUrl: "https://nexus-arena.example.com",
    ogImage: "",
  },
  hero: {
    title: "",
    subtitle: "",
    description: "",
    image: "",
    video: "",
  },
  contact: {
    phone: "+91 98765 43210",
    whatsapp: "919876543210",
    email: "play@nexusarena.gg",
    address: "2nd Floor, Cyber Hub, MG Road, Bengaluru 560001",
    googleMapsUrl: "https://maps.google.com/?q=MG+Road+Bengaluru",
    mapEmbedUrl:
      "https://www.google.com/maps?q=MG+Road+Bengaluru&output=embed",
  },
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    youtube: "https://youtube.com/",
    twitch: "https://twitch.tv/",
    discord: "",
  },
  branding: {
    primaryColor: "#00E5FF",
    secondaryColor: "#7C4DFF",
    accentColor: "#FF2E88",
    backgroundColor: "#05060B",
    foregroundColor: "#E9F1FF",
    cardColor: "#0C1020",
    font: "Orbitron",
    buttonStyle: "sharp",
    borderRadius: 6,
    glowIntensity: 0.75,
  },
  booking: {
    type: "whatsapp",
    label: "Book Now",
    whatsappNumber: "919876543210",
    message: "Hi, I would like to book a gaming session.",
    url: "",
  },
  hours: [
    { day: "Mon – Thu", open: "11:00 AM – 12:00 AM" },
    { day: "Fri – Sat", open: "10:00 AM – 3:00 AM" },
    { day: "Sunday", open: "10:00 AM – 1:00 AM" },
  ],
  gamingZones: [
    {
      id: "pc",
      name: "PC Battle Station",
      description:
        "RTX-powered rigs on 240Hz panels with mechanical keyboards and pro audio. Built for ranked grind sessions.",
      image: "/images/zone-pc.jpg",
      model: "pc",
      price: "₹100 / hour",
      features: ["240Hz displays", "RTX 4070 rigs", "Pro peripherals", "Voice comms"],
      equipment: ["RTX 4070", "i7 13th Gen", "32GB DDR5", "HyperX headsets"],
      players: "1 – 20 players",
      cta: "Reserve a rig",
      available: true,
    },
    {
      id: "console",
      name: "Console Lounge",
      description:
        "PS5 and Xbox Series X suites on 65\" OLED with recliner seating — perfect for couch co-op nights.",
      image: "/images/zone-console.jpg",
      model: "console",
      price: "₹150 / hour",
      features: ["65\" OLED", "4 controllers", "Recliner seating", "Split-screen ready"],
      equipment: ["PS5", "Xbox Series X", "DualSense", "Dolby Atmos"],
      players: "1 – 4 players",
      cta: "Grab a couch",
      available: true,
    },
    {
      id: "racing",
      name: "Racing Simulator",
      description:
        "Full-motion cockpit with direct-drive wheel, load-cell pedals and triple-screen wrap-around view.",
      image: "/images/zone-racing.jpg",
      model: "racing",
      price: "₹300 / session",
      features: ["Direct-drive wheel", "Triple screens", "Motion rig", "Live leaderboard"],
      equipment: ["Fanatec DD", "Load-cell pedals", "Bucket seat"],
      players: "1 player",
      cta: "Set a lap time",
      available: true,
    },
    {
      id: "vr",
      name: "VR Arena",
      description:
        "Room-scale VR with wireless headsets and full body tracking. Step inside the game.",
      image: "/images/zone-vr.jpg",
      model: "vr",
      price: "₹250 / 30 min",
      features: ["Room-scale tracking", "Wireless headsets", "Co-op titles", "Safety marshal"],
      equipment: ["Quest 3", "Valve Index", "Haptic vests"],
      players: "1 – 2 players",
      cta: "Enter VR",
      available: true,
    },
    {
      id: "arcade",
      name: "Retro Arcade",
      description:
        "Cabinet classics, fight sticks and a Tekken tower that never sleeps.",
      image: "/images/zone-arcade.jpg",
      model: "arcade",
      price: "₹80 / hour",
      features: ["Fight sticks", "Retro classics", "Tournament ladder"],
      equipment: ["Arcade1Up cabinets", "Sanwa sticks"],
      players: "1 – 2 players",
      cta: "Insert coin",
      available: true,
    },
    {
      id: "arena",
      name: "Esports Arena",
      description:
        "A 10-seat competition stage with casting desk, stream setup and LED wall for live finals.",
      image: "/images/zone-arena.jpg",
      model: "arena",
      price: "On request",
      features: ["LED wall", "Casting desk", "Live streaming", "Tournament ops"],
      equipment: ["10 pro rigs", "Stream deck", "Shoutcast booth"],
      players: "10 – 50 players",
      cta: "Host your event",
      available: true,
    },
  ],
  games: [
    { id: "valorant", name: "Valorant", image: "/images/games/valorant.jpg", category: "Tactical FPS", platform: "PC", description: "5v5 character-based tactical shooter.", featured: true },
    { id: "cs2", name: "CS2", image: "/images/games/cs2.jpg", category: "FPS", platform: "PC", description: "The competitive benchmark.", featured: true },
    { id: "gtav", name: "GTA V", image: "/images/games/gtav.jpg", category: "Open World", platform: "PC / PS5", description: "Los Santos, your rules.", featured: false },
    { id: "eafc", name: "EA FC", image: "/images/games/eafc.jpg", category: "Sports", platform: "PS5 / Xbox", description: "Couch football rivalries.", featured: true },
    { id: "cod", name: "Call of Duty", image: "/images/games/cod.jpg", category: "FPS", platform: "PC / Console", description: "Fast-paced multiplayer warfare.", featured: false },
    { id: "fortnite", name: "Fortnite", image: "/images/games/fortnite.jpg", category: "Battle Royale", platform: "PC / Console", description: "Build, drop, win.", featured: false },
    { id: "apex", name: "Apex Legends", image: "/images/games/apex.jpg", category: "Battle Royale", platform: "PC", description: "Squad-based hero BR.", featured: false },
    { id: "mk", name: "Mortal Kombat", image: "/images/games/mk.jpg", category: "Fighting", platform: "Console", description: "Flawless victory nights.", featured: false },
    { id: "f1", name: "F1", image: "/images/games/f1.jpg", category: "Racing", platform: "Simulator", description: "Championship laps on the sim rig.", featured: true },
    { id: "nfs", name: "Need for Speed", image: "/images/games/nfs.jpg", category: "Racing", platform: "PC / Console", description: "Street racing, full send.", featured: false },
  ],
  pricing: [
    { id: "hour", name: "Casual Hour", price: "₹100", unit: "per hour / PC", features: ["Any PC station", "Free water", "Discord comms"], highlight: false },
    { id: "console", name: "Console Hour", price: "₹150", unit: "per hour / suite", features: ["PS5 or Xbox", "Up to 4 players", "OLED + Atmos"], highlight: false },
    { id: "night", name: "Night Ops Pass", price: "₹599", unit: "10 PM – 3 AM", features: ["Unlimited PC time", "Snack combo", "Priority station"], highlight: true },
    { id: "sim", name: "Sim Session", price: "₹300", unit: "per 30 min", features: ["Motion cockpit", "Coached hot lap", "Leaderboard entry"], highlight: false },
  ],
  whyUs: [
    { title: "Pro-Grade Hardware", description: "Every rig is benchmarked weekly so you never lose to lag.", icon: "cpu" },
    { title: "Tournament Ready", description: "In-house LAN, casting desk and staff who run real brackets.", icon: "trophy" },
    { title: "Open Late", description: "Night ops passes for the players who peak after midnight.", icon: "moon" },
    { title: "Squad Friendly", description: "Team booths, party bookings and birthday takeovers.", icon: "users" },
  ],
  tournaments: [
    { id: "t1", name: "Valorant Clash Night", game: "Valorant", date: "2026-09-12", time: "7:00 PM", prizePool: "₹25,000", entryFee: "₹500 / team", maxPlayers: "16 teams", registrationUrl: "", banner: "" },
    { id: "t2", name: "EA FC 1v1 Showdown", game: "EA FC", date: "2026-09-20", time: "5:00 PM", prizePool: "₹10,000", entryFee: "₹200", maxPlayers: "32 players", registrationUrl: "", banner: "" },
    { id: "t3", name: "Sim Racing Grand Prix", game: "F1", date: "2026-10-04", time: "6:30 PM", prizePool: "₹15,000", entryFee: "₹300", maxPlayers: "24 drivers", registrationUrl: "", banner: "" },
  ],
  testimonials: [
    { id: "r1", name: "Aditya M.", review: "Best rigs in the city — zero stutter in Valorant and the night pass is unbeatable value.", rating: 5, image: "" },
    { id: "r2", name: "Sneha R.", review: "The console lounge is so comfortable we lost track of time. Staff were super friendly.", rating: 5, image: "" },
    { id: "r3", name: "Karan V.", review: "The racing sim is the real deal. Felt every kerb on the motion rig.", rating: 4, image: "" },
    { id: "r4", name: "Team Vortex", review: "They ran our 16-team bracket flawlessly with a live stream. Coming back next season.", rating: 5, image: "" },
  ],
  gallery: [
    "/images/zone-pc.jpg",
    "/images/zone-console.jpg",
    "/images/zone-racing.jpg",
    "/images/zone-vr.jpg",
    "/images/zone-arcade.jpg",
    "/images/zone-arena.jpg",
  ],
  faq: [
    { question: "Do I need to book in advance?", answer: "Walk-ins are welcome, but weekends fill fast — booking ahead guarantees your station." },
    { question: "Can I bring my own peripherals?", answer: "Absolutely. Plug in your own mouse, keyboard or controller at any station." },
    { question: "Is there an age limit?", answer: "All ages are welcome. Players under 13 should be accompanied by an adult after 9 PM." },
    { question: "Do you host private events?", answer: "Yes — birthdays, team offsites and full arena takeovers are all available." },
  ],
  sections: {
    hero: true,
    gamingZones: true,
    experience3d: true,
    games: true,
    pricing: true,
    whyUs: true,
    tournaments: true,
    gallery: true,
    testimonials: true,
    booking: true,
    location: true,
    faq: true,
    finalCta: true,
  },
};

export default siteConfig;
