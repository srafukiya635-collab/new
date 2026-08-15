import { createFileRoute } from "@tanstack/react-router";
import defaultConfig from "@/config/siteConfig";
import { SiteShell } from "@/components/site/SiteShell";

const title = `${defaultConfig.business.name} — Gaming Lounge & Esports Arena`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: defaultConfig.business.description.slice(0, 155) },
      { property: "og:title", content: title },
      { property: "og:description", content: defaultConfig.business.description.slice(0, 155) },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: defaultConfig.business.canonicalUrl
      ? [{ rel: "canonical", href: defaultConfig.business.canonicalUrl }]
      : [],
  }),
  component: HomePage,
});

function HomePage() {
  return <SiteShell />;
}
