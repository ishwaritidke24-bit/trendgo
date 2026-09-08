import { getApiBaseUrl } from "./api-base";

export interface OrganizerProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  organizationName: string;
  website: string;
  verificationStatus: "unverified" | "pending" | "verified";
  createdAt: string;
  updatedAt: string;
}

export interface HostedEvent {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  date: string;
  time: string;
  endTime: string;
  venue: string;
  area: string;
  address: string;
  city: string;
  price: number;
  capacity: number;
  image: string;
  status: "draft" | "published" | "unpublished";
  attendeeCount: number;
  interestedCount: number;
}

async function organizerRequest<T>(
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
  const payload = (await response.json()) as T & {
    error?: {
      message?: string;
      details?: { field: string; message: string }[];
    };
    errors?: string[];
  };
  if (!response.ok) {
    // If there are field-level validation details, combine them into a readable message
    const details = payload.error?.details;
    if (Array.isArray(details) && details.length > 0) {
      throw new Error(
        details.map((d: { message: string }) => d.message).join(". "),
      );
    }
    throw new Error(payload.error?.message ?? "Organizer request failed");
  }
  return payload;
}

export async function getOrganizerProfile() {
  return organizerRequest<{
    success: boolean;
    organizer: OrganizerProfile | null;
  }>("/organizer/profile");
}

export async function activateOrganizer(
  input: Pick<
    OrganizerProfile,
    "displayName" | "bio" | "organizationName" | "website"
  >,
) {
  return organizerRequest<{ success: boolean; organizer: OrganizerProfile }>(
    "/organizer/profile",
    { method: "POST", body: JSON.stringify(input) },
  );
}

export async function updateOrganizerProfile(
  input: Partial<
    Pick<
      OrganizerProfile,
      "displayName" | "bio" | "organizationName" | "website"
    >
  >,
) {
  return organizerRequest<{ success: boolean; organizer: OrganizerProfile }>(
    "/organizer/profile",
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}

export async function getHostedEvents() {
  return organizerRequest<{ success: boolean; events: HostedEvent[] }>(
    "/organizer/events",
  );
}

export async function createHostedEvent(
  input: Omit<
    HostedEvent,
    "id" | "organizerId" | "status" | "attendeeCount" | "interestedCount"
  >,
) {
  return organizerRequest<{ success: boolean; event: HostedEvent }>(
    "/organizer/events",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function updateHostedEvent(
  eventId: string,
  input: Partial<HostedEvent>,
) {
  return organizerRequest<{ success: boolean; event: HostedEvent }>(
    `/organizer/events/${eventId}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export async function setHostedEventStatus(
  eventId: string,
  status: HostedEvent["status"],
) {
  return organizerRequest<{ success: boolean; event: HostedEvent }>(
    `/organizer/events/${eventId}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
  );
}

export async function getHostedEventAudience(eventId: string) {
  return organizerRequest<{
    success: boolean;
    audience: {
      attendees: { id: string; name: string; email: string }[];
      interested: { id: string; name: string; email: string }[];
    };
  }>(`/organizer/events/${eventId}/audience`);
}

export async function deleteHostedEvent(eventId: string) {
  return organizerRequest<void>(`/organizer/events/${eventId}`, {
    method: "DELETE",
  });
}
