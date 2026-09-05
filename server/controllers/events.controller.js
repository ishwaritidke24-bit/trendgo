import { getEvent, searchEvents } from "../data/events.js";
import { Event } from "../models/event.model.js";

function toDiscoveryEvent(event) {
  return {
    id: event._id.toString(),
    organizerId: event.organizerId.toString(),
    title: event.title,
    description: event.description,
    category: event.category,
    date: event.date,
    time: event.time,
    dayGroup: "Upcoming",
    venue: event.venue,
    area: event.area,
    distanceKm: 0,
    price: event.price,
    image: event.image,
    match: 0,
    tags: [event.category],
    organizer: { name: "Organizer", blurb: "TrendGo host", initials: "TG" },
    interested: event.interestedIds?.length ?? 0,
    friendIds: [],
    reasons: [],
  };
}

function matchesQuery(event, query) {
  const text = `${event.title} ${event.category} ${event.area} ${event.venue}`.toLowerCase();
  if (query.q && !text.includes(String(query.q).toLowerCase())) return false;
  if (query.category && !String(query.category).split(",").includes(event.category)) return false;
  if (query.location && !`${event.area} ${event.venue}`.toLowerCase().includes(String(query.location).toLowerCase())) return false;
  if (query.price !== undefined && query.price !== "" && event.price > Number(query.price)) return false;
  return true;
}

export async function listEventsController(req, res) {
  const events = searchEvents({
    query: req.query.q,
    category: req.query.category,
    date: req.query.date,
    location: req.query.location,
    price: req.query.price,
    distance: req.query.distance,
    sort: req.query.sort,
  });
  const hostedEvents = await Event.find({ status: "published" }).sort({ createdAt: -1 }).lean();
  const hostedDiscoveryEvents = hostedEvents.map(toDiscoveryEvent).filter((event) => matchesQuery(event, req.query));
  res.json({ success: true, events: [...hostedDiscoveryEvents, ...events] });
}

export async function getEventController(req, res) {
  const event = getEvent(req.params.eventId);
  if (event) return res.json({ success: true, event });
  const hostedEvent = await Event.findOne({ _id: req.params.eventId, status: "published" }).lean();
  if (!hostedEvent)
    return res.status(404).json({ success: false, error: { message: "Event not found" } });
  return res.json({ success: true, event: toDiscoveryEvent(hostedEvent) });
}
