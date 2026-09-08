import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Clock,
  Compass,
  Heart,
  LoaderCircle,
  MapPin,
  Search,
  Share2,
  Sparkles,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { Container, Section } from "@/components/layout/container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/lib/auth-context";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  fetchFriends,
  fetchFriendsActivity,
  fetchFriendRequests,
  fetchFriendSuggestions,
  rejectFriendRequest,
  removeFriend,
  searchUsers,
  sendFriendRequest,
  type FriendActivityItem,
  type FriendRequestItem,
  type FriendUser,
} from "@/lib/friends-api";

export const Route = createFileRoute("/friends")({ component: FriendsPage });

type TabKey = "friends" | "requests" | "suggestions" | "activity";

function FriendsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<TabKey>("friends");

  // Main Data States
  const [friends, setFriends] = React.useState<FriendUser[]>([]);
  const [incomingRequests, setIncomingRequests] = React.useState<
    FriendRequestItem[]
  >([]);
  const [outgoingRequests, setOutgoingRequests] = React.useState<
    FriendRequestItem[]
  >([]);
  const [suggestions, setSuggestions] = React.useState<FriendUser[]>([]);
  const [activities, setActivities] = React.useState<FriendActivityItem[]>([]);

  // Loading States
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(
    null,
  );

  // Search State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<FriendUser[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // Copy state
  const [copied, setCopied] = React.useState(false);

  // Modals
  const [userToView, setUserToView] = React.useState<FriendUser | null>(null);
  const [friendToRemove, setFriendToRemove] = React.useState<FriendUser | null>(
    null,
  );

  // Load all user social data
  const loadData = React.useCallback(async () => {
    if (!user) {
      setInitialLoading(false);
      return;
    }

    try {
      const [friendsList, requestsData, suggestionsList, activitiesList] =
        await Promise.all([
          fetchFriends().catch(() => []),
          fetchFriendRequests().catch(() => ({ incoming: [], outgoing: [] })),
          fetchFriendSuggestions(8).catch(() => []),
          fetchFriendsActivity().catch(() => []),
        ]);

      setFriends(friendsList);
      setIncomingRequests(requestsData.incoming);
      setOutgoingRequests(requestsData.outgoing);
      setSuggestions(suggestionsList);
      setActivities(activitiesList);
    } catch {
      toast.error("Unable to load some social data. Please try again.");
    } finally {
      setInitialLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  // Live Search with Debounce
  React.useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      searchUsers(trimmed)
        .then((res) => setSearchResults(res))
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Share / Invite Link
  const handleInvite = () => {
    if (typeof window !== "undefined") {
      const inviteUrl = `${window.location.origin}/signup?ref=friends`;
      void navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success(
        "Invite link copied to clipboard! Share it with your friends.",
      );
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Send Friend Request
  const handleSendRequest = async (targetUser: FriendUser) => {
    setActionLoadingId(targetUser.id);
    try {
      const res = await sendFriendRequest(targetUser.id);
      toast.success(res.message);

      // Optimistically update target user relationship
      setSearchResults((prev) =>
        prev.map((u) =>
          u.id === targetUser.id ? { ...u, relationship: res.relationship } : u,
        ),
      );
      setSuggestions((prev) => prev.filter((u) => u.id !== targetUser.id));
      await loadData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send friend request",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Accept Friend Request
  const handleAcceptRequest = async (
    requestId: string,
    senderName?: string,
  ) => {
    setActionLoadingId(requestId);
    try {
      const res = await acceptFriendRequest(requestId);
      toast.success(
        res.message || `You are now friends with ${senderName ?? "user"}!`,
      );
      await loadData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to accept request",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject Friend Request
  const handleRejectRequest = async (requestId: string) => {
    setActionLoadingId(requestId);
    try {
      const res = await rejectFriendRequest(requestId);
      toast.info(res.message || "Friend request declined");
      await loadData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to decline request",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Cancel Outgoing Request
  const handleCancelRequest = async (requestId: string) => {
    setActionLoadingId(requestId);
    try {
      const res = await cancelFriendRequest(requestId);
      toast.info(res.message || "Friend request cancelled");
      await loadData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to cancel request",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Remove Friend
  const handleRemoveFriend = async () => {
    if (!friendToRemove) return;
    setActionLoadingId(friendToRemove.id);
    try {
      const res = await removeFriend(friendToRemove.id);
      toast.info(res.message || `Removed ${friendToRemove.name} from friends`);
      setFriendToRemove(null);
      await loadData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove friend",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <AppShell>
      <Section spacing="sm" className="pt-10">
        <Container>
          {/* Header */}
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-primary-glow uppercase">
                Social Hub
              </p>
              <h1 className="font-display mt-2 text-3xl font-bold sm:text-4xl">
                Friends & Circle
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                Discover friends on TrendGo, coordinate plans, and see where
                your circle is heading.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleInvite}
                variant="outline"
                className="cursor-pointer"
              >
                {copied ? (
                  <Check className="size-4 text-success" />
                ) : (
                  <Share2 className="size-4" />
                )}
                {copied ? "Link copied" : "Invite friends"}
              </Button>
            </div>
          </div>

          {/* Quick Stats Banner (for logged-in user) */}
          {user ? (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div
                onClick={() => setActiveTab("friends")}
                className="group flex cursor-pointer flex-col rounded-2xl border border-border bg-card/60 p-4 transition-all hover:border-primary/40 hover:bg-card"
              >
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Friends
                  </span>
                  <Users className="size-4 text-primary-glow" />
                </div>
                <p className="font-display mt-2 text-2xl font-bold">
                  {friends.length}
                </p>
                <span className="mt-1 text-xs text-muted-foreground">
                  Active connections
                </span>
              </div>

              <div
                onClick={() => setActiveTab("requests")}
                className={`group flex cursor-pointer flex-col rounded-2xl border p-4 transition-all ${
                  incomingRequests.length > 0
                    ? "border-primary/50 bg-primary/10 hover:bg-primary/20"
                    : "border-border bg-card/60 hover:border-primary/40 hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Requests
                  </span>
                  <UserPlus className="size-4 text-primary" />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <p className="font-display text-2xl font-bold">
                    {incomingRequests.length}
                  </p>
                  {incomingRequests.length > 0 && (
                    <Badge variant="default" className="text-[10px]">
                      New
                    </Badge>
                  )}
                </div>
                <span className="mt-1 text-xs text-muted-foreground">
                  {outgoingRequests.length} pending sent
                </span>
              </div>

              <div
                onClick={() => setActiveTab("suggestions")}
                className="group flex cursor-pointer flex-col rounded-2xl border border-border bg-card/60 p-4 transition-all hover:border-primary/40 hover:bg-card"
              >
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Discover
                  </span>
                  <Compass className="size-4 text-accent-glow" />
                </div>
                <p className="font-display mt-2 text-2xl font-bold">
                  {suggestions.length}
                </p>
                <span className="mt-1 text-xs text-muted-foreground">
                  People you may know
                </span>
              </div>

              <div
                onClick={() => setActiveTab("activity")}
                className="group flex cursor-pointer flex-col rounded-2xl border border-border bg-card/60 p-4 transition-all hover:border-primary/40 hover:bg-card"
              >
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Activity
                  </span>
                  <Sparkles className="size-4 text-success" />
                </div>
                <p className="font-display mt-2 text-2xl font-bold">
                  {activities.length}
                </p>
                <span className="mt-1 text-xs text-muted-foreground">
                  Recent plans & saves
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-primary/30 bg-primary/10 p-6 sm:flex-row sm:items-center sm:justify-between backdrop-blur-md">
              <div>
                <h3 className="font-display text-lg font-semibold">
                  Join the TrendGo Circle
                </h3>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  Sign in to find people in your city, see which gigs your
                  friends are attending, and share event experiences.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button asChild>
                  <Link to="/signin" search={{ redirect: "/friends" }}>
                    Sign in
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/signup">Sign up</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Search Bar */}
          {user && (
            <div className="relative mt-8">
              <div className="relative flex items-center">
                <Search className="absolute left-4 size-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search members by name, city, or interests (e.g., Techno, Live Music, Mumbai)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-card/80 py-3.5 pr-12 pl-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none backdrop-blur-md"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </div>

              {/* Live Search Results Card */}
              {searchQuery.trim() && (
                <div className="mt-3 rounded-2xl border border-border bg-card p-4 shadow-xl">
                  <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Search Results ({searchResults.length})
                    </p>
                    {isSearching && (
                      <span className="flex items-center gap-1.5 text-xs text-primary-glow">
                        <LoaderCircle className="size-3.5 animate-spin" />{" "}
                        Searching...
                      </span>
                    )}
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {searchResults.map((person) => (
                        <UserCard
                          key={person.id}
                          user={person}
                          actionLoading={actionLoadingId === person.id}
                          onSendRequest={() => void handleSendRequest(person)}
                          onViewProfile={() => setUserToView(person)}
                        />
                      ))}
                    </div>
                  ) : !isSearching ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No members found matching &quot;{searchQuery}&quot;. Try
                      another name or keyword.
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="mt-10 flex border-b border-border">
            <button
              type="button"
              onClick={() => setActiveTab("friends")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "friends"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="size-4" />
              My Friends ({friends.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("requests")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "requests"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="size-4" />
              Requests
              {incomingRequests.length > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {incomingRequests.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("suggestions")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "suggestions"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Compass className="size-4" />
              Discover People ({suggestions.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("activity")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "activity"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="size-4" />
              Circle Activity
            </button>
          </div>

          {/* Tab Contents */}
          <div className="mt-8">
            {initialLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-36 animate-pulse rounded-2xl border border-border bg-card/40 p-4"
                  />
                ))}
              </div>
            ) : (
              <>
                {/* 1. MY FRIENDS TAB */}
                {activeTab === "friends" && (
                  <div>
                    {friends.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {friends.map((friend) => (
                          <div
                            key={friend.id}
                            className="flex flex-col justify-between rounded-2xl border border-border bg-card/60 p-4 transition-all hover:border-primary/30 hover:bg-card"
                          >
                            <div className="flex items-start gap-3">
                              <Avatar size="lg">
                                <AvatarImage
                                  src={friend.avatar}
                                  alt={friend.name}
                                />
                                <AvatarFallback>
                                  {friend.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={() => setUserToView(friend)}
                                  className="truncate text-left text-sm font-semibold hover:text-primary-glow"
                                >
                                  {friend.name}
                                </button>
                                {friend.location && (
                                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="size-3 shrink-0" />
                                    {friend.location}
                                  </p>
                                )}
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {friend.mutualCount > 0
                                    ? `${friend.mutualCount} mutual friend${friend.mutualCount > 1 ? "s" : ""}`
                                    : "Connected friend"}
                                </p>
                              </div>
                            </div>

                            {/* Interests tags */}
                            {friend.interests.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {friend.interests.slice(0, 3).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="neutral"
                                    className="text-[10px] py-0 px-2"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs"
                                onClick={() => setUserToView(friend)}
                              >
                                View info
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setFriendToRemove(friend)}
                              >
                                <UserMinus className="size-3.5" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title="You don't have any friends yet"
                        description="Find people on TrendGo, send friend requests, and start discovering events together."
                        actionLabel="Discover people"
                        onAction={() => setActiveTab("suggestions")}
                      />
                    )}
                  </div>
                )}

                {/* 2. REQUESTS TAB */}
                {activeTab === "requests" && (
                  <div className="space-y-8">
                    {/* Incoming Requests */}
                    <div>
                      <h3 className="font-display text-lg font-semibold">
                        Incoming Requests ({incomingRequests.length})
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        People who want to connect with you
                      </p>

                      {incomingRequests.length > 0 ? (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {incomingRequests.map((req) => (
                            <div
                              key={req.id}
                              className="flex flex-col justify-between rounded-2xl border border-primary/30 bg-primary/5 p-4"
                            >
                              <div className="flex items-start gap-3">
                                <Avatar size="lg">
                                  <AvatarImage
                                    src={req.sender?.avatar}
                                    alt={req.sender?.name}
                                  />
                                  <AvatarFallback>
                                    {req.sender?.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold">
                                    {req.sender?.name}
                                  </p>
                                  {req.sender?.location && (
                                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <MapPin className="size-3 shrink-0" />
                                      {req.sender.location}
                                    </p>
                                  )}
                                  {req.sender?.mutualCount ? (
                                    <p className="mt-1 text-xs text-primary-glow font-medium">
                                      {req.sender.mutualCount} mutual friend
                                      {req.sender.mutualCount > 1 ? "s" : ""}
                                    </p>
                                  ) : null}
                                </div>
                              </div>

                              <div className="mt-4 flex gap-2 border-t border-border/50 pt-3">
                                <Button
                                  size="sm"
                                  className="h-8 flex-1 text-xs"
                                  disabled={actionLoadingId === req.id}
                                  onClick={() =>
                                    void handleAcceptRequest(
                                      req.id,
                                      req.sender?.name,
                                    )
                                  }
                                >
                                  {actionLoadingId === req.id ? (
                                    <LoaderCircle className="size-3.5 animate-spin" />
                                  ) : (
                                    <Check className="size-3.5" />
                                  )}
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 flex-1 text-xs"
                                  disabled={actionLoadingId === req.id}
                                  onClick={() =>
                                    void handleRejectRequest(req.id)
                                  }
                                >
                                  Decline
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-3 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                          No pending incoming friend requests.
                        </div>
                      )}
                    </div>

                    {/* Outgoing Requests */}
                    <div>
                      <h3 className="font-display text-lg font-semibold">
                        Sent Requests ({outgoingRequests.length})
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Invitations you have sent that are waiting for response
                      </p>

                      {outgoingRequests.length > 0 ? (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {outgoingRequests.map((req) => (
                            <div
                              key={req.id}
                              className="flex items-center justify-between rounded-2xl border border-border bg-card/60 p-4"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage
                                    src={req.recipient?.avatar}
                                    alt={req.recipient?.name}
                                  />
                                  <AvatarFallback>
                                    {req.recipient?.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold">
                                    {req.recipient?.name}
                                  </p>
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="size-3 text-muted-foreground" />{" "}
                                    Pending
                                  </span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs text-muted-foreground hover:text-destructive"
                                disabled={actionLoadingId === req.id}
                                onClick={() => void handleCancelRequest(req.id)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-3 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                          No outgoing pending requests.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. DISCOVER PEOPLE / SUGGESTIONS TAB */}
                {activeTab === "suggestions" && (
                  <div>
                    <div className="mb-4">
                      <h3 className="font-display text-lg font-semibold">
                        People You May Know ({suggestions.length})
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Suggested members based on your city, music & event
                        interests
                      </p>
                    </div>

                    {suggestions.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {suggestions.map((person) => (
                          <UserCard
                            key={person.id}
                            user={person}
                            actionLoading={actionLoadingId === person.id}
                            onSendRequest={() => void handleSendRequest(person)}
                            onViewProfile={() => setUserToView(person)}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title="No suggestions at the moment"
                        description="Check back soon as more community members join your area."
                      />
                    )}
                  </div>
                )}

                {/* 4. ACTIVITY TAB */}
                {activeTab === "activity" && (
                  <div>
                    <div className="mb-4">
                      <h3 className="font-display text-lg font-semibold">
                        Circle Activity
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Live updates from your friends on TrendGo
                      </p>
                    </div>

                    {activities.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {activities.map((item) => (
                          <Link
                            key={item.id}
                            to="/event/$eventId"
                            params={{ eventId: item.event.id }}
                            className="group flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card"
                          >
                            <Avatar size="lg">
                              <AvatarImage
                                src={item.friend.avatar}
                                alt={item.friend.name}
                              />
                              <AvatarFallback>
                                {item.friend.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground">
                                  {item.friend.name}
                                </span>{" "}
                                {item.action}{" "}
                                <span className="font-medium text-primary-glow">
                                  {item.event.title}
                                </span>
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {item.when} · {item.event.area}
                              </p>
                            </div>
                            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title="No recent friend activity"
                        description="When your friends save, attend, or show interest in events, they will appear here."
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </Container>
      </Section>

      {/* Remove Friend Confirmation Dialog */}
      <Dialog
        open={Boolean(friendToRemove)}
        onOpenChange={(open) => !open && setFriendToRemove(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Friend</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">
                {friendToRemove?.name}
              </span>{" "}
              from your friends? You will no longer see their private activity
              or be connected directly.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setFriendToRemove(null)}
              disabled={Boolean(actionLoadingId)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={Boolean(actionLoadingId)}
              onClick={() => void handleRemoveFriend()}
            >
              {actionLoadingId === friendToRemove?.id ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <UserMinus className="size-4" />
              )}
              Remove Friend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Quick-View Profile Modal */}
      <Dialog
        open={Boolean(userToView)}
        onOpenChange={(open) => !open && setUserToView(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarImage src={userToView?.avatar} alt={userToView?.name} />
                <AvatarFallback>{userToView?.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <DialogTitle>{userToView?.name}</DialogTitle>
                {userToView?.location && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3 shrink-0" />
                    {userToView.location}
                  </p>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4 space-y-4 text-sm">
            {userToView?.mutualCount ? (
              <div className="flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-xs text-primary-glow font-medium">
                <Users className="size-4 shrink-0" />
                {userToView.mutualCount} mutual friend
                {userToView.mutualCount > 1 ? "s" : ""} on TrendGo
              </div>
            ) : null}

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Interests & Vibes
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {userToView?.interests && userToView.interests.length > 0 ? (
                  userToView.interests.map((tag) => (
                    <Badge key={tag} variant="neutral">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No interests specified
                  </span>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end">
            <Button variant="ghost" onClick={() => setUserToView(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

// Reusable User Card
function UserCard({
  user,
  actionLoading,
  onSendRequest,
  onViewProfile,
}: {
  user: FriendUser;
  actionLoading: boolean;
  onSendRequest: () => void;
  onViewProfile: () => void;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/60 p-4 transition-all hover:border-primary/30 hover:bg-card">
      <div className="flex items-start gap-3">
        <Avatar size="lg">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onViewProfile}
            className="truncate text-left text-sm font-semibold hover:text-primary-glow"
          >
            {user.name}
          </button>
          {user.location && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              {user.location}
            </p>
          )}
          {user.mutualCount > 0 ? (
            <p className="mt-1 text-xs text-primary-glow font-medium">
              {user.mutualCount} mutual friend{user.mutualCount > 1 ? "s" : ""}
            </p>
          ) : null}
        </div>
      </div>

      {user.interests.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {user.interests.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="neutral"
              className="text-[10px] py-0 px-2"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs"
          onClick={onViewProfile}
        >
          View info
        </Button>

        {user.relationship === "NOT_FRIENDS" && (
          <Button
            size="sm"
            className="h-8 text-xs cursor-pointer"
            disabled={actionLoading}
            onClick={onSendRequest}
          >
            {actionLoading ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <UserPlus className="size-3.5" />
            )}
            Add Friend
          </Button>
        )}

        {user.relationship === "REQUEST_SENT" && (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            <Clock className="size-3 mr-1" /> Request Sent
          </Badge>
        )}

        {user.relationship === "REQUEST_RECEIVED" && (
          <Badge variant="default" className="text-xs">
            <UserCheck className="size-3 mr-1" /> Received
          </Badge>
        )}

        {user.relationship === "FRIENDS" && (
          <Badge variant="success" className="text-xs">
            <Users className="size-3 mr-1" /> Friends
          </Badge>
        )}

        {user.relationship === "SELF" && (
          <Badge variant="neutral" className="text-xs">
            You
          </Badge>
        )}
      </div>
    </div>
  );
}
