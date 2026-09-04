import * as React from "react";

import { getCurrentUser, signIn as requestSignIn, signOut as requestSignOut, signUp as requestSignUp, type AuthUser } from "./auth-api";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) setUser(null);
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
    signIn: async (input: { email: string; password: string }) => setUser(await requestSignIn(input)),
    signUp: async (input: { name: string; email: string; password: string }) => setUser(await requestSignUp(input)),
    signOut: async () => {
      await requestSignOut();
      setUser(null);
    },
  } satisfies AuthContextValue;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
