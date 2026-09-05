import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, MapPin, Search, Shuffle, Sparkles } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import heroCrowd from "@/assets/hero-crowd.jpg";

const CHIPS = [
  "Music",
  "Comedy",
  "Sports",
  "Food",
  "Workshops",
  "Communities",
  "Nightlife",
  "Art",
] as const;

interface FieldProps {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}

function Field({ icon, label, placeholder, value, onChange }: FieldProps) {
  const id = React.useId();
  return (
    <div className="group flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-4 py-3 transition-colors duration-200 hover:bg-surface/70 focus-within:bg-surface/70">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary-glow transition-colors duration-200 group-hover:bg-primary/20 [&_svg]:size-4">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <label
          htmlFor={id}
          className="block text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase"
        >
          {label}
        </label>
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border-0 bg-transparent p-0 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
        />
      </div>
    </div>
  );
}

export function Hero() {
  const navigate = useNavigate();
  const [what, setWhat] = React.useState("");
  const [where, setWhere] = React.useState("Bengaluru");
  const [when, setWhen] = React.useState("This weekend");
  const [activeChip, setActiveChip] = React.useState<string | null>(null);

  return (
    <section className="relative isolate overflow-hidden">
      {/* Cinematic backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <img
          src={heroCrowd}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1088}
          className="size-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-[radial-gradient(70rem_40rem_at_50%_-10%,oklch(0.66_0.25_305/0.28),transparent_65%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.14_0.012_285/0.55)_0%,oklch(0.14_0.012_285/0.82)_45%,var(--background)_100%)]" />
      </div>

      <Container className="pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-background/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md">
            <Sparkles className="size-3.5 text-primary-glow" />
            Personalized discovery, not another ticket list
          </span>

          <h1 className="mt-6 font-display text-4xl leading-[1.05] font-semibold text-balance sm:text-6xl lg:text-7xl">
            Find something <span className="text-gradient-brand">worth doing next.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
            TrendGo learns what you actually like and surfaces the events, activities, communities
            and experiences around you that match — from tiny gigs to weekend workshops you'd never
            have found alone.
          </p>
        </div>

        {/* Discovery bar */}
        <div className="mx-auto mt-10 w-full max-w-4xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void navigate({
                to: "/explore",
                search: { q: what, location: where, date: when, category: activeChip ?? undefined },
              });
            }}
            className="glass-panel rounded-3xl p-2 shadow-[var(--shadow-elevated)]"
          >
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              <Field
                icon={<Sparkles />}
                label="What are you into?"
                placeholder="Live music, pottery, run clubs…"
                value={what}
                onChange={setWhat}
              />
              <div className="hidden h-10 w-px shrink-0 bg-border md:block" />
              <Field
                icon={<MapPin />}
                label="Where?"
                placeholder="City or neighbourhood"
                value={where}
                onChange={setWhere}
              />
              <div className="hidden h-10 w-px shrink-0 bg-border md:block" />
              <Field
                icon={<Calendar />}
                label="When?"
                placeholder="Tonight, this weekend…"
                value={when}
                onChange={setWhen}
              />
              <Button type="submit" size="lg" className="mt-1 w-full md:mt-0 md:w-auto">
                <Search />
                Discover
              </Button>
            </div>
          </form>

          {/* Quick chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setActiveChip((c) => (c === chip ? null : chip))}
                aria-pressed={activeChip === chip}
                className={cn(
                  "cursor-pointer rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200 ease-[var(--ease-out-soft)]",
                  activeChip === chip
                    ? "border-primary/60 bg-primary/15 text-foreground shadow-[var(--shadow-glow)]"
                    : "border-border bg-surface/50 text-muted-foreground hover:-translate-y-px hover:border-primary/40 hover:text-foreground",
                )}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => void navigate({ to: "/explore", search: { sort: "Best match" } })}
            >
              <Shuffle />
              Surprise Me
            </Button>
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground">2,480</span> experiences live near you this week
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
