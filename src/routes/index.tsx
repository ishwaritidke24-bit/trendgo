import { createFileRoute } from "@tanstack/react-router";

import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/hero";
import { ExploreByVibe } from "@/components/sections/explore-vibe";
import { TrendingNearYou } from "@/components/sections/trending-near-you";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TrendGo — Discover events worth showing up for" },
      {
        name: "description",
        content:
          "TrendGo is a personalized discovery platform for events and experiences happening around you and your friends.",
      },
      { property: "og:title", content: "TrendGo — Discover events worth showing up for" },
      {
        property: "og:description",
        content:
          "TrendGo is a personalized discovery platform for events and experiences happening around you and your friends.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="bg-aurora min-h-screen">
      <Navbar notificationCount={3} />
      <main>
        <Hero />
        <ExploreByVibe />
        <TrendingNearYou />
      </main>
    </div>

  );
}
