import * as React from "react";
import { MapPin, Plus, X, Loader2, LocateFixed } from "lucide-react";
import { updateLocations } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const MAX_LOCATIONS = 3;

interface LocationSelectorProps {
  /** Called whenever the list of selected cities changes */
  onChange?: (locations: string[]) => void;
  className?: string;
}

/**
 * Multi-location selector supporting up to 3 cities.
 * Saves to the user's profile and supports browser geolocation.
 */
export function LocationSelector({
  onChange,
  className,
}: LocationSelectorProps) {
  const { user, refreshUser } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [detecting, setDetecting] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const locations: string[] = user?.discoveryLocations ?? [];

  async function save(nextLocations: string[]) {
    setSaving(true);
    setError(null);
    try {
      await updateLocations(nextLocations);
      await refreshUser();
      onChange?.(nextLocations);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save locations");
    } finally {
      setSaving(false);
    }
  }

  async function addCity(city: string) {
    const trimmed = city.trim();
    if (!trimmed) return;
    if (locations.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
      setInput("");
      return;
    }
    if (locations.length >= MAX_LOCATIONS) {
      setError(`You can add up to ${MAX_LOCATIONS} locations`);
      return;
    }
    const next = [...locations, trimmed];
    setInput("");
    await save(next);
  }

  async function removeCity(city: string) {
    const next = locations.filter((l) => l !== city);
    await save(next);
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      return;
    }
    setDetecting(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Use a free reverse geocoding API (no key required)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
          );
          const data = await res.json();
          const city =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.county ||
            "";
          if (city) {
            await addCity(city);
          } else {
            setError("Could not determine city from your location");
          }
        } catch {
          setError("Failed to reverse geocode your location");
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setDetecting(false);
        if (err.code === 1)
          setError("Location permission denied. Add cities manually.");
        else setError("Unable to detect your location");
      },
      { timeout: 10_000 },
    );
  }

  const displayLabel =
    locations.length === 0
      ? "Add locations"
      : locations.length === 1
        ? locations[0]
        : `${locations[0]} +${locations.length - 1}`;

  return (
    <div className={cn("relative", className)}>
      {/* Trigger button */}
      <button
        id="location-selector-trigger"
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
      >
        <MapPin className="size-3.5 text-primary-glow" />
        {displayLabel}
        {saving ? <Loader2 className="size-3 animate-spin" /> : null}
      </button>

      {/* Dropdown panel */}
      {open ? (
        <div
          className="absolute top-full right-0 z-50 mt-2 w-72 rounded-2xl border border-border bg-background/95 p-4 shadow-[var(--shadow-elevated)] backdrop-blur-xl"
          role="dialog"
          aria-label="Location selector"
        >
          <p className="text-[11px] font-medium tracking-[0.14em] text-primary-glow uppercase mb-3">
            Discovery Locations
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Add up to {MAX_LOCATIONS} cities to discover real events this month.
          </p>

          {/* Current locations */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {locations.map((loc) => (
              <span
                key={loc}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-glow"
              >
                <MapPin className="size-3" />
                {loc}
                <button
                  type="button"
                  onClick={() => void removeCity(loc)}
                  aria-label={`Remove ${loc}`}
                  className="ml-0.5 rounded-full opacity-70 hover:opacity-100"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
            {locations.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No locations added yet
              </p>
            ) : null}
          </div>

          {/* Add city input */}
          {locations.length < MAX_LOCATIONS ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void addCity(input);
              }}
              className="flex gap-2 mb-3"
            >
              <input
                id="location-add-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a city name…"
                className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <button
                type="submit"
                disabled={!input.trim() || saving}
                className="inline-flex items-center gap-1 rounded-xl bg-primary/15 border border-primary/40 px-3 py-2 text-xs font-medium text-primary-glow hover:bg-primary/25 disabled:opacity-40"
              >
                <Plus className="size-3" /> Add
              </button>
            </form>
          ) : (
            <p className="mb-3 text-xs text-muted-foreground">
              Maximum {MAX_LOCATIONS} locations reached. Remove one to add
              another.
            </p>
          )}

          {/* Detect my location */}
          <button
            type="button"
            onClick={detectLocation}
            disabled={detecting || saving || locations.length >= MAX_LOCATIONS}
            className="flex w-full items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground hover:border-border-strong hover:text-foreground disabled:opacity-40 transition-colors"
          >
            {detecting ? (
              <Loader2 className="size-3.5 animate-spin text-primary-glow" />
            ) : (
              <LocateFixed className="size-3.5 text-primary-glow" />
            )}
            {detecting ? "Detecting…" : "Detect my current location"}
          </button>

          {error ? (
            <p className="mt-2 text-xs text-destructive">{error}</p>
          ) : null}

          <div className="mt-3 border-t border-border pt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}

      {/* Click-away overlay */}
      {open ? (
        <div
          className="fixed inset-0 z-40"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
