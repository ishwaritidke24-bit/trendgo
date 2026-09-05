import * as React from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronLeft, LogOut, Menu, X } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useAuth } from "@/lib/auth-context";
import { getNotifications } from "@/lib/auth-api";
import { cn } from "@/lib/utils";

const LINKS = [
  ["Dashboard", "/organizer"],
  ["My Events", "/organizer/events"],
  ["Create Event", "/organizer/events/create"],
  ["Attendees", "/organizer/attendees"],
  ["Invitations", "/organizer/invitations"],
  ["Notifications", "/notifications"],
  ["Organizer Profile", "/organizer/profile"],
] as const;

export function OrganizerShell({ children }: { children: React.ReactNode }) {
  const { user, loading, error, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const [unread, setUnread] = React.useState(0);

  React.useEffect(() => {
    if (
      !loading &&
      (!user || !user.roles.includes("organizer") || user.organizerStatus !== "active")
    ) {
      void navigate({ to: "/profile" });
    }
  }, [loading, user, navigate]);

  React.useEffect(() => {
    if (user)
      void getNotifications()
        .then((result) => setUnread(result.unreadCount))
        .catch(() => setUnread(0));
  }, [user]);

  if (loading || !user)
    return (
      <div className="bg-aurora grid min-h-screen place-items-center text-sm text-muted-foreground">
        Checking organizer access...
      </div>
    );
  if (error)
    return (
      <div className="bg-aurora grid min-h-screen place-items-center text-sm text-destructive">
        {error.message}
      </div>
    );

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  return (
    <div className="bg-aurora min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <Container className="flex h-16 items-center gap-4">
          <Link to="/home" className="font-display text-lg font-semibold text-foreground">
            TrendGo <span className="text-primary-glow">Host</span>
          </Link>
          <nav
            className="hidden flex-1 items-center gap-1 lg:flex"
            aria-label="Organizer navigation"
          >
            {LINKS.map(([label, to]) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "rounded-full px-3 py-2 text-sm text-muted-foreground hover:bg-surface hover:text-foreground",
                  location.pathname === to && "bg-primary/10 text-primary-glow",
                )}
              >
                {label}
                {label === "Notifications" && unread ? ` (${unread})` : ""}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/profile"
              className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex"
            >
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              {user.name}
            </Link>
            <IconButton
              label="Open organizer menu"
              className="lg:hidden"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X /> : <Menu />}
            </IconButton>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void signOut().then(() => navigate({ to: "/" }))}
            >
              <LogOut /> Sign out
            </Button>
          </div>
        </Container>
        {open ? (
          <Container className="flex flex-col gap-1 border-t border-border py-3 lg:hidden">
            {LINKS.map(([label, to]) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                {label}
              </Link>
            ))}
            <Link
              to="/home"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 border-t border-border px-3 py-3 text-sm text-muted-foreground"
            >
              <ChevronLeft /> Explorer Mode
            </Link>
          </Container>
        ) : null}
      </header>
      <main className="pb-24">{children}</main>
      <div className="fixed right-5 bottom-5 hidden lg:block">
        <Button variant="outline" asChild>
          <Link to="/home">
            <ChevronLeft /> Explorer Mode
          </Link>
        </Button>
      </div>
    </div>
  );
}
