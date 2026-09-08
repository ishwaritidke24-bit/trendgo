import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Check, LoaderCircle } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Container, Section } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getNotifications,
  getInvitations,
  markAllNotificationsRead,
  markNotificationRead,
  updateInvitation,
  type EventInvitation,
  type NotificationItem,
} from "@/lib/auth-api";

export const Route = createFileRoute("/notifications")({ component: NotificationsPage });

function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [invitations, setInvitations] = React.useState<EventInvitation[]>([]);

  const load = React.useCallback(async () => {
    try {
      const [result, invitationResult] = await Promise.all([getNotifications(), getInvitations()]);
      setNotifications(result.notifications);
      setInvitations(invitationResult.invitations);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to load notifications",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function markRead(notification: NotificationItem) {
    if (notification.read) return;
    await markNotificationRead(notification.id);
    setNotifications((current) =>
      current.map((item) => (item.id === notification.id ? { ...item, read: true } : item)),
    );
  }

  async function markAllRead() {
    setSaving(true);
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    } finally {
      setSaving(false);
    }
  }

  async function respondToInvitation(invitationId: string, status: "accepted" | "declined") {
    const result = await updateInvitation(invitationId, status);
    setInvitations((current) =>
      current.map((item) => (item.id === invitationId ? result.invitation : item)),
    );
  }

  return (
    <AppShell>
    <AppShell requireAuth>
      <Section spacing="sm" className="pt-10">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-primary-glow uppercase">
                Updates
              </p>
              <h1 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
                Notifications
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={() => void markAllRead()}
              disabled={saving || !notifications.some((item) => !item.read)}
            >
              <Check /> Mark all as read
            </Button>
          </div>
          {loading ? (
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="animate-spin" /> Loading notifications...
            </div>
          ) : null}
          {error ? (
            <p role="alert" className="mt-8 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {!loading && !error && notifications.length === 0 ? (
            <EmptyState
              className="mt-8"
              icon={<Bell />}
              title="No notifications"
              description="New activity will appear here."
            />
          ) : null}
          {invitations.length ? (
            <div className="mt-8">
              <p className="text-xs font-medium tracking-[0.16em] text-primary-glow uppercase">
                Invitations
              </p>
              <div className="mt-3 flex flex-col gap-3">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="rounded-2xl border border-border bg-card/60 p-4"
                  >
                    <p className="font-medium">{invitation.sender.name} invited you</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {invitation.event?.title ?? "An event"}
                      {invitation.message ? ` · ${invitation.message}` : ""}
                    </p>
                    {invitation.status === "pending" ? (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => void respondToInvitation(invitation.id, "accepted")}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void respondToInvitation(invitation.id, "declined")}
                        >
                          Decline
                        </Button>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-muted-foreground capitalize">
                        {invitation.status}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-8 flex flex-col gap-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-2xl border p-4 ${notification.read ? "border-border bg-card/50" : "border-primary/35 bg-primary/10"}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => void markRead(notification)}
                  >
                    <p className="font-medium">{notification.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                  </button>
                  {!notification.read ? (
                    <Button variant="ghost" size="sm" onClick={() => void markRead(notification)}>
                      Mark read
                    </Button>
                  ) : null}
                </div>
                {notification.eventId ? (
                  <Link
                    to="/event/$eventId"
                    params={{ eventId: notification.eventId }}
                    onClick={() => void markRead(notification)}
                    className="mt-3 inline-block text-sm text-primary-glow hover:underline"
                  >
                    View event
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </AppShell>
  );
}
