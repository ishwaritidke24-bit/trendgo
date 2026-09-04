import * as React from "react";

import { Navbar } from "@/components/layout/navbar";
import { CURRENT_USER } from "@/data/mock";
import { cn } from "@/lib/utils";

export function AppShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-aurora min-h-screen", className)}>
      <Navbar
        user={{ name: CURRENT_USER.name, avatarUrl: CURRENT_USER.avatar }}
        location={CURRENT_USER.location}
        notificationCount={3}
      />
      <main className="pb-24">{children}</main>
    </div>
  );
}
