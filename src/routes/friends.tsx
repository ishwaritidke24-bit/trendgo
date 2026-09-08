import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Heart, UserPlus, Users, Share2, Check } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { Container, Section } from "@/components/layout/container";
import { EventCard } from "@/components/events/event-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ACTIVITY, EVENTS, FRIENDS, eventById, friendById, type EventItem } from "@/data/mock";
import { useAuth } from "@/lib/auth-context";
import { searchEvents } from "@/lib/events-api";

export const Route = createFileRoute("/friends")({ component: FriendsPage });

function FriendsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);
  const [groupEvents, setGroupEvents] = React.useState<EventItem[]>([]);

  React.useEffect(() => {
    let active = true;
    void searchEvents({ limit: 6 })
      .then((res) => {
        if (active && res.events && res.events.length > 0) {
          setGroupEvents(res.events.slice(0, 3));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleInvite = () => {
    if (typeof window !== "undefined") {
      const inviteUrl = `${window.location.origin}/signup?ref=friends`;
      void navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Invite link copied to clipboard! Share it with your friends.");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const socialEvents = ACTIVITY.map((item) => ({
    item,
    friend: friendById(item.friendId),
    event: eventById(item.eventId),
  })).filter((entry) => entry.friend && entry.event);

  const displayGroupEvents = groupEvents.length > 0
    ? groupEvents
    : EVENTS.filter((event) => event.friendIds.length >= 2).slice(0, 3);

  return (
    <AppShell>
      <Section spacing="sm" className="pt-10">
        <Container>
          <p className="text-xs font-medium tracking-[0.18em] text-primary-glow uppercase">
            Social discovery
          </p>
          <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-3xl font-semibold sm:text-4xl">
                Your people, your next plan
              </h1>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                See what your circle is excited about, then find the room you will all talk about
                later.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInvite} className="cursor-pointer">
                {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
                {copied ? "Link copied" : "Invite friends"}
              </Button>
            </div>
          </div>

          {!user && (
            <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-primary/30 bg-primary/10 p-5 sm:flex-row sm:items-center sm:justify-between backdrop-blur-md">
              <div>
                <h3 className="font-semibold text-foreground">Connect with your friends</h3>
                <p className="text-sm text-muted-foreground">
                  Sign in to see where people you know are going, coordinate plans, and get invited to private gigs.
                </p>
              </div>
              <Button asChild className="shrink-0">
                <Link to="/signin" search={{ redirect: "/friends" }}>
                  Sign in to connect
                </Link>
              </Button>
            </div>
          )}
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem]">
            <div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Live from your circle</p>
                  <h2 className="font-display mt-1 text-2xl font-semibold">Friend activity</h2>
                </div>
                <Badge variant="success">
                  <span className="size-1.5 rounded-full bg-success" /> 6 active now
                </Badge>
              </div>
              <div className="mt-5 flex flex-col gap-3">
                {socialEvents.map(({ item, friend, event }) => (
                  <Link
                    key={item.id}
                    to="/event/$eventId"
                    params={{ eventId: event!.id }}
                    className="group flex items-center gap-4 rounded-3xl border border-border bg-card/60 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card"
                  >
                    <Avatar size="lg">
                      <AvatarImage src={friend!.avatar} alt={friend!.name} />
                      <AvatarFallback>{friend!.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{friend!.name}</span>{" "}
                        {item.action}{" "}
                        <span className="font-medium text-primary-glow">{event!.title}</span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.when} · {event!.area}
                      </p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
            <aside className="rounded-3xl border border-border bg-surface/60 p-5">
              <p className="text-xs font-medium tracking-[0.16em] text-primary-glow uppercase">
                Your circle
              </p>
              <div className="mt-4 flex flex-col gap-4">
                {FRIENDS.slice(0, 5).map((friend) => (
                  <div key={friend.id} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback>{friend.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{friend.name}</p>
                      <p className="text-xs text-muted-foreground">{friend.mutual} mutuals</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="subtle" className="mt-5 w-full" asChild>
                <Link to="/friends">View all friends</Link>
              </Button>
            </aside>
          </div>
        </Container>
      </Section>
      <Section spacing="sm">
        <Container>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] text-primary-glow uppercase">
                Because your friends are going
              </p>
              <h2 className="font-display mt-2 text-2xl font-semibold">Make it a group plan</h2>
            </div>
            <CalendarDays className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayGroupEvents.map((event) => (
              <EventCard key={event.id} event={event} showWhy={false} />
            ))}
          </div>
        </Container>
      </Section>
      <Section spacing="sm">
        <Container>
          <div className="rounded-[2rem] border border-primary/25 bg-[radial-gradient(100%_180%_at_0%_0%,oklch(0.66_0.25_305/0.2),transparent_60%)] p-6 sm:p-9">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium tracking-[0.16em] text-primary-glow uppercase">
                  Expand the graph
                </p>
                <h2 className="font-display mt-2 text-2xl font-semibold">
                  Discover through friend activity
                </h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  The best recommendations are one degree away. Follow a few more people to make
                  your feed feel even more like yours.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/explore">
                  <Heart /> Browse their picks
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </AppShell>
  );
}
