import { getEvent, searchEvents } from "../data/events.js";

export function listEventsController(req, res) {
  const events = searchEvents({
    query: req.query.q,
    category: req.query.category,
    date: req.query.date,
    location: req.query.location,
    price: req.query.price,
    distance: req.query.distance,
    sort: req.query.sort,
  });
  res.json({ success: true, events });
}

export function getEventController(req, res) {
  const event = getEvent(req.params.eventId);
  if (!event)
    return res.status(404).json({ success: false, error: { message: "Event not found" } });
  return res.json({ success: true, event });
}
