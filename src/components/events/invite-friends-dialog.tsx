import * as React from "react";
import { Check, LoaderCircle, Send, Users, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getFriends, inviteFriends, type FriendItem } from "@/lib/auth-api";

export function InviteFriendsDialog({
  eventId,
  open,
  onOpenChange,
}: {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [friends, setFriends] = React.useState<FriendItem[]>([]);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [message, setMessage] = React.useState("Want to come with me?");
  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);
  const [shared, setShared] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setSent(false);
    void getFriends()
      .then((result) => setFriends(result.friends))
      .catch((requestError) =>
        setError(
          requestError instanceof Error ? requestError.message : "Unable to load your friends",
        ),
      )
      .finally(() => setLoading(false));
  }, [open]);

  function toggleFriend(friendId: string) {
    setSelected((current) =>
      current.includes(friendId) ? current.filter((id) => id !== friendId) : [...current, friendId],
    );
  }

  async function sendInvites() {
    setSending(true);
    setError(null);
    try {
      await inviteFriends(eventId, selected, message.trim());
      setSent(true);
      setShared(false);
      setSelected([]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send invites");
    } finally {
      setSending(false);
    }
  }

  async function shareInvite() {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: "TrendGo event invite", url });
    else await navigator.clipboard.writeText(url);
    setShared(true);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite friends</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="animate-spin" /> Loading friends...
            </div>
          ) : null}
          {!loading && !error && friends.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">No TrendGo friends yet</p>
            </div>
          ) : null}
          {!loading && friends.length ? (
            <div className="flex max-h-60 flex-col gap-2 overflow-y-auto">
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  type="button"
                  onClick={() => toggleFriend(friend.id)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left ${selected.includes(friend.id) ? "border-primary/50 bg-primary/10" : "border-border bg-surface/40"}`}
                >
                  <Avatar>
                    <AvatarImage src={friend.avatar} alt={friend.name} />
                    <AvatarFallback>{friend.initials}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{friend.name}</span>
                    {friend.online ? <span className="text-xs text-success">Available</span> : null}
                  </span>
                  {selected.includes(friend.id) ? (
                    <Check className="size-4 text-primary-glow" />
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
          <label className="mt-4 block text-sm">
            Message
            <input
              value={message}
              maxLength={240}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
            />
          </label>
          {error ? (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {sent ? (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-success">
              <p className="flex items-center gap-2">
                <Check className="size-4" /> Invites sent
              </p>
              <Button type="button" size="sm" variant="ghost" onClick={() => void shareInvite()}>
                {shared ? "Invite link copied" : "Share invite"}
              </Button>
            </div>
          ) : null}
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              <X /> Close
            </Button>
            <Button
              type="button"
              disabled={sending || selected.length === 0}
              onClick={() => void sendInvites()}
            >
              {sending ? <LoaderCircle className="animate-spin" /> : <Send />}
              {sending ? "Sending..." : "Send invite"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
