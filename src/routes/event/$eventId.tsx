import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bookmark,
  CalendarDays,
  Check,
  Clock3,
  Heart,
  MapPin,
  Navigation,
  Send,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Container, Section } from "@/components/layout/container";
import { EventCard } from "@/components/events/event-card";
import { FriendAvatars } from "@/components/events/friend-avatars";
import { MatchBadge } from "@/components/events/match-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EVENTS, eventById, friendById } from "@/data/mock";

export const Route = createFileRoute("/event/$eventId")({ component: EventDetailPage });

function EventDetailPage() {
  const { eventId } = Route.useParams();
  const event = eventById(eventId);
  const [interested, setInterested] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  if (!event) {
    return (
      <AppShell>
        <Container className="py-24 text-center">
          <h1 className="font-display text-3xl font-semibold">That experience moved on</h1>
          <p className="mt-3 text-muted-foreground">Try another pick from your feed.</p>
          <Button className="mt-6" asChild>
            <Link to="/home">Back to your feed</Link>
          </Button>
        </Container>
      </AppShell>
    );
  }

  const similar = EVENTS.filter((item) => item.id !== event.id && item.category === event.category)
    .concat(EVENTS.filter((item) => item.id !== event.id && item.category !== event.category))
    .slice(0, 4);

  return (
    <AppShell>
      <Section spacing="sm" className="pt-8">
        <Container>
          <Link
            to="/home"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to your feed
          </Link>
          <div className="mt-6 overflow-hidden rounded-[2rem] border border-border bg-card/70">
            <div className="relative aspect-[16/8] min-h-64">
              <img src={event.image} alt={event.title} className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <Badge className="absolute top-5 left-5">{event.category}</Badge>
              <MatchBadge value={event.match} className="absolute top-5 right-5" />
              <div className="absolute right-5 bottom-5 left-5 max-w-3xl">
                <h1 className="font-display text-3xl font-semibold text-balance sm:text-5xl">
                  {event.title}
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  {event.venue} · {event.area}
                </p>
              </div>
            </div>
            <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_20rem]">
              <div>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="neutral">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
                  {event.description}
                </p>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <Info
                    icon={<CalendarDays />}
                    label="When"
                    value={`${event.date} · ${event.time}`}
                  />
                  <Info icon={<MapPin />} label="Where" value={`${event.venue}, ${event.area}`} />
                  <Info
                    icon={<Navigation />}
                    label="Getting there"
                    value={`${event.distanceKm} km from you`}
                  />
                  <Info
                    icon={<Users />}
                    label="The room"
                    value={`${event.interested} people interested`}
                  />
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button onClick={() => setInterested((value) => !value)}>
                    {interested ? <Check /> : <Heart />}{" "}
                    {interested ? "Interested" : "I'm interested"}
                  </Button>
                  <Button variant="outline" onClick={() => setSaved((value) => !value)}>
                    <Bookmark className={saved ? "fill-primary-glow text-primary-glow" : ""} />{" "}
                    {saved ? "Saved" : "Save"}
                  </Button>
                  <Button variant="outline">
                    <Share2 /> Share
                  </Button>
                  <Button variant="ghost">
                    <Send /> Invite friends
                  </Button>
                </div>
              </div>
              <aside className="self-start rounded-3xl border border-border bg-surface/60 p-5">
                <p className="text-xs font-medium tracking-[0.16em] text-primary-glow uppercase">
                  Why you&apos;ll like this
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  {event.reasons.map((reason) => (
                    <div
                      key={reason}
                      className="flex gap-3 rounded-2xl bg-background/60 p-3 text-sm text-muted-foreground"
                    >
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-primary-glow" />
                      {reason}
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="sm">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
            <div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium tracking-[0.16em] text-primary-glow uppercase">
                    Your people
                  </p>
                  <h2 className="font-display mt-2 text-2xl font-semibold">Who&apos;s going</h2>
                </div>
                <FriendAvatars ids={event.friendIds} size="lg" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {event.friendIds.map((id) => {
                  const friend = friendById(id);
                  if (!friend) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 p-3"
                    >
                      <Avatar>
                        <AvatarImage src={friend.avatar} alt={friend.name} />
                        <AvatarFallback>{friend.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{friend.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {friend.taste} · {friend.mutual} mutuals
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-card/60 p-5">
              <p className="text-xs text-muted-foreground">Hosted by</p>
              <div className="mt-4 flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{event.organizer.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{event.organizer.name}</p>
                  <p className="text-xs text-muted-foreground">{event.organizer.blurb}</p>
                </div>
              </div>
              <Button variant="subtle" className="mt-5 w-full">
                <Clock3 /> View organizer
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="sm">
        <Container>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] text-primary-glow uppercase">
                Keep exploring
              </p>
              <h2 className="font-display mt-2 text-2xl font-semibold">Similar experiences</h2>
            </div>
            <Link to="/explore" className="text-sm text-primary-glow hover:underline">
              See all
            </Link>
          </div>
          <div className="mt-6 flex snap-x gap-5 overflow-x-auto pb-4">
            {similar.map((item) => (
              <div key={item.id} className="min-w-[17rem] snap-start sm:min-w-[20rem]">
                <EventCard event={item} size="compact" showWhy={false} />
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </AppShell>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary-glow">
        {icon}
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
