

export const CATEGORIES = [
  "Music",
  "Techno",
  "Indie",
  "Comedy",
  "Sports",
  "Food",
  "Art",
  "Theatre",
  "Workshops",
  "Communities",
  "Nightlife",
  "Outdoor",
  "Startups",
  "Photography",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Friend {
  id: string;
  name: string;
  initials: string;
  avatar: string;
  mutual: number;
  taste: string;
}

export interface EventItem {
  id: string;
  organizerId?: string | null;
  title: string;
  image: string;
  category: string; // Trendgo category or raw external category
  match: number; // AI ranking score 0-100
  date: string;
  time: string;
  endTime?: string;
  dayGroup: "Today" | "Tomorrow" | "This weekend" | "This week" | "Next week" | "This month" | "Upcoming";
  venue: string;
  area: string;
  city?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm: number;
  price: number;
  isFree?: boolean;
  tags: string[];
  organizer: { name: string; blurb: string; initials: string };
  description: string;
  interested: number;
  friendIds: string[];
  reasons: string[];
  outsideBubble?: boolean;
  // External event fields
  source?: string; // e.g. "trendgo", "ticketmaster"
  sourceEventId?: string;
  ticketUrl?: string; // External registration/ticket link
}

const av = (seed: string) => `https://i.pravatar.cc/160?img=${seed}`;

export const FRIENDS: Friend[] = [];

export const friendById = (id: string) => FRIENDS.find((f) => f.id === id);

export const EVENTS: EventItem[] = [];

export const eventById = (id: string) => EVENTS.find((e) => e.id === id);

export interface ActivityItem {
  id: string;
  friendId: string;
  action: "interested in" | "is going to" | "saved" | "attended";
  eventId: string;
  when: string;
}

export const ACTIVITY: ActivityItem[] = [];
