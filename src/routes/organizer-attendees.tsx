import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Users } from "lucide-react";

import { OrganizerShell } from "@/components/organizer/organizer-shell";
import { Container, Section } from "@/components/layout/container";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getHostedEvents,
  getHostedEventAudience,
  type HostedEvent,
} from "@/lib/organizer-api";

export const Route = createFileRoute("/organizer-attendees")({
  component: OrganizerAttendees,
});
function OrganizerAttendees() {
  const [events, setEvents] = React.useState<HostedEvent[]>([]);
  const [selected, setSelected] = React.useState("");
  const [audience, setAudience] = React.useState<{
    attendees: { id: string; name: string; email: string }[];
    interested: { id: string; name: string; email: string }[];
  } | null>(null);
  React.useEffect(() => {
    void getHostedEvents().then((result) => {
      setEvents(result.events);
      if (result.events[0]) setSelected(result.events[0].id);
    });
  }, []);
  React.useEffect(() => {
    if (selected)
      void getHostedEventAudience(selected).then((result) =>
        setAudience(result.audience),
      );
  }, [selected]);
  return (
    <OrganizerShell>
      <Section spacing="sm" className="pt-10">
        <Container>
          <Link
            to="/organizer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground"
          >
            <ArrowLeft /> Dashboard
          </Link>
          <h1 className="font-display mt-5 text-3xl font-semibold">
            Manage Attendees
          </h1>
          {events.length ? (
            <>
              <select
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
                className="mt-6 rounded-xl border border-border bg-surface px-3 py-2"
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Audience title="Attending" users={audience?.attendees ?? []} />
                <Audience
                  title="Interested"
                  users={audience?.interested ?? []}
                />
              </div>
            </>
          ) : (
            <EmptyState
              className="mt-8"
              icon={<Users />}
              title="No hosted events yet"
              description="Create an event to see its audience here."
            />
          )}
        </Container>
      </Section>
    </OrganizerShell>
  );
}
function Audience({
  title,
  users,
}: {
  title: string;
  users: { id: string; name: string; email: string }[];
}) {
  return (
    <div className="rounded-3xl border border-border bg-card/60 p-5">
      <h2 className="font-display text-xl font-semibold">
        {title} <span className="text-primary-glow">{users.length}</span>
      </h2>
      {users.length ? (
        <div className="mt-4 flex flex-col gap-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-xl border border-border bg-surface/40 p-3"
            >
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">TrendGo member</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No people here yet.
        </p>
      )}
    </div>
  );
}
