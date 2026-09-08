import mongoose from "mongoose";

import { Friendship } from "../models/friendship.model.js";
import { User } from "../models/user.model.js";
import { Event } from "../models/event.model.js";
import { createNotification } from "./notification.service.js";
import { createHttpError } from "../utils/http-error.js";

function getInitials(name = "") {
  return (
    (name || "Friend")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

function toPublicUser(user, options = {}) {
  return {
    id: user._id ? user._id.toString() : user.id,
    name: user.name,
    avatar: user.avatar || "",
    initials: getInitials(user.name),
    location: user.location || "",
    interests: user.interests || [],
    mutualCount: options.mutualCount ?? 0,
    relationship: options.relationship ?? "NOT_FRIENDS",
    friendshipId: options.friendshipId ? options.friendshipId.toString() : null,
    createdAt: user.createdAt,
  };
}

export async function getUserFriendIds(userId) {
  const friendships = await Friendship.find({
    status: "accepted",
    $or: [{ requesterId: userId }, { addresseeId: userId }],
  }).lean();

  return friendships.map((f) =>
    f.requesterId.toString() === userId.toString() ? f.addresseeId : f.requesterId,
  );
}

export async function listFriends(userId) {
  const userFriendIds = await getUserFriendIds(userId);
  if (!userFriendIds.length) return [];

  const friends = await User.find({ _id: { $in: userFriendIds } })
    .select("name avatar location interests createdAt")
    .lean();

  const userFriendIdStrings = new Set(userFriendIds.map((id) => id.toString()));

  // Compute mutual friends for each friend
  const friendsWithMutuals = await Promise.all(
    friends.map(async (friend) => {
      const otherFriendIds = await getUserFriendIds(friend._id);
      const mutualCount = otherFriendIds.filter(
        (id) => id.toString() !== userId.toString() && userFriendIdStrings.has(id.toString()),
      ).length;

      return toPublicUser(friend, {
        mutualCount,
        relationship: "FRIENDS",
      });
    }),
  );

  return friendsWithMutuals;
}

export async function listFriendRequests(userId) {
  const [incomingFriendships, outgoingFriendships] = await Promise.all([
    Friendship.find({ addresseeId: userId, status: "pending" })
      .sort({ createdAt: -1 })
      .populate("requesterId", "name avatar location interests createdAt")
      .lean(),
    Friendship.find({ requesterId: userId, status: "pending" })
      .sort({ createdAt: -1 })
      .populate("addresseeId", "name avatar location interests createdAt")
      .lean(),
  ]);

  const userFriendIds = await getUserFriendIds(userId);
  const userFriendIdStrings = new Set(userFriendIds.map((id) => id.toString()));

  const incoming = await Promise.all(
    incomingFriendships
      .filter((f) => f.requesterId)
      .map(async (f) => {
        const sender = f.requesterId;
        const senderFriendIds = await getUserFriendIds(sender._id);
        const mutualCount = senderFriendIds.filter((id) =>
          userFriendIdStrings.has(id.toString()),
        ).length;

        return {
          id: f._id.toString(),
          sender: toPublicUser(sender, {
            mutualCount,
            relationship: "REQUEST_RECEIVED",
            friendshipId: f._id,
          }),
          createdAt: f.createdAt,
        };
      }),
  );

  const outgoing = outgoingFriendships
    .filter((f) => f.addresseeId)
    .map((f) => ({
      id: f._id.toString(),
      recipient: toPublicUser(f.addresseeId, {
        relationship: "REQUEST_SENT",
        friendshipId: f._id,
      }),
      createdAt: f.createdAt,
    }));

  return { incoming, outgoing };
}

export async function searchUsers(userId, query) {
  const trimmed = (query || "").trim();
  if (!trimmed) return [];

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");

  const candidates = await User.find({
    _id: { $ne: userId },
    $or: [{ name: regex }, { location: regex }, { interests: { $in: [regex] } }],
  })
    .select("name avatar location interests createdAt")
    .limit(20)
    .lean();

  if (!candidates.length) return [];

  const userFriendIds = await getUserFriendIds(userId);
  const userFriendIdStrings = new Set(userFriendIds.map((id) => id.toString()));

  const candidateIds = candidates.map((c) => c._id);
  const relationships = await Friendship.find({
    $or: [
      { requesterId: userId, addresseeId: { $in: candidateIds } },
      { requesterId: { $in: candidateIds }, addresseeId: userId },
    ],
  }).lean();

  const relMap = new Map();
  for (const rel of relationships) {
    const isRequester = rel.requesterId.toString() === userId.toString();
    const otherId = isRequester ? rel.addresseeId.toString() : rel.requesterId.toString();
    relMap.set(otherId, { rel, isRequester });
  }

  const results = await Promise.all(
    candidates.map(async (candidate) => {
      const candIdStr = candidate._id.toString();
      const relInfo = relMap.get(candIdStr);

      let relationship = "NOT_FRIENDS";
      let friendshipId = null;

      if (relInfo) {
        friendshipId = relInfo.rel._id;
        if (relInfo.rel.status === "accepted") {
          relationship = "FRIENDS";
        } else if (relInfo.rel.status === "pending") {
          relationship = relInfo.isRequester ? "REQUEST_SENT" : "REQUEST_RECEIVED";
        }
      }

      const otherFriendIds = await getUserFriendIds(candidate._id);
      const mutualCount = otherFriendIds.filter((id) =>
        userFriendIdStrings.has(id.toString()),
      ).length;

      return toPublicUser(candidate, {
        mutualCount,
        relationship,
        friendshipId,
      });
    }),
  );

  return results;
}

export async function getFriendSuggestions(userId, limit = 8) {
  const [currentUser, userFriendIds, pendingFriendships] = await Promise.all([
    User.findById(userId).select("location interests").lean(),
    getUserFriendIds(userId),
    Friendship.find({
      $or: [{ requesterId: userId }, { addresseeId: userId }],
      status: "pending",
    }).lean(),
  ]);

  const pendingUserIds = pendingFriendships.map((f) =>
    f.requesterId.toString() === userId.toString() ? f.addresseeId : f.requesterId,
  );

  const excludeIds = [
    new mongoose.Types.ObjectId(userId),
    ...userFriendIds,
    ...pendingUserIds,
  ];

  const candidates = await User.find({ _id: { $nin: excludeIds } })
    .select("name avatar location interests createdAt")
    .limit(30)
    .lean();

  if (!candidates.length) return [];

  const userFriendIdStrings = new Set(userFriendIds.map((id) => id.toString()));
  const userInterests = new Set(currentUser?.interests || []);
  const userLocation = (currentUser?.location || "").toLowerCase();

  const scoredCandidates = await Promise.all(
    candidates.map(async (candidate) => {
      const candidateFriendIds = await getUserFriendIds(candidate._id);
      const mutualCount = candidateFriendIds.filter((id) =>
        userFriendIdStrings.has(id.toString()),
      ).length;

      let score = 0;
      score += mutualCount * 3;

      if (userLocation && candidate.location && candidate.location.toLowerCase() === userLocation) {
        score += 2;
      }

      const sharedInterests = (candidate.interests || []).filter((i) => userInterests.has(i));
      score += sharedInterests.length;

      return {
        candidate,
        score,
        mutualCount,
      };
    }),
  );

  scoredCandidates.sort((a, b) => b.score - a.score);

  return scoredCandidates.slice(0, limit).map(({ candidate, mutualCount }) =>
    toPublicUser(candidate, {
      mutualCount,
      relationship: "NOT_FRIENDS",
    }),
  );
}

export async function sendFriendRequest(requesterId, targetUserId) {
  if (requesterId.toString() === targetUserId.toString()) {
    throw createHttpError(400, "Cannot send friend request to yourself", "SELF_REQUEST");
  }

  const [requester, targetUser] = await Promise.all([
    User.findById(requesterId).select("name").lean(),
    User.findById(targetUserId).select("name").lean(),
  ]);

  if (!targetUser) {
    throw createHttpError(404, "User not found", "USER_NOT_FOUND");
  }

  const existing = await Friendship.findOne({
    $or: [
      { requesterId, addresseeId: targetUserId },
      { requesterId: targetUserId, addresseeId: requesterId },
    ],
  });

  if (existing) {
    if (existing.status === "accepted") {
      throw createHttpError(400, "You are already friends with this user", "ALREADY_FRIENDS");
    }

    if (existing.status === "pending") {
      if (existing.requesterId.toString() === requesterId.toString()) {
        throw createHttpError(400, "Friend request already sent", "REQUEST_ALREADY_SENT");
      }

      // If the target user had sent a request to requester, auto-accept it!
      existing.status = "accepted";
      await existing.save();

      await createNotification({
        userId: targetUserId,
        senderId: requesterId,
        type: "friend_accept",
        title: "Friend request accepted",
        message: `${requester.name} accepted your friend request.`,
      });

      return {
        success: true,
        relationship: "FRIENDS",
        friendshipId: existing._id.toString(),
        message: `You and ${targetUser.name} are now friends!`,
      };
    }

    // If declined previously, reset to pending
    existing.requesterId = requesterId;
    existing.addresseeId = targetUserId;
    existing.status = "pending";
    await existing.save();
  } else {
    await Friendship.create({
      requesterId,
      addresseeId: targetUserId,
      status: "pending",
    });
  }

  await createNotification({
    userId: targetUserId,
    senderId: requesterId,
    type: "friend_request",
    title: "New friend request",
    message: `${requester.name} sent you a friend request.`,
  });

  return {
    success: true,
    relationship: "REQUEST_SENT",
    message: `Friend request sent to ${targetUser.name}`,
  };
}

export async function acceptFriendRequest(userId, requestId) {
  const friendship = await Friendship.findOne({
    _id: requestId,
    addresseeId: userId,
    status: "pending",
  });

  if (!friendship) {
    throw createHttpError(404, "Friend request not found or unauthorized", "REQUEST_NOT_FOUND");
  }

  friendship.status = "accepted";
  await friendship.save();

  const user = await User.findById(userId).select("name").lean();

  await createNotification({
    userId: friendship.requesterId,
    senderId: userId,
    type: "friend_accept",
    title: "Friend request accepted",
    message: `${user.name} accepted your friend request.`,
  });

  return {
    success: true,
    relationship: "FRIENDS",
    message: "Friend request accepted",
  };
}

export async function rejectFriendRequest(userId, requestId) {
  const friendship = await Friendship.findOneAndDelete({
    _id: requestId,
    addresseeId: userId,
    status: "pending",
  });

  if (!friendship) {
    throw createHttpError(404, "Friend request not found or unauthorized", "REQUEST_NOT_FOUND");
  }

  return {
    success: true,
    relationship: "NOT_FRIENDS",
    message: "Friend request declined",
  };
}

export async function cancelFriendRequest(userId, requestId) {
  const friendship = await Friendship.findOneAndDelete({
    _id: requestId,
    requesterId: userId,
    status: "pending",
  });

  if (!friendship) {
    throw createHttpError(404, "Friend request not found or unauthorized", "REQUEST_NOT_FOUND");
  }

  return {
    success: true,
    relationship: "NOT_FRIENDS",
    message: "Friend request cancelled",
  };
}

export async function removeFriend(userId, friendId) {
  const deleted = await Friendship.findOneAndDelete({
    status: "accepted",
    $or: [
      { requesterId: userId, addresseeId: friendId },
      { requesterId: friendId, addresseeId: userId },
    ],
  });

  if (!deleted) {
    throw createHttpError(404, "Friendship not found", "FRIENDSHIP_NOT_FOUND");
  }

  return {
    success: true,
    relationship: "NOT_FRIENDS",
    message: "Friend removed successfully",
  };
}

export async function getRelationshipStatus(userId, targetUserId) {
  if (userId.toString() === targetUserId.toString()) {
    return { status: "SELF", friendshipId: null };
  }

  const friendship = await Friendship.findOne({
    $or: [
      { requesterId: userId, addresseeId: targetUserId },
      { requesterId: targetUserId, addresseeId: userId },
    ],
  }).lean();

  if (!friendship) {
    return { status: "NOT_FRIENDS", friendshipId: null };
  }

  if (friendship.status === "accepted") {
    return { status: "FRIENDS", friendshipId: friendship._id.toString() };
  }

  if (friendship.status === "pending") {
    const isSender = friendship.requesterId.toString() === userId.toString();
    return {
      status: isSender ? "REQUEST_SENT" : "REQUEST_RECEIVED",
      friendshipId: friendship._id.toString(),
    };
  }

  return { status: "NOT_FRIENDS", friendshipId: null };
}

export async function getFriendsActivity(userId) {
  const userFriendIds = await getUserFriendIds(userId);
  if (!userFriendIds.length) return [];

  const friends = await User.find({ _id: { $in: userFriendIds } })
    .select("name avatar interestedEventIds savedEventIds attendedEventIds")
    .lean();

  const activity = [];
  const eventIdsToFetch = new Set();

  for (const friend of friends) {
    for (const eid of (friend.attendedEventIds || []).slice(0, 2)) {
      eventIdsToFetch.add(eid);
      activity.push({ friend, eventId: eid, action: "is attending", when: "Upcoming" });
    }
    for (const eid of (friend.interestedEventIds || []).slice(0, 2)) {
      eventIdsToFetch.add(eid);
      activity.push({ friend, eventId: eid, action: "is interested in", when: "This week" });
    }
    for (const eid of (friend.savedEventIds || []).slice(0, 2)) {
      eventIdsToFetch.add(eid);
      activity.push({ friend, eventId: eid, action: "saved", when: "Recently" });
    }
  }

  if (!activity.length) return [];

  const events = await Event.find({ _id: { $in: Array.from(eventIdsToFetch) } })
    .select("title city startTime date")
    .lean();

  const eventMap = new Map(events.map((e) => [e._id.toString(), e]));

  return activity
    .filter((a) => eventMap.has(a.eventId))
    .slice(0, 10)
    .map((item, idx) => {
      const ev = eventMap.get(item.eventId);
      return {
        id: `act_${idx}_${item.eventId}`,
        friend: {
          id: item.friend._id.toString(),
          name: item.friend.name,
          avatar: item.friend.avatar || "",
          initials: getInitials(item.friend.name),
        },
        event: {
          id: ev._id.toString(),
          title: ev.title,
          area: ev.city,
          date: ev.date,
        },
        action: item.action,
        when: item.when,
      };
    });
}
