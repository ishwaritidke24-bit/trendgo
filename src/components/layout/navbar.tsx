import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Bell, ChevronDown, MapPin, Menu, X } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Discover", to: "/" },
  { label: "Explore", to: "/" },
  { label: "Trending", to: "/" },
  { label: "Friends", to: "/" },
] as const;

export interface NavbarUser {
  name: string;
  avatarUrl?: string;
}

export interface NavbarProps {
  user?: NavbarUser | null;
  location?: string;
  notificationCount?: number;
  onSignIn?: () => void;
}

function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export function Navbar({
  user = null,
  location = "Bengaluru",
  notificationCount = 0,
  onSignIn,
}: NavbarProps) {
  const scrolled = useScrolled();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
    : "";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300 ease-[var(--ease-out-soft)]",
        "backdrop-blur-xl",
        scrolled
          ? "border-border-strong bg-background/85 shadow-[var(--shadow-elevated)]"
          : "border-border bg-background/45",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="TrendGo home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-surface hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground lg:inline-flex"
          >
            <MapPin className="size-3.5 text-primary-glow" />
            {location}
            <ChevronDown className="size-3.5 opacity-60" />
          </button>

          {user ? (
            <>
              <div className="relative hidden sm:block">
                <IconButton label="Notifications" variant="default">
                  <Bell />
                </IconButton>
                {notificationCount > 0 ? (
                  <span className="pointer-events-none absolute -top-0.5 -right-0.5 grid min-w-[18px] place-items-center rounded-full bg-[image:var(--gradient-brand)] px-1 text-[10px] leading-[18px] font-semibold text-primary-foreground">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                ) : null}
              </div>
              <button type="button" aria-label="Open profile" className="cursor-pointer">
                <Avatar ring="accent">
                  {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </button>
            </>
          ) : (
            <Button className="hidden sm:inline-flex" onClick={onSignIn}>
              Get Started
            </Button>
          )}

          <IconButton
            label={open ? "Close menu" : "Open menu"}
            variant="ghost"
            className="md:hidden"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </IconButton>
        </div>
      </Container>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 ease-[var(--ease-out-soft)] md:hidden",
          open ? "max-h-[24rem] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <Container className="flex flex-col gap-1 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-4">
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 text-primary-glow" />
              {location}
            </span>
            {user ? (
              <IconButton label="Notifications">
                <Bell />
              </IconButton>
            ) : (
              <Button size="sm" onClick={onSignIn}>
                Get Started
              </Button>
            )}
          </div>
        </Container>
      </div>
    </header>
  );
}
