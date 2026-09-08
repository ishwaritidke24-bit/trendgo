import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  Edit3,
  Heart,
  LoaderCircle,
  MapPin,
  Plus,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Container, Section } from "@/components/layout/container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { CATEGORIES } from "@/data/mock";
import { useAuth } from "@/lib/auth-context";
import { BecomeOrganizerDialog } from "@/components/organizer/become-organizer-dialog";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user, loading, error, updateInterests, updateProfile } = useAuth();
  const [savingInterests, setSavingInterests] = React.useState(false);
  const [updateError, setUpdateError] = React.useState<string | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [becomeOrganizerOpen, setBecomeOrganizerOpen] = React.useState(false);
  const [draft, setDraft] = React.useState({ name: "", location: "", avatar: "", interests: [] as string[] });
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const openEditor = () => {
    setDraft({
      name: user?.name ?? "",
      location: user?.location ?? "",
      avatar: user?.avatar ?? "",
      interests: user?.interests ?? [],
    });
    setUpdateError(null);
    setSaveSuccess(false);
    setEditOpen(true);
  };
  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setUpdateError(null);
    try {
      await updateProfile({
        name: draft.name,
        location: draft.location,
        avatar: draft.avatar,
      });
      await updateInterests(draft.interests);
      setEditOpen(false);
      setSaveSuccess(true);
    } catch (saveError) {
      setUpdateError(
        saveError instanceof Error ? saveError.message : "Unable to save your profile",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) return <ProfileState title="Loading your profile..." />;
  if (error || !user)
    return <ProfileState title={error?.message ?? "Your profile is unavailable"} />;

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  const joined = user.createdAt
    ? `Joined ${new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}`
    : null;
  const toggleInterest = async (interest: string) => {
    const interests = user.interests.includes(interest)
      ? user.interests.filter((item) => item !== interest)
      : [...user.interests, interest];
    setSavingInterests(true);
    setUpdateError(null);
    try {
      await updateInterests(interests);
    } catch (updateFailure) {
      setUpdateError(
        updateFailure instanceof Error ? updateFailure.message : "Unable to update interests",
      );
    } finally {
      setSavingInterests(false);
    }
  };

  return (
    <AppShell>
    <AppShell requireAuth>
      <Section spacing="sm" className="pt-10">
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card/70 p-6 sm:p-9">
            <div className="absolute top-0 right-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <Avatar size="xl" ring="accent">
                {user.avatar ? <AvatarImage src={user.avatar} alt={`${user.name}'s avatar`} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-xs font-medium tracking-[0.18em] text-primary-glow uppercase">
                  Your TrendGo
                </p>
                <h1 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">
                  {user.name}
                </h1>
                {user.location || joined ? (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    {user.location ? (
                      <>
                        <MapPin className="size-4 text-primary-glow" /> {user.location}
                      </>
                    ) : null}
                    {user.location && joined ? " · " : null}
                    {joined}
                  </p>
                ) : null}
              </div>
              <Button variant="outline" onClick={openEditor}>
                <Edit3 /> Edit profile
              </Button>
              {saveSuccess ? <p className="text-sm text-success">Profile saved</p> : null}
              {user.roles.includes("organizer") && user.organizerStatus === "active" ? (
                <Button variant="ghost" asChild>
                  <Link to="/organizer">Organizer mode</Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setBecomeOrganizerOpen(true)}
                  className="border-primary/40 bg-primary/10 text-primary-glow hover:bg-primary/20"
                >
                  <Sparkles className="size-4 text-primary-glow" /> Become an Organizer
                </Button>
              )}
            </div>
            <div className="relative mt-8 grid grid-cols-3 border-t border-border pt-6">
              <Stat
                icon={<CalendarCheck />}
                value={user.attendedEventIds.length}
                label="Attended"
              />
              <Stat icon={<Ticket />} value={user.savedEventIds.length} label="Saved" />
              <Stat icon={<Heart />} value={user.interests.length} label="Interests" />
            </div>
          </div>
        </Container>
      </Section>
      <BecomeOrganizerDialog open={becomeOrganizerOpen} onOpenChange={setBecomeOrganizerOpen} />
      <Section spacing="sm">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
            <div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-medium tracking-[0.16em] text-primary-glow uppercase">
                    Personalization
                  </p>
                  <h2 className="font-display mt-2 text-2xl font-semibold">Your interests</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={openEditor}>
                  <Plus /> Add interest
                </Button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Tune the signals behind your recommendations.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {user.interests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    disabled={savingInterests}
                    className="rounded-full border border-primary/35 bg-primary/10 px-4 py-2 text-sm text-primary-glow transition-colors hover:bg-primary/20"
                  >
                    {interest} <span className="ml-2 opacity-60">x</span>
                  </button>
                ))}
                {CATEGORIES.filter((category) => !user.interests.includes(category))
                  .slice(0, 3)
                  .map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleInterest(category)}
                      disabled={savingInterests}
                      className="rounded-full border border-dashed border-border-strong px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      + {category}
                    </button>
                  ))}
              </div>
              {updateError ? <p className="mt-3 text-sm text-destructive">{updateError}</p> : null}
              {!user.interests.length ? (
                <p className="mt-5 text-sm text-muted-foreground">No interests added yet</p>
              ) : null}
            </div>
            <aside className="rounded-3xl border border-border bg-surface/60 p-5">
              <p className="text-xs font-medium tracking-[0.16em] text-primary-glow uppercase">
                Favorite categories
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {user.interests
                  .filter((interest) =>
                    CATEGORIES.includes(interest as (typeof CATEGORIES)[number]),
                  )
                  .map((category) => (
                    <Badge key={category} variant="neutral">
                      {category}
                    </Badge>
                  ))}
              </div>
              {!user.interests.some((interest) =>
                CATEGORIES.includes(interest as (typeof CATEGORIES)[number]),
              ) ? (
                <p className="mt-4 text-sm text-muted-foreground">No favorite categories yet</p>
              ) : null}
              <div className="mt-6 flex items-start gap-3 border-t border-border pt-5">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary-glow" />
                <p className="text-xs leading-5 text-muted-foreground">
                  Your profile helps TrendGo balance familiar favorites with something different.
                </p>
              </div>

              {/* Discovery Locations */}
              <div className="mt-6 border-t border-border pt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium tracking-[0.16em] text-primary-glow uppercase">
                    Discovery Locations
                  </p>
                  <LocationSelector />
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Events are fetched for these cities every month.
                </p>
                <div className="flex flex-wrap gap-2">
                  {(user.discoveryLocations ?? []).length === 0 ? (
                    <p className="text-xs text-muted-foreground">No locations added yet</p>
                  ) : (
                    (user.discoveryLocations ?? []).map((loc) => (
                      <span
                        key={loc}
                        className="inline-flex items-center gap-1 rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary-glow"
                      >
                        <MapPin className="size-3" /> {loc}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <form className="mt-4 flex flex-col gap-4" onSubmit={saveProfile}>
            <label className="text-sm">
              Name
              <input
                required
                minLength={2}
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Location
              <input
                value={draft.location}
                onChange={(event) => setDraft({ ...draft, location: event.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Avatar URL
              <input
                type="url"
                value={draft.avatar}
                onChange={(event) => setDraft({ ...draft, avatar: event.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
              />
            </label>
            <fieldset>
              <legend className="text-sm">Interests</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORIES.map((category) => {
                  const selected = draft.interests.includes(category);
                  return (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          interests: selected
                            ? draft.interests.filter((interest) => interest !== category)
                            : [...draft.interests, category],
                        })
                      }
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        selected
                          ? "border-primary/35 bg-primary/10 text-primary-glow"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            {updateError ? (
              <p role="alert" className="text-sm text-destructive">
                {updateError}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
                <X /> Cancel
              </Button>
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? <LoaderCircle className="animate-spin" /> : <Edit3 />}
                {savingProfile ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <BecomeOrganizerDialog
        open={becomeOrganizerOpen}
        onOpenChange={setBecomeOrganizerOpen}
      />
      <Section spacing="sm">
        <Container>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] text-primary-glow uppercase">
                Your taste trail
              </p>
              <h2 className="font-display mt-2 text-2xl font-semibold">Saved experiences</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <EventCollectionState
              icon={<Ticket />}
              count={user.savedEventIds.length}
              emptyTitle="No saved events"
              countLabel="saved events"
              description="Events you save will appear here."
            />
            <EventCollectionState
              icon={<Heart />}
              count={user.interestedEventIds.length}
              emptyTitle="No interested events yet"
              countLabel="interested events"
              description="Events you mark as interested will appear here."
            />
            <EventCollectionState
              icon={<CalendarCheck />}
              count={user.attendedEventIds.length}
              emptyTitle="No events attended yet"
              countLabel="attended events"
              description="Events you attend will appear here."
            />
          </div>
        </Container>
      </Section>
    </AppShell>
  );
}

function ProfileState({ title }: { title: string }) {
  return (
    <div className="bg-aurora grid min-h-screen place-items-center px-6 text-center text-sm text-muted-foreground">
      {title}
    </div>
  );
}

function EventCollectionState({
  icon,
  count,
  emptyTitle,
  countLabel,
  description,
}: {
  icon: React.ReactNode;
  count: number;
  emptyTitle: string;
  countLabel: string;
  description: string;
}) {
  return (
    <EmptyState
      icon={icon}
      title={count ? `${count} ${countLabel}` : emptyTitle}
      description={description}
    />
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 border-r border-border last:border-0">
      <span className="text-primary-glow">{icon}</span>
      <div>
        <p className="font-display text-xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
