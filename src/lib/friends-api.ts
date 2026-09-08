import { getApiBaseUrl } from "./api-base";

export type RelationshipStatus =
  "SELF" | "FRIENDS" | "REQUEST_SENT" | "REQUEST_RECEIVED" | "NOT_FRIENDS";

export interface FriendUser {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  location: string;
  interests: string[];
  mutualCount: number;
  relationship: RelationshipStatus;
  friendshipId: string | null;
  createdAt?: string;
}

export interface FriendRequestItem {
  id: string;
  sender?: FriendUser;
  recipient?: FriendUser;
  createdAt: string;
}

export interface FriendRequestsResponse {
  success: boolean;
  incoming: FriendRequestItem[];
  outgoing: FriendRequestItem[];
}

export interface FriendActivityItem {
  id: string;
  friend: {
    id: string;
    name: string;
    avatar: string;
    initials: string;
  };
  event: {
    id: string;
    title: string;
    area: string;
    date: string;
  };
  action: string;
  when: string;
}

async function friendsApiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (response.status === 204) return undefined as T;

  const payload = (await response.json()) as T & {
    error?: { message?: string };
    message?: string;
  };

  if (!response.ok) {
    throw new Error(
      payload.error?.message ?? payload.message ?? "Request failed",
    );
  }

  return payload;
}

export async function fetchFriends(): Promise<FriendUser[]> {
  const data = await friendsApiRequest<{
    success: boolean;
    friends: FriendUser[];
    count: number;
  }>("/friends");
  return data.friends || [];
}

export async function fetchFriendRequests(): Promise<{
  incoming: FriendRequestItem[];
  outgoing: FriendRequestItem[];
}> {
  const data =
    await friendsApiRequest<FriendRequestsResponse>("/friends/requests");
  return {
    incoming: data.incoming || [],
    outgoing: data.outgoing || [],
  };
}

export async function fetchFriendSuggestions(limit = 8): Promise<FriendUser[]> {
  const data = await friendsApiRequest<{
    success: boolean;
    suggestions: FriendUser[];
  }>(`/friends/suggestions?limit=${limit}`);
  return data.suggestions || [];
}

export async function searchUsers(query: string): Promise<FriendUser[]> {
  if (!query || !query.trim()) return [];
  const data = await friendsApiRequest<{
    success: boolean;
    users: FriendUser[];
  }>(`/friends/search?q=${encodeURIComponent(query.trim())}`);
  return data.users || [];
}

export async function sendFriendRequest(targetUserId: string): Promise<{
  success: boolean;
  relationship: RelationshipStatus;
  message: string;
}> {
  return friendsApiRequest(`/friends/request/${targetUserId}`, {
    method: "POST",
  });
}

export async function acceptFriendRequest(requestId: string): Promise<{
  success: boolean;
  relationship: RelationshipStatus;
  message: string;
}> {
  return friendsApiRequest(`/friends/requests/${requestId}/accept`, {
    method: "POST",
  });
}

export async function rejectFriendRequest(requestId: string): Promise<{
  success: boolean;
  relationship: RelationshipStatus;
  message: string;
}> {
  return friendsApiRequest(`/friends/requests/${requestId}/reject`, {
    method: "POST",
  });
}

export async function cancelFriendRequest(requestId: string): Promise<{
  success: boolean;
  relationship: RelationshipStatus;
  message: string;
}> {
  return friendsApiRequest(`/friends/requests/${requestId}`, {
    method: "DELETE",
  });
}

export async function removeFriend(friendId: string): Promise<{
  success: boolean;
  relationship: RelationshipStatus;
  message: string;
}> {
  return friendsApiRequest(`/friends/${friendId}`, {
    method: "DELETE",
  });
}

export async function fetchRelationshipStatus(targetUserId: string): Promise<{
  status: RelationshipStatus;
  friendshipId: string | null;
}> {
  return friendsApiRequest(`/friends/status/${targetUserId}`);
}

export async function fetchFriendsActivity(): Promise<FriendActivityItem[]> {
  const data = await friendsApiRequest<{
    success: boolean;
    activity: FriendActivityItem[];
  }>("/friends/activity");
  return data.activity || [];
}
