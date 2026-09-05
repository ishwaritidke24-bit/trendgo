import { Clock, MapPin, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Container, Section } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { Button } from "@/components/ui/button";

import eventMusic from "@/assets/event-music.jpg";
import eventComedy from "@/assets/event-comedy.jpg";
import eventFood from "@/assets/event-food.jpg";

interface EventPreview {
  id: string;
  title: string;
  image: string;
  match: number;
  when: string;
  location: string;
  distance: string;
  tag: string;
  interested: number;
}

const EVENTS: EventPreview[] = [
  {
    id: "indie-basement",
    title: "Basement Sessions: Indie Night Vol. 12",
    image: eventMusic,
    match: 96,
    when: "Fri, 12 Sep · 8:30 PM",
    location: "Indiranagar",
    distance: "2.1 km away",
    tag: "Live Music",
    interested: 12,
  },
  {
    id: "open-mic",
    title: "Unfiltered — Standup Open Mic",
    image: eventComedy,
    match: 89,
    when: "Sat, 13 Sep · 7:00 PM",
    location: "Koramangala",
    distance: "4.6 km away",
    tag: "Comedy",
    interested: 34,
  },
  {
    id: "rooftop-market",
    title: "Rooftop Supper Club & Night Market",
    image: eventFood,
    match: 84,
    when: "Sun, 14 Sep · 6:00 PM",
    location: "Church Street",
    distance: "6.3 km away",
    tag: "Food",
    interested: 58,
  },
];

function EventCard({ event }: { event: EventPreview }) {
  return (
    <Link
      to="/event/$eventId"
      params={{ eventId: event.id }}
      className="group relative block cursor-pointer overflow-hidden rounded-3xl border border-border bg-surface/60 transition-all duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:border-primary/45 hover:shadow-[var(--shadow-glow)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          width={1024}
          height={768}
          className="size-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,oklch(0.14_0.012_285/0.9)_100%)]" />

        <span className="absolute top-3 left-3 rounded-full border border-border-strong bg-background/70 px-3 py-1 text-[11px] font-medium text-foreground backdrop-blur-md">
          {event.tag}
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-[image:var(--gradient-brand)] px-3 py-1 text-[11px] font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
          {event.match}% match
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-display text-base leading-snug font-semibold text-balance text-foreground sm:text-lg">
          {event.title}
        </h3>

        <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Clock className="size-3.5 shrink-0 text-primary-glow" />
            {event.when}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-primary-glow" />
            {event.location} · {event.distance}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="inline-flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <Users className="size-3.5 shrink-0" />
            <span className="truncate">{event.interested} people interested</span>
          </span>
          <span className="shrink-0 text-xs font-medium text-primary-glow opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

export function TrendingNearYou() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Near you"
          title="Trending near you"
          description="Picked from what people with taste like yours are showing up to this week."
          action={
            <Button variant="outline" size="sm" asChild>
              <Link to="/explore">See all</Link>
            </Button>
          }
        />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {EVENTS.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
