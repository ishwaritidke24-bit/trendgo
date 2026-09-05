import {
  getCurrentUser,
  updateCurrentUser,
  updateCurrentUserInterests,
} from "../services/auth.service.js";

export async function getMeController(req, res) {
  const user = await getCurrentUser(req.auth.userId);
  res.status(200).json({ success: true, user });
}

export async function updateMeController(req, res) {
  const user = await updateCurrentUser(req.auth.userId, req.body);
  res.status(200).json({ success: true, user });
}

export async function updateMyInterestsController(req, res) {
  const user = await updateCurrentUserInterests(req.auth.userId, req.body.interests);
  res.status(200).json({ success: true, user });
}
