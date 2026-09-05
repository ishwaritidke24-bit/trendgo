import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Container, Section } from "@/components/layout/container";
import { EventCard } from "@/components/events/event-card";
import { FriendAvatars } from "@/components/events/friend-avatars";
import { MatchBadge } from "@/components/events/match-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { CATEGORIES, type Category, type EventItem } from "@/data/mock";
import { searchEvents } from "@/lib/events-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
    location: typeof search.location === "string" ? search.location : "",
    date: typeof search.date === "string" ? search.date : "Any time",
    category: typeof search.category === "string" ? search.category : "",
    sort: typeof search.sort === "string" ? search.sort : "Best match",
  }),
  head: () => ({
    meta: [
      { title: "Explore experiences — TrendGo" },
      {
        name: "description",
        content:
          "Filter every gig, supper club, workshop and meetup near you by category, date, distance and price.",
      },
      { property: "og:title", content: "Explore experiences — TrendGo" },
      {
        property: "og:description",
        content: "Filter gigs, supper clubs, workshops and meetups near you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExplorePage,
});

const DATES = ["Any time", "Today", "Tomorrow", "This weekend", "Next week"] as const;
const DISTANCES = [
  { label: "Any distance", value: 999 },
  { label: "Under 3 km", value: 3 },
  { label: "Under 5 km", value: 5 },
  { label: "Under 10 km", value: 10 },
] as const;
const PRICES = [
  { label: "Any price", value: 99999 },
  { label: "Free", value: 0 },
  { label: "Under ₹500", value: 500 },
  { label: "Under ₹1000", value: 1000 },
] as const;
const SORTS = ["Best match", "Nearest", "Soonest", "Most popular", "Price: low to high"] as const;

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ease-[var(--ease-out-soft)]",
        active
          ? "border-primary/60 bg-primary/15 text-foreground shadow-[var(--shadow-glow)]"
          : "border-border bg-surface/50 text-muted-foreground hover:border-border-strong hover:text-foreground",
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function ExplorePage() {
  const search = Route.useSearch();
  const [query, setQuery] = React.useState(search.q);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [date, setDate] = React.useState<(typeof DATES)[number]>(
    (DATES.includes(search.date as (typeof DATES)[number])
      ? search.date
      : "Any time") as (typeof DATES)[number],
  );
  const [distance, setDistance] = React.useState<number>(999);
  const [price, setPrice] = React.useState<number>(99999);
  const [sort, setSort] = React.useState<(typeof SORTS)[number]>(
    (SORTS.includes(search.sort as (typeof SORTS)[number])
      ? search.sort
      : "Best match") as (typeof SORTS)[number],
  );
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [results, setResults] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const toggleCategory = (c: Category) =>
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const reset = () => {
    setQuery("");
    setCategories([]);
    setDate("Any time");
    setDistance(999);
    setPrice(99999);
    setSort("Best match");
  };

  React.useEffect(() => {
    if (search.category && CATEGORIES.includes(search.category as Category))
      setCategories([search.category as Category]);
  }, [search.category]);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    void searchEvents({
      q: query,
      category: categories.join(","),
      date: date === "Any time" ? undefined : date,
      distance: distance === 999 ? undefined : distance,
      price: price === 99999 ? undefined : price,
      sort:
        sort === "Nearest"
          ? "nearest"
          : sort === "Price: low to high"
            ? "price"
            : sort === "Soonest"
              ? "soonest"
              : "match",
    })
      .then((events) => {
        if (active) {
          setResults(events);
          setError(null);
        }
      })
      .catch((requestError) => {
        if (active)
          setError(requestError instanceof Error ? requestError.message : "Unable to load events");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query, categories, date, distance, price, sort]);

  const activeFilters =
    categories.length +
    (date !== "Any time" ? 1 : 0) +
    (distance !== 999 ? 1 : 0) +
    (price !== 99999 ? 1 : 0);

  return (
    <AppShell>
      <Section spacing="sm" className="pt-10">
        <Container>
          <p className="text-xs font-medium tracking-[0.18em] text-primary-glow uppercase">
            Explore
          </p>
          <h1 className="font-display mt-3 text-3xl font-semibold text-balance text-foreground sm:text-4xl">
            Everything happening around you
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Filter it down to exactly the kind of night you&apos;re in the mood for.
          </p>

          {/* Search */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="glass-panel flex flex-1 items-center gap-3 rounded-2xl border border-border px-4 py-3">
              <Search className="size-4 shrink-0 text-primary-glow" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search gigs, supper clubs, meetups, neighbourhoods…"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {query ? (
                <IconButton
                  label="Clear search"
                  size="sm"
                  variant="ghost"
                  onClick={() => setQuery("")}
                >
                  <X />
                </IconButton>
              ) : null}
            </div>
            <Button
              variant="outline"
              className="sm:hidden"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <SlidersHorizontal /> Filters{activeFilters ? ` (${activeFilters})` : ""}
            </Button>
          </div>

          {/* Filters */}
          <div
            className={cn(
              "mt-4 grid gap-6 rounded-3xl border border-border bg-card/50 p-5 sm:grid-cols-2 lg:grid-cols-4",
              !filtersOpen && "hidden sm:grid",
            )}
          >
            <div className="sm:col-span-2 lg:col-span-4">
              <FilterGroup label="Category">
                {CATEGORIES.map((c) => (
                  <Chip key={c} active={categories.includes(c)} onClick={() => toggleCategory(c)}>
                    {c}
                  </Chip>
                ))}
              </FilterGroup>
            </div>
            <FilterGroup label="Date">
              {DATES.map((d) => (
                <Chip key={d} active={date === d} onClick={() => setDate(d)}>
                  {d}
                </Chip>
              ))}
            </FilterGroup>
            <FilterGroup label="Distance">
              {DISTANCES.map((d) => (
                <Chip
                  key={d.label}
                  active={distance === d.value}
                  onClick={() => setDistance(d.value)}
                >
                  {d.label}
                </Chip>
              ))}
            </FilterGroup>
            <FilterGroup label="Price">
              {PRICES.map((p) => (
                <Chip key={p.label} active={price === p.value} onClick={() => setPrice(p.value)}>
                  {p.label}
                </Chip>
              ))}
            </FilterGroup>
            <FilterGroup label="Sort by">
              {SORTS.map((s) => (
                <Chip key={s} active={sort === s} onClick={() => setSort(s)}>
                  {s}
                </Chip>
              ))}
            </FilterGroup>
          </div>

          {/* Result bar */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{results.length}</span> experiences
              {activeFilters ? " match your filters" : " near you"}
            </p>
            <div className="flex items-center gap-2">
              {activeFilters ? (
                <Button variant="ghost" size="sm" onClick={reset}>
                  Clear all
                </Button>
              ) : null}
              <div className="hidden items-center gap-1 rounded-full border border-border bg-surface/50 p-1 sm:flex">
                <IconButton
                  label="Grid view"
                  size="sm"
                  variant={view === "grid" ? "accent" : "ghost"}
                  onClick={() => setView("grid")}
                >
                  <LayoutGrid />
                </IconButton>
                <IconButton
                  label="List view"
                  size="sm"
                  variant={view === "list" ? "accent" : "ghost"}
                  onClick={() => setView("list")}
                >
                  <List />
                </IconButton>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <p className="mt-8 text-sm text-muted-foreground">Loading experiences...</p>
          ) : error ? (
            <p role="alert" className="mt-8 text-sm text-destructive">
              {error}
            </p>
          ) : results.length === 0 ? (
            <EmptyState
              className="mt-8"
              icon={<Search />}
              title="Nothing matches that yet"
              description="Try widening the distance or clearing a filter — new experiences get added every day."
              action={<Button onClick={reset}>Clear filters</Button>}
            />
          ) : view === "grid" ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((event) => (
                <EventCard key={event.id} event={event} showWhy={false} />
              ))}
            </div>
          ) : (
            <ul className="mt-8 flex flex-col gap-3">
              {results.map((event) => (
                <li key={event.id}>
                  <a
                    href={`/event/${event.id}`}
                    className="group flex gap-4 rounded-3xl border border-border bg-card/60 p-3 transition-all duration-300 ease-[var(--ease-out-soft)] hover:border-primary/40 hover:bg-card"
                  >
                    <div className="size-24 shrink-0 overflow-hidden rounded-2xl sm:size-28">
                      <img
                        src={event.image}
                        alt={event.title}
                        loading="lazy"
                        width={1024}
                        height={768}
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="min-w-0 flex-1 py-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display truncate text-base font-semibold text-foreground">
                          {event.title}
                        </h3>
                        <MatchBadge
                          value={event.match}
                          className="hidden shrink-0 sm:inline-flex"
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {event.category} · {event.date} · {event.time}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {event.area} · {event.distanceKm} km ·{" "}
                        {event.price === 0 ? "Free" : `₹${event.price}`}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <FriendAvatars ids={event.friendIds} max={3} />
                        <span className="text-[11px] text-muted-foreground">
                          {event.interested} interested
                        </span>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </AppShell>
  );
}
