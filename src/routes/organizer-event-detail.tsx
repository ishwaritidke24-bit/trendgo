import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Eye, Save, Users } from "lucide-react";

import { OrganizerShell } from "@/components/organizer/organizer-shell";
import { Container, Section } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { getHostedEvents, updateHostedEvent, type HostedEvent } from "@/lib/organizer-api";

export const Route = createFileRoute("/organizer-event-detail")({
  component: OrganizerEventDetail,
});
function OrganizerEventDetail() {
  const { eventId } = Route.useParams();
  const [event, setEvent] = React.useState<HostedEvent | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");
  React.useEffect(() => {
    void getHostedEvents().then((result) =>
      setEvent(result.events.find((item) => item.id === eventId) ?? null),
    );
  }, [eventId]);
  async function save() {
    if (!event) return;
    setSaving(true);
    try {
      const result = await updateHostedEvent(event.id, event);
      setEvent(result.event);
      setMessage("Event updated");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update event");
    } finally {
      setSaving(false);
    }
  }
  return (
    <OrganizerShell>
      <Section spacing="sm" className="pt-10">
        <Container className="max-w-3xl">
          <Link
            to="/organizer/events"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground"
          >
            <ArrowLeft /> My Events
          </Link>
          {event ? (
            <>
              <h1 className="font-display mt-5 text-3xl font-semibold">{event.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {event.date} · {event.area} · {event.status}
              </p>
              <div className="mt-6 grid gap-4 rounded-3xl border border-border bg-card/60 p-6">
                <label className="text-sm">
                  Title
                  <input
                    value={event.title}
                    onChange={(input) => setEvent({ ...event, title: input.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
                  />
                </label>
                <label className="text-sm">
                  Description
                  <textarea
                    value={event.description}
                    onChange={(input) => setEvent({ ...event, description: input.target.value })}
                    className="mt-1 min-h-32 w-full rounded-xl border border-border bg-surface px-3 py-2"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => void save()} disabled={saving}>
                    {saving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save /> Save changes
                      </>
                    )}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/organizer/events/$eventId/attendees" params={{ eventId: event.id }}>
                      <Users /> View attendees
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/event/$eventId" params={{ eventId: event.id }}>
                      <Eye /> View event
                    </Link>
                  </Button>
                </div>
                {message ? <p className="text-sm text-success">{message}</p> : null}
              </div>
            </>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">Event not found.</p>
          )}
        </Container>
      </Section>
    </OrganizerShell>
  );
}
