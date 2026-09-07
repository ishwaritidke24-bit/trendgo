import {
  createEvent,
  deleteEvent,
  getPublicEvent,
  listPublicEvents,
  updateEvent,
} from "../services/events.service.js";

export async function listEventsController(req, res) {
  res.json({ success: true, ...(await listPublicEvents(req.query)) });
}

export async function getEventController(req, res) {
  res.json({ success: true, event: await getPublicEvent(req.params.eventId) });
}

export async function createEventController(req, res) {
  res.status(201).json({ success: true, event: await createEvent(req.auth.userId, req.body) });
}

export async function updateEventController(req, res) {
  res.json({ success: true, event: await updateEvent(req.auth.userId, req.params.eventId, req.body) });
}

export async function deleteEventController(req, res) {
  await deleteEvent(req.auth.userId, req.params.eventId);
  res.status(204).end();
}
