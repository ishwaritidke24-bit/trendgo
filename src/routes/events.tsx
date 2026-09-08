import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, CalendarDays, Check, Heart } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Container, Section } from "@/components/layout/container";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { EventItem } from "@/data/mock";
import { useAuth } from "@/lib/auth-context";
import { getEvent } from "@/lib/events-api";

export const Route = createFileRoute("/events")({ component: MyEventsPage });
const TABS = ["interested", "saved", "going", "past"] as const;
type Tab = (typeof TABS)[number];

function MyEventsPage() {
  const { user } = useAuth();
  const [tab, setTab] = React.useState<Tab>("interested");
  const eventIds =
    tab === "saved"
      ? (user?.savedEventIds ?? [])
      : tab === "past"
        ? (user?.attendedEventIds ?? [])
        : tab === "interested"
          ? (user?.interestedEventIds ?? [])
          : [];
  const eventIdsKey = eventIds.join(",");
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    const ids = eventIdsKey ? eventIdsKey.split(",") : [];
    void Promise.all(ids.map((id) => getEvent(id).catch(() => null)))
      .then((loadedEvents) => {
        if (active) setEvents(loadedEvents.filter((event): event is EventItem => Boolean(event)));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [eventIdsKey]);
  return (
    <AppShell requireAuth>
      <Section spacing="sm" className="pt-10">
        <Container>
          <p className="text-xs font-medium tracking-[0.18em] text-primary-glow uppercase">
            Your plans
          </p>
          <h1 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">My events</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Keep the experiences you are considering close. Your next good night is already here.
          </p>
          <div className="mt-8 flex max-w-2xl gap-1 overflow-x-auto rounded-2xl border border-border bg-card/60 p-1">
            {TABS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium capitalize transition-colors ${tab === item ? "bg-primary/15 text-primary-glow" : "text-muted-foreground hover:text-foreground"}`}
              >
                <span className="inline-flex items-center gap-2">
                  {item === "saved" ? (
                    <Bookmark />
                  ) : item === "going" ? (
                    <Check />
                  ) : item === "past" ? (
                    <CalendarDays />
                  ) : (
                    <Heart />
                  )}
                  {item}
                </span>
              </button>
            ))}
          </div>
          {loading ? (
            <p className="mt-8 text-sm text-muted-foreground">Loading your events...</p>
          ) : events.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} showWhy={tab !== "past"} />
              ))}
            </div>
          ) : (
            <EmptyState
              className="mt-8"
              icon={<CalendarDays />}
              title={`No ${tab} events yet`}
              description="When an experience catches your eye, it will show up here."
              action={<Button onClick={() => setTab("interested")}>Find something to do</Button>}
            />
          )}
        </Container>
      </Section>
    </AppShell>
  );
}
