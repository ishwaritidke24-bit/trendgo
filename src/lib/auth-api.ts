import { getApiBaseUrl } from "./api-base";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  location: string;
  discoveryLocations: string[];
  interests: string[];
  avatar: string;
  onboardingCompleted: boolean;
  savedEventIds: string[];
  interestedEventIds: string[];
  attendedEventIds: string[];
  roles: ("explorer" | "organizer")[];
  organizerStatus: "not_started" | "active";
  organizerProfileId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  eventId: string;
  read: boolean;
  createdAt: string;
  invitationId?: string | null;
}

export interface FriendItem {
  id: string;
  name: string;
  initials: string;
  avatar: string;
  online: boolean;
}

export interface EventInvitation {
  id: string;
  eventId: string;
  event: { id: string; title: string; date: string; time: string; area: string } | null;
  sender: { _id: string; name: string };
  recipient: { _id: string; name: string };
  message: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

interface AuthResponse {
  success: boolean;
  user: AuthUser;
  error?: { message?: string; details?: Array<{ field: string; message: string }> };
}

interface BasicResponse {
  success: boolean;
  error?: { message?: string; details?: Array<{ field: string; message: string }> };
}

async function authRequest<T extends AuthResponse>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  const payload = (await response.json()) as T;
  if (!response.ok) {
    const validationMessage = payload.error?.details?.map((item) => item.message).join(" ");
    throw new Error(
      validationMessage || payload.error?.message || "Something went wrong. Please try again.",
    );
  }
  return payload;
}

export async function getCurrentUser() {
  const response = await fetch(`${getApiBaseUrl()}/users/me`, { credentials: "include" });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Unable to verify your session");
  const payload = (await response.json()) as AuthResponse;
  return payload.user;
}

export async function signUp(input: { name: string; email: string; password: string }) {
  const payload = await authRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return payload.user;
}

export async function signIn(input: { email: string; password: string }) {
  const payload = await authRequest<AuthResponse>("/auth/signin", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return payload.user;
}

export async function signOut() {
  await authRequest<BasicResponse>("/auth/signout", { method: "POST" });
}

export async function updateCurrentUser(
  input: Partial<Pick<AuthUser, "name" | "email" | "location" | "avatar" | "interests" | "discoveryLocations">>,
) {
  const payload = await authRequest<AuthResponse>("/users/me", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return payload.user;
}

export async function updateLocations(discoveryLocations: string[]) {
  return updateCurrentUser({ discoveryLocations });
}

export async function updateCurrentUserInterests(interests: string[]) {
  const payload = await authRequest<AuthResponse>("/users/me/interests", {
    method: "PUT",
    body: JSON.stringify({ interests }),
  });
  return payload.user;
}

export async function getInterestCategories() {
  const payload = await apiRequest<{ success: boolean; interests: string[] }>("/interests");
  return payload.interests;
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  if (response.status === 204) return undefined as T;
  const payload = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message ?? "Request failed");
  return payload;
}

export async function updateEventPreference(
  eventId: string,
  preference: "save" | "interest",
  enabled: boolean,
) {
  return apiRequest<{ success: boolean; savedEventIds: string[]; interestedEventIds: string[] }>(
    `/events/${eventId}/${preference}`,
    { method: "PATCH", body: JSON.stringify({ enabled }) },
  );
}

export async function inviteToEvent(eventId: string, friendId?: string) {
  return apiRequest(`/events/${eventId}/invite`, {
    method: "POST",
    body: JSON.stringify({ recipientIds: friendId ? [friendId] : [], message: "" }),
  });
}

export async function getFriends() {
  return apiRequest<{ success: boolean; friends: FriendItem[] }>("/friends");
}

export async function inviteFriends(eventId: string, recipientIds: string[], message: string) {
  return apiRequest<{ success: boolean; invitations: EventInvitation[] }>(
    `/events/${eventId}/invite`,
    {
      method: "POST",
      body: JSON.stringify({ recipientIds, message }),
    },
  );
}

export async function getInvitations() {
  return apiRequest<{ success: boolean; invitations: EventInvitation[] }>("/invitations");
}

export async function updateInvitation(invitationId: string, status: "accepted" | "declined") {
  return apiRequest<{ success: boolean; invitation: EventInvitation }>(
    `/invitations/${invitationId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

export async function getNotifications() {
  return apiRequest<{ success: boolean; notifications: NotificationItem[]; unreadCount: number }>(
    "/notifications",
  );
}

export async function markNotificationRead(notificationId: string) {
  return apiRequest<void>(`/notifications/${notificationId}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead() {
  return apiRequest<void>("/notifications/read-all", { method: "PATCH" });
}
