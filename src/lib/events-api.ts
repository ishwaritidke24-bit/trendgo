import type { EventItem } from "@/data/mock";
import { getApiBaseUrl } from "./api-base";

export interface EventPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface EventSearchResult {
  events: EventItem[];
  pagination: EventPagination;
}

export async function searchEvents(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const response = await fetch(`${getApiBaseUrl()}/events?${query.toString()}`, {
    credentials: "include",
  });
  const payload = (await response.json()) as EventSearchResult & { error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load events");
  return payload;
}

export async function getEvent(eventId: string) {
  const response = await fetch(`${getApiBaseUrl()}/events/${eventId}`, { credentials: "include" });
  const payload = (await response.json()) as { event: EventItem; error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load event");
  return payload.event;
}
