import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Sparkles, TrendingUp, Users } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Container, Section } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { EventCard } from "@/components/events/event-card";
import { EventRail } from "@/components/events/event-rail";
import { FriendAvatars } from "@/components/events/friend-avatars";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ACTIVITY, EVENTS, eventById, friendById } from "@/data/mock";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Your feed — TrendGo" },
      {
        name: "description",
        content:
          "A personalized feed of events, gigs and experiences picked for your taste, your city and your friends.",
      },
      { property: "og:title", content: "Your feed — TrendGo" },
      {
        property: "og:description",
        content: "Events picked for your taste, your city and your friends.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user } = useAuth();
  const picked = [...EVENTS].sort((a, b) => b.match - a.match).slice(0, 3);
  const becauseYouLiked = EVENTS.filter((e) => ["Music", "Nightlife"].includes(e.category));
  const popular = [...EVENTS].sort((a, b) => b.interested - a.interested).slice(0, 5);
  const friendPicks = EVENTS.filter((e) => e.friendIds.length >= 2);
  const bubble = EVENTS.filter((e) => e.outsideBubble);
  const weekend = EVENTS.filter((e) => e.dayGroup === "This weekend").slice(0, 5);

  return (
    <AppShell>
      {/* Greeting */}
      <Section spacing="sm" className="pt-10">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Good evening 👋</p>
              <h1 className="font-display mt-2 text-3xl font-semibold text-balance text-foreground sm:text-4xl">
                {user?.name.split(" ")[0]}, here&apos;s what&apos;s{" "}
                <span className="text-gradient-brand">worth doing</span> tonight
              </h1>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="neutral">
                  <Compass /> {user?.location || "Location not added"}
                </Badge>
                <Badge>
                  <Sparkles /> 9 new matches today
                </Badge>
                <Badge variant="neutral">
                  <Users /> 6 friends active
                </Badge>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to="/explore">
                Explore everything <TrendingUp />
              </Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Picked for you */}
      <Section spacing="sm">
        <Container>
          <SectionHeading
            eyebrow="For You"
            title="Picked for you"
            description="Ranked by your taste graph — music you play, places you save and people you go out with."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {picked.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Because you liked */}
      <Section spacing="sm">
        <Container>
          <SectionHeading
            eyebrow="Because you liked electronic music"
            title="More rooms with good sound"
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link to="/explore">See all</Link>
              </Button>
            }
          />
          <div className="mt-6">
            <EventRail events={becauseYouLiked} />
          </div>
        </Container>
      </Section>

      {/* Friends */}
      <Section spacing="sm">
        <Container>
          <SectionHeading
            eyebrow="Social"
            title="Your friends are exploring"
            description="What the people you actually go out with are saving this week."
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link to="/friends">Friend activity</Link>
              </Button>
            }
          />
          <div className="mt-6 grid gap-5 lg:grid-cols-[22rem_1fr]">
            <ul className="flex flex-col gap-3 rounded-3xl border border-border bg-card/60 p-4">
              {ACTIVITY.slice(0, 5).map((item) => {
                const friend = friendById(item.friendId);
                const event = eventById(item.eventId);
                if (!friend || !event) return null;
                return (
                  <li key={item.id}>
                    <Link
                      to="/event/$eventId"
                      params={{ eventId: event.id }}
                      className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-surface"
                    >
                      <Avatar>
                        <AvatarImage src={friend.avatar} alt={friend.name} />
                        <AvatarFallback>{friend.initials}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {friend.name.split(" ")[0]}
                        </span>{" "}
                        {item.action}{" "}
                        <span className="font-medium text-primary-glow">{event.title}</span>
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {item.when}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="grid gap-5 sm:grid-cols-2">
              {friendPicks.slice(0, 2).map((event) => (
                <EventCard key={event.id} event={event} showWhy={false} />
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Step outside your bubble */}
      <Section spacing="sm">
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] border border-primary/25 bg-[radial-gradient(120%_140%_at_0%_0%,oklch(0.66_0.25_305/0.22),transparent_60%)] p-6 sm:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-medium tracking-[0.18em] text-primary-glow uppercase">
                  Something different
                </p>
                <h2 className="font-display mt-3 text-2xl font-semibold text-balance text-foreground sm:text-3xl">
                  Step outside your bubble
                </h2>
                <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                  Three picks just off your usual pattern. Same city, different crowd — people with
                  your taste tried these and stayed.
                </p>
              </div>
              <FriendAvatars ids={["dev", "mira", "kabir", "rahul"]} size="lg" />
            </div>
            <div className="mt-8">
              <EventRail events={bubble} showWhy />
            </div>
          </div>
        </Container>
      </Section>

      {/* Popular near you */}
      <Section spacing="sm">
        <Container>
          <SectionHeading eyebrow="Trending" title="Popular near you" />
          <div className="mt-6">
            <EventRail events={popular} />
          </div>
        </Container>
      </Section>

      {/* Weekend */}
      <Section spacing="sm">
        <Container>
          <SectionHeading
            eyebrow="Plan ahead"
            title="Recommended for this weekend"
            description="Friday to Sunday, sorted so you can build one good run of a night."
          />
          <div className="mt-6">
            <EventRail events={weekend} />
          </div>
        </Container>
      </Section>
    </AppShell>
  );
}
