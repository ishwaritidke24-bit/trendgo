import * as React from "react";
import { useAuth } from "./auth-context";

export interface LocationContextValue {
  location: string;
  status: "idle" | "detecting" | "resolved" | "denied" | "error";
  isDetecting: boolean;
  permissionDenied: boolean;
  error: string | null;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  setLocation: (city: string) => void;
  detectLocation: () => Promise<string | null>;
}

const LocationContext = React.createContext<LocationContextValue | null>(null);

const STORAGE_KEY = "trendgo_selected_city";

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { user, updateProfile } = useAuth();
  const [location, setLocationState] = React.useState<string>("");
  const [status, setStatus] = React.useState<
    "idle" | "detecting" | "resolved" | "denied" | "error"
  >("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const setLocation = React.useCallback(
    (newCity: string) => {
      const trimmed = newCity.trim();
      setLocationState(trimmed);
      if (trimmed) {
        setStatus("resolved");
        setError(null);
        try {
          localStorage.setItem(STORAGE_KEY, trimmed);
        } catch {
          // Ignore localStorage errors
        }
        if (user && user.location !== trimmed) {
          void updateProfile({ location: trimmed }).catch(() => {
            // Non-blocking profile update failure
          });
        }
      } else {
        setStatus("idle");
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // Ignore
        }
      }
    },
    [user, updateProfile],
  );

  const detectLocation = React.useCallback(async (): Promise<string | null> => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setStatus("error");
      setError("Geolocation is not supported by your browser");
      return null;
    }

    setStatus("detecting");
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
              {
                headers: {
                  Accept: "application/json",
                },
              },
            );

            if (!res.ok) throw new Error("Reverse geocoding failed");

            const data = await res.json();
            const resolvedCity =
              data?.address?.city ||
              data?.address?.town ||
              data?.address?.suburb ||
              data?.address?.village ||
              data?.address?.county ||
              data?.address?.state_district ||
              "";

            if (resolvedCity) {
              setLocation(resolvedCity);
              resolve(resolvedCity);
            } else {
              setStatus("error");
              setError("Could not determine city from your coordinates");
              resolve(null);
            }
          } catch (err) {
            setStatus("error");
            setError(err instanceof Error ? err.message : "Failed to determine city name");
            resolve(null);
          }
        },
        (geoError) => {
          if (geoError.code === 1) {
            // Permission denied by user
            setStatus("denied");
            setError("Location permission was denied. Please select your city manually.");
          } else {
            setStatus("error");
            setError("Unable to retrieve your location from device");
          }
          resolve(null);
        },
        { timeout: 10000, enableHighAccuracy: false },
      );
    });
  }, [setLocation]);

  // Initial resolution on mount or when user changes
  React.useEffect(() => {
    // 1. If user is logged in with a profile location, prioritize that
    if (user?.location && user.location.trim()) {
      setLocationState(user.location.trim());
      setStatus("resolved");
      return;
    }

    // 2. Otherwise check if user manually selected a city in this browser session
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored.trim()) {
        setLocationState(stored.trim());
        setStatus("resolved");
        return;
      }
    } catch {
      // Ignore localStorage errors
    }

    // 3. Otherwise automatically attempt geolocation detection
    void detectLocation();
  }, [user?.location, detectLocation]);

  const value: LocationContextValue = {
    location,
    status,
    isDetecting: status === "detecting",
    permissionDenied: status === "denied",
    error,
    isModalOpen,
    setIsModalOpen,
    setLocation,
    detectLocation,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useUserLocation(): LocationContextValue {
  const context = React.useContext(LocationContext);
  if (!context) {
    throw new Error("useUserLocation must be used within a LocationProvider");
  }
  return context;
}
