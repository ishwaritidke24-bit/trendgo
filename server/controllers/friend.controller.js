import {
  listFriends,
  listFriendRequests,
  searchUsers,
  getFriendSuggestions,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getRelationshipStatus,
  getFriendsActivity,
} from "../services/friend.service.js";

export async function listFriendsController(req, res) {
  const friends = await listFriends(req.auth.userId);
  res.json({ success: true, friends, count: friends.length });
}

export async function listFriendRequestsController(req, res) {
  const requests = await listFriendRequests(req.auth.userId);
  res.json({ success: true, ...requests });
}

export async function searchUsersController(req, res) {
  const users = await searchUsers(req.auth.userId, req.query.q);
  res.json({ success: true, users });
}

export async function getFriendSuggestionsController(req, res) {
  const limit = parseInt(req.query.limit, 10) || 8;
  const suggestions = await getFriendSuggestions(req.auth.userId, limit);
  res.json({ success: true, suggestions });
}

export async function sendFriendRequestController(req, res) {
  const result = await sendFriendRequest(req.auth.userId, req.params.targetUserId);
  res.status(201).json(result);
}

export async function acceptFriendRequestController(req, res) {
  const result = await acceptFriendRequest(req.auth.userId, req.params.requestId);
  res.json(result);
}

export async function rejectFriendRequestController(req, res) {
  const result = await rejectFriendRequest(req.auth.userId, req.params.requestId);
  res.json(result);
}

export async function cancelFriendRequestController(req, res) {
  const result = await cancelFriendRequest(req.auth.userId, req.params.requestId);
  res.json(result);
}

export async function removeFriendController(req, res) {
  const result = await removeFriend(req.auth.userId, req.params.friendId);
  res.json(result);
}

export async function getRelationshipStatusController(req, res) {
  const result = await getRelationshipStatus(req.auth.userId, req.params.targetUserId);
  res.json({ success: true, ...result });
}

export async function getFriendsActivityController(req, res) {
  const activity = await getFriendsActivity(req.auth.userId);
  res.json({ success: true, activity });
}
