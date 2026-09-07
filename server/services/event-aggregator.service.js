/**
 * Event Aggregation Service
 *
 * Modular service that fetches real events from external APIs, normalizes
 * them into Trendgo's Event schema, deduplicates, and caches in MongoDB.
 *
 * Architecture:
 *   External Sources (Ticketmaster, etc.)
 *     ↓
 *   Per-source fetchers (fetchTicketmasterEvents)
 *     ↓
 *   Normalize → Deduplicate → Rank → Store
 *     ↓
 *   Trendgo Event DB (served via existing events controller)
 */

import { env } from "../config/env.js";
import { Event } from "../models/event.model.js";

// How many hours before we re-fetch events for a city+month combo
const CACHE_TTL_HOURS = 6;

// ─── Category normalization ────────────────────────────────────────────────
// Maps external API classification strings to Trendgo's fixed categories.
const TRENDGO_CATEGORIES = [
  "Music", "Comedy", "Sports", "Food", "Art",
  "Workshops", "Communities", "Nightlife", "Outdoor",
];

const CATEGORY_MAP = {
  // Ticketmaster segment/genre names → Trendgo categories
  music: "Music",
  "rock": "Music",
  "pop": "Music",
  "hip-hop": "Music",
  "electronic": "Music",
  "classical": "Music",
  "jazz": "Music",
  "indie": "Music",
  "concert": "Music",
  "festival": "Music",
  comedy: "Comedy",
  "stand-up": "Comedy",
  "standup": "Comedy",
  sports: "Sports",
  football: "Sports",
  cricket: "Sports",
  "sports event": "Sports",
  food: "Food",
  "food & drink": "Food",
  "food festival": "Food",
  culinary: "Food",
  "arts & theatre": "Art",
  arts: "Art",
  theatre: "Art",
  "fine art": "Art",
  film: "Art",
  exhibition: "Art",
  cultural: "Art",
  "performing arts": "Art",
  "workshop": "Workshops",
  "workshops": "Workshops",
  "seminar": "Workshops",
  "hackathon": "Workshops",
  "tech": "Workshops",
  "conference": "Workshops",
  "business": "Workshops",
  "networking": "Communities",
  "community": "Communities",
  "meetup": "Communities",
  "miscellaneous": "Communities",
  "family": "Communities",
  "nightlife": "Nightlife",
  "club": "Nightlife",
  "dj": "Nightlife",
  "outdoor": "Outdoor",
  "adventure": "Outdoor",
  "nature": "Outdoor",
  "sports & outdoors": "Outdoor",
};

function normalizeCategory(raw) {
  if (!raw) return "Communities";
  const key = raw.toLowerCase().trim();
  for (const [pattern, category] of Object.entries(CATEGORY_MAP)) {
    if (key.includes(pattern)) return category;
  }
  return "Communities";
}

// ─── Image helpers ─────────────────────────────────────────────────────────
const FALLBACK_IMAGES = {
  Music: "https://images.unsplash.com/photo-1501386761578-eaa54b4af1b8?auto=format&fit=crop&w=1200&q=80",
  Comedy: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80",
  Food: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80",
  Art: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1200&q=80",
  Nightlife: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
  Workshops: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
  Sports: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=1200&q=80",
  Outdoor: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  Communities: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
};

function getFallbackImage(category) {
  return FALLBACK_IMAGES[category] ?? FALLBACK_IMAGES.Communities;
}

// ─── Date helpers ─────────────────────────────────────────────────────────
function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

function toISODateOnly(date) {
  if (!date) return "";
  const d = new Date(date);
  return `${d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}`;
}

function toTimeStr(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

// ─── Deduplication ────────────────────────────────────────────────────────
function normalizeTitle(title) {
  return (title ?? "").toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function isFuzzyDuplicate(titleA, titleB) {
  const a = normalizeTitle(titleA), b = normalizeTitle(titleB);
  if (a === b) return true;
  const longer = Math.max(a.length, b.length);
  if (longer === 0) return true;
  const dist = levenshtein(a, b);
  return dist / longer < 0.2; // Allow up to 20% difference
}

// ─── Ticketmaster source ───────────────────────────────────────────────────
async function fetchTicketmasterEvents(city, start, end) {
  if (!env.ticketmasterApiKey) {
    console.log("[Aggregator] TICKETMASTER_API_KEY not set — skipping Ticketmaster source");
    return [];
  }

  const startDateTime = start.toISOString().replace(".000", "");
  const endDateTime = end.toISOString().replace(".000", "");

  const params = new URLSearchParams({
    apikey: env.ticketmasterApiKey,
    city,
    countryCode: "IN",
    startDateTime,
    endDateTime,
    size: "50",
    sort: "date,asc",
  });

  const url = `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`;

  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (response.status === 401) {
      console.warn("[Aggregator] Ticketmaster API key invalid or unauthorized");
      return [];
    }
    if (response.status === 429) {
      console.warn("[Aggregator] Ticketmaster rate limit hit — skipping");
      return [];
    }
    if (!response.ok) {
      console.warn(`[Aggregator] Ticketmaster returned ${response.status} for city: ${city}`);
      return [];
    }

    const data = await response.json();
    const rawEvents = data?._embedded?.events ?? [];

    return rawEvents.map((ev) => {
      const venue = ev._embedded?.venues?.[0];
      const segment = ev.classifications?.[0]?.segment?.name ?? "";
      const genre = ev.classifications?.[0]?.genre?.name ?? "";
      const category = normalizeCategory(genre || segment);
      const imageObj = (ev.images ?? []).find((img) => img.width > 400) ?? ev.images?.[0];
      const startStr = ev.dates?.start?.dateTime ?? ev.dates?.start?.localDate;
      const priceRanges = ev.priceRanges?.[0];
      const price = priceRanges ? Math.round(priceRanges.min ?? 0) : 0;

      return {
        source: "ticketmaster",
        sourceEventId: ev.id,
        title: ev.name ?? "Untitled Event",
        description: ev.info ?? ev.pleaseNote ?? "",
        category,
        tags: [segment, genre].filter(Boolean),
        startDate: startStr ? new Date(startStr) : null,
        endDate: ev.dates?.end?.dateTime ? new Date(ev.dates.end.dateTime) : null,
        date: toISODateOnly(startStr),
        time: ev.dates?.start?.localTime
          ? ev.dates.start.localTime.slice(0, 5).replace(/^0/, "") + " " + (parseInt(ev.dates.start.localTime) >= 12 ? "PM" : "AM")
          : toTimeStr(startStr),
        venue: venue?.name ?? "Venue TBC",
        area: venue?.address?.line1 ?? "",
        address: [venue?.address?.line1, venue?.address?.city].filter(Boolean).join(", "),
        city: venue?.city?.name ?? city,
        latitude: parseFloat(venue?.location?.latitude) || null,
        longitude: parseFloat(venue?.location?.longitude) || null,
        price,
        isFree: price === 0,
        image: imageObj?.url ?? getFallbackImage(category),
        ticketUrl: ev.url ?? "",
        organizer: {
          name: ev._embedded?.attractions?.[0]?.name ?? "External Event",
          blurb: segment,
          initials: (ev._embedded?.attractions?.[0]?.name ?? "EX").slice(0, 2).toUpperCase(),
        },
        interested: ev.sales?.public?.startDateTime ? 0 : 0, // placeholder
        status: "published",
        cacheExpiresAt: new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000),
      };
    });
  } catch (error) {
    console.error(`[Aggregator] Ticketmaster fetch failed for ${city}:`, error.message);
    return [];
  }
}

// ─── Core aggregation pipeline ────────────────────────────────────────────
/**
 * Aggregate events for a given city + current month.
 * Uses lazy caching: if we already have recent events for this city, returns them.
 * Otherwise, fetches from external sources, deduplicates, stores, and returns.
 */
export async function aggregateEventsForCity(city) {
  const { start, end } = getCurrentMonthRange();

  // Check cache — if we have non-expired events for this city this month, serve them
  const cachedCount = await Event.countDocuments({
    source: { $ne: "trendgo" },
    city: new RegExp(`^${city}$`, "i"),
    startDate: { $gte: start, $lte: end },
    cacheExpiresAt: { $gt: new Date() },
  });

  if (cachedCount > 0) {
    console.log(`[Aggregator] Cache hit for "${city}" (${cachedCount} events)`);
    return;
  }

  console.log(`[Aggregator] Fetching fresh events for "${city}" from external sources...`);

  // Fetch from all sources in parallel
  const [ticketmasterEvents] = await Promise.all([
    fetchTicketmasterEvents(city, start, end),
    // Future sources can be added here:
    // fetchEventbriteEvents(city, start, end),
    // fetchMeetupEvents(city, start, end),
  ]);

  const allRawEvents = [...ticketmasterEvents];

  if (allRawEvents.length === 0) {
    console.log(`[Aggregator] No external events found for "${city}"`);
    return;
  }

  console.log(`[Aggregator] Fetched ${allRawEvents.length} raw events for "${city}"`);

  // Deduplicate in-memory (across sources) then against DB
  const dedupedRaw = [];
  for (const ev of allRawEvents) {
    const isDupe = dedupedRaw.some(
      (existing) =>
        existing.source === ev.source && existing.sourceEventId === ev.sourceEventId,
    );
    if (!isDupe) dedupedRaw.push(ev);
  }

  let stored = 0;
  let updated = 0;
  let skipped = 0;

  for (const ev of dedupedRaw) {
    // Check if this exact external event already exists (by sourceEventId)
    const existingBySourceId = await Event.findOne({
      source: ev.source,
      sourceEventId: ev.sourceEventId,
    });

    if (existingBySourceId) {
      // Refresh the cache TTL and update details
      await Event.updateOne(
        { _id: existingBySourceId._id },
        {
          $set: {
            cacheExpiresAt: ev.cacheExpiresAt,
            image: ev.image || existingBySourceId.image,
            price: ev.price,
            ticketUrl: ev.ticketUrl || existingBySourceId.ticketUrl,
            description: ev.description || existingBySourceId.description,
          },
        },
      );
      updated++;
      continue;
    }

    // Check for fuzzy title+date duplicates from other sources
    const sameMonthSameCity = await Event.findOne({
      city: new RegExp(`^${ev.city}$`, "i"),
      startDate: ev.startDate
        ? { $gte: new Date(ev.startDate.getTime() - 86400000), $lte: new Date(ev.startDate.getTime() + 86400000) }
        : { $exists: false },
    }).lean();

    if (sameMonthSameCity && isFuzzyDuplicate(sameMonthSameCity.title, ev.title)) {
      // Merge: add the ticket URL if missing from existing record
      if (!sameMonthSameCity.ticketUrl && ev.ticketUrl) {
        await Event.updateOne(
          { _id: sameMonthSameCity._id },
          { $set: { ticketUrl: ev.ticketUrl, cacheExpiresAt: ev.cacheExpiresAt } },
        );
      }
      skipped++;
      continue;
    }

    // New event — insert it
    try {
      await Event.create({
        ...ev,
        organizerId: null,
        attendeeIds: [],
        interestedIds: [],
      });
      stored++;
    } catch (dbErr) {
      if (dbErr.code !== 11000) {
        console.error("[Aggregator] DB insert failed:", dbErr.message, ev.title);
      }
    }
  }

  console.log(
    `[Aggregator] "${city}": ${stored} new, ${updated} refreshed, ${skipped} duplicates skipped`,
  );
}

/**
 * Aggregate events across multiple cities in parallel.
 */
export async function aggregateEventsForCities(cities) {
  if (!cities || cities.length === 0) return;
  await Promise.allSettled(cities.map((city) => aggregateEventsForCity(city)));
}

/**
 * Remove events that have ended and whose cache has fully expired.
 */
export async function cleanExpiredEvents() {
  const result = await Event.deleteMany({
    source: { $ne: "trendgo" },
    endDate: { $lt: new Date() },
    cacheExpiresAt: { $lt: new Date() },
  });
  if (result.deletedCount > 0) {
    console.log(`[Aggregator] Cleaned up ${result.deletedCount} expired external events`);
  }
}
