import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, LoaderCircle, Rocket, Save } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Container, Section } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/lib/auth-context";
import {
  activateOrganizer,
  createHostedEvent,
  getHostedEvents,
  getOrganizerProfile,
  setHostedEventStatus,
  type HostedEvent,
  type OrganizerProfile,
} from "@/lib/organizer-api";

export const Route = createFileRoute("/organizer")({ component: OrganizerPage });

const blankEvent = {
  title: "",
  description: "",
  category: "",
  date: "",
  time: "",
  venue: "",
  area: "",
  price: 0,
  image: "",
};

function OrganizerPage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = React.useState<OrganizerProfile | null>(null);
  const [events, setEvents] = React.useState<HostedEvent[]>([]);
  const [form, setForm] = React.useState({
    displayName: user?.name ?? "",
    bio: "",
    organizationName: "",
    website: "",
  });
  const [eventForm, setEventForm] = React.useState(blankEvent);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const activeOrganizer = user?.roles.includes("organizer") && user.organizerStatus === "active";

  React.useEffect(() => {
    if (!activeOrganizer) {
      setLoading(false);
      return;
    }
    void Promise.all([getOrganizerProfile(), getHostedEvents()])
      .then(([profileResult, eventResult]) => {
        setProfile(profileResult.organizer);
        setEvents(eventResult.events);
        if (profileResult.organizer) setForm(profileResult.organizer);
      })
      .catch((requestError) =>
        setError(
          requestError instanceof Error ? requestError.message : "Unable to load organizer mode",
        ),
      )
      .finally(() => setLoading(false));
  }, [activeOrganizer]);

  async function becomeOrganizer(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await activateOrganizer(form);
      setProfile(result.organizer);
      await refreshUser();
      setSuccess("Organizer mode is active");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to activate organizer mode",
      );
    } finally {
      setSaving(false);
    }
  }

  async function createEvent(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await createHostedEvent(eventForm);
      setEvents((current) => [result.event, ...current]);
      setEventForm(blankEvent);
      setSuccess("Event saved as a draft");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create event");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(hostedEvent: HostedEvent) {
    const status = hostedEvent.status === "published" ? "unpublished" : "published";
    try {
      const result = await setHostedEventStatus(hostedEvent.id, status);
      setEvents((current) =>
        current.map((item) => (item.id === hostedEvent.id ? result.event : item)),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to update event status",
      );
    }
  }

  if (loading)
    return (
      <AppShell>
        <Container className="py-24 text-center text-sm text-muted-foreground">
          Loading organizer mode...
        </Container>
      </AppShell>
    );

  return (
    <AppShell>
      <Section spacing="sm" className="pt-10">
        <Container>
          <p className="text-xs font-medium tracking-[0.18em] text-primary-glow uppercase">
            Host experiences
          </p>
          <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-3xl font-semibold sm:text-4xl">Organizer mode</h1>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                Use the same TrendGo account to create and manage events.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/profile">Back to profile</Link>
            </Button>
          </div>
          {error ? (
            <p role="alert" className="mt-6 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {success ? <p className="mt-6 text-sm text-success">{success}</p> : null}
          {!activeOrganizer ? (
            <form
              onSubmit={becomeOrganizer}
              className="mt-8 grid gap-4 rounded-3xl border border-border bg-card/60 p-6 sm:grid-cols-2"
            >
              <div className="sm:col-span-2">
                <h2 className="font-display text-xl font-semibold">Become an Organizer</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create a host profile without creating another account.
                </p>
              </div>
              <label className="text-sm">
                Display name
                <input
                  required
                  value={form.displayName}
                  onChange={(event) => setForm({ ...form, displayName: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
                />
              </label>
              <label className="text-sm">
                Organization name
                <input
                  value={form.organizationName}
                  onChange={(event) => setForm({ ...form, organizationName: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                Bio
                <textarea
                  value={form.bio}
                  onChange={(event) => setForm({ ...form, bio: event.target.value })}
                  className="mt-1 min-h-24 w-full rounded-xl border border-border bg-surface px-3 py-2"
                />
              </label>
              <label className="text-sm">
                Website
                <input
                  type="url"
                  value={form.website}
                  onChange={(event) => setForm({ ...form, website: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
                />
              </label>
              <div className="flex items-end">
                <Button type="submit" disabled={saving}>
                  {saving ? <LoaderCircle className="animate-spin" /> : <Rocket />}
                  {saving ? "Activating..." : "Become an Organizer"}
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
                <form
                  onSubmit={createEvent}
                  className="grid gap-4 rounded-3xl border border-border bg-card/60 p-6 sm:grid-cols-2"
                >
                  <h2 className="font-display text-xl font-semibold sm:col-span-2">
                    Create an event
                  </h2>
                  {(
                    [
                      ["title", "Title"],
                      ["category", "Category"],
                      ["date", "Date"],
                      ["time", "Time"],
                      ["venue", "Venue"],
                      ["area", "Area"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="text-sm">
                      {label}
                      <input
                        required
                        value={eventForm[key]}
                        onChange={(event) =>
                          setEventForm({ ...eventForm, [key]: event.target.value })
                        }
                        className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
                      />
                    </label>
                  ))}
                  <label className="text-sm">
                    Price
                    <input
                      type="number"
                      min="0"
                      value={eventForm.price}
                      onChange={(event) =>
                        setEventForm({ ...eventForm, price: Number(event.target.value) })
                      }
                      className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
                    />
                  </label>
                  <label className="text-sm">
                    Image URL
                    <input
                      type="url"
                      value={eventForm.image}
                      onChange={(event) =>
                        setEventForm({ ...eventForm, image: event.target.value })
                      }
                      className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
                    />
                  </label>
                  <label className="text-sm sm:col-span-2">
                    Description
                    <textarea
                      value={eventForm.description}
                      onChange={(event) =>
                        setEventForm({ ...eventForm, description: event.target.value })
                      }
                      className="mt-1 min-h-24 w-full rounded-xl border border-border bg-surface px-3 py-2"
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={saving}>
                      {saving ? <LoaderCircle className="animate-spin" /> : <CalendarPlus />}
                      {saving ? "Saving..." : "Save draft"}
                    </Button>
                  </div>
                </form>
                <aside className="rounded-3xl border border-border bg-surface/60 p-5">
                  <p className="text-xs font-medium tracking-[0.16em] text-primary-glow uppercase">
                    Host profile
                  </p>
                  <h2 className="font-display mt-2 text-xl font-semibold">
                    {profile?.displayName}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {profile?.organizationName || "Independent organizer"}
                  </p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Verification: {profile?.verificationStatus}
                  </p>
                  <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Save className="size-4" /> {events.length} hosted events
                  </p>
                </aside>
              </div>
              <div className="mt-10">
                <h2 className="font-display text-2xl font-semibold">Your hosted events</h2>
                {events.length ? (
                  <div className="mt-5 flex flex-col gap-3">
                    {events.map((hostedEvent) => (
                      <div
                        key={hostedEvent.id}
                        className="flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-4 sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{hostedEvent.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {hostedEvent.date} · {hostedEvent.area} · {hostedEvent.attendeeCount}{" "}
                            attendees · {hostedEvent.interestedCount} interested
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={hostedEvent.status === "published" ? "outline" : "default"}
                          onClick={() => void togglePublish(hostedEvent)}
                        >
                          {hostedEvent.status === "published" ? "Unpublish" : "Publish"}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    className="mt-5"
                    icon={<CalendarPlus />}
                    title="No hosted events yet"
                    description="Save a draft above to start building your hosted event list."
                  />
                )}
              </div>
            </>
          )}
        </Container>
      </Section>
    </AppShell>
  );
}
