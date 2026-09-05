import { getApiBaseUrl } from "./api-base";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  location: string;
  interests: string[];
  avatar: string;
  savedEventIds: string[];
  interestedEventIds: string[];
  attendedEventIds: string[];
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
  const response = await fetch(`${getApiBaseUrl()}/auth/me`, { credentials: "include" });
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
  input: Partial<Pick<AuthUser, "name" | "location" | "interests" | "avatar">>,
) {
  const payload = await authRequest<AuthResponse>("/auth/me", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return payload.user;
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
  return apiRequest(`/events/${eventId}/invitations`, {
    method: "POST",
    body: JSON.stringify({ friendId }),
  });
}

export async function inviteFriend(friendId: string) {
  return apiRequest<{ success: boolean; invitationId: string }>("/friends/invitations", {
    method: "POST",
    body: JSON.stringify({ friendId }),
  });
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
