import * as React from "react";
import { Clock, MapPin, Users, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Container, Section } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserLocation } from "@/lib/location-context";
import { searchEvents } from "@/lib/events-api";
import type { EventItem } from "@/data/mock";

function EventCard({ event, city }: { event: EventItem; city: string }) {
  const whenText =
    event.date && event.time ? `${event.date} · ${event.time}` : event.date || "Upcoming";
  const venueText = event.venue || event.area || city;
  const distanceText = event.distanceKm ? `${event.distanceKm} km away` : event.area || city;

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
          {event.category}
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-[image:var(--gradient-brand)] px-3 py-1 text-[11px] font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
          {event.match || 90}% match
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-display text-base leading-snug font-semibold text-balance text-foreground sm:text-lg">
          {event.title}
        </h3>

        <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Clock className="size-3.5 shrink-0 text-primary-glow" />
            {whenText}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-primary-glow" />
            <span className="truncate">
              {venueText} · {distanceText}
            </span>
          </span>
        </div>

        {event.price !== undefined && (
          <div className="mt-2.5 text-xs font-medium text-foreground/80">
            {event.price === 0 ? (
              <span className="text-emerald-400">Free entry</span>
            ) : (
              <span>₹{event.price} onwards</span>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="inline-flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <Users className="size-3.5 shrink-0" />
            <span className="truncate">{event.interested ?? 12} people interested</span>
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
  const { location, isDetecting } = useUserLocation();
  // Default test location is Nashik if user hasn't yet resolved or picked a city
  const activeCity = location.trim() || "Nashik";

  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    setLoading(true);

    void searchEvents({ city: activeCity, limit: 6, sort: "match" })
      .then((res) => {
        if (active) {
          setEvents(res.events || []);
        }
      })
      .catch(() => {
        if (active) setEvents([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeCity]);

  return (
    <Section id="trending">
      <Container>
        <SectionHeading
          eyebrow={location ? `Near ${location}` : "Near you"}
          title={location ? `Trending in ${location}` : "Trending near you"}
          description={
            isDetecting
              ? "Finding experiences in your city..."
              : `Handpicked live experiences, gigs, and community meetups happening in ${activeCity}.`
          }
          action={
            <Button variant="outline" size="sm" asChild>
              <Link to="/explore" search={{ location: activeCity }}>
                See all
              </Link>
            </Button>
          }
        />

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="overflow-hidden rounded-3xl border border-border bg-surface/40 p-4 space-y-3"
              >
                <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} city={activeCity} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-border/70 bg-surface/30 p-10 text-center">
            <Sparkles className="size-8 mx-auto text-primary-glow mb-3 opacity-80" />
            <h4 className="font-display text-base font-semibold text-foreground">
              No live experiences listed in {activeCity} yet
            </h4>
            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
              Check out experiences in nearby cities or explore all categories.
            </p>
            <div className="mt-5">
              <Button variant="outline" size="sm" asChild>
                <Link to="/explore">Explore all experiences</Link>
              </Button>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
