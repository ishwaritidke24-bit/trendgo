import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, CalendarDays, Check, Heart } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Container, Section } from "@/components/layout/container";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EVENTS, MY_EVENTS, eventById } from "@/data/mock";

export const Route = createFileRoute("/events")({ component: MyEventsPage });
const TABS = ["interested", "saved", "going", "past"] as const;
type Tab = (typeof TABS)[number];

function MyEventsPage() {
  const [tab, setTab] = React.useState<Tab>("interested");
  const events = MY_EVENTS[tab]
    .map((id) => eventById(id))
    .filter((event): event is (typeof EVENTS)[number] => Boolean(event));
  return (
    <AppShell>
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
          {events.length ? (
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
