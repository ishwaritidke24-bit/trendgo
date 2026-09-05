import { listFriends } from "../services/invitation.service.js";

export async function listFriendsController(req, res) {
  const friends = await listFriends(req.auth.userId);
  res.json({ success: true, friends });
}
