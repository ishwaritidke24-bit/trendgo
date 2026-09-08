import * as React from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";

import { Navbar } from "@/components/layout/navbar";
import { getNotifications } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  className,
  requireAuth = false,
}: {
  children: React.ReactNode;
  className?: string;
  requireAuth?: boolean;
}) {
  const { user, loading, error, signOut } = useAuth();
  const [notificationCount, setNotificationCount] = React.useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (requireAuth && !loading && !user) {
      void navigate({
        to: "/signin",
        search: { redirect: `${location.pathname}${location.search}` },
      });
    }
  }, [requireAuth, loading, user, navigate, location.pathname, location.search]);

  React.useEffect(() => {
    if (!user) return;
    void getNotifications()
      .then((result) => setNotificationCount(result.unreadCount))
      .catch(() => setNotificationCount(0));
  }, [user]);

  if (requireAuth && (loading || !user)) {
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
        user={user ? { name: user.name } : null}
        location={user?.location || undefined}
        notificationCount={notificationCount}
        organizerEnabled={user ? user.roles.includes("organizer") && user.organizerStatus === "active" : false}
        onNotifications={() => void navigate({ to: "/notifications" })}
        onSignOut={() => void signOut().then(() => navigate({ to: "/" }))}
      />
      <main className="pb-24">{children}</main>
    </div>
  );
}
