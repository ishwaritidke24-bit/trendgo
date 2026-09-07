import * as React from "react";
import { LocateFixed, MapPin, Search, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserLocation } from "@/lib/location-context";

const POPULAR_CITIES = [
  "Nashik",
  "Pune",
  "Mumbai",
  "Bengaluru",
  "Delhi",
  "Hyderabad",
  "Goa",
] as const;

export function LocationModal() {
  const {
    location,
    isModalOpen,
    setIsModalOpen,
    setLocation,
    detectLocation,
    isDetecting,
    error,
    permissionDenied,
  } = useUserLocation();

  const [inputCity, setInputCity] = React.useState("");

  const handleSelectCity = (city: string) => {
    setLocation(city);
    setIsModalOpen(false);
    setInputCity("");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCity.trim()) {
      handleSelectCity(inputCity.trim());
    }
  };

  const handleDetectClick = async () => {
    const detected = await detectLocation();
    if (detected) {
      setIsModalOpen(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
            <MapPin className="size-5 text-primary-glow" />
            Select Your Location
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            TrendGo tailors experiences, gigs, and communities happening around you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Quick Detect Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center gap-2 border-primary/40 hover:border-primary text-foreground"
            onClick={handleDetectClick}
            disabled={isDetecting}
          >
            {isDetecting ? (
              <>
                <Loader2 className="size-4 animate-spin text-primary-glow" />
                Detecting your location...
              </>
            ) : (
              <>
                <LocateFixed className="size-4 text-primary-glow" />
                Use my current location
              </>
            )}
          </Button>

          {permissionDenied && (
            <p className="text-xs text-amber-400/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
              Location permission was denied in your browser. You can manually enter or select your
              city below.
            </p>
          )}

          {error && !permissionDenied && (
            <p className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
              {error}
            </p>
          )}

          {/* Search Input */}
          <form onSubmit={handleFormSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search or enter city name..."
              value={inputCity}
              onChange={(e) => setInputCity(e.target.value)}
              className="pl-9 h-11 bg-surface/60 border-border"
              autoFocus
            />
            {inputCity.trim() && (
              <Button
                type="submit"
                size="sm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 text-xs"
              >
                Set
              </Button>
            )}
          </form>

          {/* Common Cities */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-2">
              Popular Cities
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_CITIES.map((city) => {
                const isCurrent = location.toLowerCase() === city.toLowerCase();
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isCurrent
                        ? "border-primary/60 bg-primary/20 text-foreground shadow-[var(--shadow-glow)]"
                        : "border-border bg-surface/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {city} {isCurrent && "✓"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
