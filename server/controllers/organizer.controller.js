import {
  activateOrganizer,
  getOrganizerProfile,
  updateOrganizerProfile,
} from "../services/organizer.service.js";
import {
  createHostedEvent,
  listHostedEvents,
  setHostedEventStatus,
  getHostedEventAudience,
  updateHostedEvent,
} from "../services/organizer-event.service.js";

export async function getOrganizerProfileController(req, res) {
  res.json({ success: true, organizer: await getOrganizerProfile(req.auth.userId) });
}

export async function activateOrganizerController(req, res) {
  res
    .status(201)
    .json({ success: true, organizer: await activateOrganizer(req.auth.userId, req.body) });
}

export async function updateOrganizerProfileController(req, res) {
  res.json({ success: true, organizer: await updateOrganizerProfile(req.auth.userId, req.body) });
}

export async function listHostedEventsController(req, res) {
  res.json({ success: true, events: await listHostedEvents(req.auth.userId) });
}

export async function createHostedEventController(req, res) {
  res
    .status(201)
    .json({ success: true, event: await createHostedEvent(req.auth.userId, req.body) });
}

export async function updateHostedEventController(req, res) {
  res.json({
    success: true,
    event: await updateHostedEvent(req.auth.userId, req.params.eventId, req.body),
  });
}

export async function setHostedEventStatusController(req, res) {
  res.json({
    success: true,
    event: await setHostedEventStatus(req.auth.userId, req.params.eventId, req.body.status),
  });
}

export async function getHostedEventAudienceController(req, res) {
  res.json({
    success: true,
    audience: await getHostedEventAudience(req.auth.userId, req.params.eventId),
  });
}
