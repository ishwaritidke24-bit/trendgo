import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarPlus, LoaderCircle } from "lucide-react";

import { OrganizerShell } from "@/components/organizer/organizer-shell";
import { Container, Section } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { createHostedEvent } from "@/lib/organizer-api";

export const Route = createFileRoute("/organizer-create")({ component: CreateOrganizerEvent });
const initial = {
  title: "",
  description: "",
  category: "",
  tags: "",
  image: "",
  date: "",
  time: "",
  endTime: "",
  venue: "",
  address: "",
  area: "",
  city: "",
  price: 0,
  capacity: 0,
};
function CreateOrganizerEvent() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState(initial);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await createHostedEvent({
        ...form,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      await navigate({ to: "/organizer/events/$eventId", params: { eventId: result.event.id } });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create event");
    } finally {
      setSaving(false);
    }
  }
  const textFields = [
    ["title", "Title"],
    ["category", "Category"],
    ["date", "Date"],
    ["time", "Start time"],
    ["endTime", "End time"],
    ["venue", "Venue"],
    ["address", "Address"],
    ["area", "Area / neighbourhood"],
    ["city", "City"],
    ["tags", "Tags (comma separated)"],
    ["image", "Event image URL"],
  ] as const;
  return (
    <OrganizerShell>
      <Section spacing="sm" className="pt-10">
        <Container className="max-w-4xl">
          <p className="text-xs font-medium tracking-[0.18em] text-primary-glow uppercase">
            Build an experience
          </p>
          <h1 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">Create Event</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your account will automatically own this event.
          </p>
          <form
            onSubmit={submit}
            className="mt-8 grid gap-4 rounded-3xl border border-border bg-card/60 p-6 sm:grid-cols-2"
          >
            {textFields.map(([key, label]) => (
              <label key={key} className="text-sm">
                {label}
                <input
                  required={
                    key === "title" ||
                    key === "category" ||
                    key === "date" ||
                    key === "time" ||
                    key === "venue" ||
                    key === "city"
                  }
                  type={key === "image" ? "url" : "text"}
                  value={form[key]}
                  onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
                />
              </label>
            ))}
            <label className="text-sm">
              Price
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Capacity
              <input
                type="number"
                min="0"
                value={form.capacity}
                onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })}
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              Description
              <textarea
                required
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="mt-1 min-h-32 w-full rounded-xl border border-border bg-surface px-3 py-2"
              />
            </label>
            {error ? (
              <p role="alert" className="text-sm text-destructive sm:col-span-2">
                {error}
              </p>
            ) : null}
            <div className="flex justify-end sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? <LoaderCircle className="animate-spin" /> : <CalendarPlus />}
                {saving ? "Creating..." : "Create draft"}
              </Button>
            </div>
          </form>
        </Container>
      </Section>
    </OrganizerShell>
  );
}
