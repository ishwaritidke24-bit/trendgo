import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, Users, Heart, BarChart3, Clock } from "lucide-react";

import { OrganizerShell } from "@/components/organizer/organizer-shell";
import { Container, Section } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getHostedEvents, type HostedEvent } from "@/lib/organizer-api";

export const Route = createFileRoute("/organizer")({ component: OrganizerDashboard });

function OrganizerDashboard() {
  const [events, setEvents] = React.useState<HostedEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    void getHostedEvents()
      .then((result) => setEvents(result.events))
      .catch((requestError) =>
        setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard"),
      )
      .finally(() => setLoading(false));
  }, []);
  const published = events.filter((event) => event.status === "published");
  const upcoming = published.filter((event) => new Date(event.date) >= new Date());
  const past = published.filter((event) => new Date(event.date) < new Date());
  const attendees = events.reduce((total, event) => total + event.attendeeCount, 0);
  const interested = events.reduce((total, event) => total + event.interestedCount, 0);
  return (
    <OrganizerShell>
      <Section spacing="sm" className="pt-10">
        <Container>
          <p className="text-xs font-medium tracking-[0.18em] text-primary-glow uppercase">
            Organizer mode
          </p>
          <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-3xl font-semibold sm:text-4xl">Your experiences</h1>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                Manage the moments you are bringing to the TrendGo community.
              </p>
            </div>
            <Button asChild>
              <Link to="/organizer-create">
                <CalendarPlus /> Create Event
              </Link>
            </Button>
          </div>
          {error ? (
            <p role="alert" className="mt-6 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {loading ? (
            <p className="mt-8 text-sm text-muted-foreground">Loading your dashboard...</p>
          ) : events.length === 0 ? (
            <EmptyState
              className="mt-8"
              icon={<CalendarPlus />}
              title="No events yet"
              description="Create your first event and start building your audience."
              action={
                <Button asChild>
                  <Link to="/organizer-create">Create your first event</Link>
                </Button>
              }
            />
          ) : (
            <>
              <div className="mt-8 grid gap-3 sm:grid-cols-4">
                <Metric icon={<CalendarPlus />} label="Total events" value={events.length} />
                <Metric icon={<CalendarPlus />} label="Upcoming events" value={upcoming.length} />
                <Metric icon={<Clock />} label="Past events" value={past.length} />
                <Metric icon={<Heart />} label="Interested users" value={interested} />
                <Metric icon={<Users />} label="Total attendees" value={attendees} />
              </div>
              <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem]">
                <div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-medium tracking-[0.16em] text-primary-glow uppercase">
                        Upcoming Events
                      </p>
                      <h2 className="font-display mt-2 text-2xl font-semibold">
                        Upcoming experiences
                      </h2>
                    </div>
                    <Link
                      to="/organizer-events"
                      className="text-sm text-primary-glow hover:underline"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="mt-5 flex flex-col gap-3">
                    {upcoming.slice(0, 5).map((event) => (
                      <Link
                        key={event.id}
                        to="/organizer-event-detail"
                        search={{ eventId: event.id }}
                        className="flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-4 hover:border-primary/40"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{event.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {event.date} · {event.area}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {event.attendeeCount} attendees
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
                <aside className="rounded-3xl border border-border bg-surface/60 p-5">
                  <p className="text-xs font-medium tracking-[0.16em] text-primary-glow uppercase">
                    Event Performance
                  </p>
                  <BarChart3 className="mt-5 size-7 text-primary-glow" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Audience counts are calculated from real event activity. More detailed analytics
                    can come later.
                  </p>
                </aside>
              </div>
            </>
          )}
        </Container>
      </Section>
    </OrganizerShell>
  );
}
function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4">
      <span className="text-primary-glow">{icon}</span>
      <p className="font-display mt-3 text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
