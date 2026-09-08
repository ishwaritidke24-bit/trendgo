import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, Eye, Pencil, Trash2, Users } from "lucide-react";

import { OrganizerShell } from "@/components/organizer/organizer-shell";
import { Container, Section } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  deleteHostedEvent,
  getHostedEvents,
  setHostedEventStatus,
  type HostedEvent,
} from "@/lib/organizer-api";

export const Route = createFileRoute("/organizer-events")({
  component: OrganizerEvents,
});
function OrganizerEvents() {
  const [events, setEvents] = React.useState<HostedEvent[]>([]);
  const [tab, setTab] = React.useState<
    "upcoming" | "published" | "drafts" | "past"
  >("upcoming");
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    void getHostedEvents()
      .then((result) => setEvents(result.events))
      .catch((requestError) =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load events",
        ),
      );
  }, []);
  const filtered = events.filter((event) =>
    tab === "published"
      ? event.status === "published"
      : tab === "drafts"
        ? event.status === "draft"
        : tab === "past"
          ? event.status === "unpublished"
          : event.status !== "unpublished",
  );
  async function toggle(event: HostedEvent) {
    try {
      const result = await setHostedEventStatus(
        event.id,
        event.status === "published" ? "unpublished" : "published",
      );
      setEvents((current) =>
        current.map((item) => (item.id === event.id ? result.event : item)),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update event",
      );
    }
  }
  async function remove(event: HostedEvent) {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteHostedEvent(event.id);
      setEvents((current) => current.filter((item) => item.id !== event.id));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete event",
      );
    }
  }
  return (
    <OrganizerShell>
      <Section spacing="sm" className="pt-10">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-primary-glow uppercase">
                Manage experiences
              </p>
              <h1 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
                My Events
              </h1>
            </div>
            <Button asChild>
              <Link to="/organizer-create">
                <CalendarPlus /> Create Event
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card/60 p-1">
            {(["upcoming", "published", "drafts", "past"] as const).map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`rounded-xl px-4 py-2.5 text-sm capitalize ${tab === item ? "bg-primary/15 text-primary-glow" : "text-muted-foreground"}`}
                >
                  {item}
                </button>
              ),
            )}
          </div>
          {error ? (
            <p role="alert" className="mt-5 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {filtered.length ? (
            <div className="mt-6 flex flex-col gap-3">
              {filtered.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.date} · {event.area} · {event.attendeeCount}{" "}
                      attendees · {event.interestedCount} interested
                    </p>
                    <span className="text-xs capitalize text-primary-glow">
                      {event.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="ghost" asChild>
                      <Link
                        to="/organizer-event-detail"
                        search={{ eventId: event.id }}
                      >
                        <Eye />
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link
                        to="/organizer-event-detail"
                        search={{ eventId: event.id }}
                      >
                        <Pencil />
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void toggle(event)}
                    >
                      {event.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void remove(event)}
                    >
                      <Trash2 />
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link
                        to="/organizer-attendees"
                        search={{ eventId: event.id }}
                      >
                        <Users />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              className="mt-8"
              icon={<CalendarPlus />}
              title={`No ${tab} events`}
              description="Create an experience and it will appear here."
              action={
                <Button asChild>
                  <Link to="/organizer-create">Create Event</Link>
                </Button>
              }
            />
          )}
        </Container>
      </Section>
    </OrganizerShell>
  );
}
