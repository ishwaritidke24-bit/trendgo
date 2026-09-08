import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LoaderCircle, Save } from "lucide-react";

import { OrganizerShell } from "@/components/organizer/organizer-shell";
import { Container, Section } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  getOrganizerProfile,
  updateOrganizerProfile,
  type OrganizerProfile,
} from "@/lib/organizer-api";

export const Route = createFileRoute("/organizer-profile")({
  component: OrganizerProfilePage,
});
function OrganizerProfilePage() {
  const [profile, setProfile] = React.useState<OrganizerProfile | null>(null);
  const [form, setForm] = React.useState({
    displayName: "",
    organizationName: "",
    bio: "",
    website: "",
  });
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");
  React.useEffect(() => {
    void getOrganizerProfile().then((result) => {
      setProfile(result.organizer);
      if (result.organizer) setForm(result.organizer);
    });
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await updateOrganizerProfile(form);
      setProfile(result.organizer);
      setMessage("Organizer profile saved");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save profile",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <OrganizerShell>
      <Section spacing="sm" className="pt-10">
        <Container className="max-w-3xl">
          <p className="text-xs font-medium tracking-[0.18em] text-primary-glow uppercase">
            Your host identity
          </p>
          <h1 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
            Organizer Profile
          </h1>
          <form
            onSubmit={submit}
            className="mt-8 grid gap-4 rounded-3xl border border-border bg-card/60 p-6"
          >
            <label className="text-sm">
              Display name
              <input
                required
                value={form.displayName}
                onChange={(event) =>
                  setForm({ ...form, displayName: event.target.value })
                }
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Organization name
              <input
                value={form.organizationName}
                onChange={(event) =>
                  setForm({ ...form, organizationName: event.target.value })
                }
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Website
              <input
                type="url"
                value={form.website}
                onChange={(event) =>
                  setForm({ ...form, website: event.target.value })
                }
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Bio
              <textarea
                value={form.bio}
                onChange={(event) =>
                  setForm({ ...form, bio: event.target.value })
                }
                className="mt-1 min-h-32 w-full rounded-xl border border-border bg-surface px-3 py-2"
              />
            </label>
            <p className="text-xs text-muted-foreground">
              Verification: {profile?.verificationStatus ?? "unverified"}
            </p>
            {message ? <p className="text-sm text-success">{message}</p> : null}
            <Button type="submit" disabled={saving}>
              {saving ? <LoaderCircle className="animate-spin" /> : <Save />}
              {saving ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </Container>
      </Section>
    </OrganizerShell>
  );
}
