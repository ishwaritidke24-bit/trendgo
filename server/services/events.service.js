import mongoose from "mongoose";

import { Event } from "../models/event.model.js";
import { User } from "../models/user.model.js";
import { seedEvents } from "../data/seed-events.data.js";
import { createHttpError } from "../utils/http-error.js";
import { env } from "../config/env.js";

async function fetchSerpApiEvents(city) {
  if (!env.serpApiKey || !city) return [];

  try {
    const params = new URLSearchParams({
      engine: "google_events",
      q: `events in ${city}`,
      api_key: env.serpApiKey,
      hl: "en",
      gl: "in",
    });

    const res = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`,
    );
    if (!res.ok) return [];

    const data = await res.json();
    const eventsResults = data?.events_results || [];

    const now = new Date();
    const normalized = eventsResults.slice(0, 10).map((ev) => {
      const title = ev.title || "Local Event";
      const startDate = ev.date?.start_date
        ? new Date(ev.date.start_date)
        : new Date(now.getTime() + 86400000 * 2);
      const startTime = ev.date?.when?.split("–")?.[0]?.trim() || "6:00 PM";
      const venue = ev.venue?.name || ev.address?.[0] || `${city} Venue`;
      const address = (ev.address || []).join(", ") || `${venue}, ${city}`;

      return {
        title,
        description: ev.description || `Live experience in ${city}.`,
        category: "Communities",
        tags: ["Live", city, "Google Events"],
        image:
          ev.thumbnail ||
          ev.image ||
          "https://images.unsplash.com/photo-1501386761578-eaa54b4af1b8?auto=format&fit=crop&w=1200&q=80",
        date: startDate,
        startTime,
        endTime: "10:00 PM",
        venue,
        address,
        city,
        price: 0,
        capacity: 100,
        organizer: {
          name: ev.venue?.name || "Local Host",
          blurb: "Event via Google Events",
          initials: (title[0] || "E").toUpperCase(),
        },
        status: "published",
      };
    });

    if (normalized.length > 0) {
      await Event.insertMany(normalized, { ordered: false }).catch(() => {});
    }
    return normalized;
  } catch (error) {
    console.warn("SerpApi aggregation error:", error.message);
    return [];
  }
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

function dayGroup(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(date);
  eventDate.setHours(0, 0, 0, 0);
  const days = Math.round((eventDate - today) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 1 && days < 7) return "This weekend";
  return "Next week";
}

function distanceInKm(latitude, longitude, originLatitude, originLongitude) {
  if (
    [latitude, longitude, originLatitude, originLongitude].some(
      (value) => value === null,
    )
  )
    return 0;
  const radians = (value) => (value * Math.PI) / 180;
  const latDelta = radians(latitude - originLatitude);
  const lngDelta = radians(longitude - originLongitude);
  const calculation =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(radians(originLatitude)) *
      Math.cos(radians(latitude)) *
      Math.sin(lngDelta / 2) ** 2;
  return (
    Math.round(
      6371 *
        2 *
        Math.atan2(Math.sqrt(calculation), Math.sqrt(1 - calculation)) *
        10,
    ) / 10
  );
}

export function toPublicEvent(event, origin) {
  const distanceKm = origin
    ? distanceInKm(
        event.latitude,
        event.longitude,
        origin.latitude,
        origin.longitude,
      )
    : 0;
  return {
    id: event._id.toString(),
    title: event.title,
    description: event.description,
    category: event.category,
    tags: event.tags ?? [],
    image: event.image,
    date: formatDate(event.date),
    startTime: event.startTime,
    time: event.startTime,
    endTime: event.endTime,
    venue: event.venue,
    address: event.address,
    city: event.city,
    area: event.city,
    latitude: event.latitude,
    longitude: event.longitude,
    distanceKm,
    price: event.price,
    organizer: event.organizer,
    capacity: event.capacity,
    status: event.status,
    interested: event.interestedIds?.length ?? 0,
    match: 0,
    dayGroup: dayGroup(event.date),
    friendIds: [],
    reasons: [],
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

function parsePositiveInteger(value, fallback, maximum) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0
    ? Math.min(parsed, maximum)
    : fallback;
}

function getDateRange(filter) {
  if (!filter || filter === "Any time") return null;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  if (filter === "Today") end.setDate(end.getDate() + 1);
  else if (filter === "Tomorrow") {
    start.setDate(start.getDate() + 1);
    end.setDate(end.getDate() + 2);
  } else if (filter === "This weekend") end.setDate(end.getDate() + 7);
  else if (filter === "Next week") {
    start.setDate(start.getDate() + 7);
    end.setDate(end.getDate() + 14);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(filter)) {
    const selected = new Date(`${filter}T00:00:00.000Z`);
    if (Number.isNaN(selected.getTime())) return null;
    return { $gte: selected, $lt: new Date(selected.getTime() + 86_400_000) };
  } else return null;
  return { $gte: start, $lt: end };
}

export async function listPublicEvents(query) {
  const page = parsePositiveInteger(query.page, 1, 10_000);
  const limit = parsePositiveInteger(query.limit, 12, 50);
  const filters = { status: "published" };
  const category =
    typeof query.category === "string"
      ? query.category.split(",").filter(Boolean)
      : [];
  if (category.length) filters.category = { $in: category };
  if (typeof query.city === "string" && query.city.trim()) {
    filters.city = {
      $regex: `^${query.city.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      $options: "i",
    };
  }
  const dateRange = getDateRange(query.date);
  if (dateRange) filters.date = dateRange;
  const maximumPrice = Number(query.price);
  if (
    query.price !== undefined &&
    Number.isFinite(maximumPrice) &&
    maximumPrice >= 0
  )
    filters.price = { $lte: maximumPrice };
  const search = typeof query.search === "string" ? query.search : query.q;
  if (typeof search === "string" && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filters.$or = [
      "title",
      "description",
      "category",
      "tags",
      "venue",
      "address",
      "city",
    ].map((field) => ({ [field]: { $regex: escaped, $options: "i" } }));
  }
  const latitude = Number(query.latitude ?? query.lat);
  const longitude = Number(query.longitude ?? query.lng);
  const hasOrigin = Number.isFinite(latitude) && Number.isFinite(longitude);
  const maximumDistance = Number(query.distance);

  let events;
  if (mongoose.connection.readyState === 1) {
    if (typeof query.city === "string" && query.city.trim() && env.serpApiKey) {
      const existingCount = await Event.countDocuments(filters);
      if (existingCount === 0) {
        await fetchSerpApiEvents(query.city.trim());
      }
    }
    events = await Event.find(filters).sort({ date: 1, startTime: 1 }).lean();
    if (events.length === 0) {
      const totalCount = await Event.estimatedDocumentCount();
      if (totalCount === 0) {
        await Event.insertMany(seedEvents).catch(() => {});
        events = await Event.find(filters)
          .sort({ date: 1, startTime: 1 })
          .lean();
      }
    }
  }

  if (!events || events.length === 0) {
    // Graceful in-memory fallback when database has no matches or is disconnected / offline
    const memoryEvents = seedEvents
      .map((ev, index) => ({ ...ev, _id: `seed_${index + 1}` }))
      .filter((ev) => {
        if (
          query.city &&
          !new RegExp(`^${query.city.trim()}$`, "i").test(ev.city)
        )
          return false;
        if (category.length && !category.includes(ev.category)) return false;
        if (maximumPrice && ev.price > maximumPrice) return false;
        if (search) {
          const text =
            `${ev.title} ${ev.description} ${ev.category} ${ev.venue} ${ev.city}`.toLowerCase();
          if (!text.includes(search.toLowerCase())) return false;
        }
        return true;
      });
    if (!events || (events.length === 0 && memoryEvents.length > 0)) {
      events = memoryEvents;
    }
  }

  const origin = hasOrigin ? { latitude, longitude } : null;
  const filtered =
    origin && Number.isFinite(maximumDistance) && maximumDistance >= 0
      ? events.filter(
          (event) =>
            distanceInKm(
              event.latitude,
              event.longitude,
              latitude,
              longitude,
            ) <= maximumDistance,
        )
      : events;

  if (query.sort === "trending" || query.sort === "popular") {
    filtered.sort(
      (a, b) =>
        (b.interestedIds?.length ?? b.interested ?? 0) -
        (a.interestedIds?.length ?? a.interested ?? 0),
    );
  } else if (query.sort === "price") {
    filtered.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  } else if (query.sort === "soonest") {
    filtered.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }

  const total = filtered.length;
  const paginated = filtered
    .slice((page - 1) * limit, page * limit)
    .map((event) => toPublicEvent(event, origin));
  return {
    events: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    },
  };
}

export async function getPublicEvent(eventId) {
  if (
    mongoose.connection.readyState === 1 &&
    mongoose.isObjectIdOrHexString(eventId)
  ) {
    const event = await Event.findOne({
      _id: eventId,
      status: "published",
    }).lean();
    if (event) return toPublicEvent(event);
  }
  // In-memory fallback
  const seed = seedEvents
    .map((ev, index) => ({ ...ev, _id: `seed_${index + 1}` }))
    .find(
      (ev) =>
        ev._id === eventId ||
        ev.title.toLowerCase().replace(/\s+/g, "-") === eventId,
    );
  if (seed) return toPublicEvent(seed);
  throw createHttpError(404, "Event not found", "EVENT_NOT_FOUND");
}

function organizerDetails(user) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return { name: user.name, blurb: "TrendGo host", initials };
}

export async function createEvent(userId, input) {
  const user = await User.findById(userId).select("name").lean();
  if (!user)
    throw createHttpError(401, "Authentication required", "AUTH_INVALID");
  const event = await Event.create({
    ...input,
    organizerId: user._id,
    organizer: organizerDetails(user),
  });
  return toPublicEvent(event);
}

export async function updateEvent(userId, eventId, input) {
  if (!mongoose.isObjectIdOrHexString(eventId))
    throw createHttpError(404, "Event not found", "EVENT_NOT_FOUND");
  const event = await Event.findOneAndUpdate(
    { _id: eventId, organizerId: userId },
    { $set: input },
    { returnDocument: "after", runValidators: true },
  ).lean();
  if (!event) throw createHttpError(404, "Event not found", "EVENT_NOT_FOUND");
  return toPublicEvent(event);
}

export async function deleteEvent(userId, eventId) {
  if (!mongoose.isObjectIdOrHexString(eventId))
    throw createHttpError(404, "Event not found", "EVENT_NOT_FOUND");
  const result = await Event.deleteOne({ _id: eventId, organizerId: userId });
  if (!result.deletedCount)
    throw createHttpError(404, "Event not found", "EVENT_NOT_FOUND");
}
