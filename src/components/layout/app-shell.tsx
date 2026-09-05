import * as React from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";

import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { user, loading, error, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!loading && !user) {
      void navigate({
        to: "/signin",
        search: { redirect: `${location.pathname}${location.search}` },
      });
    }
  }, [loading, user, navigate, location.pathname, location.search]);

  if (loading || !user) {
    if (error) {
      return (
        <div className="bg-aurora grid min-h-screen place-items-center px-6 text-center text-sm text-muted-foreground">
          {error.message}
        </div>
      );
    }
    return (
      <div className="bg-aurora grid min-h-screen place-items-center text-sm text-muted-foreground">
        Checking your session...
      </div>
    );
  }

  return (
    <div className={cn("bg-aurora min-h-screen", className)}>
      <Navbar
        user={{ name: user.name, avatarUrl: user.avatar }}
        location={user.location || "Bengaluru"}
        notificationCount={3}
        onSignOut={() => void signOut().then(() => navigate({ to: "/" }))}
      />
      <main className="pb-24">{children}</main>
    </div>
  );
}
