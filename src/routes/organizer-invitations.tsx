import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, Users } from "lucide-react";

import { OrganizerShell } from "@/components/organizer/organizer-shell";
import { Container, Section } from "@/components/layout/container";
import { EmptyState } from "@/components/ui/empty-state";
import { getInvitations, type EventInvitation } from "@/lib/auth-api";

export const Route = createFileRoute("/organizer-invitations")({
  component: OrganizerInvitations,
});
function OrganizerInvitations() {
  const [invitations, setInvitations] = React.useState<EventInvitation[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    void getInvitations()
      .then((result) => setInvitations(result.invitations))
      .finally(() => setLoading(false));
  }, []);
  return (
    <OrganizerShell>
      <Section spacing="sm" className="pt-10">
        <Container>
          <p className="text-xs font-medium tracking-[0.18em] text-primary-glow uppercase">
            Social planning
          </p>
          <h1 className="font-display mt-3 text-3xl font-semibold">
            Invitations
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Invitations connected to your TrendGo account.
          </p>
          {loading ? (
            <p className="mt-8 text-sm text-muted-foreground">
              Loading invitations...
            </p>
          ) : invitations.length ? (
            <div className="mt-8 flex flex-col gap-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="rounded-2xl border border-border bg-card/60 p-4"
                >
                  <p className="font-medium">
                    {invitation.sender.name} · {invitation.status}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {invitation.event?.title ?? "Event invitation"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              className="mt-8"
              icon={<Mail />}
              title="No invitations yet"
              description="Event invitations will appear here."
            />
          )}
        </Container>
      </Section>
    </OrganizerShell>
  );
}
