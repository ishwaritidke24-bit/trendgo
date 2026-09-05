import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles, CalendarPlus, Users, ArrowRight, LoaderCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { activateOrganizer } from "@/lib/organizer-api";

interface BecomeOrganizerFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export function BecomeOrganizerForm({
  onSuccess,
  onCancel,
  showCancel = true,
}: BecomeOrganizerFormProps) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = React.useState(user?.name ?? "");
  const [organizationName, setOrganizationName] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user?.name && !displayName) {
      setDisplayName(user.name);
    }
  }, [user?.name, displayName]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!displayName.trim()) {
      setError("Please provide a display name for your host profile.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await activateOrganizer({
        displayName: displayName.trim(),
        organizationName: organizationName.trim(),
        website: website.trim(),
        bio: bio.trim(),
      });

      await refreshUser();
      toast.success("Welcome to TrendGo Host! Your organizer profile is active.");
      if (onSuccess) {
        onSuccess();
      } else {
        void navigate({ to: "/organizer" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to activate organizer account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-primary-glow uppercase">
          <Sparkles className="size-4" /> Organizer Perks
        </div>
        <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <CalendarPlus className="size-3.5 text-primary-glow" /> Publish public or invite-only experiences
          </li>
          <li className="flex items-center gap-2">
            <Users className="size-3.5 text-primary-glow" /> Track RSVPs, guest lists, and attendee metrics
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-primary-glow" /> Build your verified curator reputation
          </li>
        </ul>
      </div>

      <div className="grid gap-3">
        <label className="text-sm font-medium text-foreground">
          Host / Display Name <span className="text-destructive">*</span>
          <input
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Maya Lin or SoundWave Sessions"
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
        </label>

        <label className="text-sm font-medium text-foreground">
          Brand or Organization Name <span className="text-xs font-normal text-muted-foreground">(optional)</span>
          <input
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder="e.g. Underground Collective"
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
        </label>

        <label className="text-sm font-medium text-foreground">
          Website or Social Link <span className="text-xs font-normal text-muted-foreground">(optional)</span>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://instagram.com/yourbrand"
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
        </label>

        <label className="text-sm font-medium text-foreground">
          Bio / Description <span className="text-xs font-normal text-muted-foreground">(optional)</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell future attendees what kinds of experiences you host..."
            rows={3}
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
        </label>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2 pt-2">
        {showCancel && onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting} className="min-w-[170px]">
          {submitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" /> Activating...
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" /> Activate Organizer
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export function BecomeOrganizerDialog({
  open,
  onOpenChange,
  onActivated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivated?: () => void;
}) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-semibold">
            Become a TrendGo Organizer
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Activate host mode to create and publish events, manage attendee RSVPs, and cultivate your community.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <BecomeOrganizerForm
            onCancel={() => onOpenChange(false)}
            onSuccess={() => {
              onOpenChange(false);
              if (onActivated) {
                onActivated();
              } else {
                void navigate({ to: "/organizer" });
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
