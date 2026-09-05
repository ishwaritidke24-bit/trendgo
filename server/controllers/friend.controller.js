import { FriendInvitation } from "../models/friend-invitation.model.js";

export async function createFriendInvitationController(req, res) {
  const invitation = await FriendInvitation.create({
    inviterId: req.auth.userId,
    friendId: req.body.friendId,
  });
  res.status(201).json({ success: true, invitationId: invitation._id.toString() });
}
