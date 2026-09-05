import {
  createEventInvitations,
  listInvitations,
  updateInvitation,
} from "../services/invitation.service.js";

export async function createEventInvitationsController(req, res) {
  const invitations = await createEventInvitations(
    req.auth.userId,
    req.params.eventId,
    req.body.recipientIds,
    req.body.message,
  );
  res.status(201).json({ success: true, invitations });
}

export async function listInvitationsController(req, res) {
  const invitations = await listInvitations(req.auth.userId);
  res.json({ success: true, invitations });
}

export async function updateInvitationController(req, res) {
  const invitation = await updateInvitation(
    req.auth.userId,
    req.params.invitationId,
    req.body.status,
  );
  res.json({ success: true, invitation });
}
