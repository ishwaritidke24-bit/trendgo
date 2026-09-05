import { inviteToEvent, updateEventPreference } from "../services/event.service.js";

export async function updateEventPreferenceController(req, res) {
  const result = await updateEventPreference(
    req.auth.userId,
    req.params.eventId,
    req.params.preference,
    Boolean(req.body.enabled),
  );
  if (!result)
    return res
      .status(401)
      .json({ success: false, error: { message: "Your session is no longer valid" } });
  return res.json({ success: true, ...result });
}

export async function inviteToEventController(req, res) {
  await inviteToEvent(req.auth.userId, req.params.eventId, req.body.friendId ?? "your friend");
  return res.status(201).json({ success: true });
}
