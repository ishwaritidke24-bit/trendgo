import { Event } from "../models/event.model.js";
import { aggregateEventsForCities, cleanExpiredEvents } from "../services/event-aggregator.service.js";

// ─── Ranking helpers ───────────────────────────────────────────────────────
/**
 * Score an event for the discovery feed. Factors:
 *  - Category match with user interests (+30 per match)
 *  - How soon the event is (closer = higher score)
 *  - Free events get a small bump (+5)
 *  - Interested count (popularity, capped)
 */
function scoreEvent(event, userInterests = []) {
  let score = 0;
  const interests = userInterests.map((i) => i.toLowerCase());

  if (interests.includes((event.category ?? "").toLowerCase())) score += 30;
  for (const tag of event.tags ?? []) {
    if (interests.includes(tag.toLowerCase())) score += 10;
  }

  if (event.startDate) {
    const hoursUntil = (new Date(event.startDate) - Date.now()) / 3_600_000;
    if (hoursUntil >= 0 && hoursUntil < 24) score += 20;
    else if (hoursUntil < 72) score += 12;
    else if (hoursUntil < 168) score += 6;
  }

  if (event.isFree || event.price === 0) score += 5;
  score += Math.min(event.interested ?? 0, 10);

  return score;
}

// ─── Shape an event for the frontend (EventItem) ──────────────────────────
function toDiscoveryEvent(event, userInterests = []) {
  const match = scoreEvent(event, userInterests);

  return {
    id: event._id.toString(),
    organizerId: event.organizerId?.toString() ?? null,
    source: event.source ?? "trendgo",
    sourceEventId: event.sourceEventId ?? "",
    title: event.title,
    description: event.description ?? "",
    category: event.category,
    date: event.date || "",
    time: event.time || "",
    endTime: event.endTime || "",
    dayGroup: getDayGroup(event.startDate),
    venue: event.venue || "",
    area: event.area || "",
    city: event.city || "",
    address: event.address || "",
    distanceKm: 0,
    latitude: event.latitude ?? null,
    longitude: event.longitude ?? null,
    price: event.price ?? 0,
    isFree: event.isFree || event.price === 0,
    image: event.image || "",
    ticketUrl: event.ticketUrl || "",
    match,
    tags: event.tags ?? [event.category],
    organizer: event.organizer ?? { name: "Organizer", blurb: "TrendGo host", initials: "TG" },
    interested: event.interested ?? event.interestedIds?.length ?? 0,
    friendIds: [],
    reasons: buildReasons(event, userInterests),
    outsideBubble: false,
  };
}

function getDayGroup(startDate) {
  if (!startDate) return "Upcoming";
  const now = new Date();
  const diffMs = new Date(startDate) - now;
  const diffHours = diffMs / 3_600_000;
  if (diffHours < 0) return "Upcoming";
  if (diffHours < 24) return "Today";
  if (diffHours < 48) return "Tomorrow";
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays <= 7) return "This week";
  if (diffDays <= 14) return "Next week";
  return "This month";
}

function buildReasons(event, userInterests) {
  const reasons = [];
  const interests = userInterests.map((i) => i.toLowerCase());
  if (interests.includes((event.category ?? "").toLowerCase())) {
    reasons.push(`Matches your ${event.category} interest`);
  }
  if (event.isFree || event.price === 0) reasons.push("Free entry");
  if (event.city) reasons.push(`📍 ${event.city}`);
  if (reasons.length === 0) reasons.push("Happening near you");
  return reasons;
}

function matchesFilters(event, query) {
  const text = `${event.title} ${event.category} ${event.area} ${event.venue} ${event.city}`.toLowerCase();
  if (query.q && !text.includes(String(query.q).toLowerCase())) return false;
  if (query.category) {
    const cats = String(query.category).split(",").map((c) => c.trim().toLowerCase());
    if (!cats.includes((event.category ?? "").toLowerCase())) return false;
  }
  if (query.price !== undefined && query.price !== "" && event.price > Number(query.price)) return false;
  return true;
}

// ─── Controllers ───────────────────────────────────────────────────────────
export async function listEventsController(req, res) {
  const { q, category, date, location, price, distance, sort, locations, refresh } = req.query;
  const userInterests = req.user?.interests ?? [];

  // Determine which cities to query
  let citiesToFetch = [];
  if (locations) {
    citiesToFetch = String(locations).split(",").map((c) => c.trim()).filter(Boolean);
  } else if (location) {
    citiesToFetch = [String(location).trim()];
  }

  // Run aggregation for requested cities (lazy cache-aware)
  if (citiesToFetch.length > 0) {
    // Fire and await aggregation so the response includes fresh data
    await aggregateEventsForCities(citiesToFetch);
  }

  // Clean up stale external events periodically (fire-and-forget)
  cleanExpiredEvents().catch(() => {});

  // Build MongoDB query
  const dbQuery = { status: "published" };

  if (citiesToFetch.length > 0) {
    dbQuery.city = { $in: citiesToFetch.map((c) => new RegExp(`^${c}$`, "i")) };
  }

  // Date filtering
  const now = new Date();
  const { start: monthStart, end: monthEnd } = getCurrentMonthRange();

  if (date && date !== "Any time") {
    const dayRange = getDateRange(date);
    if (dayRange) {
      dbQuery.startDate = { $gte: dayRange.start, $lte: dayRange.end };
    } else {
      dbQuery.startDate = { $gte: now, $lte: monthEnd };
    }
  } else {
    // Default: show current-month upcoming events
    dbQuery.startDate = { $gte: now, $lte: monthEnd };
  }

  const rawEvents = await Event.find(dbQuery).sort({ startDate: 1 }).limit(200).lean();

  let discoveryEvents = rawEvents
    .map((e) => toDiscoveryEvent(e, userInterests))
    .filter((e) => matchesFilters(e, { q, category, price }));

  // Distance filter (client-side, distanceKm is 0 for external events for now)
  if (distance !== undefined && distance !== "") {
    discoveryEvents = discoveryEvents.filter((e) => e.distanceKm <= Number(distance) || e.distanceKm === 0);
  }

  // Sort
  if (sort === "soonest") {
    discoveryEvents.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  } else if (sort === "price") {
    discoveryEvents.sort((a, b) => a.price - b.price);
  } else {
    // Default: by match score (AI recommendation ranking)
    discoveryEvents.sort((a, b) => b.match - a.match);
  }

  res.json({ success: true, events: discoveryEvents });
}

export async function getEventController(req, res) {
  const { eventId } = req.params;
  const userInterests = req.user?.interests ?? [];

  const event = await Event.findOne({ _id: eventId, status: "published" }).lean();
  if (!event) return res.status(404).json({ success: false, error: { message: "Event not found" } });

  return res.json({ success: true, event: toDiscoveryEvent(event, userInterests) });
}

// ─── Helper: current month range ──────────────────────────────────────────
function getCurrentMonthRange() {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
  };
}

function getDateRange(dayGroup) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (dayGroup === "Today") return { start: today, end: new Date(today.getTime() + 86399999) };
  if (dayGroup === "Tomorrow") {
    const tom = new Date(today.getTime() + 86400000);
    return { start: tom, end: new Date(tom.getTime() + 86399999) };
  }
  if (dayGroup === "This week" || dayGroup === "This weekend") {
    return { start: today, end: new Date(today.getTime() + 7 * 86400000) };
  }
  if (dayGroup === "Next week") {
    const next = new Date(today.getTime() + 7 * 86400000);
    return { start: next, end: new Date(next.getTime() + 7 * 86400000) };
  }
  return null;
}
