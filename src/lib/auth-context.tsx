import * as React from "react";

import {
  getCurrentUser,
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
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (
    input: Partial<Pick<AuthUser, "name" | "location" | "interests" | "avatar">>,
  ) => Promise<void>;
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
      setUser(await requestSignIn(input));
      setError(null);
    },
    signUp: async (input: { name: string; email: string; password: string }) => {
      setUser(await requestSignUp(input));
      setError(null);
    },
    signOut: async () => {
      await requestSignOut();
      setUser(null);
    },
    updateProfile: async (input) => setUser(await requestUpdateCurrentUser(input)),
    refreshUser: async () => setUser(await getCurrentUser()),
  } satisfies AuthContextValue;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
