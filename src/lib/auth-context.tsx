import * as React from "react";

import {
  getCurrentUser,
  updateCurrentUserInterests as requestUpdateCurrentUserInterests,
  signIn as requestSignIn,
  signOut as requestSignOut,
  signUp as requestSignUp,
  updateCurrentUser as requestUpdateCurrentUser,
  type AuthUser,
} from "./auth-api";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  signIn: (input: { email: string; password: string }) => Promise<AuthUser>;
  signUp: (input: { name: string; email: string; password: string }) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  updateProfile: (
    input: Partial<Pick<AuthUser, "name" | "email" | "location" | "avatar" | "interests" | "discoveryLocations">>,
  ) => Promise<void>;
  updateInterests: (interests: string[]) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) {
          setUser(null);
          setError(new Error("Unable to load your profile"));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = {
    user,
    loading,
    error,
    signIn: async (input: { email: string; password: string }) => {
      const authenticatedUser = await requestSignIn(input);
      setUser(authenticatedUser);
      setError(null);
      return authenticatedUser;
    },
    signUp: async (input: { name: string; email: string; password: string }) => {
      const authenticatedUser = await requestSignUp(input);
      setUser(authenticatedUser);
      setError(null);
      return authenticatedUser;
    },
    signOut: async () => {
      await requestSignOut();
      setUser(null);
    },
    updateProfile: async (input) => setUser(await requestUpdateCurrentUser(input)),
    updateInterests: async (interests) =>
      setUser(await requestUpdateCurrentUserInterests(interests)),
    refreshUser: async () => setUser(await getCurrentUser()),
  } satisfies AuthContextValue;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
