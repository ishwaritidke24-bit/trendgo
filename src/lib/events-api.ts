import type { EventItem } from "@/data/mock";
import { getApiBaseUrl } from "./api-base";

export async function searchEvents(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const response = await fetch(`${getApiBaseUrl()}/events?${query.toString()}`, {
    credentials: "include",
  });
  const payload = (await response.json()) as { events: EventItem[]; error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load events");
  return payload.events;
}

export async function getEvent(eventId: string) {
  const response = await fetch(`${getApiBaseUrl()}/events/${eventId}`, { credentials: "include" });
  const payload = (await response.json()) as { event: EventItem; error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load event");
  return payload.event;
}
