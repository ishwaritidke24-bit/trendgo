import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  Edit3,
  MapPin,
  Plus,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Container, Section } from "@/components/layout/container";
import { EventCard } from "@/components/events/event-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORIES, CURRENT_USER, EVENTS } from "@/data/mock";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const [interests, setInterests] = React.useState(CURRENT_USER.interests);
  const toggleInterest = (interest: string) =>
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  return (
    <AppShell>
      <Section spacing="sm" className="pt-10">
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card/70 p-6 sm:p-9">
            <div className="absolute top-0 right-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <Avatar size="xl" ring="accent">
                <AvatarImage src={CURRENT_USER.avatar} alt={CURRENT_USER.name} />
                <AvatarFallback>{CURRENT_USER.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-xs font-medium tracking-[0.18em] text-primary-glow uppercase">
                  Your TrendGo
                </p>
                <h1 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">
                  {CURRENT_USER.name}
                </h1>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4 text-primary-glow" /> {CURRENT_USER.location} ·{" "}
                  {CURRENT_USER.joined}
                </p>
                <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                  {CURRENT_USER.bio}
                </p>
              </div>
              <Button variant="outline">
                <Edit3 /> Edit profile
              </Button>
            </div>
            <div className="relative mt-8 grid grid-cols-3 border-t border-border pt-6">
              <Stat icon={<CalendarCheck />} value={CURRENT_USER.stats.attended} label="Attended" />
              <Stat icon={<Ticket />} value={CURRENT_USER.stats.saved} label="Saved" />
              <Stat icon={<Users />} value={CURRENT_USER.stats.friends} label="Friends" />
            </div>
          </div>
        </Container>
      </Section>
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
                <Button variant="ghost" size="sm">
                  <Plus /> Add interest
                </Button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Tune the signals behind your recommendations.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className="rounded-full border border-primary/35 bg-primary/10 px-4 py-2 text-sm text-primary-glow transition-colors hover:bg-primary/20"
                  >
                    {interest} <span className="ml-2 opacity-60">x</span>
                  </button>
                ))}
                {CATEGORIES.filter(
                  (category) => !CURRENT_USER.favouriteCategories.includes(category),
                )
                  .slice(0, 3)
                  .map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleInterest(category)}
                      className="rounded-full border border-dashed border-border-strong px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      + {category}
                    </button>
                  ))}
              </div>
            </div>
            <aside className="rounded-3xl border border-border bg-surface/60 p-5">
              <p className="text-xs font-medium tracking-[0.16em] text-primary-glow uppercase">
                Favorite categories
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {CURRENT_USER.favouriteCategories.map((category) => (
                  <Badge key={category} variant="neutral">
                    {category}
                  </Badge>
                ))}
              </div>
              <div className="mt-6 flex items-start gap-3 border-t border-border pt-5">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary-glow" />
                <p className="text-xs leading-5 text-muted-foreground">
                  Your profile helps TrendGo balance familiar favorites with something different.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
      <Section spacing="sm">
        <Container>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] text-primary-glow uppercase">
                Your taste trail
              </p>
              <h2 className="font-display mt-2 text-2xl font-semibold">Saved experiences</h2>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1 text-sm text-primary-glow hover:underline"
            >
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {EVENTS.filter((event) =>
              ["clay-studio", "sunrise-trek", "indie-basement"].includes(event.id),
            ).map((event) => (
              <EventCard key={event.id} event={event} showWhy={false} />
            ))}
          </div>
        </Container>
      </Section>
    </AppShell>
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
