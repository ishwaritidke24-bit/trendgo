import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarPlus, CheckCircle, LoaderCircle } from "lucide-react";

import { OrganizerShell } from "@/components/organizer/organizer-shell";
import { Container, Section } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { createHostedEvent } from "@/lib/organizer-api";

export const Route = createFileRoute("/organizer-create")({
  component: CreateOrganizerEvent,
});
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
  const [success, setSuccess] = React.useState(false);

  function validateForm(): string | null {
    if (!form.title.trim()) return "Title is required.";
    if (!form.description.trim()) return "Description is required.";
    if (!form.category.trim()) return "Category is required.";
    if (!form.date) return "Date is required.";
    if (!form.time) return "Start time is required.";
    if (!form.venue.trim()) return "Venue is required.";
    if (!form.address.trim()) return "Address is required.";
    if (!form.city.trim()) return "City is required.";
    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date))
      return "Date must be in YYYY-MM-DD format.";
    // Validate time format HH:MM
    if (!/^\d{2}:\d{2}$/.test(form.time))
      return "Start time must be in HH:MM format (e.g. 19:00).";
    if (form.endTime && !/^\d{2}:\d{2}$/.test(form.endTime))
      return "End time must be in HH:MM format (e.g. 21:00).";
    if (form.endTime && form.endTime <= form.time)
      return "End time must be after start time.";
    if (form.price < 0) return "Price cannot be negative.";
    if (form.capacity < 0) return "Capacity cannot be negative.";
    // Validate image URL if provided
    if (form.image) {
      try {
        new URL(form.image);
      } catch {
        return "Image must be a valid URL.";
      }
    }
    return null;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const tags = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      // area defaults to city if not provided
      const area = form.area.trim() || form.city.trim();
      await createHostedEvent({ ...form, tags, area });
      setSuccess(true);
      // Navigate to My Events after short delay so user sees success
      setTimeout(() => void navigate({ to: "/organizer-events" }), 1200);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create event",
      );
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
          <h1 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
            Create Event
          </h1>
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
                  type={
                    key === "image"
                      ? "url"
                      : key === "date"
                        ? "date"
                        : key === "time" || key === "endTime"
                          ? "time"
                          : "text"
                  }
                  value={form[key]}
                  onChange={(event) =>
                    setForm({ ...form, [key]: event.target.value })
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
                value={form.price}
                onChange={(event) =>
                  setForm({ ...form, price: Number(event.target.value) })
                }
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Capacity
              <input
                type="number"
                min="0"
                value={form.capacity}
                onChange={(event) =>
                  setForm({ ...form, capacity: Number(event.target.value) })
                }
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              Description
              <textarea
                required
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                className="mt-1 min-h-32 w-full rounded-xl border border-border bg-surface px-3 py-2"
              />
            </label>
            {error ? (
              <p
                role="alert"
                className="text-sm text-destructive sm:col-span-2"
              >
                {error}
              </p>
            ) : null}
            {success ? (
              <p
                role="status"
                className="flex items-center gap-2 text-sm text-green-500 sm:col-span-2"
              >
                <CheckCircle className="size-4" /> Event created! Redirecting to
                My Events...
              </p>
            ) : null}
            <div className="flex justify-end sm:col-span-2">
              <Button type="submit" disabled={saving || success}>
                {saving ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <CalendarPlus />
                )}
                {saving ? "Creating..." : "Create draft"}
              </Button>
            </div>
          </form>
        </Container>
      </Section>
    </OrganizerShell>
  );
}
