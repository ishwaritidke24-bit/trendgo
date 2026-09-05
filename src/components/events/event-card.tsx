import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  Check,
  ChevronDown,
  Clock,
  Heart,
  MapPin,
  Navigation,
  Sparkles,
} from "lucide-react";

import { FriendAvatars } from "@/components/events/friend-avatars";
import { MatchBadge } from "@/components/events/match-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EventItem } from "@/data/mock";
import { updateEventPreference } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export interface EventCardProps {
  event: EventItem;
  size?: "default" | "compact";
  showWhy?: boolean;
  className?: string;
}

export function EventCard({ event, size = "default", showWhy = true, className }: EventCardProps) {
  const { user, refreshUser } = useAuth();
  const [interested, setInterested] = React.useState(
    () => user?.interestedEventIds.includes(event.id) ?? false,
  );
  const [saved, setSaved] = React.useState(() => user?.savedEventIds.includes(event.id) ?? false);
  const [saving, setSaving] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [whyOpen, setWhyOpen] = React.useState(false);

  const compact = size === "compact";

  async function togglePreference(preference: "save" | "interest") {
    const enabled = preference === "save" ? !saved : !interested;
    setSaving(true);
    setActionError(null);
    try {
      await updateEventPreference(event.id, preference, enabled);
      await refreshUser();
      if (preference === "save") setSaved(enabled);
      else setInterested(enabled);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to update this event");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card/70 transition-all duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[var(--shadow-elevated)]",
        className,
      )}
    >
      <Link
        to="/event/$eventId"
        params={{ eventId: event.id }}
        className="relative block overflow-hidden"
        aria-label={event.title}
      >
        <div
          className={cn("relative overflow-hidden", compact ? "aspect-[16/10]" : "aspect-[16/9]")}
        >
          <img
            src={event.image}
            alt={event.title}
            loading="lazy"
            width={1024}
            height={768}
            className="size-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.07]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.14_0.012_285/0.15)_0%,transparent_35%,oklch(0.14_0.012_285/0.92)_100%)]" />
          <span className="absolute top-3 left-3 rounded-full border border-border-strong bg-background/70 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur-md">
            {event.category}
          </span>
          <MatchBadge value={event.match} className="absolute top-3 right-3" />
          {event.outsideBubble ? (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full border border-primary/40 bg-background/70 px-2.5 py-1 text-[11px] font-medium text-primary-glow backdrop-blur-md">
              <Sparkles className="size-3" /> Outside your bubble
            </span>
          ) : null}
        </div>
      </Link>

      <div className={cn("flex flex-1 flex-col", compact ? "p-4" : "p-5")}>
        <Link to="/event/$eventId" params={{ eventId: event.id }}>
          <h3
            className={cn(
              "font-display leading-snug font-semibold text-balance text-foreground transition-colors group-hover:text-primary-glow",
              compact ? "text-sm sm:text-base" : "text-base sm:text-lg",
            )}
          >
            {event.title}
          </h3>
        </Link>

        <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Clock className="size-3.5 shrink-0 text-primary-glow" />
            {event.date} · {event.time}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-primary-glow" />
            <span className="truncate">
              {event.venue}, {event.area}
            </span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Navigation className="size-3.5 shrink-0 text-primary-glow" />
            {event.distanceKm} km away · {event.price === 0 ? "Free" : `₹${event.price}`}
          </span>
        </div>

        {event.friendIds.length > 0 ? (
          <div className="mt-4 flex items-center gap-2.5">
            <FriendAvatars ids={event.friendIds} />
            <span className="text-xs text-muted-foreground">
              {event.friendIds.length} {event.friendIds.length === 1 ? "friend" : "friends"}{" "}
              interested
            </span>
          </div>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">{event.interested} people interested</p>
        )}

        {showWhy ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setWhyOpen((v) => !v)}
              aria-expanded={whyOpen}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary-glow transition-opacity hover:opacity-80"
            >
              Why this event?
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform duration-300",
                  whyOpen && "rotate-180",
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-[var(--ease-out-soft)]",
                whyOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <ul className="flex flex-wrap gap-1.5">
                  {event.reasons.map((reason) => (
                    <li key={reason}>
                      <Badge size="sm">{reason}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
          <Button
            size="sm"
            variant={interested ? "default" : "outline"}
            className="flex-1"
            onClick={() => void togglePreference("interest")}
            disabled={saving}
          >
            {interested ? <Check /> : <Heart />}
            {interested ? "Interested" : "Interested"}
          </Button>
          <Button
            size="sm"
            variant={saved ? "subtle" : "ghost"}
            onClick={() => void togglePreference("save")}
            disabled={saving}
            aria-pressed={saved}
          >
            <Bookmark className={cn(saved && "fill-primary-glow text-primary-glow")} />
            {saved ? "Saved" : "Save"}
          </Button>
        </div>
        {actionError ? (
          <p role="alert" className="mt-2 text-xs text-destructive">
            {actionError}
          </p>
        ) : null}
      </div>
    </article>
  );
}
